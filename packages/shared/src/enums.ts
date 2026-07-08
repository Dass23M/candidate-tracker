import { z } from 'zod';

export const applicationStatusValues = [
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
] as const;

export const applicationStatusSchema = z.enum(applicationStatusValues);

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;