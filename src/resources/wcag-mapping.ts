/**
 * WCAG 2.1 / 2.2 compliance mapping resource.
 *
 * Split into two resources:
 *   navable://docs/wcag-mapping — compact mapping table + summary stats + WCAG 2.2 recs (~4 KB)
 *   navable://docs/bfsg-legal   — full legal context, scope, glossary, enforcement (~13 KB)
 */

import { getWcag21AA, getWcag22Recommended } from '../data/wcag-criteria.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortBySc<T extends { sc: string }>(arr: T[]): T[] {
  return arr.sort((a, b) => {
    const partsA = a.sc.split('.').map(Number);
    const partsB = b.sc.split('.').map(Number);
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Mapping table (shared by both compact and full)
// ---------------------------------------------------------------------------

function buildMappingTable(): string {
  const criteria = sortBySc(getWcag21AA());

  const lines: string[] = [];

  lines.push('| WCAG SC | Name | Level | EN 301 549 | Principle | Testability | axe-core Rules |');
  lines.push('|---|---|---|---|---|---|---|');

  const PRINCIPLE_NAMES: Record<string, string> = {
    perceivable: 'Perceivable',
    operable: 'Operable',
    understandable: 'Understandable',
    robust: 'Robust',
  };

  for (const c of criteria) {
    const axeRules = c.axeRules.length > 0 ? c.axeRules.map(r => `\`${r}\``).join(', ') : '\u2014';
    const testability =
      c.testability === 'automated'
        ? '\u2705 Automated'
        : c.testability === 'semi-automated'
          ? '\uD83D\uDD36 Semi-automated'
          : '\uD83D\uDD27 Manual';

    const name = c.removed ? `${c.name} \u26A0\uFE0F` : c.name;
    const principle = PRINCIPLE_NAMES[c.principle] ?? c.principle;

    lines.push(
      `| ${c.sc} | ${name} | ${c.level} | ${c.en301549} | ${principle} | ${testability} | ${axeRules} |`,
    );
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Summary statistics
// ---------------------------------------------------------------------------

function buildSummary(): string {
  const all = getWcag21AA();
  const levelA = all.filter(c => c.level === 'A');
  const levelAA = all.filter(c => c.level === 'AA');
  const automated = all.filter(c => c.testability === 'automated');
  const semiAutomated = all.filter(c => c.testability === 'semi-automated');
  const manual = all.filter(c => c.testability === 'manual');
  const hasAxeRules = all.filter(c => c.axeRules.length > 0);

  const byPrincipleLabels: [string, string][] = [
    ['perceivable', 'Perceivable'],
    ['operable', 'Operable'],
    ['understandable', 'Understandable'],
    ['robust', 'Robust'],
  ];

  const principleRows = byPrincipleLabels.map(([key, label]) => {
    const count = all.filter(c => c.principle === key).length;
    return `| ${label} | ${count} |`;
  });

  return `
---

## Summary Statistics

| Metric | Count |
|---|---|
| **Total WCAG 2.1 A+AA criteria** | **${all.length}** |
| Level A | ${levelA.length} |
| Level AA | ${levelAA.length} |
| Fully automated testing | ${automated.length} |
| Semi-automated | ${semiAutomated.length} |
| Manual testing required | ${manual.length} |
| axe-core detectable | ${hasAxeRules.length} |

### By WCAG Principle

| Principle | Criteria |
|---|---|
${principleRows.join('\n')}
`;
}

// ---------------------------------------------------------------------------
// WCAG 2.2 forward-looking section
// ---------------------------------------------------------------------------

function buildWcag22Section(): string {
  const recommended = sortBySc(getWcag22Recommended());
  if (recommended.length === 0) return '';

  const rows = recommended
    .map(c => `| ${c.sc} | ${c.name} | ${c.level} | Recommended |`)
    .join('\n');

  return `
---

## WCAG 2.2 \u2014 Forward-Looking Recommendations

New criteria introduced in WCAG 2.2. Not yet referenced by EN 301 549 v3.2.1.
Recommended for adoption ahead of future standard updates.

| WCAG SC | Name | Level | Status |
|---|---|---|---|
${rows}
`;
}

// ---------------------------------------------------------------------------
// Legal context sections
// ---------------------------------------------------------------------------

function buildLegalContext(): string {
  return `# BFSG Legal Context \u2014 Scope, Enforcement & Glossary

> **Barrierefreiheitsst\u00E4rkungsgesetz (BFSG)** \u2014 German Act on Strengthening
> Accessibility of Products and Services.
>
> In force since **28 June 2025**. For the WCAG mapping table, load:
> \`navable://docs/wcag-mapping\`

---

## Legal Chain

| Layer | Document | Scope |
|---|---|---|
| **Law** | BFSG (BGBl. I 2021 S. 2970) | Obligations, scope, deadlines, penalties |
| **Regulation** | BFSGV | Technical requirements; references EN 301 549 |
| **Harmonised Standard** | EN 301 549 v3.2.1 (2021) | Chapter 9 (Web) maps to WCAG 2.1 Level AA |
| **Web Standard** | WCAG 2.1 Level AA | 50 success criteria (30 A + 20 AA) |
| **Public Sector Overlay** | BITV 2.0 (2019) | Adds Easy Language and DGS for federal bodies |

### Key Relationships

- **BFSG \u2192 EN 301 549**: The BFSGV deems products/services conformant when they
  meet the harmonised standards. For web content: **EN 301 549 Chapter 9**.
- **EN 301 549 \u2192 WCAG**: Chapter 9 reproduces WCAG 2.1 Level AA verbatim,
  clause \`9.X.X.X\` = \`9.\` + WCAG SC number.
- **BITV 2.0**: Public sector overlay adding Easy Language and DGS.

---

## Scope: Who Must Comply?

### Products (Hardware)
- Computers and operating systems
- Self-service terminals (ATMs, ticket machines, check-in kiosks)
- Consumer terminal equipment for telephony and audiovisual media
- E-book readers

### Services (Digital)
- **E-commerce** \u2014 online shops, marketplaces, booking platforms
- Banking and financial services
- Electronic communication services (VoIP, messaging, email)
- Audiovisual media services
- Transport services (websites, apps, ticketing)
- E-books and dedicated software

### Exemptions
- **Micro-enterprises** (< 10 employees AND \u2264 \u20AC2M turnover) for services only
- **Transition (\u00A7 38 BFSG)**: Pre-existing products may continue until 27 June 2030;
  self-service terminals up to 15 years
- **Disproportionate burden** (\u00A7 17 BFSG): Documented assessment required,
  reviewed every 5 years for services

---

## German Terminology (Glossar)

| German Term | English | Context |
|---|---|---|
| Barrierefreiheitsst\u00E4rkungsgesetz (BFSG) | Accessibility Strengthening Act | The federal law |
| Barrierefreiheitsst\u00E4rkungsverordnung (BFSGV) | BFSG Regulation | Technical requirements |
| BITV 2.0 | Accessible IT Regulation | Public sector overlay |
| Konformit\u00E4tserkl\u00E4rung | Declaration of Conformity | Required self-declaration |
| Markt\u00FCberwachung | Market Surveillance | Enforcement authority |
| Unverh\u00E4ltnism\u00E4\u00DFige Belastung | Disproportionate Burden | Defence mechanism |
| Leichte Sprache | Easy Language | BITV 2.0 \u00A7 4 |
| Deutsche Geb\u00E4rdensprache (DGS) | German Sign Language | BITV 2.0 \u00A7 4 |
| Wahrnehmbarkeit / Bedienbarkeit / Verst\u00E4ndlichkeit / Robustheit | Perceivable / Operable / Understandable / Robust | WCAG Principles |

---

## Enforcement & Penalties

- **Authority**: Landesmarkt\u00FCberwachungsbeh\u00F6rden (state authorities).
  Bundesnetzagentur serves as central liaison (\u00A7 27 BFSG).
- **Fines (\u00A7 37 BFSG)**:
  - Up to **\u20AC100 000** for major violations
  - Up to **\u20AC10 000** for other infractions
- **Consumer rights**: Direct reporting of non-compliance
- **Disproportionate burden**: Documented assessment required; void if receiving
  accessibility funding

---

## BITV 2.0 Additional Requirements

For **German federal public sector** bodies:
1. Websites and apps must conform to EN 301 549
2. Key content must be available in **Leichte Sprache** (Easy Language)
3. Key content must be available as **DGS** (German Sign Language) video

---

## Key Dates

| Date | Event |
|---|---|
| July 2021 | BFSG published |
| June 2022 | BFSGV published |
| **28 June 2025** | **BFSG enforcement begins** |
| 27 June 2030 | Transition period ends |
| Up to 15 years | Self-service terminal max lifetime |

---

## References

- [BFSG Full Text (German)](https://www.gesetze-im-internet.de/bfsg/)
- [BFSGV Full Text (German)](https://www.gesetze-im-internet.de/bfsgv/)
- [BITV 2.0 Full Text (German)](https://www.gesetze-im-internet.de/bitv_2_0/)
- [EN 301 549 v3.2.1 (ETSI)](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf)
- [WCAG 2.1 (W3C)](https://www.w3.org/TR/WCAG21/)
- [WCAG 2.2 (W3C)](https://www.w3.org/TR/WCAG22/)
- [EAA Directive 2019/882](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L0882)
`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compact WCAG mapping: mapping table + summary stats + WCAG 2.2 recs.
 * Used by scan-fix workflows.
 */
export function generateWcagMapping(): string {
  const header =
    '# WCAG 2.1 Level A + AA Compliance Mapping\n\n' +
    '> All WCAG 2.1 Level A + AA success criteria with EN 301 549 clause references,\n' +
    '> testability classification, and axe-core rule mapping.\n>\n' +
    '> For BFSG/German legal context: `navable://docs/bfsg-legal`\n\n---\n\n';

  return header + buildMappingTable() + buildSummary() + buildWcag22Section();
}

/**
 * Full BFSG legal context: legal chain, scope, glossary, enforcement, dates, references.
 * Optional resource for German compliance audits.
 */
export function generateBfsgLegal(): string {
  return buildLegalContext();
}
