# Changelog

## 0.2.0

### Added

- **Pa11y/HTMLCS as opt-in second engine.** Pass `engines: ["axe", "htmlcs"]` to
  `run_accessibility_scan` or set it in `.navable.json` to run both axe-core and Pa11y/HTMLCS in
  parallel. Shares Playwright's Chromium binary — no extra download.
- **Cross-engine dedup.** Crossover findings (same WCAG SC + matching selector + matching HTML) are
  merged server-side using a conservative confidence ladder. Merged entries are tagged
  `alsoFlaggedBy: ["htmlcs"]`. HTMLCS-only entries include `helpUrl` and `developerNote`.
- **HTMLCS noise suppression.** New `htmlcsIgnore` config option to suppress advisory HTMLCS codes.
- **Compact mode (default).** `run_accessibility_scan` and `generate_fix_plan` now return smaller
  JSON by default (`compact: true`). Set `compact: false` for the previous verbose shape.
- **Result normalization.** Both engines map to a single `NormalizedViolation` shape with WCAG SC,
  EN 301 549 mapping, and impact severity before plan generation.

### Changed

- `generate_fix_plan` compact mode (default when `writeToDisk: true`) returns only `planPath`,
  `summary`, top 5 items, and `manualReviewCount` — read the plan file for full details.

## < 0.1.5

Initial public release — axe-core only, single-engine scanning.
