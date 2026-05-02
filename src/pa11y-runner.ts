/**
 * Pa11y runner — invokes Pa11y with the HTMLCS runner against a URL.
 *
 * Pa11y's `browser`/`page` config is typed against Puppeteer, so we use
 * `puppeteer-core` (no bundled Chromium) pointed at Playwright's Chromium
 * binary. This keeps the install footprint to one Chromium download.
 */

import puppeteer from 'puppeteer-core';
import { getChromiumExecutablePath } from './browser.js';
import { loadConfig } from './config.js';
import type { Pa11yIssue } from './normalize.js';

interface Pa11yResults {
  documentTitle?: string;
  pageUrl?: string;
  issues: Pa11yIssue[];
}

interface Pa11yLib {
  (url: string, opts: Record<string, unknown>): Promise<Pa11yResults>;
}

export interface RunPa11yOptions {
  htmlcsIgnore?: string[];
}

export async function runPa11y(url: string, opts: RunPa11yOptions = {}): Promise<Pa11yResults> {
  const cfg = await loadConfig();
  const executablePath = getChromiumExecutablePath();

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Pa11y is a CommonJS module; load via dynamic import.
    const mod = (await import('pa11y')) as { default: Pa11yLib } | Pa11yLib;
    const pa11y: Pa11yLib = typeof mod === 'function' ? mod : mod.default;

    const ignore = opts.htmlcsIgnore ?? cfg.htmlcsIgnore ?? [];

    const results = await pa11y(url, {
      browser,
      page,
      runners: ['htmlcs'],
      standard: 'WCAG2AA',
      includeWarnings: true,
      includeNotices: false,
      timeout: cfg.timeout,
      ...(ignore.length ? { ignore } : {}),
    });

    return results;
  } finally {
    await browser.close().catch(() => {});
  }
}
