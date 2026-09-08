import { describe, it, expect } from 'vitest';
import { calculateAchievementPercentage } from '@/lib/production';

describe('Production Calculation Logic', () => {
  it('correctly calculates achievement percentage for normal numbers', () => {
    expect(calculateAchievementPercentage(5200, 5000)).toBe(104);
    expect(calculateAchievementPercentage(4300, 4500)).toBe(95.6);
  });

  it('safely handles zero planned quantity without throwing division by zero', () => {
    expect(calculateAchievementPercentage(100, 0)).toBe(0);
    expect(calculateAchievementPercentage(0, 0)).toBe(0);
  });

  it('safely handles negative numbers', () => {
    expect(calculateAchievementPercentage(-50, 100)).toBe(0);
    expect(calculateAchievementPercentage(50, -100)).toBe(0);
  });
});
