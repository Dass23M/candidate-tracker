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

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getApplicationsPerWeek() {
  const since = new Date();
  since.setDate(since.getDate() - 56); // 8 weeks

  const applications = await prisma.application.findMany({
    where: { appliedAt: { gte: since } },
    select: { appliedAt: true },
  });

  const weekBuckets = new Map<string, number>();
  for (const app of applications) {
    const key = startOfWeek(app.appliedAt).toISOString();
    weekBuckets.set(key, (weekBuckets.get(key) ?? 0) + 1);
  }

  return Array.from(weekBuckets.entries())
    .map(([weekStart, count]) => ({ weekStart: new Date(weekStart), count }))
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
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