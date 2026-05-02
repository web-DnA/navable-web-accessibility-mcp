import { describe, expect, it } from 'vitest';
import { mapAxeViolation, mapHtmlcsIssue, mergeViolations } from '../src/normalize.js';
import { _scanSchema } from '../src/tools/generate-fix-plan.js';

const COMPACT_OPTS = { isCompact: true, htmlCap: 120 };

/**
 * These tests guarantee that the scan output produced by the (axe + htmlcs)
 * pipeline is consumable by generate_fix_plan. The schema is intentionally
 * forgiving (passthrough), but the impact enum and required fields are strict.
 */
describe('generate_fix_plan schema accepts merged scan output', () => {
  it('accepts a scan containing an htmlcs-source violation with helpUrl + developerNote', () => {
    const axe = mapAxeViolation(
      {
        id: 'image-alt',
        impact: 'critical',
        help: 'Images must have alternative text',
        description: 'Ensures <img> elements have alternate text',
        helpUrl: 'https://example.com',
        tags: ['wcag2a', 'wcag111'],
        nodes: [{ target: ['main > img'], html: '<img>' }],
      },
      COMPACT_OPTS,
    );

    const htmlcsOnly = mapHtmlcsIssue(
      {
        code: 'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2',
        type: 'error',
        message: 'The html element should have a lang attribute.',
        selector: 'html',
        context: '<html>',
      },
      COMPACT_OPTS,
    );

    const { merged } = mergeViolations([axe], [htmlcsOnly]);
    const scan = {
      url: 'http://localhost:3000/',
      timestamp: new Date().toISOString(),
      summary: { total: merged.length },
      violations: merged,
      incomplete: [],
      metadata: { enginesRun: ['axe', 'htmlcs'] },
    };

    const parsed = _scanSchema.safeParse(scan);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const htmlcsRow = parsed.data.violations.find(
        v => (v as { source?: string }).source === 'htmlcs',
      );
      expect(htmlcsRow).toBeDefined();
      // passthrough preserves source, helpUrl, developerNote, alsoFlaggedBy
      expect((htmlcsRow as Record<string, unknown>).source).toBe('htmlcs');
      expect((htmlcsRow as Record<string, unknown>).helpUrl).toBeDefined();
      expect((htmlcsRow as Record<string, unknown>).developerNote).toBeDefined();
    }
  });

  it('accepts crossover-confirmed entries (alsoFlaggedBy preserved)', () => {
    const axe = mapAxeViolation(
      {
        id: 'image-alt',
        impact: 'critical',
        help: 'Images must have alternative text',
        description: '',
        helpUrl: '',
        tags: [],
        nodes: [{ target: ['main > img'], html: '<img>' }],
      },
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      {
        code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H37',
        type: 'error',
        message: 'Img missing alt.',
        selector: 'main > img',
        context: '<img>',
      },
      COMPACT_OPTS,
    );

    const { merged } = mergeViolations([axe], [htmlcs]);
    const scan = {
      url: 'http://localhost:3000/',
      timestamp: new Date().toISOString(),
      violations: merged,
    };

    const parsed = _scanSchema.safeParse(scan);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect((parsed.data.violations[0] as Record<string, unknown>).alsoFlaggedBy).toEqual([
        'htmlcs',
      ]);
    }
  });

  it('rejects scan with invalid impact value (regression guard for HTMLCS mapping)', () => {
    const scan = {
      url: 'http://localhost:3000/',
      timestamp: new Date().toISOString(),
      violations: [
        { id: 'x', impact: 'unknown', nodes: [] }, // invalid impact
      ],
    };
    const parsed = _scanSchema.safeParse(scan);
    expect(parsed.success).toBe(false);
  });
});
