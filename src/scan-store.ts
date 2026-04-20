/**
 * In-memory scan result store.
 *
 * Keeps the last N scan results server-side so `generate_fix_plan` can
 * reference them by ID instead of requiring the agent to round-trip the
 * full ~18 KB scan JSON through MCP parameter serialization (which can
 * corrupt nested objects in some clients).
 */

import { randomUUID } from 'node:crypto';

const MAX_ENTRIES = 10;

const store = new Map<string, object>();
const insertionOrder: string[] = [];

/** Store a scan result and return a stable ID for later retrieval. */
export function storeScanResult(result: object): string {
  const scanId = `scan-${randomUUID()}`;
  store.set(scanId, result);
  insertionOrder.push(scanId);

  while (insertionOrder.length > MAX_ENTRIES) {
    const oldest = insertionOrder.shift()!;
    store.delete(oldest);
  }

  return scanId;
}

/** Retrieve a previously stored scan result by ID. */
export function getScanResult(scanId: string): object | undefined {
  return store.get(scanId);
}
