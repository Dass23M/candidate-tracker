import { z } from 'zod';
import { applicationStatusSchema } from './enums';

export const applicationSchema = z.object({
  id: z.string().uuid(),
  candidateId: z.string().uuid(),
  jobTitle: z.string().min(1),
  company: z.string().min(1),
  status: applicationStatusSchema,
  appliedAt: z.coerce.date(),
  salaryExpectation: z.number().int().nullable(),
  source: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Application = z.infer<typeof applicationSchema>;

export const createApplicationSchema = z.object({
  candidateId: z.string().uuid('Must select a candidate'),
  jobTitle: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  status: applicationStatusSchema.default('applied'),
  appliedAt: z.coerce.date(),
  salaryExpectation: z.number().int().positive().nullable().optional(),
  source: z.string().trim().min(1).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const updateApplicationSchema = createApplicationSchema.partial();

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export const applicationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(),
  status: applicationStatusSchema.optional(),
  appliedFrom: z.coerce.date().optional(),
  appliedTo: z.coerce.date().optional(),
});

export type ApplicationListQuery = z.infer<typeof applicationListQuerySchema>;