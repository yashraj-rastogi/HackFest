import { describe, it, expect } from 'vitest';
import { formatQty, parseQty, getStepSize } from './units';

describe('formatQty', () => {
  it('formats weight in fractions and kilograms', () => {
    expect(formatQty(250, 'g', 'en')).toBe('¼ kg');
    expect(formatQty(500, 'g', 'en')).toBe('½ kg');
    expect(formatQty(750, 'g', 'en')).toBe('¾ kg');
    expect(formatQty(1000, 'g', 'en')).toBe('1 kg');
    expect(formatQty(1500, 'g', 'en')).toBe('1½ kg');
    expect(formatQty(2250, 'g', 'en')).toBe('2¼ kg');
    expect(formatQty(2750, 'g', 'en')).toBe('2¾ kg');
    expect(formatQty(350, 'g', 'en')).toBe('350 g');
  });

  it('formats volume in liters and fractions', () => {
    expect(formatQty(500, 'ml', 'en')).toBe('½ L');
    expect(formatQty(1000, 'ml', 'en')).toBe('1 L');
    expect(formatQty(2500, 'ml', 'en')).toBe('2½ L');
    expect(formatQty(200, 'ml', 'en')).toBe('200 ml');
  });

  it('formats pieces and dozens', () => {
    expect(formatQty(1, 'pcs', 'en')).toBe('1 pcs');
    expect(formatQty(5, 'pcs', 'en')).toBe('5 pcs');
    expect(formatQty(12, 'pcs', 'en')).toBe('1 dozen');
    expect(formatQty(24, 'pcs', 'en')).toBe('2 dozens');
    expect(formatQty(15, 'pcs', 'en')).toBe('15 pcs');
  });

  it('respects Hindi language output', () => {
    expect(formatQty(500, 'g', 'hi')).toBe('½ किलो');
    expect(formatQty(1000, 'g', 'hi')).toBe('1 किलो');
    expect(formatQty(12, 'pcs', 'hi')).toBe('1 दर्जन');
    expect(formatQty(5, 'pcs', 'hi')).toBe('5 पीस');
    expect(formatQty(null, 'g', 'hi')).toBe('अज्ञात');
  });
});

describe('parseQty', () => {
  it('parses fractional and unit inputs to base units', () => {
    expect(parseQty(0.5, 'kg')).toBe(500);
    expect(parseQty(1, 'kg')).toBe(1000);
    expect(parseQty(250, 'g')).toBe(250);
    expect(parseQty(1.5, 'l')).toBe(1500);
    expect(parseQty(1, 'dozen')).toBe(12);
    expect(parseQty(2.5, 'dozen')).toBe(30);
  });
});

describe('getStepSize', () => {
  it('returns correct step size for pieces', () => {
    expect(getStepSize(5, 'pcs')).toBe(1);
  });

  it('returns 50 for weight below 1000g, 250 for 1000g and above', () => {
    expect(getStepSize(250, 'g')).toBe(50);
    expect(getStepSize(1000, 'g')).toBe(250);
    expect(getStepSize(2500, 'g')).toBe(250);
  });
});
