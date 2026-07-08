import { beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { prisma } from '../src/plugins/prisma';

describe('Dashboard API', () => {
  beforeEach(async () => {
    await prisma.application.deleteMany();
    await prisma.candidate.deleteMany();
  });

  it('GET /api/dashboard returns all required metric fields with correct types', async () => {
    const app = buildApp();

    const alice = await prisma.candidate.create({
      data: { name: 'Alice Perera', email: 'alice@example.com' },
    });
    const bob = await prisma.candidate.create({
      data: { name: 'Bob Silva', email: 'bob@example.com' },
    });

    await prisma.application.create({
      data: { candidateId: alice.id, jobTitle: 'Backend Engineer', company: 'Acme', status: 'hired', appliedAt: new Date() },
    });
    await prisma.application.create({
      data: { candidateId: alice.id, jobTitle: 'Frontend Engineer', company: 'Beta', status: 'rejected', appliedAt: new Date() },
    });
    await prisma.application.create({
      data: { candidateId: bob.id, jobTitle: 'Designer', company: 'Gamma', status: 'applied', appliedAt: new Date() },
    });
    await prisma.application.create({
      data: { candidateId: bob.id, jobTitle: 'QA Engineer', company: 'Delta', status: 'rejected', appliedAt: new Date() },
    });

    const res = await app.inject({ method: 'GET', url: '/api/dashboard' });
    expect(res.statusCode).toBe(200);

    const body = res.json();

    expect(typeof body.totalCandidates).toBe('number');
    expect(body.totalCandidates).toBe(2);

    expect(typeof body.totalApplications).toBe('number');
    expect(body.totalApplications).toBe(4);

    expect(Array.isArray(body.applicationsByStatus)).toBe(true);
    expect(body.applicationsByStatus).toHaveLength(6); // all 6 enum values present, zero-filled
    const hiredEntry = body.applicationsByStatus.find((s: { status: string }) => s.status === 'hired');
    expect(hiredEntry.count).toBe(1);
    const rejectedEntry = body.applicationsByStatus.find((s: { status: string }) => s.status === 'rejected');
    expect(rejectedEntry.count).toBe(2);

    expect(typeof body.hiredThisMonth).toBe('number');
    expect(body.hiredThisMonth).toBe(1);

    expect(typeof body.rejectionRate).toBe('number');
    expect(body.rejectionRate).toBe(0.5); // 2 rejected / 4 total

    expect(Array.isArray(body.applicationsPerWeek)).toBe(true);

    expect(Array.isArray(body.latestApplications)).toBe(true);
    expect(body.latestApplications.length).toBeGreaterThan(0);
    expect(body.latestApplications[0]).toHaveProperty('candidateName');
    expect(body.latestApplications[0]).toHaveProperty('candidateEmail');
  });

  it('GET /api/dashboard returns zeroed metrics with no data', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/api/dashboard' });
    const body = res.json();

    expect(body.totalCandidates).toBe(0);
    expect(body.totalApplications).toBe(0);
    expect(body.rejectionRate).toBe(0);
    expect(body.latestApplications).toHaveLength(0);
  });
});