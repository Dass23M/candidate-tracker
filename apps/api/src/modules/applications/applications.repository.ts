import { Prisma } from '@prisma/client';
import { prisma } from '../../plugins/prisma';
import type {
  ApplicationListQuery,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@candidate-tracker/shared';

function buildWhere(query: ApplicationListQuery): Prisma.ApplicationWhereInput {
  const clauses: Prisma.ApplicationWhereInput[] = [];

  if (query.status) {
    clauses.push({ status: query.status });
  }

  if (query.appliedFrom || query.appliedTo) {
    clauses.push({
      appliedAt: {
        ...(query.appliedFrom ? { gte: query.appliedFrom } : {}),
        ...(query.appliedTo ? { lte: query.appliedTo } : {}),
      },
    });
  }

  if (query.search) {
    const s = query.search;
    clauses.push({
      OR: [
        { jobTitle: { contains: s, mode: 'insensitive' } },
        { company: { contains: s, mode: 'insensitive' } },
        { source: { contains: s, mode: 'insensitive' } },
        { notes: { contains: s, mode: 'insensitive' } },
        // These three cross the relation boundary -> Prisma emits a SQL JOIN, not a second query.
        { candidate: { name: { contains: s, mode: 'insensitive' } } },
        { candidate: { email: { contains: s, mode: 'insensitive' } } },
        { candidate: { location: { contains: s, mode: 'insensitive' } } },
      ],
    });
  }

  return clauses.length ? { AND: clauses } : {};
}

export const applicationsRepository = {
  async findMany(query: ApplicationListQuery) {
    const where = buildWhere(query);

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: { candidate: { select: { id: true, name: true, email: true } } },
        orderBy: { appliedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.application.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: { candidate: true },
    });
  },

  candidateExists(candidateId: string) {
    return prisma.candidate.findFirst({ where: { id: candidateId, deletedAt: null } });
  },

  create(data: CreateApplicationInput) {
    return prisma.application.create({ data });
  },

  update(id: string, data: UpdateApplicationInput) {
    return prisma.application.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.application.delete({ where: { id } });
  },
};