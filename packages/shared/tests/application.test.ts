import { describe, expect, it } from 'vitest';
import { createApplicationSchema } from '../src/application';
import { applicationStatusSchema } from '../src/enums';

const validCandidateId = '11111111-1111-1111-1111-111111111111';

describe('createApplicationSchema', () => {
  it('passes with valid required fields', () => {
    const result = createApplicationSchema.safeParse({
      candidateId: validCandidateId,
      jobTitle: 'Frontend Engineer',
      company: 'Acme Corp',
      appliedAt: '2026-06-01',
    });
    expect(result.success).toBe(true);
  });

  it('defaults status to "applied" when omitted', () => {
    const result = createApplicationSchema.safeParse({
      candidateId: validCandidateId,
      jobTitle: 'Frontend Engineer',
      company: 'Acme Corp',
      appliedAt: '2026-06-01',
    });
    if (result.success) {
      expect(result.data.status).toBe('applied');
    }
  });

  it('fails when candidateId is not a UUID', () => {
    const result = createApplicationSchema.safeParse({
      candidateId: 'not-a-uuid',
      jobTitle: 'Frontend Engineer',
      company: 'Acme Corp',
      appliedAt: '2026-06-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Must select a candidate');
    }
  });

  it('fails when jobTitle is missing', () => {
    const result = createApplicationSchema.safeParse({
      candidateId: validCandidateId,
      company: 'Acme Corp',
      appliedAt: '2026-06-01',
    });
    expect(result.success).toBe(false);
  });

  it('fails when salaryExpectation is not positive', () => {
    const result = createApplicationSchema.safeParse({
      candidateId: validCandidateId,
      jobTitle: 'Frontend Engineer',
      company: 'Acme Corp',
      appliedAt: '2026-06-01',
      salaryExpectation: -500,
    });
    expect(result.success).toBe(false);
  });
});

describe('applicationStatusSchema', () => {
  it('accepts all 6 valid enum values', () => {
    const valid = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];
    for (const status of valid) {
      expect(applicationStatusSchema.safeParse(status).success).toBe(true);
    }
  });

  it('rejects an invalid status value', () => {
    expect(applicationStatusSchema.safeParse('withdrawn').success).toBe(false);
  });
});