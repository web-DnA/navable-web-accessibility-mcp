# @navable/mcp

[![npm version](https://img.shields.io/npm/v/@navable/mcp.svg)](https://www.npmjs.com/package/@navable/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js >= 20](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that gives AI coding
agents real-browser accessibility scanning. Scans localhost pages with Playwright + axe-core,
returns WCAG 2.1 Level A + AA violations with EN 301 549 mapping, and generates structured fix plans
your agent can work through autonomously.

## Quick Start

```bash
# 1. Install — Chromium is downloaded automatically during install
npm install -g @navable/mcp

# 2. Start your dev server, then scan
#    (configure your IDE — see below — and ask your agent to scan)
```

> **Chromium installs automatically** when you run `npm install`. No extra step needed. If the
> automatic download fails (e.g. in a restricted network or CI environment), install it manually:
>
> ```bash
> npx playwright install chromium
> ```

## MCP Configuration

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "navable": {
      "command": "npx",
      "args": ["-y", "@navable/mcp"],
      "env": {
        "NAVABLE_PROJECT_ROOT": "/absolute/path/to/your/project"
      }
    }
  }
}
```

`NAVABLE_PROJECT_ROOT` is optional. Set it if `.navable-plan.json` is written to the wrong directory
(some IDE extension hosts use a different working directory). Omit `env` if auto-detection works.

### VS Code (Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "navable": {
      "command": "npx",
      "args": ["-y", "@navable/mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add navable -- npx -y @navable/mcp
```

## Available Tools

### `run_accessibility_scan`

Scans a URL for WCAG 2.1 Level A + AA accessibility violations.

| Input     | Description                                                                                                                                                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`     | Full URL to scan (e.g. `http://localhost:3000`)                                                                                                                                                                                                    |
| `tags`    | axe-core rule tags to include (optional)                                                                                                                                                                                                           |
| `include` | CSS selectors to limit scan scope (optional)                                                                                                                                                                                                       |
| `exclude` | CSS selectors to exclude (optional)                                                                                                                                                                                                                |
| `compact` | **`true` (default)** — smaller JSON: omits `description`, `helpUrl`, `wcag` tags, `failureSummary`; `wcagCriteria` keeps only `sc` and `en301549`; HTML snippets capped at 120 chars; no pretty-print. Set `false` for the previous verbose shape. |

**Workflow:** The response includes a **`scanId`**. Pass it to `generate_fix_plan` instead of
pasting the full scan object — this avoids MCP client serialization issues and keeps chats smaller.

### `generate_fix_plan`

Converts scan output into a structured `AccessibilityFixPlan` and writes `.navable-plan.json` when
`writeToDisk` is true.

| Input         | Description                                                                                                                                                                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scanId`      | From `run_accessibility_scan` (**preferred**)                                                                                                                                                                                                                                                                     |
| `scan`        | Full scan JSON (fallback if the server was restarted; only the last 10 scans are cached)                                                                                                                                                                                                                          |
| `writeToDisk` | Write `.navable-plan.json` (default: `true`)                                                                                                                                                                                                                                                                      |
| `compact`     | **`true` (default)** when writing to disk: response is only `planPath`, `summary`, top 5 `topItems`, and `manualReviewCount`. Read the plan file for full item details. Set `false` to return the full plan in the tool response. Ignored when combined with `writeToDisk: false` (full plan is always returned). |

Returns `planPath` (absolute) when the file is written successfully. On write failure, returns an
error with the attempted path; set `NAVABLE_PROJECT_ROOT` in the MCP server `env` if needed.

### `update_fix_status`

Mark fix plan items as done, skipped, or in progress. Prefer this over hand-editing
`.navable-plan.json`.

| Input      | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| `fixId`    | Item ID(s), e.g. `"fix-1"` or `["fix-1", "fix-2"]`              |
| `status`   | `done`, `skipped`, `in_progress`, or `pending`                  |
| `planPath` | Absolute path to plan file (optional; defaults to project root) |

Returns updated progress summary (total, done, pending, skipped).

## Available Resources

Resources use `text/markdown`. **Prefer parameterized URIs** during fix workflows to save context.

### WCAG / compliance

| URI                           | Size (typical) | Description                                                                                   |
| ----------------------------- | -------------- | --------------------------------------------------------------------------------------------- |
| `navable://docs/wcag-mapping` | Compact        | WCAG SC → EN 301 549 → testability → axe rules; summary stats; WCAG 2.2 forward-looking table |
| `navable://docs/bfsg-legal`   | Large          | BFSG legal context: scope, German glossary, enforcement, BITV 2.0, dates (optional)           |

### Fix patterns (axe rule → before/after code)

| URI                                     | Size (typical) | Description                                                                                                                                             |
| --------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `navable://docs/fix-patterns/{ruleIds}` | Small          | **Preferred.** Comma-separated axe rule IDs, no spaces. Example: `navable://docs/fix-patterns/label,color-contrast,image-alt`. Unknown IDs are skipped. |
| `navable://docs/fix-patterns`           | Large (~49 KB) | All 55 documented rules                                                                                                                                 |

### ARIA (WAI-ARIA APG patterns)

| URI                                          | Size (typical) | Description                                                                          |
| -------------------------------------------- | -------------- | ------------------------------------------------------------------------------------ |
| `navable://docs/aria-patterns`               | Compact index  | Table: slug, name, complexity, short description                                     |
| `navable://docs/aria-patterns/{patternSlug}` | Per pattern    | Full detail (e.g. `dialog-modal`, `combobox`). Invalid slug → lists available slugs. |

### Semantic HTML

| URI                                      | Size (typical) | Description                                                                                   |
| ---------------------------------------- | -------------- | --------------------------------------------------------------------------------------------- |
| `navable://docs/semantic-html`           | Compact index  | Table: element, implicit role, short description                                              |
| `navable://docs/semantic-html/{element}` | Per element    | Full detail (e.g. `nav`, `button`, `input-checkbox`). Invalid tag → lists available elements. |

## Configuration

Create a `.navable.json` in your project root to customize behavior:

```json
{
  "allowedHosts": ["localhost", "127.0.0.1", "[::1]"],
  "timeout": 15000,
  "waitUntil": "load",
  "axeTags": ["wcag2a", "wcag21a", "wcag2aa", "wcag21aa"],
  "axeDisableRules": [],
  "wcagLevel": "AA"
}
```

| Option            | Default                                        | Description                                                                    |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| `allowedHosts`    | `["localhost", "127.0.0.1", "[::1]"]`          | Hostnames the scanner may reach                                                |
| `timeout`         | `15000`                                        | Navigation timeout in ms                                                       |
| `waitUntil`       | `"load"`                                       | Playwright wait strategy (`load`, `domcontentloaded`, `networkidle`, `commit`) |
| `axeTags`         | `["wcag2a", "wcag21a", "wcag2aa", "wcag21aa"]` | axe-core tags to include                                                       |
| `axeDisableRules` | `[]`                                           | axe-core rule IDs to skip                                                      |
| `wcagLevel`       | `"AA"`                                         | Target WCAG conformance level                                                  |

Set **`NAVABLE_PROJECT_ROOT`** in the MCP server environment (see Cursor example above) so
`.navable-plan.json` resolves to your app’s repo root when the server’s cwd is not the project.

## Requirements

- **Node.js** >= 20
- **Playwright Chromium** — downloaded automatically on `npm install`. If needed, install manually
  with `npx playwright install chromium`.

## Contributing / development

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
git clone https://github.com/web-DnA/navable-web-accessibility-mcp.git
cd navable-web-accessibility-mcp
npm install
npx playwright install chromium
npm run dev   # watch mode
```

## License

MIT
