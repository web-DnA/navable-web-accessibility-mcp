/**
 * Cross-engine result normalization.
 *
 * Maps axe-core violations and Pa11y (HTMLCS) issues into a single
 * `NormalizedViolation` shape, then conservatively dedups crossover findings
 * via {@link mergeViolations}.
 *
 * Safety property: false positives (wrong merges) are far worse than false
 * negatives (missed merges). Ambiguous matches always keep both entries.
 */

import { getCriterionBySc, getForAxeRule, type WcagCriterion } from './data/wcag-criteria.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal shape of an axe-core violation/incomplete entry we depend on. */
export interface AxeViolationLike {
  id: string;
  impact?: string | null;
  help: string;
  description: string;
  helpUrl: string;
  tags: string[];
  nodes: Array<{
    target: unknown;
    html: string;
    failureSummary?: string;
  }>;
}

export type Impact = 'critical' | 'serious' | 'moderate' | 'minor';
export type EngineSource = 'axe' | 'htmlcs';

export interface NormalizedNode {
  target: string[];
  html: string;
  failureSummary?: string;
}

export interface NormalizedCriterion {
  sc: string;
  name?: string;
  level?: 'A' | 'AA' | 'AAA';
  en301549: string;
}

export interface NormalizedViolation {
  source: EngineSource;
  id: string;
  impact: Impact;
  help: string;
  description?: string;
  helpUrl?: string;
  wcagCriteria: NormalizedCriterion[];
  /** axe-style WCAG tags (e.g. "wcag2aa", "wcag131") — only when source = 'axe'. */
  wcag?: string[];
  /** One-sentence actionable guidance for developers. Always populated for htmlcs entries when an SC mapping exists. */
  developerNote?: string;
  nodes: NormalizedNode[];
  /** Other engines that flagged the same finding. Set during dedup. */
  alsoFlaggedBy?: EngineSource[];
}

/** Minimal shape of a Pa11y issue we depend on. */
export interface Pa11yIssue {
  code: string;
  message: string;
  type: 'error' | 'warning' | 'notice';
  typeCode?: number;
  context?: string;
  selector?: string;
  runner?: string;
  runnerExtras?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

const HTMLCS_TYPE_TO_IMPACT: Record<Pa11yIssue['type'], Impact> = {
  error: 'serious',
  warning: 'moderate',
  notice: 'minor',
};

const SC_FROM_HTMLCS = /(\d+)_(\d+)_(\d+)/;

function toCriterion(c: WcagCriterion, isCompact: boolean): NormalizedCriterion {
  return isCompact
    ? { sc: c.sc, en301549: c.en301549 }
    : { sc: c.sc, name: c.name, level: c.level, en301549: c.en301549 };
}

function truncateHtml(html: string, cap: number): string {
  return html.length > cap ? html.slice(0, cap) + '…' : html;
}

export function mapAxeViolation(
  v: AxeViolationLike,
  opts: { isCompact: boolean; htmlCap: number },
): NormalizedViolation {
  const matchedCriteria = getForAxeRule(v.id);
  const impact = (v.impact as Impact | null | undefined) ?? 'minor';

  const base: NormalizedViolation = {
    source: 'axe',
    id: v.id,
    impact,
    help: v.help,
    wcagCriteria: matchedCriteria.map(c => toCriterion(c, opts.isCompact)),
    nodes: v.nodes.map(n => {
      const node: NormalizedNode = {
        target: n.target as string[],
        html: truncateHtml(n.html, opts.htmlCap),
      };
      if (!opts.isCompact) node.failureSummary = n.failureSummary ?? '';
      return node;
    }),
  };

  if (!opts.isCompact) {
    base.description = v.description;
    base.helpUrl = v.helpUrl;
    base.wcag = v.tags.filter(t => t.startsWith('wcag'));
  }

  return base;
}

/**
 * Convert a Pa11y/HTMLCS issue into the normalized shape.
 *
 * INVARIANT (relied on by {@link mergeViolations}): the returned violation
 * has exactly **one** node and at most **one** WCAG criterion. HTMLCS issues
 * are emitted one-per-element-per-rule, so this is a natural fit. If this
 * mapper ever returns multi-node entries, dedup will silently ignore the
 * extra nodes — update {@link mergeViolations} accordingly.
 */
export function mapHtmlcsIssue(
  issue: Pa11yIssue,
  opts: { isCompact: boolean; htmlCap: number },
): NormalizedViolation {
  const scMatch = SC_FROM_HTMLCS.exec(issue.code);
  const sc = scMatch ? `${scMatch[1]}.${scMatch[2]}.${scMatch[3]}` : '';
  const criterion = sc ? getCriterionBySc(sc) : undefined;

  const wcagCriteria: NormalizedCriterion[] = criterion
    ? [toCriterion(criterion, opts.isCompact)]
    : sc
      ? [{ sc, en301549: `9.${sc}` }]
      : [];

  // HTMLCS help text is often vague ("Check that..."), and HTMLCS codes are
  // less recognizable to LLMs than axe rule IDs. Always surface the WCAG
  // "Understanding" URL and a one-sentence developer note when we have an SC
  // mapping — these dramatically improve agent comprehension at low token cost.
  const result: NormalizedViolation = {
    source: 'htmlcs',
    id: issue.code,
    impact: HTMLCS_TYPE_TO_IMPACT[issue.type] ?? 'minor',
    help: issue.message,
    wcagCriteria,
    nodes: [
      {
        target: issue.selector ? [issue.selector] : [],
        html: truncateHtml(issue.context ?? '', opts.htmlCap),
        ...(opts.isCompact ? {} : { failureSummary: issue.message }),
      },
    ],
  };

  if (criterion) {
    result.helpUrl = criterion.understandingUrl;
    result.developerNote = criterion.developerNote;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Dedup (conservative server-side merge)
// ---------------------------------------------------------------------------

const IMPACT_ORDER: Record<Impact, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

function normalizeSelector(s: string): string {
  return s
    .toLowerCase()
    .replace(/^(html\s*>\s*)?body\s*>\s*/, '')
    .replace(/\s*>\s*/g, ' > ')
    .trim();
}

/**
 * Strip CSS attribute selectors (e.g. `[type="image"]`, `[href$="nowhere"]`).
 *
 * axe and HTMLCS describe the same DOM element with different selector
 * dialects — axe often adds attribute filters that HTMLCS omits:
 *   axe:    `button[type="button"]`            HTMLCS: `button`
 *   axe:    `a[href$="nowhere"]:nth-child(2)`  HTMLCS: `a:nth-child(2)`
 *
 * Stripping attribute brackets makes these comparable. Used only by
 * {@link selectorSuffixMatchAttrStripped} as a secondary attempt, gated by
 * a *strict* HTML check downstream — see merge logic.
 */
function stripAttributeSelectors(s: string): string {
  // Remove [...] segments. CSS attribute values can contain `]` only when
  // quoted, so a non-greedy match is good enough for axe/HTMLCS output.
  return s.replace(/\[[^\]]*\]/g, '');
}

function selectorFingerprint(s: string): string {
  const norm = normalizeSelector(s);
  if (!norm) return '';
  const parts = norm.split(' > ');
  return parts.slice(-3).join(' > ');
}

/**
 * Whether a selector fingerprint contains enough positional/identity
 * information to safely identify a single element in a repeating layout.
 *
 * For lists/grids like `ul > li > a` repeated 50 times, the bare-tag
 * fingerprint matches every item — combined with a loose HTML compare this
 * could merge unrelated findings. Require at least one of:
 *   - `:nth-child` / `:nth-of-type` / `:first-…` / `:last-…` / `:only-…`
 *   - an id (`#foo`)
 *   - a class (`.foo`)
 *   - an attribute filter (`[…]`)
 */
function hasPositionalDiscriminator(fp: string): boolean {
  return /(:nth-|:first-|:last-|:only-|#[\w-]|\.[\w-]|\[)/.test(fp);
}

/**
 * Strict suffix match without attribute stripping.
 *
 * Handles the axe-short / HTMLCS-long mismatch:
 *   axe:   "section:nth-child(3) > p"
 *   htmlcs: "#root > main > section:nth-child(3) > p"
 * The short one ends the long one (preceded by ` > ` in the longer) → match.
 *
 * The shorter side need not contain ` > ` itself — single-segment selectors
 * like `img:nth-child(1)` match `… > img:nth-child(1)`.
 */
function selectorSuffixMatch(a: string, b: string): boolean {
  const normA = normalizeSelector(a);
  const normB = normalizeSelector(b);
  if (!normA || !normB) return false;
  return suffixCheck(normA, normB);
}

/**
 * Suffix match using attribute-stripped selectors (e.g. `button[type="button"]`
 * → `button`). This is the *least confident* tier — distinct elements like
 * `input[type="checkbox"]` and `input[type="radio"]` collapse to the same
 * stripped form, so callers MUST gate this with a strict (full-string) HTML
 * comparison, not the loose prefix compare used elsewhere.
 */
function selectorSuffixMatchAttrStripped(a: string, b: string): boolean {
  const normA = normalizeSelector(a);
  const normB = normalizeSelector(b);
  if (!normA || !normB) return false;
  const strippedA = stripAttributeSelectors(normA);
  const strippedB = stripAttributeSelectors(normB);
  if (strippedA === normA && strippedB === normB) return false; // nothing changed
  if (!strippedA || !strippedB) return false;
  return suffixCheck(strippedA, strippedB);
}

function suffixCheck(a: string, b: string): boolean {
  if (a === b) return true;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  const boundary = longer.length - shorter.length;
  return (
    longer.endsWith(shorter) && boundary >= 3 && longer.slice(boundary - 3, boundary) === ' > '
  );
}

// HTML comparison parameters.
//
// 80 chars proved too short — two `<select>` elements in two different forms
// often share the first ~80 chars (`<select id="..." class="..." name="..."`)
// and only diverge in their <option> children. 200 captures enough child
// content to disambiguate while staying robust to truncation differences
// between engines.
//
// Whitespace is collapsed because axe and HTMLCS sometimes serialize the
// same DOM with different whitespace (`<img src="x">` vs `<img src="x" >`).
const HTML_COMPARE_CAP = 200;

function normalizeHtmlForCompare(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function htmlSnippetMatch(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  const na = normalizeHtmlForCompare(a).slice(0, HTML_COMPARE_CAP);
  const nb = normalizeHtmlForCompare(b).slice(0, HTML_COMPARE_CAP);
  return na === nb;
}

/**
 * Strict full-string HTML equality (after whitespace + case normalization).
 * Used as the gate for the attribute-strip selector tier, where any selector
 * ambiguity must be eliminated by an unambiguous HTML match.
 */
function htmlSnippetMatchStrict(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  return normalizeHtmlForCompare(a) === normalizeHtmlForCompare(b);
}

interface MergeStats {
  merged: number;
  unmergedCrossoverCandidates: number;
}

/**
 * Conservatively dedup crossover findings between axe and htmlcs.
 *
 * Returns the merged list (axe-preferred for crossover) plus stats for
 * observability. Safety property: ambiguous matches keep both entries.
 */
export function mergeViolations(
  axeList: NormalizedViolation[],
  htmlcsList: NormalizedViolation[],
): { merged: NormalizedViolation[]; stats: MergeStats } {
  const stats: MergeStats = { merged: 0, unmergedCrossoverCandidates: 0 };

  // Index axe nodes by SC -> { violation, node, fingerprint }
  type IndexEntry = { violation: NormalizedViolation; node: NormalizedNode; fp: string };
  const axeIndex = new Map<string, IndexEntry[]>();

  for (const v of axeList) {
    for (const sc of v.wcagCriteria.map(c => c.sc).filter(Boolean)) {
      for (const node of v.nodes) {
        const fp = selectorFingerprint(node.target?.[0] ?? '');
        if (!fp) continue;
        const arr = axeIndex.get(sc) ?? [];
        arr.push({ violation: v, node, fp });
        axeIndex.set(sc, arr);
      }
    }
  }

  const survivingHtmlcs: NormalizedViolation[] = [];

  function annotateMatch(target: NormalizedViolation): void {
    const set = new Set(target.alsoFlaggedBy ?? []);
    set.add('htmlcs');
    target.alsoFlaggedBy = Array.from(set);
  }

  for (const h of htmlcsList) {
    // INVARIANT: mapHtmlcsIssue produces exactly one node + at most one
    // criterion. If that ever changes, this loop must iterate them.
    const sc = h.wcagCriteria[0]?.sc ?? '';
    const node = h.nodes[0];
    const rawSelector = node?.target?.[0] ?? '';

    let didMerge = false;

    if (sc) {
      const candidates = axeIndex.get(sc);
      if (candidates && candidates.length > 0) {
        // Confidence ladder, highest → lowest:
        //   L1  full selector match (identical after normalization)
        //         + loose HTML match (200-char prefix, whitespace-collapsed)
        //   L2a strict suffix match (one selector is the tail of the other)
        //         + loose HTML match
        //   L2b attribute-stripped suffix match (axe `button[type]` vs HTMLCS `button`)
        //         + STRICT HTML match (full string equality) — distinct elements
        //         like input[type=checkbox] vs input[type=radio] collapse here,
        //         so HTML must match exactly to merge.
        //   L3  fingerprint (last 3 segments) match
        //         + positional discriminator in fingerprint (`:nth-`, `#`, `.`, `[`)
        //         + loose HTML match — guards against repeating-layout false merges.
        const normalizedH = normalizeSelector(rawSelector);
        const fpH = selectorFingerprint(rawSelector);

        const fullMatch = candidates.find(
          c => normalizeSelector(c.node.target?.[0] ?? '') === normalizedH,
        );
        const strictSuffix =
          !fullMatch &&
          candidates.find(c => selectorSuffixMatch(c.node.target?.[0] ?? '', rawSelector));
        const attrStripSuffix =
          !fullMatch &&
          !strictSuffix &&
          candidates.find(c =>
            selectorSuffixMatchAttrStripped(c.node.target?.[0] ?? '', rawSelector),
          );

        const looseMatch = fullMatch ?? strictSuffix;
        const hHtml = node?.html;

        if (looseMatch) {
          const aHtml = looseMatch.node.html;
          const htmlPresent = Boolean(hHtml && aHtml);
          const merge = !htmlPresent || htmlSnippetMatch(hHtml, aHtml);
          if (merge) {
            annotateMatch(looseMatch.violation);
            stats.merged += 1;
            didMerge = true;
          } else {
            stats.unmergedCrossoverCandidates += 1;
          }
        } else if (attrStripSuffix) {
          // Attribute-stripped path requires strict HTML equality. We do NOT
          // merge when one side has no HTML — too risky.
          const aHtml = attrStripSuffix.node.html;
          if (htmlSnippetMatchStrict(hHtml, aHtml)) {
            annotateMatch(attrStripSuffix.violation);
            stats.merged += 1;
            didMerge = true;
          } else {
            stats.unmergedCrossoverCandidates += 1;
          }
        } else if (fpH && hasPositionalDiscriminator(fpH)) {
          // Fingerprint tier: only enter when the fingerprint has enough
          // identity info to distinguish elements in a repeating layout.
          const fpCandidates = candidates.filter(c => c.fp === fpH);
          const htmlConfirmed = fpCandidates.find(c => htmlSnippetMatch(c.node.html, node?.html));
          if (htmlConfirmed) {
            annotateMatch(htmlConfirmed.violation);
            stats.merged += 1;
            didMerge = true;
          } else if (fpCandidates.length > 0) {
            stats.unmergedCrossoverCandidates += 1;
          }
        }
      }
    }

    if (!didMerge) survivingHtmlcs.push(h);
  }

  const merged = [...axeList, ...survivingHtmlcs].sort(
    (a, b) => (IMPACT_ORDER[a.impact] ?? 4) - (IMPACT_ORDER[b.impact] ?? 4),
  );

  return { merged, stats };
}
