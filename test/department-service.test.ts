import { describe, it, expect } from 'vitest';
import { escalateAssignments } from '../server/department-service';

describe('department-service escalation', () => {
  it('returns an array (no crash)', () => {
    const res = escalateAssignments();
    expect(Array.isArray(res)).toBe(true);
  });
});
