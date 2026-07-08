import { applicationsRepository } from './applications.repository';
import { NotFoundError } from '../../plugins/error-handler';
import type {
  ApplicationListQuery,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@candidate-tracker/shared';

function toListItem(app: Awaited<ReturnType<typeof applicationsRepository.findMany>>['items'][number]) {
  const { candidate, ...rest } = app;
  return { ...rest, candidateName: candidate.name, candidateEmail: candidate.email };
}

export const applicationsService = {
  async list(query: ApplicationListQuery) {
    const { items, total } = await applicationsRepository.findMany(query);
    return {
      items: items.map(toListItem),
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    };
  },

  async getById(id: string) {
    const application = await applicationsRepository.findById(id);
    if (!application) throw new NotFoundError('Application not found');
    return application;
  },

  async create(input: CreateApplicationInput) {
    const candidate = await applicationsRepository.candidateExists(input.candidateId);
    if (!candidate) throw new NotFoundError('Candidate not found');
    return applicationsRepository.create(input);
  },

  async update(id: string, input: UpdateApplicationInput) {
    const existing = await applicationsRepository.findById(id);
    if (!existing) throw new NotFoundError('Application not found');

    if (input.candidateId) {
      const candidate = await applicationsRepository.candidateExists(input.candidateId);
      if (!candidate) throw new NotFoundError('Candidate not found');
    }

    return applicationsRepository.update(id, input);
  },

  async remove(id: string) {
    const existing = await applicationsRepository.findById(id);
    if (!existing) throw new NotFoundError('Application not found');
    await applicationsRepository.delete(id);
  },
};