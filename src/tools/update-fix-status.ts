import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, isAbsolute, join } from 'node:path';
import { z } from 'zod';
import { getProjectRoot } from '../config.js';

function errorResponse(message: string) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
    isError: true as const,
  };
}

export function registerUpdateFixStatus(server: McpServer): void {
  server.registerTool(
    'update_fix_status',
    {
      title: 'Fix Status Updater',
      description:
        'Update the status of one or more items in .navable-plan.json.\n\n' +
        'Use after applying a fix to mark it as done, or to skip an item.\n' +
        'Reads the plan from the project root (or planPath), updates the matching items, ' +
        'and writes the file back. Returns the updated summary.',
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
      inputSchema: {
        fixId: z
          .union([z.string(), z.array(z.string())])
          .describe('Fix item ID(s) to update, e.g. "fix-1" or ["fix-1", "fix-2"]'),
        status: z
          .enum(['done', 'skipped', 'in_progress', 'pending'])
          .describe('New status for the item(s)'),
        planPath: z
          .string()
          .optional()
          .describe('Absolute path to .navable-plan.json. If omitted, resolves from project root.'),
      },
    },
    async ({ fixId, status, planPath }) => {
      const ids = Array.isArray(fixId) ? fixId : [fixId];

      // Resolve plan file location
      let resolvedPath: string;
      if (planPath) {
        if (!isAbsolute(planPath)) {
          return errorResponse(`planPath must be an absolute path. Received: "${planPath}".`);
        }
        if (basename(planPath) !== '.navable-plan.json') {
          return errorResponse(
            `planPath must point to a file named ".navable-plan.json". Received: "${planPath}".`,
          );
        }
        resolvedPath = planPath;
      } else {
        const root = await getProjectRoot();
        resolvedPath = join(root, '.navable-plan.json');
      }

      // Read existing plan
      let plan: { items?: Array<{ id: string; status: string; appliedAt?: string }> };
      try {
        const raw = await readFile(resolvedPath, 'utf-8');
        plan = JSON.parse(raw);
      } catch (err) {
        return errorResponse(
          `Could not read plan at "${resolvedPath}": ${(err as Error).message}. ` +
            'Run generate_fix_plan first to create the plan file.',
        );
      }

      if (!Array.isArray(plan.items)) {
        return errorResponse(`Invalid plan file at "${resolvedPath}": missing "items" array.`);
      }
      const planItems = plan.items;

      // Update matching items
      const updated: string[] = [];
      const notFound: string[] = [];
      const now = new Date().toISOString();

      for (const id of ids) {
        const item = planItems.find(i => i.id === id);
        if (item) {
          item.status = status;
          if (status === 'done') {
            item.appliedAt = now;
          }
          updated.push(id);
        } else {
          notFound.push(id);
        }
      }

      if (!updated.length) {
        return errorResponse(
          `No matching items found for: ${notFound.join(', ')}. ` +
            `Available IDs: ${planItems.map(i => i.id).join(', ')}`,
        );
      }

      // Write back
      try {
        await writeFile(resolvedPath, JSON.stringify(plan, null, 2), 'utf-8');
      } catch (err) {
        return errorResponse(
          `Failed to write plan at "${resolvedPath}": ${(err as Error).message}.`,
        );
      }

      // Build summary
      const summary = {
        updated,
        ...(notFound.length ? { notFound } : {}),
        planPath: resolvedPath,
        progress: {
          total: planItems.length,
          done: planItems.filter(i => i.status === 'done').length,
          skipped: planItems.filter(i => i.status === 'skipped').length,
          pending: planItems.filter(i => i.status === 'pending').length,
          inProgress: planItems.filter(i => i.status === 'in_progress').length,
        },
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }],
      };
    },
  );
}
