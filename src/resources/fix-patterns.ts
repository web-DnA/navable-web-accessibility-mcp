/**
 * Fix patterns accessibility resource.
 *
 * Generates a Markdown document mapping the most common axe-core rule IDs
 * to concrete before/after code fixes with WCAG criteria and
 * framework-specific notes.
 *
 * Served as: navable://docs/fix-patterns
 */

import { getAllFixPatterns, getFixPattern, type FixPattern } from '../data/fix-patterns.js';

// ---------------------------------------------------------------------------
// Static preamble
// ---------------------------------------------------------------------------

const HEADER = `# Accessibility Fix Patterns — axe-core Rule Reference

> Concrete before/after code fixes for the most common axe-core violations.
> Use this resource to look up the correct fix for a specific axe rule ID.
>
> **How to use:** Match the \`id\` field from a scan violation to the rule
> heading below. Apply the "After (Good)" pattern adapted to the project's
> framework.

---

`;

// ---------------------------------------------------------------------------
// Markdown generation
// ---------------------------------------------------------------------------

function buildTableOfContents(patterns: FixPattern[]): string {
  const rows = patterns.map(p => `| \`${p.id}\` | ${p.name} | ${p.impact} |`);

  return [
    '## Table of Contents',
    '',
    '| Rule ID | Name | Impact |',
    '| --- | --- | --- |',
    ...rows,
    '',
    '---',
    '',
  ].join('\n');
}

function buildPatternSection(p: FixPattern): string {
  const wcagLabel = p.wcagSc.join(', ');
  const enLabel = p.en301549.map(c => `§${c}`).join(', ');

  const lines: string[] = [
    `## \`${p.id}\` — ${p.name}`,
    '',
    `**Impact:** ${p.impact} | **WCAG:** ${wcagLabel}`,
    `**EN 301 549:** ${enLabel}`,
    '',
    "### What's Wrong",
    '',
    p.whatIsWrong,
    '',
    '### Why It Matters',
    '',
    p.whyItMatters,
    '',
    '### Before (Bad)',
    '',
    '```html',
    p.badExample,
    '```',
    '',
    '### After (Good)',
    '',
    '```html',
    p.goodExample,
    '```',
    '',
  ];

  if (p.frameworkNotes.react || p.frameworkNotes.vue) {
    lines.push('### Framework Notes', '');
    if (p.frameworkNotes.react) {
      lines.push(`- **React:** ${p.frameworkNotes.react}`);
    }
    if (p.frameworkNotes.vue) {
      lines.push(`- **Vue:** ${p.frameworkNotes.vue}`);
    }
    lines.push('');
  }

  lines.push(`[axe-core docs](${p.helpUrl})`, '', '---', '');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function generateFixPatterns(): string {
  const patterns = getAllFixPatterns();
  const toc = buildTableOfContents(patterns);
  const sections = patterns.map(buildPatternSection).join('\n');

  return HEADER + toc + sections;
}

/**
 * Generate fix-patterns markdown filtered to specific rule IDs.
 * Invalid IDs are silently skipped.
 */
export function generateFilteredFixPatterns(ruleIds: string[]): string {
  const patterns = ruleIds
    .map(id => getFixPattern(id.trim()))
    .filter((p): p is FixPattern => p !== undefined);

  if (patterns.length === 0) {
    const all = getAllFixPatterns();
    return (
      `# No matching fix patterns\n\n` +
      `None of the requested rule IDs were found.\n\n` +
      `**Available rule IDs:** ${all.map(p => `\`${p.id}\``).join(', ')}\n`
    );
  }

  const header =
    `# Accessibility Fix Patterns — Filtered\n\n` +
    `> Showing ${patterns.length} pattern(s): ${patterns.map(p => `\`${p.id}\``).join(', ')}\n\n---\n\n`;

  return header + patterns.map(buildPatternSection).join('\n');
}
