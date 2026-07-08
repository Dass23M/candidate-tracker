import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@candidate-tracker/shared';
import type { Paginated } from './candidates';

export type ApplicationListItem = Application & {
  candidateName: string;
  candidateEmail: string;
};

export type ApplicationWithCandidate = Application & {
  candidate: { id: string; name: string; email: string };
};

export interface ApplicationListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: ApplicationStatus;
  appliedFrom?: string;
  appliedTo?: string;
}

const APPLICATIONS_KEY = 'applications';

export function useApplications(params: ApplicationListParams) {
  return useQuery({
    queryKey: [APPLICATIONS_KEY, params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<ApplicationListItem>>('/applications', { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: [APPLICATIONS_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApplicationWithCandidate>(`/applications/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateApplicationInput) => {
      const { data } = await apiClient.post<Application>('/applications', input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [APPLICATIONS_KEY] }),
  });
}

export function useUpdateApplication(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateApplicationInput) => {
      const { data } = await apiClient.patch<Application>(`/applications/${id}`, input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [APPLICATIONS_KEY] }),
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/applications/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [APPLICATIONS_KEY] }),
  });
}