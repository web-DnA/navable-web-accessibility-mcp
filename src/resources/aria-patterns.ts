/**
 * WAI-ARIA APG pattern reference resource.
 *
 * Provides a compact index plus per-pattern detail for 25 ARIA widget
 * patterns. Built programmatically from data/aria-patterns.ts.
 *
 * Served as:
 *   navable://docs/aria-patterns
 *   navable://docs/aria-patterns/{slug}
 */

import { getAllPatterns, getPattern } from '../data/aria-patterns.js';

/** Compact index: slug + name + one-line description for each pattern (~2 KB). */
export function generateAriaPatternIndex(): string {
  const patterns = getAllPatterns();
  const lines: string[] = [
    '# WAI-ARIA Patterns — Index\n',
    '> Load a specific pattern: `navable://docs/aria-patterns/{slug}`\n',
    '| Slug | Name | Complexity | Description |',
    '|---|---|---|---|',
  ];
  for (const p of patterns) {
    lines.push(`| \`${p.id}\` | ${p.name} | ${p.complexity} | ${p.description.split('.')[0]}. |`);
  }
  return lines.join('\n') + '\n';
}

/** Full detail for a single pattern by slug. */
export function generateAriaPatternDetail(slug: string): string {
  const p = getPattern(slug);
  if (!p) {
    const all = getAllPatterns();
    return (
      `# Pattern not found: \`${slug}\`\n\n` +
      `**Available slugs:** ${all.map(a => `\`${a.id}\``).join(', ')}\n`
    );
  }

  const lines: string[] = [];
  lines.push(`# ${p.name}\n`);
  lines.push(`${p.description}\n`);

  lines.push('## Roles and Attributes\n');
  lines.push('| Category | Values |');
  lines.push('|---|---|');
  lines.push(
    `| **Required roles** | ${p.roles.length > 0 ? p.roles.map(r => `\`${r}\``).join(', ') : '—'} |`,
  );
  lines.push(
    `| **Required attributes** | ${p.requiredAttributes.length > 0 ? p.requiredAttributes.map(a => `\`${a}\``).join(', ') : '—'} |`,
  );
  lines.push(
    `| **Optional attributes** | ${p.optionalAttributes.length > 0 ? p.optionalAttributes.map(a => `\`${a}\``).join(', ') : '—'} |`,
  );
  if (p.nativeHtmlEquivalent) {
    lines.push(`| **Native HTML equivalent** | \`${p.nativeHtmlEquivalent}\` |`);
  }
  lines.push('');

  if (p.keyboardInteractions.length > 0) {
    lines.push('## Keyboard Interaction\n');
    lines.push('| Key | Action |');
    lines.push('|---|---|');
    for (const ki of p.keyboardInteractions) {
      lines.push(`| \`${ki.key}\` | ${ki.action} |`);
    }
    lines.push('');
  }

  lines.push('## Focus Management\n');
  lines.push(`${p.focusManagement}\n`);

  lines.push('## Common Mistakes\n');
  for (const m of p.commonMistakes) {
    lines.push(`- ${m}`);
  }
  lines.push('');

  lines.push('## Decision Guide\n');
  lines.push(`| | |`);
  lines.push(`|---|---|`);
  lines.push(`| **Complexity** | ${p.complexity} |`);
  lines.push(`| **Use when** | ${p.useWhen} |`);
  lines.push(`| **Avoid when** | ${p.avoidWhen} |`);
  lines.push('');

  lines.push(`## Related WCAG Criteria\n`);
  lines.push(p.wcagCriteria.map(sc => `\`${sc}\``).join(', ') + '\n');

  lines.push(`> [APG Documentation](${p.apgUrl})\n`);

  return lines.join('\n');
}
