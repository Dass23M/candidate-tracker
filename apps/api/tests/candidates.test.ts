import { beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { prisma } from '../src/plugins/prisma';

describe('Candidates API', () => {
  beforeEach(async () => {
    await prisma.application.deleteMany();
    await prisma.candidate.deleteMany();
  });

  it('POST /api/candidates returns 201 on valid body', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/candidates',
      payload: { name: 'Alice Perera', email: 'alice@example.com' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().email).toBe('alice@example.com');
  });

  it('POST /api/candidates returns 400 on invalid body', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/candidates',
      payload: { name: '', email: 'not-an-email' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/candidates returns 409 on duplicate email', async () => {
    const app = buildApp();
    await app.inject({
      method: 'POST',
      url: '/api/candidates',
      payload: { name: 'Alice Perera', email: 'alice@example.com' },
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/candidates',
      payload: { name: 'Alice Two', email: 'alice@example.com' },
    });
    expect(res.statusCode).toBe(409);
  });

  it('GET /api/candidates returns a paginated list', async () => {
    const app = buildApp();
    await prisma.candidate.create({ data: { name: 'Bob Silva', email: 'bob@example.com' } });
    const res = await app.inject({ method: 'GET', url: '/api/candidates' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.items.length).toBe(1);
    expect(body.total).toBe(1);
  });

  it('GET /api/candidates?search filters by name', async () => {
    const app = buildApp();
    await prisma.candidate.create({ data: { name: 'Bob Silva', email: 'bob@example.com' } });
    await prisma.candidate.create({ data: { name: 'Nadia Fernando', email: 'nadia@example.com' } });

    const res = await app.inject({ method: 'GET', url: '/api/candidates?search=nadia' });
    const body = res.json();
    expect(body.items.length).toBe(1);
    expect(body.items[0].name).toBe('Nadia Fernando');
  });
});