import { describe, it, expect } from 'vitest';
import { feetToMeters, formatFeetMeters, yardsToMeters, formatYardsMeters } from './units';

describe('feetToMeters', () => {
  it('returns 0 for 0 feet', () => {
    expect(feetToMeters(0)).toBe(0);
  });

  it('converts 3 feet to 0.9 m (3 × 0.3048 = 0.9144 → rounds to 0.9)', () => {
    expect(feetToMeters(3)).toBe(0.9);
  });

  it('converts 5 feet to 1.5 m', () => {
    expect(feetToMeters(5)).toBe(1.5);
  });

  it('converts 10 feet to 3.0 m (3.048 → rounds to 3)', () => {
    expect(feetToMeters(10)).toBe(3);
  });

  it('converts 20 feet to 6.1 m (6.096 → rounds to 6.1)', () => {
    expect(feetToMeters(20)).toBe(6.1);
  });

  it('handles a large distance (100 ft = 30.5 m)', () => {
    expect(feetToMeters(100)).toBe(30.5);
  });
});

describe('formatFeetMeters', () => {
  it('formats 0 feet', () => {
    expect(formatFeetMeters(0)).toBe('0 ft / ~0 m');
  });

  it('formats 10 feet', () => {
    expect(formatFeetMeters(10)).toBe('10 ft / ~3 m');
  });

  it('formats 20 feet', () => {
    expect(formatFeetMeters(20)).toBe('20 ft / ~6.1 m');
  });
});

describe('yardsToMeters', () => {
  it('returns 0 for 0 yards', () => {
    expect(yardsToMeters(0)).toBe(0);
  });

  it('converts 100 yards to 91 m (91.44 → rounds to 91)', () => {
    expect(yardsToMeters(100)).toBe(91);
  });

  it('converts 150 yards to 137 m', () => {
    expect(yardsToMeters(150)).toBe(137);
  });

  it('converts 293 yards (PGA Tour avg) to 268 m', () => {
    expect(yardsToMeters(293)).toBe(268);
  });

  it('handles a large distance (500 yd = 457 m)', () => {
    expect(yardsToMeters(500)).toBe(457);
  });
});

describe('formatYardsMeters', () => {
  it('formats 0 yards', () => {
    expect(formatYardsMeters(0)).toBe('0 yd / ~0 m');
  });

  it('formats 100 yards', () => {
    expect(formatYardsMeters(100)).toBe('100 yd / ~91 m');
  });

  it('formats 293 yards', () => {
    expect(formatYardsMeters(293)).toBe('293 yd / ~268 m');
  });
});
