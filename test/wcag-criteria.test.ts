import { describe, expect, it } from 'vitest';
import { getCriterionBySc, getForAxeRule } from '../src/data/wcag-criteria.js';

describe('getCriterionBySc', () => {
  it('returns the criterion for a known SC', () => {
    const c = getCriterionBySc('1.1.1');
    expect(c).toBeDefined();
    expect(c!.sc).toBe('1.1.1');
    expect(c!.en301549).toBe('9.1.1.1');
    expect(c!.developerNote).toBeTruthy();
    expect(c!.understandingUrl).toMatch(/^https:\/\/www\.w3\.org\/WAI\/WCAG22\/Understanding\//);
  });

  it('returns undefined for an unknown SC', () => {
    expect(getCriterionBySc('9.9.9')).toBeUndefined();
  });

  it('returns undefined for the removed SC 4.1.1 (Parsing)', () => {
    expect(getCriterionBySc('4.1.1')).toBeUndefined();
  });
});

describe('getForAxeRule', () => {
  it('returns at least one criterion for a well-known axe rule', () => {
    const result = getForAxeRule('image-alt');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].sc).toBe('1.1.1');
  });

  it('returns an empty array for an unknown rule', () => {
    expect(getForAxeRule('not-a-real-rule')).toEqual([]);
  });
});
