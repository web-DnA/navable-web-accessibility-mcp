/**
 * Tool: run_accessibility_scan
 *
 * Scans a URL for WCAG 2.1 Level A + AA accessibility violations using
 * Playwright + axe-core. Optionally also runs Pa11y (HTMLCS) as a second
 * engine and merges crossover findings server-side.
 */

import { AxeBuilder } from '@axe-core/playwright';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { navigateTo, newPage } from '../browser.js';
import { loadConfig, validateUrl } from '../config.js';
import {
  mapAxeViolation,
  mapHtmlcsIssue,
  mergeViolations,
  type EngineSource,
  type NormalizedViolation,
} from '../normalize.js';
import { runPa11y } from '../pa11y-runner.js';
import { storeScanResult } from '../scan-store.js';

const DEFAULT_AXE_TAGS = ['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'];

export function registerRunAccessibilityScan(server: McpServer): void {
  server.registerTool(
    'run_accessibility_scan',
    {
      title: 'WCAG Accessibility Scanner',
      description:
        'Scan a URL for WCAG 2.1 Level A + AA accessibility violations using Playwright + axe-core, ' +
        'with optional Pa11y (HTMLCS) as a second engine.\n\n' +
        'Returns structured violations grouped by severity with WCAG criteria and fix hints. ' +
        'Requires the target URL to be running and reachable.\n\n' +
        'ENGINES:\n' +
        '  Default: ["axe"]. Pass {"engines": ["axe", "htmlcs"]} to also run Pa11y/HTMLCS.\n' +
        '  Crossover findings are deduped server-side: an axe violation also flagged by HTMLCS is\n' +
        '  marked with `alsoFlaggedBy: ["htmlcs"]`. Adding HTMLCS typically grows the result by\n' +
        '  ~10-20% (mostly standalone HTMLCS findings) and adds ~2-4s wall-clock per scan.\n\n' +
        'NEXT STEP:\n' +
        '  The result includes a "scanId" field. Pass it directly to generate_fix_plan:\n' +
        '    generate_fix_plan({ scanId: "<value of scanId from this result>" })\n' +
        '  Do NOT pass the full scan result object - use the scanId instead.',
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
        engines: z
          .array(z.enum(['axe', 'htmlcs']))
          .optional()
          .describe(
            'Engines to run (default: ["axe"]). Add "htmlcs" to also run Pa11y/HTMLCS for ' +
              'crossover validation. Configurable via .navable.json "engines".',
          ),
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
    async ({ url: rawUrl, tags, include, exclude, engines, compact }) => {
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
      const isCustomConfig =
        Boolean(config.axeTags) ||
        Boolean(config.axeDisableRules) ||
        Boolean(config.engines) ||
        Boolean(config.htmlcsIgnore);
      const configSource = isCustomConfig ? '.navable.json' : 'default';

      const requestedEngines: EngineSource[] = engines ?? config.engines ?? ['axe'];
      const runAxe = requestedEngines.includes('axe');
      const runHtmlcs = requestedEngines.includes('htmlcs');

      const isCompact = compact !== false;
      const HTML_CAP = isCompact ? 120 : 200;

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

        // 5. Build axe runner promise
        const axeStart = Date.now();
        const axePromise: Promise<{
          violations: NormalizedViolation[];
          incomplete: NormalizedViolation[];
          passes: number;
          rulesRun: number;
          duration: number;
        }> = (async () => {
          if (!runAxe) {
            return { violations: [], incomplete: [], passes: 0, rulesRun: 0, duration: 0 };
          }
          let axeBuilder = new AxeBuilder({ page });
          const axeTags = tags ?? config.axeTags ?? DEFAULT_AXE_TAGS;
          axeBuilder = axeBuilder.withTags(axeTags);
          if (config.axeDisableRules?.length) {
            axeBuilder = axeBuilder.disableRules(config.axeDisableRules);
          }
          if (include?.length) {
            for (const sel of include) axeBuilder = axeBuilder.include(sel);
          }
          if (exclude?.length) {
            for (const sel of exclude) axeBuilder = axeBuilder.exclude(sel);
          }
          const axeResults = await axeBuilder.analyze();
          return {
            violations: axeResults.violations.map(v =>
              mapAxeViolation(v, { isCompact, htmlCap: HTML_CAP }),
            ),
            incomplete: axeResults.incomplete.map(v =>
              mapAxeViolation(v, { isCompact, htmlCap: HTML_CAP }),
            ),
            passes: axeResults.passes.length,
            rulesRun:
              axeResults.passes.length +
              axeResults.violations.length +
              axeResults.incomplete.length,
            duration: Date.now() - axeStart,
          };
        })();

        // 6. Build htmlcs runner promise (Pa11y uses its own browser process,
        //    so it doesn't need our Playwright `page`).
        const htmlcsStart = Date.now();
        const htmlcsPromise: Promise<{
          violations: NormalizedViolation[];
          duration: number;
        }> = (async () => {
          if (!runHtmlcs) return { violations: [], duration: 0 };
          const results = await runPa11y(validatedUrl.href);
          return {
            violations: results.issues.map(i =>
              mapHtmlcsIssue(i, { isCompact, htmlCap: HTML_CAP }),
            ),
            duration: Date.now() - htmlcsStart,
          };
        })();

        // 7. Run engines in parallel - fail soft so a Pa11y crash never blocks axe.
        const [axeSettled, htmlcsSettled] = await Promise.allSettled([axePromise, htmlcsPromise]);

        const engineErrors: Partial<Record<EngineSource, string>> = {};
        const engineDurations: Partial<Record<EngineSource, number>> = {};

        let axeViolations: NormalizedViolation[] = [];
        let axeIncomplete: NormalizedViolation[] = [];
        let axePasses = 0;
        let axeRulesRun = 0;

        if (axeSettled.status === 'fulfilled') {
          axeViolations = axeSettled.value.violations;
          axeIncomplete = axeSettled.value.incomplete;
          axePasses = axeSettled.value.passes;
          axeRulesRun = axeSettled.value.rulesRun;
          if (runAxe) engineDurations.axe = axeSettled.value.duration;
        } else if (runAxe) {
          engineErrors.axe = (axeSettled.reason as Error)?.message ?? String(axeSettled.reason);
        }

        let htmlcsViolations: NormalizedViolation[] = [];
        if (htmlcsSettled.status === 'fulfilled') {
          htmlcsViolations = htmlcsSettled.value.violations;
          if (runHtmlcs) engineDurations.htmlcs = htmlcsSettled.value.duration;
        } else if (runHtmlcs) {
          engineErrors.htmlcs =
            (htmlcsSettled.reason as Error)?.message ?? String(htmlcsSettled.reason);
        }

        // 8. Merge crossover findings (axe-preferred); collapse htmlcs twins.
        const { merged: violations, stats: mergeStats } = mergeViolations(
          axeViolations,
          htmlcsViolations,
        );

        // 9. Summary (counts AFTER merge).
        const impactOf = (v: NormalizedViolation) => v.impact;
        const summary: Record<string, unknown> = {
          total: violations.length,
          critical: violations.filter(v => impactOf(v) === 'critical').length,
          serious: violations.filter(v => impactOf(v) === 'serious').length,
          moderate: violations.filter(v => impactOf(v) === 'moderate').length,
          minor: violations.filter(v => impactOf(v) === 'minor').length,
          passes: axePasses,
          incomplete: axeIncomplete.length,
        };
        if (runHtmlcs) {
          summary.bySource = {
            axe: violations.filter(v => v.source === 'axe').length,
            htmlcs: violations.filter(v => v.source === 'htmlcs').length,
          };
          summary.crossEngineConfirmed = violations.filter(
            v => (v.alsoFlaggedBy ?? []).length > 0,
          ).length;
        }

        // 10. Build final result.
        const enginesRun: EngineSource[] = [];
        if (runAxe && axeSettled.status === 'fulfilled') enginesRun.push('axe');
        if (runHtmlcs && htmlcsSettled.status === 'fulfilled') enginesRun.push('htmlcs');

        const metadata: Record<string, unknown> = {
          scanDuration: Date.now() - startTime,
          rulesRun: axeRulesRun,
          configSource: configSource as 'default' | '.navable.json',
          enginesRun,
          engineDurations,
        };
        if (Object.keys(engineErrors).length) metadata.engineErrors = engineErrors;
        if (runHtmlcs) metadata.engineMerges = mergeStats;

        const result = {
          url: validatedUrl.href,
          timestamp: new Date().toISOString(),
          summary,
          violations,
          incomplete: axeIncomplete,
          metadata,
        };

        // Store server-side so generate_fix_plan can reference by ID
        const scanId = storeScanResult(result);
        const resultWithId = { ...result, scanId };

        return {
          content: [
            {
              type: 'text' as const,
              text: isCompact
                ? JSON.stringify(resultWithId)
                : JSON.stringify(resultWithId, null, 2),
            },
          ],
        };
      } finally {
        await page.context().close();
      }
    },
  );
}
