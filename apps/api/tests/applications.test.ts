import { beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { prisma } from '../src/plugins/prisma';

describe('Applications API', () => {
  beforeEach(async () => {
    await prisma.application.deleteMany();
    await prisma.candidate.deleteMany();
  });

  it('POST /api/applications returns 201 with valid candidate_id', async () => {
    const app = buildApp();
    const candidate = await prisma.candidate.create({
      data: { name: 'Alice Perera', email: 'alice@example.com' },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/applications',
      payload: {
        candidateId: candidate.id,
        jobTitle: 'Frontend Engineer',
        company: 'Acme Corp',
        appliedAt: new Date().toISOString(),
      },
    });

    expect(res.statusCode).toBe(201);
  });

  it('POST /api/applications returns 400 with missing required fields', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/applications',
      payload: { jobTitle: 'Frontend Engineer' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/applications returns 404 with unknown candidate_id', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/applications',
      payload: {
        candidateId: '00000000-0000-0000-0000-000000000000',
        jobTitle: 'Frontend Engineer',
        company: 'Acme Corp',
        appliedAt: new Date().toISOString(),
      },
    });
    expect(res.statusCode).toBe(404);
  });

  it('PATCH /api/applications/:id returns 200 on valid update', async () => {
    const app = buildApp();
    const candidate = await prisma.candidate.create({
      data: { name: 'Alice Perera', email: 'alice@example.com' },
    });
    const application = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobTitle: 'Frontend Engineer',
        company: 'Acme Corp',
        appliedAt: new Date(),
      },
    });

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/applications/${application.id}`,
      payload: { status: 'interview' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('interview');
  });

  it('PATCH /api/applications/:id returns 404 on unknown ID', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/applications/00000000-0000-0000-0000-000000000000',
      payload: { status: 'interview' },
    });
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/applications?search matches by candidate name via JOIN', async () => {
    const app = buildApp();
    const alice = await prisma.candidate.create({
      data: { name: 'Alice Perera', email: 'alice@example.com' },
    });
    const bob = await prisma.candidate.create({
      data: { name: 'Bob Silva', email: 'bob@example.com' },
    });

    await prisma.application.create({
      data: { candidateId: alice.id, jobTitle: 'Backend Engineer', company: 'Acme', appliedAt: new Date() },
    });
    await prisma.application.create({
      data: { candidateId: bob.id, jobTitle: 'Designer', company: 'Beta', appliedAt: new Date() },
    });

    const res = await app.inject({ method: 'GET', url: '/api/applications?search=alice' });
    const body = res.json();
    expect(body.items.length).toBe(1);
    expect(body.items[0].candidateName).toBe('Alice Perera');
  });

  it('GET /api/applications?search matches by job_title too', async () => {
    const app = buildApp();
    const alice = await prisma.candidate.create({
      data: { name: 'Alice Perera', email: 'alice@example.com' },
    });
    await prisma.application.create({
      data: { candidateId: alice.id, jobTitle: 'Backend Engineer', company: 'Acme', appliedAt: new Date() },
    });

    const res = await app.inject({ method: 'GET', url: '/api/applications?search=backend' });
    expect(res.json().items.length).toBe(1);
  });
});