/**
 * Semantic HTML accessibility reference resource.
 *
 * Provides a compact index plus per-element detail mapping semantic HTML
 * elements to implicit ARIA roles, correct usage, and common mistakes.
 * Built programmatically from data/semantic-html.ts.
 *
 * Served as:
 *   navable://docs/semantic-html
 *   navable://docs/semantic-html/{element}
 */

import { getAllElements, getElement } from '../data/semantic-html.js';

/** Compact index: element + implicit role + one-line description (~3 KB). */
export function generateSemanticHtmlIndex(): string {
  const allElements = getAllElements();
  const lines: string[] = [
    '# Semantic HTML — Index\n',
    '> Load element detail: `navable://docs/semantic-html/{element}`\n',
    '| Element | Implicit Role | Description |',
    '|---|---|---|',
  ];
  for (const el of allElements) {
    const role = el.implicitRole ? `\`${el.implicitRole}\`` : '(none)';
    lines.push(`| \`<${el.element}>\` | ${role} | ${el.description.split('.')[0]}. |`);
  }
  return lines.join('\n') + '\n';
}

/** Full detail for a single element by tag name. */
export function generateSemanticHtmlDetail(element: string): string {
  const el = getElement(element);
  if (!el) {
    const all = getAllElements();
    return (
      `# Element not found: \`${element}\`\n\n` +
      `**Available elements:** ${all.map(e => `\`${e.element}\``).join(', ')}\n`
    );
  }

  const lines: string[] = [];
  lines.push(`# \`<${el.element}>\`\n`);
  lines.push(`${el.description}\n`);

  lines.push('| Property | Value |');
  lines.push('|---|---|');
  lines.push(
    `| **Implicit ARIA role** | ${el.implicitRole ? `\`${el.implicitRole}\`` : '(none)'} |`,
  );
  lines.push(`| **MDN docs** | [Link](${el.mdnUrl}) |`);
  if (el.relatedWcagCriteria.length > 0) {
    lines.push(
      `| **Related WCAG SC** | ${el.relatedWcagCriteria.map(sc => `\`${sc}\``).join(', ')} |`,
    );
  }
  lines.push('');

  lines.push(`**Correct usage:** ${el.correctUsage}\n`);

  if (el.commonMistakes.length > 0) {
    lines.push('**Common mistakes:**\n');
    for (const m of el.commonMistakes) {
      lines.push(`- ${m}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
