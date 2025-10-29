import { describe, it, expect } from 'vitest';
import { detectObjects } from '../server/cv-service';

describe('cv-service.detectObjects (mock)', () => {
  it('returns detections and a severity number', async () => {
    const bufSmall = Buffer.alloc(10000);
    const res1 = await detectObjects(bufSmall);
    expect(res1).toHaveProperty('detections');
    expect(typeof res1.severity).toBe('number');

    const bufLarge = Buffer.alloc(300000);
    const res2 = await detectObjects(bufLarge);
    expect(res2.detections.length).toBeGreaterThanOrEqual(1);
    expect(res2.severity).toBeGreaterThanOrEqual(res1.severity);
  });
});
