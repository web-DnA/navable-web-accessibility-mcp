/**
 * Smoke test driver: runs run_accessibility_scan against the local
 * test/smoke/test-page.html for both engine configurations.
 *
 * Usage:
 *   1. In one terminal: `npx http-server test/smoke -p 8765 -s`
 *   2. In another:      `npm run smoke`
 */
import { AxeBuilder } from '@axe-core/playwright';
import { closeBrowser, navigateTo, newPage } from '../../dist/browser.js';
import { mapAxeViolation, mapHtmlcsIssue, mergeViolations } from '../../dist/normalize.js';
import { runPa11y } from '../../dist/pa11y-runner.js';

const URL = 'http://localhost:8765/test-page.html';
const HTML_CAP = 120;
const isCompact = true;

async function scan(engines) {
  const start = Date.now();
  const page = await newPage();
  try {
    await navigateTo(page, URL);

    const axeStart = Date.now();
    const axePromise = engines.includes('axe')
      ? new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'])
          .analyze()
          .then(r => ({
            violations: r.violations.map(v => mapAxeViolation(v, { isCompact, htmlCap: HTML_CAP })),
            duration: Date.now() - axeStart,
          }))
      : Promise.resolve({ violations: [], duration: 0 });

    const htmlcsStart = Date.now();
    const htmlcsPromise = engines.includes('htmlcs')
      ? runPa11y(URL).then(r => ({
          violations: r.issues.map(i => mapHtmlcsIssue(i, { isCompact, htmlCap: HTML_CAP })),
          duration: Date.now() - htmlcsStart,
        }))
      : Promise.resolve({ violations: [], duration: 0 });

    const [axeRes, htmlcsRes] = await Promise.allSettled([axePromise, htmlcsPromise]);

    const axeV = axeRes.status === 'fulfilled' ? axeRes.value.violations : [];
    const htmlcsV = htmlcsRes.status === 'fulfilled' ? htmlcsRes.value.violations : [];
    const { merged, stats } = mergeViolations(axeV, htmlcsV);

    return {
      engines,
      durationMs: Date.now() - start,
      axeDurationMs: axeRes.status === 'fulfilled' ? axeRes.value.duration : null,
      htmlcsDurationMs: htmlcsRes.status === 'fulfilled' ? htmlcsRes.value.duration : null,
      axeError: axeRes.status === 'rejected' ? String(axeRes.reason) : null,
      htmlcsError: htmlcsRes.status === 'rejected' ? String(htmlcsRes.reason) : null,
      counts: { axeOnlyRaw: axeV.length, htmlcsOnlyRaw: htmlcsV.length, merged: merged.length },
      mergeStats: stats,
      crossEngineConfirmed: merged.filter(v => (v.alsoFlaggedBy ?? []).length > 0).length,
      sample: {
        axeWithAlsoFlagged: merged.find(
          v => v.source === 'axe' && (v.alsoFlaggedBy ?? []).length > 0,
        ),
        firstHtmlcsOnly: merged.find(v => v.source === 'htmlcs'),
      },
      mergedJsonBytes: JSON.stringify(merged).length,
    };
  } finally {
    await page.context().close();
  }
}

const reports = [];
reports.push(await scan(['axe']));
reports.push(await scan(['axe', 'htmlcs']));
await closeBrowser();

console.log(JSON.stringify(reports, null, 2));
