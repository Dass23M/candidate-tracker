import { Prisma } from '@prisma/client';
import { prisma } from '../../plugins/prisma';
import type { CandidateListQuery, CreateCandidateInput, UpdateCandidateInput } from '@candidate-tracker/shared';

function searchWhere(search?: string): Prisma.CandidateWhereInput {
  if (!search) return {};
  return {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ],
  };
}

export const candidatesRepository = {
  async findMany(query: CandidateListQuery) {
    const where: Prisma.CandidateWhereInput = {
      deletedAt: null,
      ...searchWhere(query.search),
    };

    const [items, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.candidate.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string) {
    return prisma.candidate.findFirst({ where: { id, deletedAt: null } });
  },

  findByEmail(email: string) {
    return prisma.candidate.findFirst({ where: { email, deletedAt: null } });
  },

  create(data: CreateCandidateInput) {
    return prisma.candidate.create({ data });
  },

  update(id: string, data: UpdateCandidateInput) {
    return prisma.candidate.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.candidate.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  findApplicationsByCandidateId(candidateId: string) {
    return prisma.application.findMany({
      where: { candidateId },
      orderBy: { appliedAt: 'desc' },
    });
  },
};