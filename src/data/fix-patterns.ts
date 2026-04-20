/**
 * Fix patterns data — maps axe-core rule IDs to before/after code fixes.
 *
 * Each pattern provides the rule metadata, a bad example, a good example,
 * and framework-specific notes. This is the join key between scan results
 * and remediation guidance.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FixPattern {
  /** axe-core rule ID — this is the join key to scan results */
  id: string;
  /** Human-readable rule name */
  name: string;
  /** Impact level when this rule fails */
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  /** WCAG success criterion numbers (e.g. ["1.1.1"]) */
  wcagSc: string[];
  /** EN 301 549 clause references */
  en301549: string[];
  /** One sentence: what axe detected */
  whatIsWrong: string;
  /** One sentence: why this matters for users */
  whyItMatters: string;
  /** Bad code example (HTML string) */
  badExample: string;
  /** Good code example (HTML string) */
  goodExample: string;
  /** Framework-specific notes */
  frameworkNotes: {
    react?: string;
    vue?: string;
  };
  /** Link to axe rule documentation */
  helpUrl: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const FIX_PATTERNS: FixPattern[] = [
  {
    id: 'image-alt',
    name: 'Image alt text',
    impact: 'critical',
    wcagSc: ['1.1.1'],
    en301549: ['9.1.1.1'],
    whatIsWrong: 'Image element is missing an `alt` attribute.',
    whyItMatters: 'Screen readers cannot describe the image to blind users without alt text.',
    badExample: '<img src="product.jpg">',
    goodExample: '<img src="product.jpg" alt="Red running shoe, side view">',
    frameworkNotes: {
      react: 'Use the alt prop on <img> or next/image <Image>. For decorative images, use alt="".',
      vue: 'Use :alt for dynamic values. For decorative images, use alt="" and role="presentation".',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/image-alt',
  },
  {
    id: 'label',
    name: 'Form element labels',
    impact: 'critical',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: 'Form element does not have an associated label.',
    whyItMatters: 'Screen readers cannot announce the purpose of the input, making forms unusable.',
    badExample: '<input type="text" id="email" placeholder="Email">',
    goodExample:
      '<label for="email">Email address</label>\n<input type="text" id="email" placeholder="you@example.com">',
    frameworkNotes: {
      react: 'Use htmlFor instead of for. Or wrap the input inside <label>.',
      vue: 'Use for attribute as in plain HTML, or wrap the input inside <label>.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/label',
  },
  {
    id: 'color-contrast',
    name: 'Color contrast',
    impact: 'serious',
    wcagSc: ['1.4.3'],
    en301549: ['9.1.4.3'],
    whatIsWrong: 'Element has insufficient color contrast ratio between text and background.',
    whyItMatters:
      'Low contrast makes text unreadable for users with low vision or color deficiency.',
    badExample: '<p style="color: #aaa; background: #fff;">Light gray on white</p>',
    goodExample: '<p style="color: #595959; background: #fff;">Sufficient contrast (7:1)</p>',
    frameworkNotes: {
      react:
        'Check contrast in CSS/Tailwind classes. Use the MCP check_color_contrast tool to verify ratios.',
      vue: 'Same as plain HTML. Ensure scoped styles meet 4.5:1 for normal text, 3:1 for large text.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/color-contrast',
  },
  {
    id: 'button-name',
    name: 'Button accessible name',
    impact: 'critical',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: 'Button does not have discernible text.',
    whyItMatters:
      'Screen readers announce "button" with no label, making it impossible to know its purpose.',
    badExample: '<button><svg class="icon-search"></svg></button>',
    goodExample: '<button aria-label="Search"><svg class="icon-search"></svg></button>',
    frameworkNotes: {
      react:
        'For icon-only buttons, add aria-label. Or include visually hidden text with a sr-only class.',
      vue: 'Same approach. Use aria-label or <span class="sr-only">Search</span> inside the button.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/button-name',
  },
  {
    id: 'link-name',
    name: 'Link accessible name',
    impact: 'serious',
    wcagSc: ['4.1.2', '2.4.4'],
    en301549: ['9.4.1.2', '9.2.4.4'],
    whatIsWrong: 'Link does not have discernible text.',
    whyItMatters:
      'Screen readers announce "link" with no context, leaving users unable to determine destination.',
    badExample: '<a href="/profile"><img src="avatar.png"></a>',
    goodExample: '<a href="/profile"><img src="avatar.png" alt="User profile"></a>',
    frameworkNotes: {
      react:
        'For Next.js <Link>, ensure visible text or aria-label. Icon-only links need aria-label.',
      vue: 'For Nuxt <NuxtLink>, same rules. Always provide text content or aria-label.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/link-name',
  },
  {
    id: 'html-has-lang',
    name: 'HTML lang attribute',
    impact: 'serious',
    wcagSc: ['3.1.1'],
    en301549: ['9.3.1.1'],
    whatIsWrong: 'The `<html>` element does not have a `lang` attribute.',
    whyItMatters:
      'Screen readers use the lang attribute to select the correct pronunciation engine.',
    badExample: '<html></html>',
    goodExample: '<html lang="de"></html>',
    frameworkNotes: {
      react: 'In Next.js, set lang in next.config.js i18n or in the root layout <html lang="de">.',
      vue: "In Nuxt, set it in nuxt.config.ts: app.head.htmlAttrs.lang = 'de'.",
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/html-has-lang',
  },
  {
    id: 'document-title',
    name: 'Document title',
    impact: 'serious',
    wcagSc: ['2.4.2'],
    en301549: ['9.2.4.2'],
    whatIsWrong: 'Document does not have a `<title>` element.',
    whyItMatters:
      'The title is the first thing screen readers announce and appears in browser tabs and bookmarks.',
    badExample: '<head>\n  <meta charset="utf-8">\n</head>',
    goodExample: '<head>\n  <meta charset="utf-8">\n  <title>Checkout — My Shop</title>\n</head>',
    frameworkNotes: {
      react:
        'In Next.js App Router, export metadata from layout.tsx or page.tsx. In Pages Router, use next/head.',
      vue: "In Nuxt, use useHead({ title: 'Checkout — My Shop' }) or set in nuxt.config.ts.",
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/document-title',
  },
  {
    id: 'heading-order',
    name: 'Heading order',
    impact: 'moderate',
    wcagSc: ['1.3.1'],
    en301549: ['9.1.3.1'],
    whatIsWrong: 'Heading levels are skipped (e.g. `<h1>` followed by `<h3>`).',
    whyItMatters:
      'Screen reader users navigate by heading level. Skipped levels suggest missing content.',
    badExample: '<h1>My Shop</h1>\n<h3>Featured Products</h3>',
    goodExample: '<h1>My Shop</h1>\n<h2>Featured Products</h2>',
    frameworkNotes: {
      react:
        'Heading levels must be sequential across your component tree. Consider a HeadingLevel context.',
      vue: 'Same rule. Components that render headings should accept a level prop to stay sequential.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/heading-order',
  },
  {
    id: 'region',
    name: 'Page content in landmarks',
    impact: 'moderate',
    wcagSc: ['1.3.1'],
    en301549: ['9.1.3.1'],
    whatIsWrong: 'Some page content is not contained within a landmark region.',
    whyItMatters:
      'Screen reader users rely on landmarks (main, nav, banner, contentinfo) to navigate the page structure.',
    badExample:
      '<body>\n  <div class="header">...</div>\n  <div class="content">...</div>\n</body>',
    goodExample:
      '<body>\n  <header>...</header>\n  <main>...</main>\n  <footer>...</footer>\n</body>',
    frameworkNotes: {
      react:
        'Wrap layout in semantic elements. In Next.js, the root layout.tsx is a good place for <main>.',
      vue: 'Use <header>, <main>, <footer> in your App.vue or default layout.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/region',
  },
  {
    id: 'landmark-one-main',
    name: 'Page has main landmark',
    impact: 'moderate',
    wcagSc: ['1.3.1'],
    en301549: ['9.1.3.1'],
    whatIsWrong: 'Document does not have a `<main>` element or `role="main"`.',
    whyItMatters:
      'A `<main>` landmark lets screen reader users jump directly to the primary content.',
    badExample: '<body>\n  <div id="app">...</div>\n</body>',
    goodExample: '<body>\n  <main id="app">...</main>\n</body>',
    frameworkNotes: {
      react: 'In Next.js App Router, add <main> inside the root layout.tsx wrapping {children}.',
      vue: 'In Nuxt, wrap <NuxtPage /> in <main> inside your default layout.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/landmark-one-main',
  },
  {
    id: 'aria-required-attr',
    name: 'ARIA required attributes',
    impact: 'critical',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: 'Element with an ARIA role is missing a required attribute.',
    whyItMatters:
      'Missing required ARIA attributes make the widget state invisible to assistive technology.',
    badExample: '<div role="checkbox">Accept terms</div>',
    goodExample: '<div role="checkbox" aria-checked="false" tabindex="0">Accept terms</div>',
    frameworkNotes: {
      react:
        'Prefer native <input type="checkbox"> over role="checkbox". If ARIA is needed, include aria-checked.',
      vue: 'Same rule. Always prefer native elements. If ARIA, bind :aria-checked to your reactive state.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/aria-required-attr',
  },
  {
    id: 'aria-valid-attr-value',
    name: 'ARIA attribute value valid',
    impact: 'critical',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: 'ARIA attribute has an invalid value.',
    whyItMatters:
      'Invalid ARIA values cause assistive technology to misinterpret or ignore widget state.',
    badExample: '<div role="tab" aria-selected="yes">Settings</div>',
    goodExample: '<div role="tab" aria-selected="true" tabindex="0">Settings</div>',
    frameworkNotes: {
      react:
        'ARIA boolean attributes must be "true" or "false" strings, not JS booleans in JSX. Use aria-selected="true".',
      vue: 'Bind with :aria-selected="String(isSelected)" to ensure "true"/"false" string output.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/aria-valid-attr-value',
  },
  {
    id: 'aria-allowed-attr',
    name: 'ARIA allowed attributes',
    impact: 'critical',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: "ARIA attribute is not allowed on this element's role.",
    whyItMatters:
      'Unsupported ARIA attributes are ignored or cause unpredictable behavior in assistive technology.',
    badExample: '<nav aria-checked="true">Main navigation</nav>',
    goodExample: '<nav aria-label="Main navigation">...</nav>',
    frameworkNotes: {
      react:
        'Check the WAI-ARIA spec for allowed attributes per role. Use navable://docs/aria-patterns for reference.',
      vue: "Same rules. The ARIA attributes you can use depend on the element's role.",
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/aria-allowed-attr',
  },
  {
    id: 'aria-hidden-focus',
    name: 'ARIA hidden focusable',
    impact: 'serious',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: 'A focusable element is inside an `aria-hidden="true"` container.',
    whyItMatters: 'Users can Tab into invisible elements, creating a confusing keyboard trap.',
    badExample: '<div aria-hidden="true">\n  <button>Submit</button>\n</div>',
    goodExample: '<div aria-hidden="true">\n  <button tabindex="-1">Submit</button>\n</div>',
    frameworkNotes: {
      react:
        'Better approach: remove the hidden content from the DOM entirely, or use inert attribute.',
      vue: 'Use v-if to remove hidden content instead of aria-hidden. If needed, add tabindex="-1" or inert.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/aria-hidden-focus',
  },
  {
    id: 'select-name',
    name: 'Select element name',
    impact: 'critical',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: 'Select element does not have an associated label.',
    whyItMatters: 'Screen readers cannot announce the purpose of the dropdown.',
    badExample: '<select id="country">\n  <option>Germany</option>\n</select>',
    goodExample:
      '<label for="country">Country</label>\n<select id="country">\n  <option>Germany</option>\n</select>',
    frameworkNotes: {
      react: 'Use htmlFor on <label>. Or wrap: <label>Country <select>...</select></label>.',
      vue: "Use the for attribute on <label> matching the select's id.",
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/select-name',
  },
  {
    id: 'frame-title',
    name: 'Frame title',
    impact: 'serious',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: '`<iframe>` does not have a `title` attribute.',
    whyItMatters:
      'Screen readers announce the title so users understand what content the iframe embeds.',
    badExample: '<iframe src="https://maps.example.com/embed"></iframe>',
    goodExample:
      '<iframe src="https://maps.example.com/embed" title="Store location map"></iframe>',
    frameworkNotes: {
      react: 'Always pass a title prop to iframe elements, including third-party embed components.',
      vue: 'Same rule. Bind :title for dynamic content.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/frame-title',
  },
  {
    id: 'meta-viewport',
    name: 'Viewport zoom',
    impact: 'critical',
    wcagSc: ['1.4.4'],
    en301549: ['9.1.4.4'],
    whatIsWrong:
      '`<meta name="viewport">` disables user scaling with `maximum-scale=1` or `user-scalable=no`.',
    whyItMatters:
      'Users with low vision need to zoom in. Disabling zoom creates an accessibility barrier.',
    badExample:
      '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">',
    goodExample: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    frameworkNotes: {
      react:
        'Check your root HTML template or layout.tsx. Remove maximum-scale and user-scalable=no.',
      vue: 'Check index.html or nuxt.config.ts app.head.meta. Remove zoom restrictions.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/meta-viewport',
  },
  {
    id: 'list',
    name: 'List structure',
    impact: 'serious',
    wcagSc: ['1.3.1'],
    en301549: ['9.1.3.1'],
    whatIsWrong:
      'List element contains direct children that are not `<li>`, `<script>`, or `<template>`.',
    whyItMatters:
      'Screen readers announce list item counts. Invalid children break this navigation.',
    badExample: '<ul>\n  <div>Item 1</div>\n  <div>Item 2</div>\n</ul>',
    goodExample: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>',
    frameworkNotes: {
      react:
        'Ensure components that render inside <ul>/<ol> output <li> as root element. Watch for Fragment wrappers.',
      vue: 'Same rule. Components used inside lists must render <li> as their root element.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/list',
  },
  {
    id: 'autocomplete-valid',
    name: 'Autocomplete attribute valid',
    impact: 'serious',
    wcagSc: ['1.3.5'],
    en301549: ['9.1.3.5'],
    whatIsWrong: "`autocomplete` attribute value is not valid for the input's type.",
    whyItMatters:
      'Correct autocomplete values enable browsers and password managers to fill forms accurately, helping users with cognitive or motor disabilities.',
    badExample: '<input type="text" autocomplete="nope">',
    goodExample: '<input type="email" autocomplete="email">',
    frameworkNotes: {
      react:
        'Use standard HTML autocomplete values: name, email, tel, street-address, postal-code, cc-number, etc.',
      vue: 'Same standard values. Bind with autocomplete="email" (static) or :autocomplete (dynamic).',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/autocomplete-valid',
  },
  {
    id: 'page-has-heading-one',
    name: 'Page has h1',
    impact: 'moderate',
    wcagSc: ['1.3.1'],
    en301549: ['9.1.3.1'],
    whatIsWrong: 'Page does not contain a level-one heading (`<h1>`).',
    whyItMatters:
      "An `<h1>` identifies the primary topic. Screen reader users use it to confirm they're on the right page.",
    badExample: '<body>\n  <h2>Welcome</h2>\n</body>',
    goodExample: '<body>\n  <h1>Welcome</h1>\n</body>',
    frameworkNotes: {
      react:
        'Ensure exactly one <h1> per page. In Next.js, typically in the page component, not the layout.',
      vue: 'Place one <h1> per page view. In Nuxt, typically in the page component.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/page-has-heading-one',
  },

  // -----------------------------------------------------------------------
  // Rules 21–55: Full axe-core coverage
  // -----------------------------------------------------------------------

  {
    id: 'accesskeys',
    name: 'Unique accesskey values',
    impact: 'serious',
    wcagSc: ['2.1.4'],
    en301549: ['9.2.1.4'],
    whatIsWrong: 'Multiple elements share the same `accesskey` value.',
    whyItMatters:
      'Duplicate access keys make keyboard shortcuts unpredictable — only one element will receive focus.',
    badExample: '<button accesskey="s">Save</button>\n<button accesskey="s">Submit</button>',
    goodExample: '<button accesskey="s">Save</button>\n<button accesskey="b">Submit</button>',
    frameworkNotes: {
      react: 'Avoid accesskey in most cases. If used, ensure values are unique across the page.',
      vue: 'Same rule. Track accesskey values globally if you must use them.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/accesskeys',
  },
  {
    id: 'area-alt',
    name: 'Image map area alt text',
    impact: 'critical',
    wcagSc: ['1.1.1'],
    en301549: ['9.1.1.1'],
    whatIsWrong: '`<area>` element in an image map is missing `alt` text.',
    whyItMatters:
      'Screen readers cannot describe clickable regions in an image map without alt text.',
    badExample: '<map name="nav">\n  <area shape="rect" coords="0,0,100,50" href="/home">\n</map>',
    goodExample:
      '<map name="nav">\n  <area shape="rect" coords="0,0,100,50" href="/home" alt="Home">\n</map>',
    frameworkNotes: {
      react: 'Image maps are rare in modern React. If used, ensure every <area> has an alt prop.',
      vue: 'Same rule. Consider replacing image maps with styled links or SVG-based navigation.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/area-alt',
  },
  {
    id: 'aria-allowed-role',
    name: 'ARIA role allowed on element',
    impact: 'minor',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: 'Element has an ARIA role that is not allowed for its HTML type.',
    whyItMatters:
      'An incompatible role overrides the native semantics, confusing assistive technology.',
    badExample: '<input type="text" role="button">',
    goodExample: '<input type="text">\n<!-- or use a real button: -->\n<button>Click me</button>',
    frameworkNotes: {
      react: 'Avoid overriding native semantics with role. Use the correct HTML element instead.',
      vue: 'Same rule. If you need button behavior, use <button>, not <input role="button">.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/aria-allowed-role',
  },
  {
    id: 'aria-required-children',
    name: 'ARIA required children',
    impact: 'critical',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: 'Element with an ARIA role is missing required child roles.',
    whyItMatters:
      'ARIA composite widgets require specific child roles to function. Missing children break the widget for assistive technology.',
    badExample: '<ul role="tablist">\n  <li>Tab 1</li>\n</ul>',
    goodExample: '<ul role="tablist">\n  <li role="tab">Tab 1</li>\n</ul>',
    frameworkNotes: {
      react:
        'Prefer native HTML patterns. If ARIA is needed, e.g. role="tablist" must contain role="tab" children.',
      vue: 'Same rule. Check navable://docs/aria-patterns for required parent/child role mappings.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/aria-required-children',
  },
  {
    id: 'aria-required-parent',
    name: 'ARIA required parent',
    impact: 'critical',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: 'Element with an ARIA role is not contained in a required parent role.',
    whyItMatters:
      'Child roles like role="tab" must be inside a parent with role="tablist". Without the parent, the widget structure is broken.',
    badExample: '<div role="tab">Settings</div>',
    goodExample: '<div role="tablist">\n  <div role="tab">Settings</div>\n</div>',
    frameworkNotes: {
      react:
        'Ensure ARIA child roles are always wrapped in their required parent. Check aria-patterns resource.',
      vue: 'Same rule. If building custom widgets, keep parent/child role pairs together.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/aria-required-parent',
  },
  {
    id: 'aria-roles',
    name: 'Valid ARIA roles',
    impact: 'critical',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: 'Element has an invalid or misspelled ARIA role.',
    whyItMatters:
      'An unrecognized role is ignored by assistive technology, removing all semantics from the element.',
    badExample: '<div role="buton">Click</div>',
    goodExample: '<div role="button" tabindex="0">Click</div>',
    frameworkNotes: {
      react:
        'TypeScript and ESLint jsx-a11y will catch misspelled roles. Prefer native elements over ARIA roles.',
      vue: 'Use eslint-plugin-vuejs-accessibility to catch invalid roles at lint time.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/aria-roles',
  },
  {
    id: 'aria-valid-attr',
    name: 'Valid ARIA attributes',
    impact: 'critical',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: 'Element has an invalid or misspelled ARIA attribute.',
    whyItMatters:
      'Misspelled ARIA attributes (e.g. `aria-lable` instead of `aria-label`) are silently ignored, leaving the element unlabeled.',
    badExample: '<button aria-lable="Close">X</button>',
    goodExample: '<button aria-label="Close">X</button>',
    frameworkNotes: {
      react:
        'TypeScript will catch this in JSX if types are correct. Double-check kebab-case ARIA attributes.',
      vue: 'Same rule. ARIA attributes must be exact. No IDE autocompletion helps in templates.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/aria-valid-attr',
  },
  {
    id: 'bypass',
    name: 'Skip navigation link',
    impact: 'serious',
    wcagSc: ['2.4.1'],
    en301549: ['9.2.4.1'],
    whatIsWrong: 'Page does not provide a mechanism to bypass repeated blocks of content.',
    whyItMatters:
      'Keyboard and screen reader users must Tab through navigation on every page load without a skip link.',
    badExample: '<body>\n  <nav><!-- 20 links --></nav>\n  <main>...</main>\n</body>',
    goodExample:
      '<body>\n  <a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>\n  <nav>...</nav>\n  <main id="main">...</main>\n</body>',
    frameworkNotes: {
      react:
        'Add a skip link as the first element in your root layout. Use sr-only + focus:not-sr-only (Tailwind) or equivalent.',
      vue: 'Add a skip link in App.vue or your default Nuxt layout, before <nav>.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/bypass',
  },
  {
    id: 'color-contrast-enhanced',
    name: 'Color contrast (enhanced)',
    impact: 'serious',
    wcagSc: ['1.4.6'],
    en301549: ['9.1.4.6'],
    whatIsWrong:
      'Element does not meet enhanced (AAA) contrast ratio of 7:1 for normal text or 4.5:1 for large text.',
    whyItMatters:
      'Enhanced contrast benefits users with moderate visual impairments who need higher ratios than the AA minimum.',
    badExample: '<p style="color: #767676; background: #fff;">4.5:1 ratio (AA only)</p>',
    goodExample: '<p style="color: #595959; background: #fff;">7:1 ratio (AAA)</p>',
    frameworkNotes: {
      react:
        'Same approach as color-contrast but targeting 7:1. Use the MCP check_color_contrast tool to verify.',
      vue: 'Same approach. AAA level is not required for conformance but recommended for body text.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/color-contrast-enhanced',
  },
  {
    id: 'css-orientation-lock',
    name: 'CSS orientation lock',
    impact: 'serious',
    wcagSc: ['1.3.4'],
    en301549: ['9.1.3.4'],
    whatIsWrong: 'Content is locked to a single display orientation via CSS.',
    whyItMatters:
      'Users with mounted devices or motor disabilities may only be able to use one orientation. Locking breaks access.',
    badExample: '@media (orientation: portrait) {\n  .app { display: none; }\n}',
    goodExample:
      '/* Allow both orientations — adapt layout, never hide */\n@media (orientation: portrait) {\n  .app { flex-direction: column; }\n}',
    frameworkNotes: {
      react: 'Never use display:none in orientation media queries. Adapt layout instead.',
      vue: 'Same rule. Check for transform: rotate(90deg) hacks that force orientation.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/css-orientation-lock',
  },
  {
    id: 'definition-list',
    name: 'Definition list structure',
    impact: 'serious',
    wcagSc: ['1.3.1'],
    en301549: ['9.1.3.1'],
    whatIsWrong:
      '`<dl>` element contains direct children that are not `<dt>`, `<dd>`, `<div>`, `<script>`, or `<template>`.',
    whyItMatters:
      'Screen readers rely on proper dl/dt/dd structure to announce term-definition pairs.',
    badExample: '<dl>\n  <span>Term</span>\n  <span>Definition</span>\n</dl>',
    goodExample: '<dl>\n  <dt>Term</dt>\n  <dd>Definition</dd>\n</dl>',
    frameworkNotes: {
      react:
        'Ensure components inside <dl> render <dt> or <dd> as root. Wrapping in <div> is also valid.',
      vue: 'Same rule. <dl> children must be <dt>, <dd>, or <div> wrapping dt/dd pairs.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/definition-list',
  },
  {
    id: 'dlitem',
    name: 'Definition list item parent',
    impact: 'serious',
    wcagSc: ['1.3.1'],
    en301549: ['9.1.3.1'],
    whatIsWrong: '`<dt>` or `<dd>` element is not contained in a `<dl>`.',
    whyItMatters:
      'Without a `<dl>` parent, the term-definition relationship is lost for assistive technology.',
    badExample: '<div>\n  <dt>Color</dt>\n  <dd>Red</dd>\n</div>',
    goodExample: '<dl>\n  <dt>Color</dt>\n  <dd>Red</dd>\n</dl>',
    frameworkNotes: {
      react:
        'Ensure <dt>/<dd> are always inside a <dl>. Watch for component boundaries breaking the nesting.',
      vue: 'Same rule. If extracting dt/dd into a component, make sure <dl> wraps them in the parent.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/dlitem',
  },
  {
    id: 'duplicate-id',
    name: 'Duplicate element IDs',
    impact: 'minor',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: 'Multiple elements share the same `id` attribute value.',
    whyItMatters:
      'Duplicate IDs break label associations, ARIA references, and fragment navigation — assistive technology may link to the wrong element.',
    badExample: '<label for="name">Name</label>\n<input id="name">\n<input id="name">',
    goodExample:
      '<label for="first-name">Name</label>\n<input id="first-name">\n<input id="last-name">',
    frameworkNotes: {
      react: 'Use React.useId() to generate unique IDs in reusable components.',
      vue: 'Use a composable or unique prefix per component instance to avoid duplicate IDs.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/duplicate-id',
  },
  {
    id: 'duplicate-id-aria',
    name: 'Duplicate ARIA-referenced IDs',
    impact: 'critical',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong: 'Multiple elements share an `id` that is referenced by ARIA attributes.',
    whyItMatters:
      'When aria-labelledby or aria-describedby references a duplicate ID, assistive technology may read the wrong element.',
    badExample:
      '<p id="desc">Help text</p>\n<p id="desc">Other text</p>\n<input aria-describedby="desc">',
    goodExample: '<p id="email-help">Help text</p>\n<input aria-describedby="email-help">',
    frameworkNotes: {
      react: 'Use React.useId() for any ID referenced by ARIA attributes.',
      vue: 'Same approach — generate unique IDs per component instance.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/duplicate-id-aria',
  },
  {
    id: 'empty-heading',
    name: 'Empty heading',
    impact: 'minor',
    wcagSc: ['2.4.6'],
    en301549: ['9.2.4.6'],
    whatIsWrong: 'Heading element has no text content or accessible name.',
    whyItMatters:
      'Screen readers announce "heading level N" with nothing else, wasting navigation effort and confusing users.',
    badExample: '<h2></h2>\n<h2><img src="icon.svg"></h2>',
    goodExample: '<h2>Products</h2>\n<h2><img src="icon.svg" alt="Products"> Products</h2>',
    frameworkNotes: {
      react:
        'Ensure heading elements always have text content. Conditional rendering can leave empty headings.',
      vue: 'Check for v-if conditions that may render an empty heading. Always provide fallback text.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/empty-heading',
  },
  {
    id: 'focus-order-semantics',
    name: 'Focus order matches semantics',
    impact: 'minor',
    wcagSc: ['2.4.3'],
    en301549: ['9.2.4.3'],
    whatIsWrong:
      'An element with a semantic role is not in the tab order, or a non-interactive element has a positive tabindex.',
    whyItMatters:
      'Unexpected tab order or missing focusability makes keyboard navigation unpredictable.',
    badExample: '<div role="button">Click me</div>',
    goodExample: '<div role="button" tabindex="0">Click me</div>\n<!-- Better: use <button> -->',
    frameworkNotes: {
      react:
        'Prefer native <button> over role="button". If custom, add tabindex={0} and keyboard handlers.',
      vue: 'Same rule. Use native elements. If custom, add tabindex="0" and @keydown handlers.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/focus-order-semantics',
  },
  {
    id: 'html-lang-valid',
    name: 'HTML lang value valid',
    impact: 'serious',
    wcagSc: ['3.1.1'],
    en301549: ['9.3.1.1'],
    whatIsWrong: 'The `lang` attribute on `<html>` is not a valid BCP 47 language tag.',
    whyItMatters:
      'An invalid lang value prevents screen readers from selecting the correct pronunciation engine.',
    badExample: '<html lang="deutsch"></html>',
    goodExample: '<html lang="de"></html>',
    frameworkNotes: {
      react: 'Use standard BCP 47 codes: de, en, fr, etc. Not full language names.',
      vue: 'Same rule. In Nuxt, validate the lang value in nuxt.config.ts.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/html-lang-valid',
  },
  {
    id: 'input-button-name',
    name: 'Input button accessible name',
    impact: 'critical',
    wcagSc: ['4.1.2'],
    en301549: ['9.4.1.2'],
    whatIsWrong:
      '`<input type="button">`, `<input type="submit">`, or `<input type="reset">` is missing a `value` attribute.',
    whyItMatters:
      'Without a value, the button has no accessible name and screen readers cannot announce its purpose.',
    badExample: '<input type="submit">',
    goodExample: '<input type="submit" value="Place order">',
    frameworkNotes: {
      react:
        'Always provide a value prop. Better yet, use <button type="submit">Place order</button>.',
      vue: 'Same rule. Prefer <button> over <input type="submit"> for easier labeling.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/input-button-name',
  },
  {
    id: 'input-image-alt',
    name: 'Input image alt text',
    impact: 'critical',
    wcagSc: ['1.1.1'],
    en301549: ['9.1.1.1'],
    whatIsWrong: '`<input type="image">` is missing an `alt` attribute.',
    whyItMatters:
      'Screen readers cannot describe the purpose of image submit buttons without alt text.',
    badExample: '<input type="image" src="search-icon.png">',
    goodExample: '<input type="image" src="search-icon.png" alt="Search">',
    frameworkNotes: {
      react:
        'Add alt prop. Consider replacing <input type="image"> with <button> + <img> for better control.',
      vue: 'Same rule. <input type="image"> is rarely used — prefer <button> with an icon inside.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/input-image-alt',
  },
  {
    id: 'keyboard',
    name: 'Keyboard accessible',
    impact: 'critical',
    wcagSc: ['2.1.1'],
    en301549: ['9.2.1.1'],
    whatIsWrong: 'Interactive element is not reachable or operable via keyboard alone.',
    whyItMatters:
      'Users who cannot use a mouse (motor disabilities, screen reader users) are completely blocked from interacting with the element.',
    badExample: '<div onclick="handleClick()">Click me</div>',
    goodExample:
      '<button onclick="handleClick()">Click me</button>\n<!-- or add tabindex + keydown: -->\n<div role="button" tabindex="0" onclick="handleClick()" onkeydown="handleKeydown(event)">Click me</div>',
    frameworkNotes: {
      react:
        'Use native <button> or <a> for all interactive elements. Custom elements need tabindex={0} + onKeyDown.',
      vue: 'Same rule. Use @click on <button>, not on <div>. If custom, add tabindex="0" and @keydown.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/keyboard',
  },
  {
    id: 'label-content-name-mismatch',
    name: 'Label matches visible text',
    impact: 'serious',
    wcagSc: ['2.5.3'],
    en301549: ['9.2.5.3'],
    whatIsWrong: 'The accessible name of the element does not match or contain its visible text.',
    whyItMatters:
      'Voice control users say what they see. If the accessible name differs from visible text, voice commands fail.',
    badExample: '<button aria-label="Submit form">Send</button>',
    goodExample:
      '<button aria-label="Send">Send</button>\n<!-- Or just remove aria-label if visible text is sufficient -->',
    frameworkNotes: {
      react:
        'Ensure aria-label includes the visible text. Best practice: omit aria-label when visible text is descriptive enough.',
      vue: 'Same rule. If the button text is clear, do not override it with a different aria-label.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/label-content-name-mismatch',
  },
  {
    id: 'link-in-text-block',
    name: 'Links distinguishable in text',
    impact: 'serious',
    wcagSc: ['1.4.1'],
    en301549: ['9.1.4.1'],
    whatIsWrong:
      'Link within a block of text is not distinguishable without relying solely on color.',
    whyItMatters:
      'Color-blind users cannot identify links that differ from surrounding text only by color.',
    badExample:
      '<p>Read our <a href="/terms" style="color: blue; text-decoration: none;">terms</a>.</p>',
    goodExample:
      '<p>Read our <a href="/terms" style="color: blue; text-decoration: underline;">terms</a>.</p>',
    frameworkNotes: {
      react:
        'Keep text-decoration: underline on links in text blocks. Or add a border-bottom as visual cue.',
      vue: 'Same rule. Ensure links in prose have underline or another non-color visual indicator.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/link-in-text-block',
  },
  {
    id: 'listitem',
    name: 'List item parent',
    impact: 'serious',
    wcagSc: ['1.3.1'],
    en301549: ['9.1.3.1'],
    whatIsWrong: '`<li>` element is not contained in a `<ul>` or `<ol>`.',
    whyItMatters:
      'Without a list parent, the list item semantics are lost and screen readers cannot announce list structure.',
    badExample: '<div>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</div>',
    goodExample: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>',
    frameworkNotes: {
      react: 'Ensure <li> elements are always inside <ul> or <ol>. Watch for component boundaries.',
      vue: 'Same rule. If a child component renders <li>, the parent must render <ul> or <ol>.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/listitem',
  },
  {
    id: 'no-autoplay-audio',
    name: 'No autoplay audio',
    impact: 'moderate',
    wcagSc: ['1.4.2'],
    en301549: ['9.1.4.2'],
    whatIsWrong:
      'Audio or video element autoplays with sound for more than 3 seconds without controls.',
    whyItMatters:
      'Autoplay audio interferes with screen readers and is disorienting for users with cognitive disabilities.',
    badExample: '<video autoplay src="promo.mp4"></video>',
    goodExample: '<video autoplay muted controls src="promo.mp4"></video>',
    frameworkNotes: {
      react:
        'Add muted to autoplay video. Always include controls. Or start muted and let user unmute.',
      vue: 'Same rule. Use :muted="true" and :controls="true" on autoplay media.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/no-autoplay-audio',
  },
  {
    id: 'object-alt',
    name: 'Object element alt text',
    impact: 'serious',
    wcagSc: ['1.1.1'],
    en301549: ['9.1.1.1'],
    whatIsWrong: '`<object>` element does not have accessible text.',
    whyItMatters:
      'Screen readers cannot describe embedded content (Flash, PDF, etc.) without a text alternative.',
    badExample: '<object data="chart.swf" type="application/x-shockwave-flash"></object>',
    goodExample:
      '<object data="chart.swf" type="application/x-shockwave-flash">\n  <p>Sales chart showing Q1-Q4 revenue growth</p>\n</object>',
    frameworkNotes: {
      react:
        'Provide fallback content inside <object>. Better: replace <object> with native HTML or <canvas> with aria-label.',
      vue: 'Same rule. Add descriptive text between <object> tags as fallback.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/object-alt',
  },
  {
    id: 'p-as-heading',
    name: 'Paragraphs styled as headings',
    impact: 'serious',
    wcagSc: ['1.3.1'],
    en301549: ['9.1.3.1'],
    whatIsWrong:
      'A `<p>` element is styled to look like a heading (large/bold) but uses no heading tag.',
    whyItMatters:
      'Screen reader users navigate by headings. Fake headings are invisible to heading navigation.',
    badExample: '<p style="font-size: 24px; font-weight: bold;">Our Services</p>',
    goodExample: '<h2>Our Services</h2>',
    frameworkNotes: {
      react: 'Use actual heading elements (h1-h6) for any text that visually looks like a heading.',
      vue: 'Same rule. Style headings with CSS — do not style paragraphs to look like headings.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/p-as-heading',
  },
  {
    id: 'role-img-alt',
    name: 'Role img alt text',
    impact: 'serious',
    wcagSc: ['1.1.1'],
    en301549: ['9.1.1.1'],
    whatIsWrong: 'Element with `role="img"` does not have an accessible name.',
    whyItMatters:
      'Elements marked as images need alt text. Without it, screen readers announce "image" with no description.',
    badExample: '<div role="img" style="background: url(hero.jpg);"></div>',
    goodExample:
      '<div role="img" aria-label="Mountain landscape at sunset" style="background: url(hero.jpg);"></div>',
    frameworkNotes: {
      react:
        'Add aria-label or aria-labelledby to any element with role="img". Prefer native <img> when possible.',
      vue: 'Same rule. Use :aria-label for dynamic values on role="img" elements.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/role-img-alt',
  },
  {
    id: 'svg-img-alt',
    name: 'SVG image alt text',
    impact: 'serious',
    wcagSc: ['1.1.1'],
    en301549: ['9.1.1.1'],
    whatIsWrong: '`<svg>` element with `role="img"` does not have an accessible name.',
    whyItMatters:
      'Screen readers announce SVGs with role="img" but cannot describe them without a title or aria-label.',
    badExample: '<svg role="img"><circle cx="50" cy="50" r="40"/></svg>',
    goodExample:
      '<svg role="img" aria-label="Status: complete">\n  <circle cx="50" cy="50" r="40"/>\n</svg>',
    frameworkNotes: {
      react: 'Add aria-label to SVG or include a <title> element as the first child of <svg>.',
      vue: 'Same rule. For decorative SVGs, use aria-hidden="true" instead of role="img".',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/svg-img-alt',
  },
  {
    id: 'tabindex',
    name: 'No positive tabindex',
    impact: 'serious',
    wcagSc: ['2.4.3'],
    en301549: ['9.2.4.3'],
    whatIsWrong: 'Element has a `tabindex` value greater than 0.',
    whyItMatters:
      'Positive tabindex creates an unpredictable tab order that diverges from the visual layout, confusing keyboard users.',
    badExample: '<input tabindex="5" type="text">\n<input tabindex="1" type="text">',
    goodExample: '<input tabindex="0" type="text">\n<input tabindex="0" type="text">',
    frameworkNotes: {
      react:
        'Only use tabindex={0} (add to tab order) or tabindex={-1} (programmatic focus only). Never positive values.',
      vue: 'Same rule. Only use tabindex="0" or tabindex="-1". Rely on DOM order for tab sequence.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/tabindex',
  },
  {
    id: 'table-fake-caption',
    name: 'Table uses caption correctly',
    impact: 'serious',
    wcagSc: ['1.3.1'],
    en301549: ['9.1.3.1'],
    whatIsWrong:
      'Table uses a non-caption element (e.g. a `<td colspan>` in the first row) as a fake caption.',
    whyItMatters:
      'Screen readers need `<caption>` to announce the table purpose. A fake caption is not associated programmatically.',
    badExample:
      '<table>\n  <tr><td colspan="3"><b>Quarterly Sales</b></td></tr>\n  <tr><th>Q1</th><th>Q2</th><th>Q3</th></tr>\n</table>',
    goodExample:
      '<table>\n  <caption>Quarterly Sales</caption>\n  <tr><th>Q1</th><th>Q2</th><th>Q3</th></tr>\n</table>',
    frameworkNotes: {
      react:
        'Use <caption> as the first child of <table>. Never simulate captions with colspan cells.',
      vue: 'Same rule. <caption> provides a programmatic label for the table.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/table-fake-caption',
  },
  {
    id: 'target-size',
    name: 'Touch target size',
    impact: 'serious',
    wcagSc: ['2.5.8'],
    en301549: ['9.2.5.8'],
    whatIsWrong: 'Interactive element has a touch target smaller than 24x24 CSS pixels.',
    whyItMatters:
      'Small targets are difficult to tap for users with motor disabilities or on mobile devices.',
    badExample: '<button style="width: 16px; height: 16px;">X</button>',
    goodExample: '<button style="min-width: 44px; min-height: 44px; padding: 8px;">X</button>',
    frameworkNotes: {
      react:
        'Set min-width/min-height of 44px on all interactive elements. Use padding to enlarge hit area.',
      vue: 'Same rule. Tailwind: min-w-11 min-h-11 (44px). Do not rely on icon size alone.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/target-size',
  },
  {
    id: 'td-has-header',
    name: 'Table data cells have headers',
    impact: 'critical',
    wcagSc: ['1.3.1'],
    en301549: ['9.1.3.1'],
    whatIsWrong: 'A non-empty `<td>` in a data table is not associated with a `<th>` header.',
    whyItMatters:
      'Screen readers announce the column/row header for each cell. Without association, data tables become unreadable.',
    badExample:
      '<table>\n  <tr><td>Name</td><td>Price</td></tr>\n  <tr><td>Widget</td><td>$10</td></tr>\n</table>',
    goodExample:
      '<table>\n  <tr><th>Name</th><th>Price</th></tr>\n  <tr><td>Widget</td><td>$10</td></tr>\n</table>',
    frameworkNotes: {
      react:
        'Use <th> for header cells. For complex tables, add scope="col" or scope="row" to <th>.',
      vue: 'Same rule. Use <thead>/<th> for header rows and scope attributes for complex tables.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/td-has-header',
  },
  {
    id: 'th-has-data-cells',
    name: 'Table headers have data cells',
    impact: 'serious',
    wcagSc: ['1.3.1'],
    en301549: ['9.1.3.1'],
    whatIsWrong: '`<th>` element does not have any associated data cells.',
    whyItMatters:
      'An orphaned header suggests a broken table structure. Screen readers may misreport the table layout.',
    badExample:
      '<table>\n  <tr><th>Name</th><th>Price</th><th>Discount</th></tr>\n  <tr><td>Widget</td><td>$10</td></tr>\n</table>',
    goodExample:
      '<table>\n  <tr><th>Name</th><th>Price</th></tr>\n  <tr><td>Widget</td><td>$10</td></tr>\n</table>',
    frameworkNotes: {
      react: 'Ensure every <th> has corresponding <td> cells in the same column or row.',
      vue: 'Same rule. Remove unused headers or add the missing data cells.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/th-has-data-cells',
  },
  {
    id: 'valid-lang',
    name: 'Valid lang on elements',
    impact: 'serious',
    wcagSc: ['3.1.2'],
    en301549: ['9.3.1.2'],
    whatIsWrong: 'An element has a `lang` attribute with an invalid BCP 47 value.',
    whyItMatters:
      'Screen readers switch pronunciation engines based on lang attributes. Invalid values cause garbled speech.',
    badExample: '<p lang="francais">Bonjour le monde</p>',
    goodExample: '<p lang="fr">Bonjour le monde</p>',
    frameworkNotes: {
      react: 'Use standard BCP 47 codes (de, en, fr, es) on elements with mixed-language content.',
      vue: 'Same rule. Use :lang for dynamic language switching.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/valid-lang',
  },
  {
    id: 'video-caption',
    name: 'Video has captions',
    impact: 'critical',
    wcagSc: ['1.2.2'],
    en301549: ['9.1.2.2'],
    whatIsWrong: '`<video>` element does not have captions via `<track kind="captions">`.',
    whyItMatters: 'Deaf and hard-of-hearing users cannot access spoken content without captions.',
    badExample: '<video src="tutorial.mp4" controls></video>',
    goodExample:
      '<video src="tutorial.mp4" controls>\n  <track kind="captions" src="tutorial.vtt" srclang="de" label="Deutsch">\n</video>',
    frameworkNotes: {
      react:
        'Add <track kind="captions"> to all video elements. Consider using a video player component that supports VTT.',
      vue: 'Same rule. Provide .vtt caption files and reference them with <track>.',
    },
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/video-caption',
  },
];

// ---------------------------------------------------------------------------
// Index for fast lookup
// ---------------------------------------------------------------------------

const byId = new Map<string, FixPattern>(FIX_PATTERNS.map(p => [p.id, p]));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get all fix patterns */
export function getAllFixPatterns(): FixPattern[] {
  return FIX_PATTERNS;
}

/** Look up fix pattern by axe rule ID (returns undefined if not covered) */
export function getFixPattern(ruleId: string): FixPattern | undefined {
  return byId.get(ruleId);
}
