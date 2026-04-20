/**
 * Configuration loader and URL validation.
 *
 * Reads `.navable.json` from CWD if present, otherwise falls back to safe
 * defaults (localhost-only, 15 s timeout). Exports a URL validator that
 * tools call before every scan.
 */

import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NavableConfig {
  /** Hostnames the scanner is allowed to reach (default: localhost + 127.0.0.1 + [::1]) */
  allowedHosts: string[];
  /** Page-navigation timeout in ms (default: 15 000) */
  timeout: number;
  /** Playwright waitUntil strategy (default: 'load') */
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
  /** axe-core tags to include in scans (default: all) */
  axeTags?: string[];
  /** axe-core rule IDs to skip */
  axeDisableRules?: string[];
  /** WCAG conformance level to target */
  wcagLevel?: 'A' | 'AA' | 'AAA';
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: NavableConfig = {
  allowedHosts: ['localhost', '127.0.0.1', '[::1]'],
  timeout: 15_000,
};

const CONFIG_FILENAME = '.navable.json';

// ---------------------------------------------------------------------------
// Singleton — loaded once, reused everywhere
// ---------------------------------------------------------------------------

let cached: NavableConfig | null = null;

/**
 * Load config from `.navable.json` in CWD. Falls back to defaults when the
 * file is missing or unparseable. Caches after the first successful read.
 */
export async function loadConfig(): Promise<NavableConfig> {
  if (cached) return cached;

  try {
    const raw = await readFile(resolve(process.cwd(), CONFIG_FILENAME), 'utf-8');
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      cached = { ...DEFAULT_CONFIG };
      return cached;
    }

    const obj = parsed as Record<string, unknown>;

    cached = {
      allowedHosts: Array.isArray(obj.allowedHosts)
        ? (obj.allowedHosts as unknown[]).filter((h): h is string => typeof h === 'string')
        : DEFAULT_CONFIG.allowedHosts,
      timeout:
        typeof obj.timeout === 'number' && obj.timeout > 0 ? obj.timeout : DEFAULT_CONFIG.timeout,
      ...(Array.isArray(obj.axeTags) ? { axeTags: obj.axeTags as string[] } : {}),
      ...(Array.isArray(obj.axeDisableRules)
        ? { axeDisableRules: obj.axeDisableRules as string[] }
        : {}),
      ...(typeof obj.waitUntil === 'string' &&
      ['load', 'domcontentloaded', 'networkidle', 'commit'].includes(obj.waitUntil)
        ? { waitUntil: obj.waitUntil as NavableConfig['waitUntil'] }
        : {}),
      ...(typeof obj.wcagLevel === 'string' && ['A', 'AA', 'AAA'].includes(obj.wcagLevel)
        ? { wcagLevel: obj.wcagLevel as NavableConfig['wcagLevel'] }
        : {}),
    };

    return cached;
  } catch {
    // File missing, permission denied, or invalid JSON — all fine, use defaults
    cached = { ...DEFAULT_CONFIG };
    return cached;
  }
}

/** Force-reload config (useful after the user edits `.navable.json`). */
export function resetConfig(): void {
  cached = null;
}

// ---------------------------------------------------------------------------
// Project root resolution
// ---------------------------------------------------------------------------

/**
 * Resolve the project root directory using a fallback strategy:
 *  1. NAVABLE_PROJECT_ROOT env var (explicit override)
 *  2. Walk up from CWD looking for .navable.json, package.json, or .git
 *  3. Fall back to process.cwd()
 */
export async function getProjectRoot(): Promise<string> {
  const envRoot = process.env.NAVABLE_PROJECT_ROOT;
  if (envRoot) return resolve(envRoot);

  let dir = process.cwd();
  while (dir !== resolve(dir, '..')) {
    for (const marker of ['.navable.json', 'package.json', '.git']) {
      try {
        await stat(resolve(dir, marker));
        return dir;
      } catch {
        /* continue */
      }
    }
    dir = resolve(dir, '..');
  }

  return process.cwd();
}

// ---------------------------------------------------------------------------
// URL validation
// ---------------------------------------------------------------------------

/**
 * Validate that a URL is allowed by the current config.
 *
 * Throws a descriptive error when:
 *  - the string is not a valid URL
 *  - the hostname is not in `allowedHosts`
 */
export async function validateUrl(raw: string): Promise<URL> {
  const cfg = await loadConfig();

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(
      `Invalid URL: "${raw}". Please provide a full URL including protocol (e.g. http://localhost:3000).`,
    );
  }

  // Normalise hostname — URL constructor strips brackets from IPv6 but we
  // store "[::1]" in the config for readability.
  const hostname = url.hostname;
  const allowed = cfg.allowedHosts.some(h => h === hostname || h === `[${hostname}]`);

  if (!allowed) {
    throw new Error(
      `Host "${hostname}" is not in the allowed list (${cfg.allowedHosts.join(', ')}). ` +
        `Add it to .navable.json { "allowedHosts": [...] } if you trust this host.`,
    );
  }

  return url;
}
