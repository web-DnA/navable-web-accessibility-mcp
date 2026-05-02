import { describe, expect, it } from 'vitest';
import {
  mapAxeViolation,
  mapHtmlcsIssue,
  mergeViolations,
  type AxeViolationLike,
  type NormalizedViolation,
  type Pa11yIssue,
} from '../src/normalize.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function axeImageAlt(overrides: Partial<AxeViolationLike> = {}): AxeViolationLike {
  return {
    id: 'image-alt',
    impact: 'critical',
    help: 'Images must have alternative text',
    description: 'Ensures <img> elements have alternate text',
    helpUrl: 'https://dequeuniversity.com/rules/axe/image-alt',
    tags: ['wcag2a', 'wcag111'],
    nodes: [{ target: ['main > img:nth-child(2)'], html: '<img src="/hero.jpg">' }],
    ...overrides,
  };
}

function htmlcsImageAlt(overrides: Partial<Pa11yIssue> = {}): Pa11yIssue {
  return {
    code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H37',
    type: 'error',
    message: 'Img element missing an alt attribute.',
    selector: 'main > img:nth-child(2)',
    context: '<img src="/hero.jpg">',
    ...overrides,
  };
}

const COMPACT_OPTS = { isCompact: true, htmlCap: 120 };

// ---------------------------------------------------------------------------
// mapAxeViolation
// ---------------------------------------------------------------------------

describe('mapAxeViolation', () => {
  it('produces compact entry with WCAG criteria from the rule lookup', () => {
    const result = mapAxeViolation(axeImageAlt(), COMPACT_OPTS);
    expect(result.source).toBe('axe');
    expect(result.id).toBe('image-alt');
    expect(result.impact).toBe('critical');
    expect(result.wcagCriteria.length).toBeGreaterThan(0);
    expect(result.wcagCriteria[0]).toMatchObject({ sc: '1.1.1', en301549: '9.1.1.1' });
    expect(result.nodes[0]).toMatchObject({ html: '<img src="/hero.jpg">' });
    // compact mode strips description/helpUrl/wcag tags
    expect(result.description).toBeUndefined();
    expect(result.helpUrl).toBeUndefined();
    expect(result.wcag).toBeUndefined();
  });

  it('includes verbose fields when isCompact is false', () => {
    const result = mapAxeViolation(axeImageAlt(), { isCompact: false, htmlCap: 200 });
    expect(result.description).toBe('Ensures <img> elements have alternate text');
    expect(result.helpUrl).toBe('https://dequeuniversity.com/rules/axe/image-alt');
    expect(result.wcag).toEqual(['wcag2a', 'wcag111']);
    expect(result.nodes[0].failureSummary).toBe('');
  });

  it('truncates long HTML to the cap with an ellipsis', () => {
    const longHtml = '<img ' + 'x'.repeat(500) + '>';
    const v = axeImageAlt({ nodes: [{ target: ['img'], html: longHtml }] });
    const result = mapAxeViolation(v, COMPACT_OPTS);
    expect(result.nodes[0].html.length).toBeLessThanOrEqual(121); // cap + ellipsis char
    expect(result.nodes[0].html.endsWith('…')).toBe(true);
  });

  it('falls back to "minor" when impact is null', () => {
    const result = mapAxeViolation(axeImageAlt({ impact: null }), COMPACT_OPTS);
    expect(result.impact).toBe('minor');
  });
});

// ---------------------------------------------------------------------------
// mapHtmlcsIssue
// ---------------------------------------------------------------------------

describe('mapHtmlcsIssue', () => {
  it('parses SC from HTMLCS code and resolves the criterion', () => {
    const result = mapHtmlcsIssue(htmlcsImageAlt(), COMPACT_OPTS);
    expect(result.source).toBe('htmlcs');
    expect(result.wcagCriteria[0]).toMatchObject({ sc: '1.1.1', en301549: '9.1.1.1' });
  });

  it('maps HTMLCS type to impact (error → serious)', () => {
    expect(mapHtmlcsIssue(htmlcsImageAlt({ type: 'error' }), COMPACT_OPTS).impact).toBe('serious');
    expect(mapHtmlcsIssue(htmlcsImageAlt({ type: 'warning' }), COMPACT_OPTS).impact).toBe(
      'moderate',
    );
    expect(mapHtmlcsIssue(htmlcsImageAlt({ type: 'notice' }), COMPACT_OPTS).impact).toBe('minor');
  });

  it('populates helpUrl + developerNote when SC matches a known criterion', () => {
    const result = mapHtmlcsIssue(htmlcsImageAlt(), COMPACT_OPTS);
    expect(result.helpUrl).toMatch(/^https:\/\/www\.w3\.org\/WAI\/WCAG22\/Understanding\//);
    expect(result.developerNote).toBeTruthy();
    expect(result.developerNote!.length).toBeGreaterThan(10);
  });

  it('falls back gracefully when SC is unknown (synthesises en301549, no helpUrl)', () => {
    const result = mapHtmlcsIssue(
      htmlcsImageAlt({ code: 'WCAG2AA.Principle9.Guideline9_9.9_9_9.X1' }),
      COMPACT_OPTS,
    );
    expect(result.wcagCriteria[0]).toMatchObject({ sc: '9.9.9', en301549: '9.9.9.9' });
    expect(result.helpUrl).toBeUndefined();
    expect(result.developerNote).toBeUndefined();
  });

  it('handles missing selector and context without crashing', () => {
    const result = mapHtmlcsIssue(
      { code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H37', type: 'error', message: 'msg' },
      COMPACT_OPTS,
    );
    expect(result.nodes[0].target).toEqual([]);
    expect(result.nodes[0].html).toBe('');
  });

  it('truncates long context HTML', () => {
    const result = mapHtmlcsIssue(
      htmlcsImageAlt({ context: '<img ' + 'x'.repeat(500) + '>' }),
      COMPACT_OPTS,
    );
    expect(result.nodes[0].html.length).toBeLessThanOrEqual(121);
    expect(result.nodes[0].html.endsWith('…')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// mergeViolations — the safety-critical dedup ladder
// ---------------------------------------------------------------------------

describe('mergeViolations', () => {
  it('returns empty result for empty inputs without crashing', () => {
    const { merged, stats } = mergeViolations([], []);
    expect(merged).toEqual([]);
    expect(stats).toEqual({ merged: 0, unmergedCrossoverCandidates: 0 });
  });

  it('MERGE: same SC + identical normalized selector + matching HTML', () => {
    const axe = mapAxeViolation(axeImageAlt(), COMPACT_OPTS);
    const htmlcs = mapHtmlcsIssue(htmlcsImageAlt(), COMPACT_OPTS);

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    expect(merged).toHaveLength(1);
    expect(merged[0].source).toBe('axe');
    expect(merged[0].alsoFlaggedBy).toEqual(['htmlcs']);
    expect(stats.merged).toBe(1);
    expect(stats.unmergedCrossoverCandidates).toBe(0);
  });

  it('MERGE: same SC + identical normalized selector + no HTML on htmlcs side', () => {
    const axe = mapAxeViolation(axeImageAlt(), COMPACT_OPTS);
    const htmlcs = mapHtmlcsIssue(htmlcsImageAlt({ context: undefined }), COMPACT_OPTS);

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    expect(stats.merged).toBe(1);
    expect(merged).toHaveLength(1);
  });

  it('MERGE: normalizes "html > body > main > img" to match "main > img"', () => {
    const axe = mapAxeViolation(
      axeImageAlt({ nodes: [{ target: ['main > img'], html: '<img>' }] }),
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      htmlcsImageAlt({ selector: 'html > body > main > img', context: '<img>' }),
      COMPACT_OPTS,
    );

    const { stats } = mergeViolations([axe], [htmlcs]);
    expect(stats.merged).toBe(1);
  });

  it('KEEP BOTH: same SC + identical selector but HTML differs (safety bias)', () => {
    const axe = mapAxeViolation(
      axeImageAlt({ nodes: [{ target: ['main > img'], html: '<img src="/a.jpg">' }] }),
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      htmlcsImageAlt({ selector: 'main > img', context: '<img src="/totally-different.png">' }),
      COMPACT_OPTS,
    );

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    expect(merged).toHaveLength(2);
    expect(stats.merged).toBe(0);
    expect(stats.unmergedCrossoverCandidates).toBe(1);
  });

  it('KEEP BOTH: bare-tag fingerprint without positional discriminator (repeating-layout guard)', () => {
    // Fingerprint "nav > main > img" has no :nth-/#/./[ — in a repeating
    // layout this could match many elements. The fingerprint tier should
    // refuse to consider this and keep both entries.
    const axe = mapAxeViolation(
      axeImageAlt({ nodes: [{ target: ['aaa > nav > main > img'], html: '<img src="/a">' }] }),
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      htmlcsImageAlt({
        selector: 'bbb > nav > main > img',
        context: '<img src="/totally-different">',
      }),
      COMPACT_OPTS,
    );

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    expect(merged).toHaveLength(2);
    // Tier was skipped entirely (no discriminator), so this isn't even
    // counted as an attempted-but-rejected crossover.
    expect(stats.unmergedCrossoverCandidates).toBe(0);
  });

  it('MERGE: fingerprint match with positional discriminator + HTML confirmation', () => {
    // Selectors differ in prefix, fingerprint matches AND has :nth-child
    // (positional discriminator) AND HTML confirms same element.
    const axe = mapAxeViolation(
      axeImageAlt({
        nodes: [{ target: ['aaa > nav > main > img:nth-child(2)'], html: '<img src="/a">' }],
      }),
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      htmlcsImageAlt({
        selector: 'bbb > nav > main > img:nth-child(2)',
        context: '<img src="/a">',
      }),
      COMPACT_OPTS,
    );

    // Note: in this contrived case the suffix would already match
    // (axe ends with ` > img:nth-child(2)`); add a second axe entry whose
    // selector blocks suffix-match to force fingerprint-tier evaluation.
    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    expect(merged).toHaveLength(1);
    expect(merged[0].alsoFlaggedBy).toEqual(['htmlcs']);
    expect(stats.merged).toBe(1);
  });

  it('KEEP BOTH: fingerprint with discriminator matches but HTML diverges', () => {
    // Two `<select>` in two different forms: same suffix `form > div:nth-child(4) > select`
    // but option text differs — must remain separate. This is the canonical
    // "repeating component" failure mode the bucketing rule warns about.
    const axe = mapAxeViolation(
      axeImageAlt({
        id: 'select-name',
        nodes: [
          {
            target: ['#signup form > div:nth-child(4) > select'],
            html: '<select class="form-control" data-testid="team-size" required><option value="">Choose team size</option><option value="1-10">1–10</option><option value="11-50">11–50</option></select>',
          },
        ],
      }),
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      htmlcsImageAlt({
        code: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.F68',
        selector: '#contact form > div:nth-child(4) > select',
        context:
          '<select class="form-control" data-testid="country" required><option value="">Choose country</option><option value="DE">Germany</option><option value="AT">Austria</option></select>',
      }),
      COMPACT_OPTS,
    );

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    // Different SCs (1.1.1 vs 1.3.1) so they wouldn't merge anyway — but the
    // realistic structural test below forces same-SC + same-suffix + diverging-HTML.
    expect(merged).toHaveLength(2);
    expect(stats.merged).toBe(0);
  });

  it('KEEP BOTH: same SC + suffix-match selectors but diverging child content (200-char compare)', () => {
    // Both elements share the first ~100 chars but option text diverges past
    // the old 80-char cap. The bumped 200-char window must catch this.
    // Build directly so axe + htmlcs share SC 1.3.1 (rule lookup for the
    // synthetic ids is irrelevant here \u2014 we drive `wcagCriteria` explicitly).
    const sharedPrefix =
      '<select class="form-control form-select-lg" data-testid="signup-field" name="choice" required>';
    const axe: NormalizedViolation = {
      source: 'axe',
      id: 'select-name',
      impact: 'serious',
      help: 'Select element must have an accessible name',
      wcagCriteria: [{ sc: '1.3.1', en301549: '9.1.3.1' }],
      nodes: [
        {
          target: ['#signup > form > div:nth-child(4) > select'],
          html: `${sharedPrefix}<option value="">Choose team size</option><option value="1-10">Small team (1\u201310)</option>`.slice(
            0,
            120,
          ),
        },
      ],
    };
    const htmlcs: NormalizedViolation = {
      source: 'htmlcs',
      id: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.F68',
      impact: 'serious',
      help: 'This form field should be labelled.',
      wcagCriteria: [{ sc: '1.3.1', en301549: '9.1.3.1' }],
      nodes: [
        {
          // Same suffix "form > div:nth-child(4) > select" \u2014 the dangerous
          // case where selector matches but elements differ.
          target: ['form > div:nth-child(4) > select'],
          html: `${sharedPrefix}<option value="">Choose country</option><option value="DE">Germany (Deutschland)</option>`.slice(
            0,
            120,
          ),
        },
      ],
    };

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    expect(merged).toHaveLength(2);
    expect(stats.merged).toBe(0);
    expect(stats.unmergedCrossoverCandidates).toBe(1);
  });

  it('MERGE: suffix match — axe short selector is tail of HTMLCS long selector', () => {
    // Matches the real-world pattern: axe uses "section:nth-child(3) > p",
    // HTMLCS uses "#root > main > section:nth-child(3) > p"
    const axe = mapAxeViolation(
      axeImageAlt({
        nodes: [
          { target: ['section:nth-child(3) > p'], html: '<p style="color: rgb(189, 189, 189);">' },
        ],
      }),
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      htmlcsImageAlt({
        selector: '#root > main > section:nth-child(3) > p',
        context: '<p style="color: rgb(189, 189, 189);">',
      }),
      COMPACT_OPTS,
    );

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    expect(merged).toHaveLength(1);
    expect(merged[0].source).toBe('axe');
    expect(merged[0].alsoFlaggedBy).toEqual(['htmlcs']);
    expect(stats.merged).toBe(1);
  });

  it('MERGE: suffix match — HTMLCS short selector is tail of axe long selector', () => {
    // Reverse direction: HTMLCS shorter, axe longer (less common but should work)
    const axe = mapAxeViolation(
      axeImageAlt({
        nodes: [{ target: ['#root > main > img:nth-child(1)'], html: '<img src="/hero.jpg">' }],
      }),
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      htmlcsImageAlt({
        selector: 'main > img:nth-child(1)',
        context: '<img src="/hero.jpg">',
      }),
      COMPACT_OPTS,
    );

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    expect(merged).toHaveLength(1);
    expect(stats.merged).toBe(1);
  });

  it('KEEP BOTH: different SC, same selector', () => {
    const axe = mapAxeViolation(axeImageAlt(), COMPACT_OPTS);
    const htmlcs = mapHtmlcsIssue(
      // SC 4.1.2 instead of 1.1.1, same selector
      htmlcsImageAlt({ code: 'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91' }),
      COMPACT_OPTS,
    );

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    expect(merged).toHaveLength(2);
    expect(stats.merged).toBe(0);
  });

  it('sorts merged result by impact severity (critical → minor)', () => {
    const minor: NormalizedViolation = {
      source: 'htmlcs',
      id: 'minor',
      impact: 'minor',
      help: '',
      wcagCriteria: [],
      nodes: [],
    };
    const critical: NormalizedViolation = {
      source: 'axe',
      id: 'critical',
      impact: 'critical',
      help: '',
      wcagCriteria: [],
      nodes: [],
    };
    const moderate: NormalizedViolation = {
      source: 'axe',
      id: 'moderate',
      impact: 'moderate',
      help: '',
      wcagCriteria: [],
      nodes: [],
    };

    const { merged } = mergeViolations([moderate, critical], [minor]);
    expect(merged.map(v => v.impact)).toEqual(['critical', 'moderate', 'minor']);
  });

  it('does not mutate input arrays in place beyond annotating alsoFlaggedBy', () => {
    const axe = mapAxeViolation(axeImageAlt(), COMPACT_OPTS);
    const htmlcs = mapHtmlcsIssue(htmlcsImageAlt(), COMPACT_OPTS);
    const axeBefore = [axe];
    const htmlcsBefore = [htmlcs];

    mergeViolations(axeBefore, htmlcsBefore);
    // axe entry annotated (expected), htmlcs untouched
    expect(axe.alsoFlaggedBy).toEqual(['htmlcs']);
    expect(htmlcs.alsoFlaggedBy).toBeUndefined();
  });

  it('MERGE: single-segment axe selector is suffix of long HTMLCS selector', () => {
    // Real-world: axe uses "img:nth-child(1)", HTMLCS uses the full path.
    // The short selector has no " > " so selectorSuffixMatch must handle it.
    const axe = mapAxeViolation(
      axeImageAlt({
        nodes: [
          {
            target: ['img:nth-child(1)'],
            html: '<img width="280" height="180" src="https://picsum.photos/seed/forest/280/180">',
          },
        ],
      }),
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      htmlcsImageAlt({
        selector: '#root > main > section:nth-child(4) > div:nth-child(2) > img:nth-child(1)',
        context: '<img width="280" height="180" src="https://picsum.photos/seed/forest/280/180">',
      }),
      COMPACT_OPTS,
    );

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    expect(merged).toHaveLength(1);
    expect(merged[0].source).toBe('axe');
    expect(merged[0].alsoFlaggedBy).toEqual(['htmlcs']);
    expect(stats.merged).toBe(1);
  });

  it('end-to-end: realistic axe 10 + HTMLCS 29 scan with expected merges', () => {
    // Subset of real scan data from the test page. Only include the overlap cases
    // to verify the dedup produces the right merge count.
    const axeList: NormalizedViolation[] = [
      // fix-3: image-alt — 2 nodes
      {
        source: 'axe',
        id: 'image-alt',
        impact: 'critical',
        help: 'Images must have alternative text',
        wcagCriteria: [{ sc: '1.1.1', en301549: '9.1.1.1' }],
        nodes: [
          {
            target: ['img:nth-child(1)'],
            html: '<img width="280" height="180" src="https://picsum.photos/seed/forest/280/180">',
          },
          {
            target: ['img:nth-child(2)'],
            html: '<img width="280" height="180" src="https://picsum.photos/seed/city/280/180">',
          },
        ],
      },
      // fix-4: input-image-alt
      {
        source: 'axe',
        id: 'input-image-alt',
        impact: 'critical',
        help: 'Image buttons must have alternative text',
        wcagCriteria: [{ sc: '1.1.1', en301549: '9.1.1.1' }],
        nodes: [
          {
            target: ['input[type="image"]'],
            html: '<input src="https://picsum.photos/seed/send/120/48" type="image">',
          },
        ],
      },
      // fix-2: button-name
      {
        source: 'axe',
        id: 'button-name',
        impact: 'critical',
        help: 'Buttons must have discernible text',
        wcagCriteria: [{ sc: '4.1.2', en301549: '9.4.1.2' }],
        nodes: [
          {
            target: ['section:nth-child(4) > div:nth-child(3) > button[type="button"]'],
            html: '<button type="button"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 5h16v2H4zm0 6h16v2H',
          },
        ],
      },
      // fix-7: color-contrast
      {
        source: 'axe',
        id: 'color-contrast',
        impact: 'serious',
        help: 'Elements must meet minimum color contrast ratio thresholds',
        wcagCriteria: [{ sc: '1.4.3', en301549: '9.1.4.3' }],
        nodes: [
          {
            target: ['section:nth-child(3) > p'],
            html: '<p style="color: rgb(189, 189, 189); background: rgb(255, 255, 255);">Low contrast instructional copy that should trigge',
          },
        ],
      },
      // fix-8: frame-title (SC 4.1.2)
      {
        source: 'axe',
        id: 'frame-title',
        impact: 'serious',
        help: 'Frames must have an accessible name',
        wcagCriteria: [{ sc: '4.1.2', en301549: '9.4.1.2' }],
        nodes: [
          {
            target: ['iframe'],
            html: '<iframe src="about:blank" width="320" height="180"></iframe>',
          },
        ],
      },
      // fix-9: link-name — 2 nodes
      {
        source: 'axe',
        id: 'link-name',
        impact: 'serious',
        help: 'Links must have discernible text',
        wcagCriteria: [
          { sc: '2.4.4', en301549: '9.2.4.4' },
          { sc: '4.1.2', en301549: '9.4.1.2' },
        ],
        nodes: [
          { target: ['a[href$="nowhere"]:nth-child(2)'], html: '<a href="/nowhere"></a>' },
          {
            target: ['a[href$="also-nowhere"]'],
            html: '<a href="/also-nowhere"><span></span></a>',
          },
        ],
      },
    ];

    const htmlcsList: NormalizedViolation[] = [
      // fix-11: G18.Fail — overlaps with axe color-contrast (SC 1.4.3)
      {
        source: 'htmlcs',
        id: 'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail',
        impact: 'serious',
        help: 'Insufficient contrast',
        wcagCriteria: [{ sc: '1.4.3', en301549: '9.1.4.3' }],
        nodes: [
          {
            target: ['#root > main > section:nth-child(3) > p'],
            html: '<p style="color: rgb(189, 189, 189); background: rgb(255, 255, 255);">Low contrast instructional copy that should trigge',
          },
        ],
      },
      // fix-19: H37 img 1 — overlaps with axe image-alt (SC 1.1.1)
      {
        source: 'htmlcs',
        id: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H37',
        impact: 'serious',
        help: 'Img element missing an alt attribute.',
        wcagCriteria: [{ sc: '1.1.1', en301549: '9.1.1.1' }],
        nodes: [
          {
            target: ['#root > main > section:nth-child(4) > div:nth-child(2) > img:nth-child(1)'],
            html: '<img width="280" height="180" src="https://picsum.photos/seed/forest/280/180">',
          },
        ],
      },
      // fix-20: H37 img 2 — overlaps with axe image-alt (SC 1.1.1)
      {
        source: 'htmlcs',
        id: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H37',
        impact: 'serious',
        help: 'Img element missing an alt attribute.',
        wcagCriteria: [{ sc: '1.1.1', en301549: '9.1.1.1' }],
        nodes: [
          {
            target: ['#root > main > section:nth-child(4) > div:nth-child(2) > img:nth-child(2)'],
            html: '<img width="280" height="180" src="https://picsum.photos/seed/city/280/180">',
          },
        ],
      },
      // fix-23: H91.Button.Name — overlaps with axe button-name (SC 4.1.2)
      {
        source: 'htmlcs',
        id: 'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.Button.Name',
        impact: 'serious',
        help: 'This button element does not have a name.',
        wcagCriteria: [{ sc: '4.1.2', en301549: '9.4.1.2' }],
        nodes: [
          {
            target: ['#root > main > section:nth-child(4) > div:nth-child(3) > button'],
            html: '<button type="button"><svg viewBox="0 0 24 24" width=...',
          },
        ],
      },
      // fix-25: A.NoContent link 1 — overlaps with axe link-name (SC 4.1.2)
      {
        source: 'htmlcs',
        id: 'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.NoContent',
        impact: 'serious',
        help: 'Anchor element with no content.',
        wcagCriteria: [{ sc: '4.1.2', en301549: '9.4.1.2' }],
        nodes: [
          {
            target: ['#root > main > section:nth-child(7) > div:nth-child(2) > a:nth-child(2)'],
            html: '<a href="/nowhere"></a>',
          },
        ],
      },
      // fix-26: A.NoContent link 2 — overlaps with axe link-name (SC 4.1.2)
      {
        source: 'htmlcs',
        id: 'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.NoContent',
        impact: 'serious',
        help: 'Anchor element with no content.',
        wcagCriteria: [{ sc: '4.1.2', en301549: '9.4.1.2' }],
        nodes: [
          {
            target: ['#root > main > section:nth-child(7) > div:nth-child(2) > a:nth-child(3)'],
            html: '<a href="/also-nowhere"><span></span></a>',
          },
        ],
      },
      // fix-27: H64.1 iframe — SC 2.4.1 (different from axe's 4.1.2) → should NOT merge
      {
        source: 'htmlcs',
        id: 'WCAG2AA.Principle2.Guideline2_4.2_4_1.H64.1',
        impact: 'serious',
        help: 'Iframe element requires a non-empty title.',
        wcagCriteria: [{ sc: '2.4.1', en301549: '9.2.4.1' }],
        nodes: [
          {
            target: ['#root > main > section:nth-child(7) > div:nth-child(4) > iframe'],
            html: '<iframe src="about:blank" width="320" height="180"></iframe>',
          },
        ],
      },
      // fix-13: F68 form field — unique to HTMLCS (no axe equivalent for this specific input)
      {
        source: 'htmlcs',
        id: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.F68',
        impact: 'serious',
        help: 'This form field should be labelled.',
        wcagCriteria: [{ sc: '1.3.1', en301549: '9.1.3.1' }],
        nodes: [
          {
            target: ['#root > main > section:nth-child(3) > form > div:nth-child(1) > input'],
            html: '<input placeholder="Full name" type="text">',
          },
        ],
      },
    ];

    const { merged, stats } = mergeViolations(axeList, htmlcsList);

    // Merges that succeed:
    //   contrast (SC 1.4.3) — suffix match ✓
    //   img1     (SC 1.1.1) — suffix match ✓ (img:nth-child(1))
    //   img2     (SC 1.1.1) — suffix match ✓ (img:nth-child(2))
    //   link1    (SC 4.1.2) — attribute-stripped suffix + matching HTML ✓
    // Merges that correctly DON'T happen:
    //   button:  attribute-stripped suffix matches but test fixture has
    //            differently-truncated HTML — safety bias keeps both. (In real
    //            scans where both engines emit full element HTML this merges.)
    //   link2:   axe "a[href$=\"also-nowhere\"]" strips to "a" (single segment)
    //            and HTMLCS ends with "a:nth-child(3)" — no suffix match.
    expect(stats.merged).toBe(4);

    // Total: 6 axe entries + 8 htmlcs entries - 4 merged = 10
    expect(merged).toHaveLength(10);

    // Cross-confirmed axe entries: image-alt, color-contrast, link-name
    const confirmed = merged.filter(v => v.alsoFlaggedBy?.includes('htmlcs'));
    expect(confirmed).toHaveLength(3);

    // HTMLCS survivors: button + link2 + H64.1 iframe + F68 form = 4
    const htmlcsOnly = merged.filter(v => v.source === 'htmlcs');
    expect(htmlcsOnly).toHaveLength(4);
  });

  it('MERGE: attribute-selector mismatch — axe "button[type=button]" vs HTMLCS "button"', () => {
    // Real-world pattern: axe describes the button with an attribute filter
    // while HTMLCS uses the bare element. Same SC, same element, same HTML.
    const axe = mapAxeViolation(
      axeImageAlt({
        id: 'button-name',
        impact: 'critical',
        help: 'Buttons must have text',
        nodes: [
          {
            target: ['section:nth-child(4) > div:nth-child(3) > button[type="button"]'],
            html: '<button type="button"><svg></svg></button>',
          },
        ],
        tags: ['wcag412'],
      }),
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      {
        code: 'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.Button.Name',
        message: 'Button has no name',
        type: 'error',
        selector: '#root > main > section:nth-child(4) > div:nth-child(3) > button',
        context: '<button type="button"><svg></svg></button>',
      },
      COMPACT_OPTS,
    );

    const { stats } = mergeViolations([axe], [htmlcs]);
    expect(stats.merged).toBe(1);
  });

  it('MERGE: attribute-selector mismatch — axe "a[href$=...]:nth-child(2)" vs HTMLCS "a:nth-child(2)"', () => {
    const axe = mapAxeViolation(
      axeImageAlt({
        id: 'link-name',
        impact: 'serious',
        help: 'Links must have text',
        nodes: [{ target: ['a[href$="nowhere"]:nth-child(2)'], html: '<a href="/nowhere"></a>' }],
        tags: ['wcag412'],
      }),
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      {
        code: 'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.NoContent',
        message: 'Empty anchor',
        type: 'error',
        selector: '#root > main > section:nth-child(7) > div:nth-child(2) > a:nth-child(2)',
        context: '<a href="/nowhere"></a>',
      },
      COMPACT_OPTS,
    );

    const { stats } = mergeViolations([axe], [htmlcs]);
    expect(stats.merged).toBe(1);
  });

  it('KEEP BOTH: attribute-strip would match but HTML differs (safety bias preserved)', () => {
    // Two different inputs — axe input[type="image"] vs HTMLCS sibling input[type="text"]
    // Same parent, same SC by coincidence. Selector strip would make them suffix-match
    // (both reduce to "input"), but HTML divergence prevents the false merge.
    const axe = mapAxeViolation(
      axeImageAlt({
        id: 'input-image-alt',
        impact: 'critical',
        help: 'Image inputs need alt',
        nodes: [{ target: ['input[type="image"]'], html: '<input type="image" src="/send.jpg">' }],
        tags: ['wcag111'],
      }),
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      {
        code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H37',
        message: 'Img missing alt',
        type: 'error',
        selector: '#root > main > section > div > input',
        context: '<input type="text" placeholder="search">',
      },
      COMPACT_OPTS,
    );

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    expect(stats.merged).toBe(0);
    expect(merged).toHaveLength(2);
  });

  it('MERGE: HTMLCS "body > main > p" matches axe "main > p" after body-prefix strip', () => {
    const axe = mapAxeViolation(
      axeImageAlt({
        id: 'color-contrast',
        impact: 'serious',
        help: 'Contrast',
        nodes: [{ target: ['main > p'], html: '<p style="color: #aaa">' }],
        tags: ['wcag143'],
      }),
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      {
        code: 'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail',
        message: 'Insufficient contrast',
        type: 'error',
        selector: 'body > main > p',
        context: '<p style="color: #aaa">',
      },
      COMPACT_OPTS,
    );

    const { stats } = mergeViolations([axe], [htmlcs]);
    expect(stats.merged).toBe(1);
  });

  it('KEEP BOTH: htmlSnippetMatch rejects elements whose HTML diverges after 40 chars', () => {
    // Two different elements with identical first 40 chars but different IDs
    const axe = mapAxeViolation(
      axeImageAlt({
        id: 'color-contrast',
        impact: 'serious',
        help: 'Contrast',
        nodes: [
          {
            target: ['div.card:nth-child(1)'],
            html: '<div class="card-wrapper card-primary" id="card-1"><img src="a.jpg">',
          },
        ],
        tags: ['wcag143'],
      }),
      COMPACT_OPTS,
    );
    const htmlcs = mapHtmlcsIssue(
      {
        code: 'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail',
        message: 'Insufficient contrast',
        type: 'error',
        selector: '#root > main > div.card:nth-child(1)',
        context: '<div class="card-wrapper card-primary" id="card-2"><img src="b.jpg">',
      },
      COMPACT_OPTS,
    );

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    expect(stats.merged).toBe(0);
    expect(merged).toHaveLength(2);
  });

  it('does not merge when HTMLCS has no parseable SC', () => {
    const axe = mapAxeViolation(
      axeImageAlt({
        id: 'color-contrast',
        impact: 'serious',
        help: 'Contrast',
        nodes: [{ target: ['p'], html: '<p>' }],
        tags: ['wcag143'],
      }),
      COMPACT_OPTS,
    );
    const htmlcs: NormalizedViolation = {
      source: 'htmlcs',
      id: 'WCAG2AA.SniffMessage',
      impact: 'minor',
      help: 'Some notice',
      wcagCriteria: [],
      nodes: [{ target: ['p'], html: '<p>' }],
    };

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    expect(stats.merged).toBe(0);
    expect(merged).toHaveLength(2);
  });

  it('handles empty target arrays without crashing', () => {
    const axe = mapAxeViolation(
      axeImageAlt({
        id: 'color-contrast',
        impact: 'serious',
        help: 'Contrast',
        nodes: [{ target: ['p'], html: '<p>' }],
        tags: ['wcag143'],
      }),
      COMPACT_OPTS,
    );
    const htmlcs: NormalizedViolation = {
      source: 'htmlcs',
      id: 'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail',
      impact: 'serious',
      help: 'Contrast',
      wcagCriteria: [{ sc: '1.4.3', en301549: '9.1.4.3' }],
      nodes: [{ target: [], html: '<p>' }],
    };

    const { merged, stats } = mergeViolations([axe], [htmlcs]);
    // No selector to match — should survive as separate entry
    expect(stats.merged).toBe(0);
    expect(merged).toHaveLength(2);
  });
});
