import { describe, it, expect } from 'vitest';
import { assignDepartment } from '../server/routing-engine';

describe('routing-engine.assignDepartment', () => {
  it('assigns roads for pothole', () => {
    const dept = assignDepartment('Pothole in road', ['pothole']);
    expect(dept).toBe('roads');
  });
  it('falls back to general when unknown', () => {
    const dept = assignDepartment('Unknown issue', []);
    expect(dept).toBe('general');
  });
});
