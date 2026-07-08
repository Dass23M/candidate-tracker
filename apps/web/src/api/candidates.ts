import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { Candidate, CreateCandidateInput, UpdateCandidateInput, Application } from '@candidate-tracker/shared';

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CandidateListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export type CandidateWithApplications = Candidate & { applications: Application[] };

const CANDIDATES_KEY = 'candidates';

export function useCandidates(params: CandidateListParams) {
  return useQuery({
    queryKey: [CANDIDATES_KEY, params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Candidate>>('/candidates', { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCandidate(id: string | undefined) {
  return useQuery({
    queryKey: [CANDIDATES_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<CandidateWithApplications>(`/candidates/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCandidateInput) => {
      const { data } = await apiClient.post<Candidate>('/candidates', input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CANDIDATES_KEY] }),
  });
}

export function useUpdateCandidate(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateCandidateInput) => {
      const { data } = await apiClient.patch<Candidate>(`/candidates/${id}`, input);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CANDIDATES_KEY] }),
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/candidates/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CANDIDATES_KEY] }),
  });
}

export function useCandidateSearch(query: string) {
  return useQuery({
    queryKey: [CANDIDATES_KEY, 'search', query],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Candidate>>('/candidates', {
        params: { page: 1, pageSize: 6, search: query },
      });
      return data;
    },
    enabled: query.trim().length > 0,
    placeholderData: (prev) => prev,
  });
}