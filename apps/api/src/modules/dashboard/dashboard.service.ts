import { Prisma } from '@prisma/client';
import { prisma } from '../../plugins/prisma';
import { applicationStatusValues, type ApplicationStatus } from '@candidate-tracker/shared';

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

async function getTotals() {
  const [totalCandidates, totalApplications] = await Promise.all([
    prisma.candidate.count({ where: { deletedAt: null } }),
    prisma.application.count(),
  ]);
  return { totalCandidates, totalApplications };
}

async function getApplicationsByStatus() {
  const grouped = await prisma.application.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  const countsByStatus = new Map(grouped.map((g) => [g.status, g._count._all]));

  // Zero-fill so every status appears even with no applications yet
  return applicationStatusValues.map((status) => ({
    status: status as ApplicationStatus,
    count: countsByStatus.get(status) ?? 0,
  }));
}

async function getHiredThisMonth() {
  return prisma.application.count({
    where: { status: 'hired', updatedAt: { gte: startOfMonth() } },
  });
}

async function getRejectionRate(totalApplications: number) {
  if (totalApplications === 0) return 0;
  const rejected = await prisma.application.count({ where: { status: 'rejected' } });
  return Math.round((rejected / totalApplications) * 1000) / 1000; // e.g. 0.182
}

async function getApplicationsPerWeek() {
  const rows = await prisma.$queryRaw<{ week_start: Date; count: bigint }[]>(
    Prisma.sql`
      SELECT date_trunc('week', applied_at)::date AS week_start, COUNT(*)::bigint AS count
      FROM applications
      WHERE applied_at >= NOW() - INTERVAL '8 weeks'
      GROUP BY week_start
      ORDER BY week_start ASC
    `
  );

  return rows.map((r) => ({ weekStart: r.week_start, count: Number(r.count) }));
}

async function getLatestApplications() {
  const applications = await prisma.application.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { candidate: { select: { name: true, email: true } } },
  });

  return applications.map(({ candidate, ...app }) => ({
    ...app,
    candidateName: candidate.name,
    candidateEmail: candidate.email,
  }));
}

export const dashboardService = {
  async getMetrics() {
    const { totalCandidates, totalApplications } = await getTotals();

    const [applicationsByStatus, hiredThisMonth, rejectionRate, applicationsPerWeek, latestApplications] =
      await Promise.all([
        getApplicationsByStatus(),
        getHiredThisMonth(),
        getRejectionRate(totalApplications),
        getApplicationsPerWeek(),
        getLatestApplications(),
      ]);

    return {
      totalCandidates,
      totalApplications,
      applicationsByStatus,
      hiredThisMonth,
      rejectionRate,
      applicationsPerWeek,
      latestApplications,
    };
  },
};