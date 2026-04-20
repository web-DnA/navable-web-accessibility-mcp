#!/usr/bin/env node
/**
 * navable MCP Server — entry point.
 *
 * Wires up resources, tools, and transport. Implementation lives in:
 *   src/resources/  — MCP resource generators
 *   src/tools/      — MCP tool handlers
 *
 * Resources (compact by default, full available on demand):
 *   navable://docs/wcag-mapping              — compact mapping table + stats
 *   navable://docs/bfsg-legal                — full legal context, glossary, enforcement
 *   navable://docs/aria-patterns             — compact index (25 patterns)
 *   navable://docs/aria-patterns/{slug}      — single pattern detail
 *   navable://docs/semantic-html             — compact index
 *   navable://docs/semantic-html/{element}   — single element detail
 *   navable://docs/fix-patterns              — all fix patterns (~49 KB)
 *   navable://docs/fix-patterns/{ruleIds}    — filtered by comma-separated rule IDs
 *
 * Tools:
 *   run_accessibility_scan         — Playwright + axe-core WCAG scanner
 *   generate_fix_plan              — Convert scan output to structured AccessibilityFixPlan
 *   update_fix_status              — Mark fix plan items as done/skipped/in_progress
 */

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createRequire } from 'node:module';
import { closeBrowser } from './browser.js';

import { generateAriaPatternDetail, generateAriaPatternIndex } from './resources/aria-patterns.js';
import { generateFilteredFixPatterns, generateFixPatterns } from './resources/fix-patterns.js';
import {
  generateSemanticHtmlDetail,
  generateSemanticHtmlIndex,
} from './resources/semantic-html.js';
import { generateBfsgLegal, generateWcagMapping } from './resources/wcag-mapping.js';
import { registerGenerateFixPlan } from './tools/generate-fix-plan.js';
import { registerRunAccessibilityScan } from './tools/run-accessibility-scan.js';
import { registerUpdateFixStatus } from './tools/update-fix-status.js';

// ---------------------------------------------------------------------------
// Server instance
// ---------------------------------------------------------------------------

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const server = new McpServer({
  name: 'navable-mcp',
  version,
});

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

server.registerResource(
  'wcag-mapping',
  'navable://docs/wcag-mapping',
  {
    description:
      'WCAG 2.1 Level A + AA mapping table: success criteria, EN 301 549 clauses, testability, and axe-core rules. ' +
      'For BFSG/German legal context, load navable://docs/bfsg-legal.',
    mimeType: 'text/markdown',
  },
  async uri => ({
    contents: [{ uri: uri.href, mimeType: 'text/markdown', text: generateWcagMapping() }],
  }),
);

server.registerResource(
  'bfsg-legal',
  'navable://docs/bfsg-legal',
  {
    description:
      'BFSG legal context: legal chain, scope, German glossary, enforcement & penalties, ' +
      'BITV 2.0 requirements, key dates, and references. Optional resource for German compliance.',
    mimeType: 'text/markdown',
  },
  async uri => ({
    contents: [{ uri: uri.href, mimeType: 'text/markdown', text: generateBfsgLegal() }],
  }),
);

server.registerResource(
  'aria-patterns',
  'navable://docs/aria-patterns',
  {
    description:
      'Compact index of 25 WAI-ARIA widget patterns (~2 KB). ' +
      'Load a specific pattern with navable://docs/aria-patterns/{slug}.',
    mimeType: 'text/markdown',
  },
  async uri => ({
    contents: [{ uri: uri.href, mimeType: 'text/markdown', text: generateAriaPatternIndex() }],
  }),
);

server.registerResource(
  'aria-patterns-detail',
  new ResourceTemplate('navable://docs/aria-patterns/{patternSlug}', { list: undefined }),
  {
    description:
      'Full detail for a single WAI-ARIA pattern by slug. ' +
      'Includes roles, attributes, keyboard interactions, focus management, and common mistakes.',
    mimeType: 'text/markdown',
  },
  async (uri, { patternSlug }) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: generateAriaPatternDetail(patternSlug as string),
      },
    ],
  }),
);

server.registerResource(
  'semantic-html',
  'navable://docs/semantic-html',
  {
    description:
      'Compact index of semantic HTML elements with implicit ARIA roles (~3 KB). ' +
      'Load element detail with navable://docs/semantic-html/{element}.',
    mimeType: 'text/markdown',
  },
  async uri => ({
    contents: [{ uri: uri.href, mimeType: 'text/markdown', text: generateSemanticHtmlIndex() }],
  }),
);

server.registerResource(
  'semantic-html-detail',
  new ResourceTemplate('navable://docs/semantic-html/{element}', { list: undefined }),
  {
    description:
      'Full detail for a single semantic HTML element by tag name. ' +
      'Includes implicit ARIA role, correct usage, and common mistakes.',
    mimeType: 'text/markdown',
  },
  async (uri, { element }) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'text/markdown',
        text: generateSemanticHtmlDetail(element as string),
      },
    ],
  }),
);

server.registerResource(
  'fix-patterns',
  'navable://docs/fix-patterns',
  {
    description:
      'All axe-core rule fix patterns (~49 KB). Prefer the filtered version ' +
      'navable://docs/fix-patterns/{ruleIds} for scan-fix workflows.',
    mimeType: 'text/markdown',
  },
  async uri => ({
    contents: [{ uri: uri.href, mimeType: 'text/markdown', text: generateFixPatterns() }],
  }),
);

server.registerResource(
  'fix-patterns-by-rule',
  new ResourceTemplate('navable://docs/fix-patterns/{ruleIds}', { list: undefined }),
  {
    description:
      'Fix patterns filtered by comma-separated axe-core rule IDs. ' +
      'Example: navable://docs/fix-patterns/image-alt,label,color-contrast. ' +
      'Returns only the relevant before/after code fixes (~1-3 KB instead of 49 KB).',
    mimeType: 'text/markdown',
  },
  async (uri, { ruleIds }) => {
    const ids = (ruleIds as string).split(',').map(id => id.trim());
    return {
      contents: [
        { uri: uri.href, mimeType: 'text/markdown', text: generateFilteredFixPatterns(ids) },
      ],
    };
  },
);

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

registerRunAccessibilityScan(server);
registerGenerateFixPlan(server);
registerUpdateFixStatus(server);

// ---------------------------------------------------------------------------
// Transport & startup
// ---------------------------------------------------------------------------

async function shutdown() {
  await closeBrowser();
  process.exit(0);
}

try {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`navable-mcp failed to start: ${message}\n`);
  await closeBrowser();
  process.exit(1);
}
