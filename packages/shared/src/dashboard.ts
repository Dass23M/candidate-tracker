import { z } from 'zod';
import { applicationSchema } from './application';
import { applicationStatusSchema } from './enums';

export const dashboardMetricsSchema = z.object({
  totalCandidates: z.number().int(),
  totalApplications: z.number().int(),
  applicationsByStatus: z.array(
    z.object({
      status: applicationStatusSchema,
      count: z.number().int(),
    })
  ),
  hiredThisMonth: z.number().int(),
  rejectionRate: z.number(),
  applicationsPerWeek: z.array(
    z.object({
      weekStart: z.coerce.date(),
      count: z.number().int(),
    })
  ),
  latestApplications: z.array(
    applicationSchema.extend({
      candidateName: z.string(),
      candidateEmail: z.string(),
    })
  ),
});

export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;