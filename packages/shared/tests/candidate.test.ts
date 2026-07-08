import { describe, expect, it } from 'vitest';
import { createCandidateSchema } from '../src/candidate';

describe('createCandidateSchema', () => {
  it('passes with valid required fields only', () => {
    const result = createCandidateSchema.safeParse({ name: 'Alice Perera', email: 'alice@example.com' });
    expect(result.success).toBe(true);
  });

  it('passes with all optional fields filled in', () => {
    const result = createCandidateSchema.safeParse({
      name: 'Alice Perera',
      email: 'alice@example.com',
      phone: '0771234567',
      location: 'Colombo, Sri Lanka',
      linkedinUrl: 'https://linkedin.com/in/alice',
      notes: 'Strong candidate',
    });
    expect(result.success).toBe(true);
  });

  it('fails when name is empty', () => {
    const result = createCandidateSchema.safeParse({ name: '', email: 'alice@example.com' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Name is required');
    }
  });

  it('fails when email is invalid', () => {
    const result = createCandidateSchema.safeParse({ name: 'Alice Perera', email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Must be a valid email');
    }
  });

  it('fails when linkedinUrl is not a valid URL', () => {
    const result = createCandidateSchema.safeParse({
      name: 'Alice Perera',
      email: 'alice@example.com',
      linkedinUrl: 'not-a-url',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Must be a valid URL');
    }
  });
});