/**
 * Tool: run_accessibility_scan
 *
 * Scans a URL for WCAG 2.1 Level A + AA accessibility violations using Playwright + axe-core.
 * Returns structured violations grouped by severity with WCAG criteria and fix hints.
 */

import { AxeBuilder } from '@axe-core/playwright';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { navigateTo, newPage } from '../browser.js';
import { loadConfig, validateUrl } from '../config.js';
import { getForAxeRule } from '../data/wcag-criteria.js';
import { storeScanResult } from '../scan-store.js';

const DEFAULT_AXE_TAGS = ['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'];

export function registerRunAccessibilityScan(server: McpServer): void {
  server.registerTool(
    'run_accessibility_scan',
    {
      title: 'WCAG Accessibility Scanner',
      description:
        'Scan a URL for WCAG 2.1 Level A + AA accessibility violations using Playwright + axe-core.\n\n' +
        'Returns structured violations grouped by severity with WCAG criteria ' +
        'and fix hints. Requires the target URL to be running and reachable.\n\n' +
        'NEXT STEP:\n' +
        '  The result includes a "scanId" field. Pass it directly to generate_fix_plan:\n' +
        '    generate_fix_plan({ scanId: "<value of scanId from this result>" })\n' +
        '  Do NOT pass the full scan result object — use the scanId instead.',
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
      inputSchema: {
        url: z.string().url().describe('Full URL to scan (e.g. http://localhost:3000/checkout)'),
        tags: z
          .array(z.string())
          .optional()
          .describe('axe-core rule tags to include (default: wcag2a, wcag21a, wcag2aa, wcag21aa)'),
        include: z.array(z.string()).optional().describe('CSS selectors to limit scan scope'),
        exclude: z.array(z.string()).optional().describe('CSS selectors to exclude from scan'),
        compact: z
          .boolean()
          .optional()
          .default(true)
          .describe(
            'Return compact format (default: true). Set to false for the full verbose format ' +
              'with description, helpUrl, wcag tags, failureSummary, and full wcagCriteria fields.',
          ),
      },
    },
    async ({ url: rawUrl, tags, include, exclude, compact }) => {
      const startTime = Date.now();

      // 1. Validate URL
      let validatedUrl: URL;
      try {
        validatedUrl = await validateUrl(rawUrl);
      } catch (err) {
        return {
          content: [
            { type: 'text' as const, text: JSON.stringify({ error: (err as Error).message }) },
          ],
          isError: true,
        };
      }

      // 2. Load config
      const config = await loadConfig();
      const configSource = config.axeTags || config.axeDisableRules ? '.navable.json' : 'default';

      // 3. Open browser page
      let page;
      try {
        page = await newPage();
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                error: `Failed to launch browser: ${(err as Error).message}. Is Playwright installed? Run: npx playwright install chromium`,
              }),
            },
          ],
          isError: true,
        };
      }

      try {
        // 4. Navigate to URL
        try {
          await navigateTo(page, validatedUrl.href);
        } catch (err) {
          const message = (err as Error).message;
          if (message.includes('ERR_CONNECTION_REFUSED') || message.includes('ECONNREFUSED')) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify({
                    error: `Could not connect to ${validatedUrl.href}. Is the dev server running on that port?`,
                  }),
                },
              ],
              isError: true,
            };
          }
          if (message.includes('Timeout') || message.includes('timeout')) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: JSON.stringify({
                    error: `Timed out after ${config.timeout / 1000}s navigating to ${validatedUrl.href}. Is the dev server running?`,
                  }),
                },
              ],
              isError: true,
            };
          }
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify({ error: `Navigation failed: ${message}` }),
              },
            ],
            isError: true,
          };
        }

        // 5. Configure axe-core
        let axeBuilder = new AxeBuilder({ page });

        const axeTags = tags ?? config.axeTags ?? DEFAULT_AXE_TAGS;
        axeBuilder = axeBuilder.withTags(axeTags);

        if (config.axeDisableRules?.length) {
          axeBuilder = axeBuilder.disableRules(config.axeDisableRules);
        }

        if (include?.length) {
          for (const selector of include) {
            axeBuilder = axeBuilder.include(selector);
          }
        }

        if (exclude?.length) {
          for (const selector of exclude) {
            axeBuilder = axeBuilder.exclude(selector);
          }
        }

        // 6. Run axe-core
        const axeResults = await axeBuilder.analyze();

        // 7. Map violations + incomplete to compact output, sorted by severity
        const impactOrder: Record<string, number> = {
          critical: 0,
          serious: 1,
          moderate: 2,
          minor: 3,
        };

        const HTML_CAP = compact !== false ? 120 : 200;
        const isCompact = compact !== false;

        const mapResult = (
          v: (typeof axeResults.violations)[number] | (typeof axeResults.incomplete)[number],
        ): Record<string, unknown> => {
          const matchedCriteria = getForAxeRule(v.id);

          const base: Record<string, unknown> = {
            id: v.id,
            impact: v.impact,
            help: v.help,
            wcagCriteria: matchedCriteria.map(c =>
              isCompact
                ? { sc: c.sc, en301549: c.en301549 }
                : { sc: c.sc, name: c.name, level: c.level, en301549: c.en301549 },
            ),
            nodes: v.nodes.map(n => {
              const node: Record<string, unknown> = {
                target: n.target as string[],
                html: n.html.length > HTML_CAP ? n.html.slice(0, HTML_CAP) + '…' : n.html,
              };
              if (!isCompact) {
                node.failureSummary = n.failureSummary ?? '';
              }
              return node;
            }),
          };

          if (!isCompact) {
            base.description = v.description;
            base.helpUrl = v.helpUrl;
            base.wcag = v.tags.filter(t => t.startsWith('wcag'));
          }

          return base;
        };

        const violations = axeResults.violations
          .map(mapResult)
          .sort(
            (a, b) =>
              (impactOrder[a.impact as string] ?? 4) - (impactOrder[b.impact as string] ?? 4),
          );

        // 8. Map incomplete results (need manual review)
        const incomplete = axeResults.incomplete.map(mapResult);

        // 9. Build summary
        const impactOf = (v: Record<string, unknown>) => v.impact as string;
        const summary = {
          total: violations.length,
          critical: violations.filter(v => impactOf(v) === 'critical').length,
          serious: violations.filter(v => impactOf(v) === 'serious').length,
          moderate: violations.filter(v => impactOf(v) === 'moderate').length,
          minor: violations.filter(v => impactOf(v) === 'minor').length,
          passes: axeResults.passes.length,
          incomplete: axeResults.incomplete.length,
        };

        // 10. Build final result
        const result = {
          url: validatedUrl.href,
          timestamp: new Date().toISOString(),
          summary,
          violations,
          incomplete,
          metadata: {
            scanDuration: Date.now() - startTime,
            rulesRun:
              axeResults.passes.length +
              axeResults.violations.length +
              axeResults.incomplete.length,
            configSource: configSource as 'default' | '.navable.json',
          },
        };

        // Store server-side so generate_fix_plan can reference by ID
        const scanId = storeScanResult(result);
        const resultWithId = { ...result, scanId };

        return {
          content: [
            {
              type: 'text' as const,
              text:
                compact !== false
                  ? JSON.stringify(resultWithId)
                  : JSON.stringify(resultWithId, null, 2),
            },
          ],
        };
      } finally {
        // Always close the page context
        await page.context().close();
      }
    },
  );
}
