import { candidatesRepository } from './candidates.repository';
import { ConflictError, NotFoundError } from '../../plugins/error-handler';
import type { CandidateListQuery, CreateCandidateInput, UpdateCandidateInput } from '@candidate-tracker/shared';

export const candidatesService = {
  async list(query: CandidateListQuery) {
    const { items, total } = await candidatesRepository.findMany(query);
    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    };
  },

  async getById(id: string) {
    const candidate = await candidatesRepository.findById(id);
    if (!candidate) throw new NotFoundError('Candidate not found');

    const applications = await candidatesRepository.findApplicationsByCandidateId(id);
    return { ...candidate, applications };
  },

  async create(input: CreateCandidateInput) {
    const existing = await candidatesRepository.findByEmail(input.email);
    if (existing) throw new ConflictError('A candidate with this email already exists');
    return candidatesRepository.create(input);
  },

  async update(id: string, input: UpdateCandidateInput) {
    const existing = await candidatesRepository.findById(id);
    if (!existing) throw new NotFoundError('Candidate not found');

    if (input.email && input.email !== existing.email) {
      const emailTaken = await candidatesRepository.findByEmail(input.email);
      if (emailTaken) throw new ConflictError('A candidate with this email already exists');
    }

    return candidatesRepository.update(id, input);
  },

  async remove(id: string) {
    const existing = await candidatesRepository.findById(id);
    if (!existing) throw new NotFoundError('Candidate not found');
    await candidatesRepository.softDelete(id);
  },
};