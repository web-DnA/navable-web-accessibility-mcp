import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { getProjectRoot } from '../config.js';
import { getFixPattern } from '../data/fix-patterns.js';
import { getForAxeRule } from '../data/wcag-criteria.js';
import { getScanResult } from '../scan-store.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FixPlanItem {
  id: string;
  ruleId: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  priority: number;
  wcagSc: string[];
  en301549: string;
  help: string;
  affectedNodes: Array<{
    selector: string;
    html: string;
    failureSummary: string;
  }>;
  fixDescription: string;
  status: 'pending' | 'in_progress' | 'done' | 'skipped';
  appliedAt?: string;
}

export interface AccessibilityFixPlan {
  planId: string;
  url: string;
  createdAt: string;
  scanTimestamp: string;
  summary: {
    total: number;
    byImpact: {
      critical: number;
      serious: number;
      moderate: number;
      minor: number;
    };
  };
  items: FixPlanItem[];
  manualReview: Array<{
    ruleId: string;
    description: string;
    nodes: Array<{ selector: string; html: string }>;
  }>;
  verification?: {
    completedAt: string;
    remainingViolations: number;
    passed: boolean;
  };
}

// ---------------------------------------------------------------------------
// Input schema — validates the minimum structure needed from scan output
// ---------------------------------------------------------------------------

const violationNodeSchema = z
  .object({
    target: z.array(z.string()).optional(),
    html: z.string().optional(),
    failureSummary: z.string().optional(),
  })
  .passthrough();

const wcagCriterionSchema = z
  .object({
    sc: z.string().optional(),
    en301549: z.string().optional(),
  })
  .passthrough();

const violationSchema = z
  .object({
    id: z.string(),
    impact: z.enum(['critical', 'serious', 'moderate', 'minor']),
    help: z.string().optional(),
    description: z.string().optional(),
    nodes: z.array(violationNodeSchema),
    wcagCriteria: z.array(wcagCriterionSchema).optional(),
  })
  .passthrough();

const incompleteSchema = z
  .object({
    id: z.string().optional(),
    help: z.string().optional(),
    description: z.string().optional(),
    nodes: z.array(violationNodeSchema).optional(),
  })
  .passthrough();

const scanSchema = z
  .object({
    url: z.string(),
    timestamp: z.string(),
    violations: z.array(violationSchema),
    incomplete: z.array(incompleteSchema).optional().default([]),
  })
  .passthrough();

// ---------------------------------------------------------------------------
// Priority helpers
// ---------------------------------------------------------------------------

const IMPACT_PRIORITY: Record<string, number> = {
  critical: 1,
  serious: 2,
  moderate: 3,
  minor: 4,
};

function getPriority(impact: string): number {
  return IMPACT_PRIORITY[impact] ?? 5;
}

// ---------------------------------------------------------------------------
// Error helper
// ---------------------------------------------------------------------------

function errorResponse(message: string) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
    isError: true as const,
  };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerGenerateFixPlan(server: McpServer): void {
  server.registerTool(
    'generate_fix_plan',
    {
      title: 'Accessibility Fix Plan Generator',
      description:
        'Convert a scan result into a structured AccessibilityFixPlan and write it to .navable-plan.json.\n\n' +
        'PREFERRED WORKFLOW:\n' +
        '  1. Call run_accessibility_scan — it returns a "scanId" field in the result.\n' +
        '  2. Call generate_fix_plan with { scanId: "<value from step 1>" }.\n' +
        '  The scanId lookup is server-side — no need to pass the full scan JSON back.\n\n' +
        'FALLBACK WORKFLOW:\n' +
        '  Pass the full scan JSON as { scan: <object> }. ' +
        'Use only when the scanId is no longer available (server was restarted; last 10 scans are kept).\n\n' +
        'WRITE LOCATION:\n' +
        '  Writes .navable-plan.json to the project root (auto-detected via package.json / .git walk-up).\n' +
        '  If the file ends up in the wrong place, set the NAVABLE_PROJECT_ROOT environment variable ' +
        'in your MCP server config to the absolute path of your project directory.\n\n' +
        'RESPONSE:\n' +
        '  Always includes "planPath" — the absolute path where the file was written.\n' +
        '  On write failure, returns an error with the attempted path and instructions to set NAVABLE_PROJECT_ROOT.',
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
      inputSchema: {
        scanId: z
          .string()
          .optional()
          .describe(
            'Preferred: the "scanId" value from run_accessibility_scan output. ' +
              'Avoids passing the full scan object through MCP parameters.',
          ),
        scan: z
          .object({})
          .passthrough()
          .optional()
          .describe(
            'Fallback: full JSON output from run_accessibility_scan. ' +
              'Use only when scanId is unavailable (e.g. server was restarted).',
          ),
        writeToDisk: z
          .boolean()
          .optional()
          .default(true)
          .describe(
            'Write .navable-plan.json to project root (default: true). ' +
              'Set NAVABLE_PROJECT_ROOT env var in MCP config to control the write location.',
          ),
        compact: z
          .boolean()
          .optional()
          .default(true)
          .describe(
            'Return compact summary (default: true). When true and writeToDisk is true, returns only ' +
              'planPath + summary + top 5 items. Set to false for the full plan in the response.',
          ),
      },
    },
    async ({ scanId, scan, writeToDisk, compact }) => {
      // -----------------------------------------------------------------
      // Resolve scan data: prefer scanId, fall back to inline scan object
      // -----------------------------------------------------------------
      let rawScan: unknown;

      if (scanId) {
        rawScan = getScanResult(scanId);
        if (!rawScan) {
          return errorResponse(
            `No scan found for scanId "${scanId}". It may have expired (only the last 10 scans are kept). ` +
              'Run run_accessibility_scan again, or pass the full scan object via the "scan" parameter.',
          );
        }
      } else if (scan) {
        rawScan = scan;
      } else {
        return errorResponse(
          'Either "scanId" or "scan" must be provided. ' +
            'Use the scanId returned by run_accessibility_scan, or pass the full scan JSON.',
        );
      }

      // -----------------------------------------------------------------
      // Validate scan structure
      // -----------------------------------------------------------------
      const parsed = scanSchema.safeParse(rawScan);
      if (!parsed.success) {
        return errorResponse(
          `Invalid scan data: ${parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}. ` +
            'Pass the full JSON output from run_accessibility_scan.',
        );
      }
      const scanResult = parsed.data;

      if (!scanResult.violations.length && !scanResult.incomplete.length) {
        return errorResponse(
          'Scan result contains no violations or incomplete items. ' +
            'Pass the full JSON output from run_accessibility_scan.',
        );
      }

      // -----------------------------------------------------------------
      // Build items from violations
      // -----------------------------------------------------------------
      const unsortedItems: FixPlanItem[] = scanResult.violations.map((v, index) => {
        const pattern = getFixPattern(v.id);
        const wcagCriteria = (v.wcagCriteria ?? []).filter(
          (c): c is { sc: string; en301549: string } =>
            typeof c.sc === 'string' && typeof c.en301549 === 'string',
        );
        const en301549 = wcagCriteria[0]?.en301549 ?? getForAxeRule(v.id)[0]?.en301549 ?? '';

        return {
          id: `fix-${index + 1}`,
          ruleId: v.id,
          impact: v.impact,
          priority: getPriority(v.impact),
          wcagSc: wcagCriteria.map(c => c.sc),
          en301549,
          help: v.help ?? v.description ?? '',
          affectedNodes: v.nodes.map(n => ({
            selector: n.target?.[0] ?? '',
            html: (n.html ?? '').slice(0, 120),
            failureSummary: n.failureSummary ?? '',
          })),
          fixDescription: pattern?.whatIsWrong ?? `Fix violation: ${v.help ?? v.id}`,
          status: 'pending' as const,
        };
      });

      // Sort by priority ascending, then re-assign stable IDs
      const items: FixPlanItem[] = unsortedItems
        .sort((a, b) => a.priority - b.priority)
        .map((item, index) => ({ ...item, id: `fix-${index + 1}` }));

      // Build manualReview from incomplete results
      const manualReview = (scanResult.incomplete ?? []).map(i => ({
        ruleId: i.id ?? '',
        description: i.description ?? i.help ?? '',
        nodes: (i.nodes ?? []).map(n => {
          const rawHtml = n.html ?? '';
          return {
            selector: n.target?.[0] ?? '',
            html: rawHtml.length > 120 ? rawHtml.slice(0, 120) + '…' : rawHtml,
          };
        }),
      }));

      const plan: AccessibilityFixPlan = {
        planId: `navable-plan-${Date.now()}`,
        url: scanResult.url,
        createdAt: new Date().toISOString(),
        scanTimestamp: scanResult.timestamp,
        summary: {
          total: items.length,
          byImpact: {
            critical: items.filter(i => i.impact === 'critical').length,
            serious: items.filter(i => i.impact === 'serious').length,
            moderate: items.filter(i => i.impact === 'moderate').length,
            minor: items.filter(i => i.impact === 'minor').length,
          },
        },
        items,
        manualReview,
      };

      let planPath: string | undefined;
      let writeError: string | undefined;

      if (writeToDisk !== false) {
        const root = await getProjectRoot();
        planPath = join(root, '.navable-plan.json');
        try {
          await writeFile(planPath, JSON.stringify(plan, null, 2), 'utf-8');
        } catch (err) {
          writeError =
            `Failed to write .navable-plan.json to "${planPath}": ${(err as Error).message}. ` +
            'Set the NAVABLE_PROJECT_ROOT environment variable in your MCP server configuration ' +
            'to the absolute path of your project directory. ' +
            'Example for Cursor (.cursor/mcp.json): ' +
            '{ "env": { "NAVABLE_PROJECT_ROOT": "/absolute/path/to/your/project" } }';
        }
      }

      if (writeError) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: writeError, plan }) }],
          isError: true,
        };
      }

      // Compact mode: return summary + top items when plan is on disk
      if (compact !== false && planPath) {
        const TOP_N = 5;
        const compactResponse = {
          planPath,
          summary: plan.summary,
          topItems: items.slice(0, TOP_N).map(i => ({
            id: i.id,
            ruleId: i.ruleId,
            impact: i.impact,
          })),
          manualReviewCount: manualReview.length,
        };
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(compactResponse) }],
        };
      }

      const response = { ...plan, ...(planPath ? { planPath } : {}) };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
      };
    },
  );
}
