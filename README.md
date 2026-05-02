# Navable MCP

[![npm version](https://img.shields.io/npm/v/@navable/mcp.svg)](https://www.npmjs.com/package/@navable/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js >= 20](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)

Part of [**navable.io**](https://navable.io/) — open-source accessibility tools for development
teams.

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that gives AI coding
agents real-browser accessibility scanning. Scans localhost pages with Playwright + axe-core (and
optionally Pa11y/HTMLCS as a second engine), returns WCAG 2.1 Level A + AA violations with EN 301
549 mapping, and generates structured fix plans your agent can work through autonomously.

## Quick Start

1. Add the MCP config for your editor (see below)
2. Start your dev server
3. Ask your agent: _"scan http://localhost:3000 for accessibility issues"_

> **Chromium installs automatically** on the first scan (~150 MB one-time download). No extra step
> needed. If auto-install fails (e.g. restricted network), install manually:
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

> **By default, only axe-core runs.** Pa11y/HTMLCS is opt-in — see `engines` below.

| Input     | Description                                                                                                                                                                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`     | Full URL to scan (e.g. `http://localhost:3000`)                                                                                                                                                                                                           |
| `tags`    | axe-core rule tags to include (optional)                                                                                                                                                                                                                  |
| `include` | CSS selectors to limit scan scope (optional)                                                                                                                                                                                                              |
| `exclude` | CSS selectors to exclude (optional)                                                                                                                                                                                                                       |
| `engines` | Engines to run. Default: `["axe"]` — only axe-core runs. Pass `["axe", "htmlcs"]` to also run Pa11y/HTMLCS. Crossover findings are deduped server-side and tagged `alsoFlaggedBy: ["htmlcs"]`. Adds ~2–4 s wall-clock per scan. See _Scan engines_ below. |
| `compact` | **`true` (default)** — smaller JSON: omits `description`, `helpUrl`, `wcag` tags, `failureSummary`; `wcagCriteria` keeps only `sc` and `en301549`; HTML snippets capped at 120 chars; no pretty-print. Set `false` for the previous verbose shape.        |

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
  "engines": ["axe"],
  "htmlcsIgnore": [],
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
| `engines`         | `["axe"]`                                      | Engines to run. Add `"htmlcs"` to also run Pa11y/HTMLCS as a second engine     |
| `htmlcsIgnore`    | `[]`                                           | HTMLCS codes to suppress (see _Pa11y / HTMLCS noise reduction_ below)          |
| `wcagLevel`       | `"AA"`                                         | Target WCAG conformance level                                                  |

### Pa11y / HTMLCS as a second engine

**Pa11y does not run by default.** A plain `run_accessibility_scan({ url })` call — and the default
agent workflow — uses axe-core only. Pa11y/HTMLCS runs only when you opt in via the `engines`
parameter or `.navable.json`.

#### When to use both engines

| Use case                                               | Recommended                                   |
| ------------------------------------------------------ | --------------------------------------------- |
| Iterative fix loops (scan → fix → re-scan)             | `["axe"]` (default) — fast, low token cost    |
| One-shot compliance audit / BFSG / EN 301 549 sign-off | `["axe", "htmlcs"]` — cross-confirms findings |
| User explicitly asks for thorough / dual-engine scan   | `["axe", "htmlcs"]`                           |

#### How to enable Pa11y

**Per scan** — pass `engines` to the tool:

```
run_accessibility_scan({ url: "http://localhost:3000", engines: ["axe", "htmlcs"] })
```

**Always on** — add to `.navable.json` in your project root:

```json
{
  "engines": ["axe", "htmlcs"]
}
```

#### How results change with both engines

When `engines` includes `"htmlcs"`, Pa11y runs in parallel with axe-core and shares Playwright's
Chromium binary (no extra download). Crossover findings are deduped server-side with a deliberate
bias toward false negatives over false positives — ambiguous matches are kept as separate entries
rather than collapsed. The dedup uses a confidence ladder, all gated on **same WCAG SC**:

1. **Full selector match** (after normalizing `html > body >` prefixes and whitespace) + loose HTML
   compare (200-char prefix, whitespace-collapsed, lowercased).
2. **Strict suffix match** — one selector is the tail of the other, with `>` immediately before the
   boundary (e.g. axe `section:nth-child(3) > p` matches HTMLCS
   `#root > main > section:nth-child(3) > p`) + loose HTML compare.
3. **Attribute-stripped suffix match** (axe `button[type="button"]` vs HTMLCS `button`) + **strict**
   (full-string) HTML equality. Distinct elements like `input[type="checkbox"]` and
   `input[type="radio"]` collapse to the same stripped selector, so HTML must match exactly.
4. **Last-3-segment fingerprint match** + **positional discriminator** (`:nth-`, `#id`, `.class`, or
   `[…]` somewhere in the fingerprint) + loose HTML compare. The discriminator gate prevents false
   merges in repeating layouts (`ul > li > a` lists, grids).

Survivors:

- **Crossover-confirmed**: kept as the axe entry, tagged with `alsoFlaggedBy: ["htmlcs"]`.
- **HTMLCS-only**: kept with `source: "htmlcs"`, plus `helpUrl` (WCAG _Understanding_ doc) and a
  one-sentence `developerNote` to give agents enough context to act on the cryptic HTMLCS codes.

> **Same-element overlaps under different WCAG criteria are kept separate.** axe and HTMLCS often
> map the same element to different success criteria (e.g. a `<select>` with no label may surface as
> SC 3.3.2 _and_ SC 4.1.2 _and_ SC 1.3.1). Each is a real audit finding and dedup never collapses
> across SCs — that would lose traceability for compliance reporting. The `scan-accessibility` and
> `fix-accessibility` skills include guidance to **group plan items by DOM element** so the agent
> applies one HTML edit per element, then marks all related fix IDs resolved at once. Without this
> grouping, an agent may edit the same element repeatedly and risk one fix undoing another.

HTMLCS often emits advisory "Check that…" warnings intended for human auditors. They aren't useful
for an AI agent and inflate token cost. Suppress them via `htmlcsIgnore`. Common candidates:

```json
{
  "engines": ["axe", "htmlcs"],
  "htmlcsIgnore": [
    "WCAG2AA.Principle1.Guideline1_3.1_3_1.H49.AlignAttr",
    "WCAG2AA.Principle2.Guideline2_4.2_4_1.H64.1",
    "WCAG2AA.Principle1.Guideline1_3.1_3_1.H42.2"
  ]
}
```

Find more codes to suppress in your scan output — any HTMLCS `id` whose `help` text starts with
“Check that…” is a likely candidate.

Set **`NAVABLE_PROJECT_ROOT`** in the MCP server environment (see Cursor example above) so
`.navable-plan.json` resolves to your app’s repo root when the server’s cwd is not the project.

## Recommended: Agent Skills

For a deterministic, repeatable workflow, pair this MCP server with
[**@navable/skills**](https://github.com/web-DnA/navable-web-accessibility-skills) — pre-built agent
skills that guide your AI agent through scanning, fixing, reviewing, and auditing accessibility
issues step by step.

The skills ensure your agent follows a consistent process (scan → plan → fix → verify) instead of
improvising. Copy them into your project's skills folder:

```bash
# VS Code (Copilot)
cp -r skills/* .github/skills/

# Cursor
cp -r skills/* .agents/skills/

# Claude Code
cp -r skills/* .claude/skills/
```

See the [skills repository](https://github.com/web-DnA/navable-web-accessibility-skills) for
details.

## Requirements

- **Node.js** >= 20
- **Playwright Chromium** — downloaded automatically on first scan. If auto-install fails, run
  `npx playwright install chromium` manually.

## Contributing / development

We love getting feedback and contributions. Found a bug? Have an idea for a new fix pattern or ARIA
guide? Open an issue or send a PR — we'll review it quickly.

```bash
git clone https://github.com/web-DnA/navable-web-accessibility-mcp.git
cd navable-web-accessibility-mcp
npm install
npx playwright install chromium
npm run dev   # watch mode
```

## License

MIT — [navable.io](https://navable.io/)
