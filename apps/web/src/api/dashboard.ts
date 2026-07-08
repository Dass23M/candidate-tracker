import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { ApplicationStatus } from '@candidate-tracker/shared';

export interface DashboardApplicationItem {
  id: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  appliedAt: string;
  candidateName: string;
  candidateEmail: string;
  candidateId: string;
}

export interface DashboardMetrics {
  totalCandidates: number;
  totalApplications: number;
  applicationsByStatus: { status: ApplicationStatus; count: number }[];
  hiredThisMonth: number;
  rejectionRate: number;
  applicationsPerWeek: { weekStart: string; count: number }[];
  latestApplications: DashboardApplicationItem[];
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardMetrics>('/dashboard');
      return data;
    },
  });
}