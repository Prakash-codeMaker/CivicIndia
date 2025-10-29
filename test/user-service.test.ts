import { describe, it, expect } from 'vitest';
import { computeTrustScore, assignBadges } from '../server/user-service';

describe('user-service trust scoring', () => {
  it('grows with verification and accuracy', () => {
    const user = { phoneVerified: true, aadhaarVerified: true, inPersonVerified: false, reports: [{ status: 'resolved', verified: true }, { status: 'submitted', verified: false }] } as any;
    const score = computeTrustScore(user);
    expect(score).toBeGreaterThan(10);
    const badges = assignBadges({ ...user, reports: new Array(60).fill({ status: 'resolved', verified: true }) } as any);
    expect(badges).toContain('Veteran Reporter');
  });
});
