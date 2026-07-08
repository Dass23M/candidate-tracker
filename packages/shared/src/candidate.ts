import { z } from 'zod';

export const candidateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  linkedinUrl: z.string().url().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export type Candidate = z.infer<typeof candidateSchema>;

export const createCandidateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Must be a valid email'),
  phone: z.string().trim().min(1).nullable().optional(),
  location: z.string().trim().min(1).nullable().optional(),
  linkedinUrl: z.string().url('Must be a valid URL').nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;

export const updateCandidateSchema = createCandidateSchema.partial();

export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;

export const candidateListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(),
});

export type CandidateListQuery = z.infer<typeof candidateListQuerySchema>;