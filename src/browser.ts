/**
 * Playwright browser singleton.
 *
 * Launches headless Chromium once and reuses it for every scan. Individual
 * tool calls open/close pages (tabs) — never the browser itself.
 *
 * Call `getBrowser()` to lazily initialise, `closeBrowser()` on shutdown.
 */

import { chromium, type Browser, type Page } from 'playwright';
import { loadConfig } from './config.js';

// ---------------------------------------------------------------------------
// Singleton state
// ---------------------------------------------------------------------------

let browser: Browser | null = null;

/**
 * Return the shared browser instance, launching it on first call.
 * Throws a descriptive error if Chromium is not installed.
 */
export async function getBrowser(): Promise<Browser> {
  if (browser?.isConnected()) return browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox'],
    });
  } catch (err) {
    const msg = (err as Error).message ?? '';
    if (msg.includes('Executable doesn') || msg.includes('browserType.launch')) {
      throw new Error(
        'Playwright Chromium browser is not installed. ' +
          'Run this command in your terminal to install it:\n\n' +
          '  npx playwright install chromium\n\n' +
          'This downloads the headless Chromium binary (~150 MB) needed for accessibility scans.',
      );
    }
    throw err;
  }

  return browser;
}

/**
 * Open a new page (tab) in the singleton browser.
 * Callers must close the page in a `finally` block.
 */
export async function newPage(): Promise<Page> {
  const b = await getBrowser();
  const context = await b.newContext({
    bypassCSP: true,
    javaScriptEnabled: true,
  });
  return context.newPage();
}

/**
 * Navigate a page to `url` using the configured timeout and wait strategy.
 * Defaults to `waitUntil: "load"` which works reliably with HMR dev servers
 * (Vite, Next.js, Webpack) that keep persistent WebSocket connections.
 * A short settle delay allows client-side rendering to complete.
 */
export async function navigateTo(page: Page, url: string): Promise<void> {
  const cfg = await loadConfig();
  await page.goto(url, {
    waitUntil: cfg.waitUntil ?? 'load',
    timeout: cfg.timeout,
  });
  await page.waitForTimeout(1500);
}

/**
 * Gracefully close the browser. Safe to call multiple times.
 */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
  }
}
