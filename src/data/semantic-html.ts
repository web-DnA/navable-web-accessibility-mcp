/**
 * Semantic HTML Elements — Accessibility Reference
 *
 * Maps semantic HTML elements to their implicit ARIA roles, correct usage,
 * and common accessibility mistakes. Includes input types as separate entries
 * because their implicit roles differ.
 *
 * Verified against:
 *   - https://developer.mozilla.org/en-US/docs/Web/HTML/Element
 *   - https://www.w3.org/TR/html-aria/ (ARIA in HTML)
 *
 * Last verified: 2025-06-28
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SemanticHtmlElement {
  /** Tag name or descriptor, e.g. 'nav' or 'input-checkbox' */
  element: string;
  /** The ARIA role browsers assign by default (empty string if none) */
  implicitRole: string;
  /** What this element represents semantically */
  description: string;
  /** 1–2 sentences on when to use it correctly */
  correctUsage: string;
  /** Common accessibility anti-patterns */
  commonMistakes: string[];
  /** WCAG success criteria this element helps satisfy */
  relatedWcagCriteria: string[];
  /** Link to MDN docs */
  mdnUrl: string;
}

// ---------------------------------------------------------------------------
// MDN URL Helper
// ---------------------------------------------------------------------------

const MDN_BASE = 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element';

function mdnUrl(tag: string): string {
  return `${MDN_BASE}/${tag}`;
}

function mdnInputUrl(type: string): string {
  return `${MDN_BASE}/input/${type}`;
}

// ---------------------------------------------------------------------------
// Element Data
// ---------------------------------------------------------------------------

export const SEMANTIC_HTML_ELEMENTS: Record<string, SemanticHtmlElement> = {
  // =========================================================================
  // Landmarks & Sectioning
  // =========================================================================

  header: {
    element: 'header',
    implicitRole: 'banner',
    description:
      'Introductory content or navigational aids for its nearest sectioning ancestor. When a direct child of <body>, its implicit role is "banner".',
    correctUsage:
      'Use for page-level banners (logo, site title, global navigation) or section headers within <article>/<section>.',
    commonMistakes: [
      'Nesting multiple <header> elements as direct children of <body>.',
      'Using <div class="header"> instead of <header>.',
      'Assuming <header> always maps to role="banner" — it only does when not nested inside <article>, <aside>, <main>, <nav>, or <section>.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.1'],
    mdnUrl: mdnUrl('header'),
  },

  nav: {
    element: 'nav',
    implicitRole: 'navigation',
    description:
      'A section of the page that contains navigation links to other pages or parts within the page.',
    correctUsage:
      'Wrap major navigation blocks. Use aria-label to distinguish multiple <nav> elements (e.g., "Main navigation", "Footer navigation").',
    commonMistakes: [
      'Using <div role="navigation"> instead of <nav>.',
      'Wrapping every group of links in <nav> — reserve it for major navigation blocks.',
      'Not labelling multiple <nav> elements with aria-label or aria-labelledby.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.1', '2.4.5'],
    mdnUrl: mdnUrl('nav'),
  },

  main: {
    element: 'main',
    implicitRole: 'main',
    description:
      'The dominant content of the document body, directly related to or expanding on the central topic.',
    correctUsage:
      'Use exactly one per page to wrap the primary content. It must not be nested inside <article>, <aside>, <header>, <footer>, or <nav>.',
    commonMistakes: [
      'Having multiple <main> elements without the hidden attribute on inactive ones.',
      'Not using <main> at all, forcing screen reader users to navigate without a main landmark.',
      'Nesting <main> inside <article> or <section>.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.1'],
    mdnUrl: mdnUrl('main'),
  },

  footer: {
    element: 'footer',
    implicitRole: 'contentinfo',
    description:
      'Footer for its nearest sectioning ancestor or the root element. When a direct child of <body>, its implicit role is "contentinfo".',
    correctUsage:
      'Use for page-level footers containing copyright, contact info, related links. Can also be used within <article> or <section>.',
    commonMistakes: [
      'Using <div class="footer"> instead of <footer>.',
      'Assuming <footer> always maps to role="contentinfo" — only when not nested inside sectioning elements.',
      'Using multiple top-level <footer> elements on a page.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.1'],
    mdnUrl: mdnUrl('footer'),
  },

  aside: {
    element: 'aside',
    implicitRole: 'complementary',
    description:
      'Content tangentially related to the content around it, often presented as a sidebar.',
    correctUsage:
      'Use for sidebars, pull quotes, or related content that can be separated from the main content without losing meaning.',
    commonMistakes: [
      'Using <aside> for primary content that is essential to the main flow.',
      'Using <div class="sidebar"> instead of <aside>.',
      'Not providing an aria-label when multiple <aside> elements exist.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.1'],
    mdnUrl: mdnUrl('aside'),
  },

  section: {
    element: 'section',
    implicitRole: 'region',
    description:
      'A thematic grouping of content, typically with a heading. Its implicit "region" role only applies when the section has an accessible name.',
    correctUsage:
      'Use when a section of content forms a logical group with its own heading. Must have an accessible name (via aria-labelledby or aria-label) to be exposed as a landmark.',
    commonMistakes: [
      'Using <section> as a generic wrapper instead of <div>.',
      'Not providing a heading or accessible name for the section.',
      'Using <section> where <article> would be more appropriate.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.1', '2.4.6'],
    mdnUrl: mdnUrl('section'),
  },

  article: {
    element: 'article',
    implicitRole: 'article',
    description:
      'A self-contained composition intended for independent distribution or reuse, such as a blog post, news article, or comment.',
    correctUsage:
      'Use for content that makes sense on its own: blog posts, forum posts, news articles, comments.',
    commonMistakes: [
      'Using <article> for non-self-contained content.',
      'Using <div class="post"> instead of <article>.',
      'Not including a heading within the <article>.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('article'),
  },

  // =========================================================================
  // Headings
  // =========================================================================

  h1: {
    element: 'h1',
    implicitRole: 'heading',
    description: 'Top-level heading. Should appear once per page to identify the main topic.',
    correctUsage:
      'Use exactly one <h1> per page for the primary page title. aria-level="1" is implicit.',
    commonMistakes: [
      'Using multiple <h1> elements on a page.',
      'Using <h1> for styling purposes instead of semantic heading hierarchy.',
      'Skipping <h1> and starting with <h2>.',
      'Using <div class="title"> instead of an <h1>.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.1', '2.4.6'],
    mdnUrl: mdnUrl('Heading_Elements'),
  },

  h2: {
    element: 'h2',
    implicitRole: 'heading',
    description: 'Section heading, one level below <h1>.',
    correctUsage:
      'Use to introduce major sections of the page. Must follow <h1> without skipping levels.',
    commonMistakes: [
      'Skipping from <h1> to <h3>, creating a gap in the heading hierarchy.',
      'Using headings only for visual font sizes.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.1', '2.4.6'],
    mdnUrl: mdnUrl('Heading_Elements'),
  },

  h3: {
    element: 'h3',
    implicitRole: 'heading',
    description: 'Subsection heading, one level below <h2>.',
    correctUsage:
      'Use to introduce subsections within an <h2> section. Maintain sequential heading order.',
    commonMistakes: [
      'Using <h3> directly after <h1> without an <h2>.',
      'Using bold text instead of a proper heading element.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.1', '2.4.6'],
    mdnUrl: mdnUrl('Heading_Elements'),
  },

  h4: {
    element: 'h4',
    implicitRole: 'heading',
    description: 'Sub-subsection heading, one level below <h3>.',
    correctUsage: 'Use for deeper content subsections. Maintain heading hierarchy.',
    commonMistakes: ['Skipping heading levels (e.g., <h2> directly to <h4>).'],
    relatedWcagCriteria: ['1.3.1', '2.4.1', '2.4.6'],
    mdnUrl: mdnUrl('Heading_Elements'),
  },

  h5: {
    element: 'h5',
    implicitRole: 'heading',
    description: 'Heading at the fifth level in the document outline.',
    correctUsage: 'Use for deeply nested content sections. Maintain heading hierarchy.',
    commonMistakes: [
      'Using deep heading levels for visual styling rather than document structure.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.1', '2.4.6'],
    mdnUrl: mdnUrl('Heading_Elements'),
  },

  h6: {
    element: 'h6',
    implicitRole: 'heading',
    description: 'Heading at the sixth (deepest) level in the document outline.',
    correctUsage:
      'Use for the deepest content sections. If reaching <h6>, consider simplifying the page structure.',
    commonMistakes: [
      'Needing <h6> often indicates an overly complex page structure.',
      'Using for small print styling instead of structural heading purposes.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.1', '2.4.6'],
    mdnUrl: mdnUrl('Heading_Elements'),
  },

  // =========================================================================
  // Text Content
  // =========================================================================

  p: {
    element: 'p',
    implicitRole: '',
    description: 'A paragraph of text.',
    correctUsage: 'Use for blocks of text content. Screen readers announce paragraph boundaries.',
    commonMistakes: [
      'Using <br><br> instead of separate <p> elements.',
      'Using <p> as a generic wrapper (use <div> instead).',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('p'),
  },

  blockquote: {
    element: 'blockquote',
    implicitRole: 'blockquote',
    description: 'A section quoted from another source.',
    correctUsage:
      'Use for extended quotations from external sources. Use the cite attribute to reference the source URL.',
    commonMistakes: [
      'Using <blockquote> for visual indentation instead of quoting.',
      'Not attributing the source of the quote.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('blockquote'),
  },

  em: {
    element: 'em',
    implicitRole: '',
    description:
      'Stress emphasis — the element contents have emphatic stress compared to surrounding text.',
    correctUsage:
      'Use to indicate emphasis that changes the meaning of a sentence. Screen readers may alter prosody.',
    commonMistakes: [
      'Using <em> purely for italic styling (use CSS font-style instead).',
      'Confusing <em> with <i> — <em> conveys semantic emphasis, <i> is for alternate voice.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('em'),
  },

  strong: {
    element: 'strong',
    implicitRole: '',
    description:
      'Strong importance — the element contents have strong importance, seriousness, or urgency.',
    correctUsage:
      'Use to indicate important content. Some screen readers announce strong text differently.',
    commonMistakes: [
      'Using <strong> purely for bold styling (use CSS font-weight instead).',
      'Confusing <strong> with <b> — <strong> conveys semantic importance, <b> is stylistic.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('strong'),
  },

  code: {
    element: 'code',
    implicitRole: 'code',
    description: 'A fragment of computer code.',
    correctUsage: 'Use for inline code snippets. For code blocks, nest inside <pre>.',
    commonMistakes: [
      'Using <span class="code"> instead of <code>.',
      'Not pairing with <pre> for multi-line code blocks.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('code'),
  },

  pre: {
    element: 'pre',
    implicitRole: '',
    description: 'Preformatted text, displayed with whitespace preserved.',
    correctUsage:
      'Use for code blocks, ASCII art, or content where whitespace formatting is meaningful.',
    commonMistakes: [
      'Using <pre> for layout purposes.',
      'Not using <code> inside <pre> for code blocks.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('pre'),
  },

  mark: {
    element: 'mark',
    implicitRole: '',
    description: 'Highlighted text relevant in a particular context, such as search results.',
    correctUsage:
      'Use to highlight text for reference or notation purposes, such as marking search term matches.',
    commonMistakes: [
      'Not informing screen reader users about the highlighted context (mark has no implicit role).',
      'Using <mark> for general visual emphasis instead of <em> or <strong>.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('mark'),
  },

  time: {
    element: 'time',
    implicitRole: 'time',
    description: 'A specific period in time, with a machine-readable datetime attribute.',
    correctUsage:
      'Use for dates, times, and durations. Provide a machine-readable value in the datetime attribute.',
    commonMistakes: [
      'Not providing the datetime attribute.',
      'Using a non-standard format in the datetime attribute.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('time'),
  },

  hr: {
    element: 'hr',
    implicitRole: 'separator',
    description: 'A thematic break between paragraph-level elements.',
    correctUsage:
      'Use to represent a shift of topic within a section. Screen readers announce it as a separator.',
    commonMistakes: [
      'Using <hr> purely for visual decoration (use CSS border instead).',
      'Overusing <hr> where heading changes would better communicate structure.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('hr'),
  },

  // =========================================================================
  // Lists
  // =========================================================================

  ul: {
    element: 'ul',
    implicitRole: 'list',
    description: 'An unordered list of items.',
    correctUsage:
      'Use for groups of items where order does not matter. Screen readers announce list count.',
    commonMistakes: [
      'Removing list semantics with CSS list-style: none in some screen readers — use role="list" as a workaround.',
      'Using <div> elements instead of <ul>/<li> for lists.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('ul'),
  },

  ol: {
    element: 'ol',
    implicitRole: 'list',
    description: 'An ordered list of items.',
    correctUsage:
      'Use for items where sequential order matters (steps, rankings). Screen readers announce item number.',
    commonMistakes: [
      'Using <ul> when order matters.',
      'Manually numbering items with text instead of using <ol>.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('ol'),
  },

  li: {
    element: 'li',
    implicitRole: 'listitem',
    description: 'A list item within <ul>, <ol>, or <menu>.',
    correctUsage: 'Use as direct children of <ul>, <ol>, or <menu>.',
    commonMistakes: [
      'Using <li> outside of a list context.',
      'Wrapping <li> in <div> elements inside a list.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('li'),
  },

  dl: {
    element: 'dl',
    implicitRole: '',
    description: 'A description list — a collection of term–description pairs.',
    correctUsage: 'Use for glossaries, metadata, key–value pairs. Contains <dt> and <dd> pairs.',
    commonMistakes: [
      'Not pairing each <dt> with at least one <dd>.',
      'Using <dl> for layout purposes instead of semantic term–description pairs.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('dl'),
  },

  dt: {
    element: 'dt',
    implicitRole: '',
    description: 'A term in a description list.',
    correctUsage: 'Use inside <dl> to define the term being described.',
    commonMistakes: [
      'Using <dt> outside of <dl>.',
      'Not following <dt> with a corresponding <dd>.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('dt'),
  },

  dd: {
    element: 'dd',
    implicitRole: '',
    description: 'A description or definition of a term in a description list.',
    correctUsage: 'Use inside <dl>, following a <dt>, to provide the description.',
    commonMistakes: [
      'Using <dd> outside of <dl>.',
      'Using <dd> for indentation instead of semantic description.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('dd'),
  },

  // =========================================================================
  // Links & Interactive
  // =========================================================================

  a: {
    element: 'a',
    implicitRole: 'link',
    description: 'A hyperlink to another page, file, location, or resource.',
    correctUsage:
      'Use with an href attribute for navigation. The link text must be descriptive of the destination.',
    commonMistakes: [
      'Using <a> without an href attribute (removes implicit link role).',
      'Using non-descriptive text like "click here" or "read more".',
      'Using <a> for button-like actions (use <button> for actions).',
      'Using <div onclick> instead of <a href> for navigation.',
    ],
    relatedWcagCriteria: ['2.4.4', '2.4.9', '4.1.2'],
    mdnUrl: mdnUrl('a'),
  },

  button: {
    element: 'button',
    implicitRole: 'button',
    description: 'An interactive control triggered by user activation.',
    correctUsage:
      'Use for actions (submit, toggle, open dialog). Prefer <button> over <div role="button">.',
    commonMistakes: [
      'Using <div> or <span> with onclick instead of <button>.',
      'Using <a href="#"> for actions instead of <button>.',
      'Not specifying type="button" on non-submit buttons inside forms.',
      'Adding role="button" to an element that already is a <button>.',
    ],
    relatedWcagCriteria: ['2.1.1', '4.1.2'],
    mdnUrl: mdnUrl('button'),
  },

  details: {
    element: 'details',
    implicitRole: 'group',
    description: 'A disclosure widget that can be toggled to show or hide additional content.',
    correctUsage:
      'Use for expandable content sections. The first child must be a <summary> element.',
    commonMistakes: [
      'Not including a <summary> element as the first child.',
      'Building custom disclosure widgets instead of using native <details>/<summary>.',
      'Not testing keyboard accessibility — <details> should work with Enter and Space.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.1.1', '4.1.2'],
    mdnUrl: mdnUrl('details'),
  },

  summary: {
    element: 'summary',
    implicitRole: 'button',
    description: 'The disclosure button for a <details> element.',
    correctUsage: 'Use as the first child of <details> to provide the toggle label.',
    commonMistakes: [
      'Using <summary> outside of <details>.',
      'Placing interactive elements (links, buttons) inside <summary>.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.1.1', '4.1.2'],
    mdnUrl: mdnUrl('summary'),
  },

  dialog: {
    element: 'dialog',
    implicitRole: 'dialog',
    description: 'A dialog box or interactive component such as a modal or alert.',
    correctUsage:
      'Use with the showModal() method for modal dialogs. Provides built-in focus trapping when used as modal.',
    commonMistakes: [
      'Not using showModal() and building custom focus traps instead.',
      'Forgetting to add aria-labelledby for the dialog title.',
      'Not handling Escape key to close the dialog (native <dialog> handles this).',
    ],
    relatedWcagCriteria: ['2.1.1', '2.1.2', '2.4.3', '4.1.2'],
    mdnUrl: mdnUrl('dialog'),
  },

  // =========================================================================
  // Forms
  // =========================================================================

  form: {
    element: 'form',
    implicitRole: 'form',
    description: 'A document section containing interactive controls for submitting information.',
    correctUsage:
      'Use to wrap form controls. Provide an accessible name via aria-labelledby or aria-label for the form landmark to be exposed.',
    commonMistakes: [
      'Not providing an accessible name for the form (unnamed forms are not exposed as landmarks).',
      'Nesting forms inside other forms.',
      'Using <div> with JavaScript instead of a proper <form> with submit handling.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.1', '3.2.2'],
    mdnUrl: mdnUrl('form'),
  },

  label: {
    element: 'label',
    implicitRole: '',
    description:
      'A caption for a form control, programmatically associating the label text with the control.',
    correctUsage:
      "Use the for attribute to associate the label with its control's id. Alternatively wrap the control inside the label.",
    commonMistakes: [
      'Using placeholder text instead of a visible <label>.',
      'Not using the for attribute (or wrapping) to associate the label with the input.',
      'Hiding the label visually and not providing an alternative accessible name.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.6', '3.3.2'],
    mdnUrl: mdnUrl('label'),
  },

  fieldset: {
    element: 'fieldset',
    implicitRole: 'group',
    description: 'Groups related form controls with an optional <legend>.',
    correctUsage:
      'Use to group related controls (radio buttons, checkboxes, address fields). Always include a <legend>.',
    commonMistakes: [
      'Not including a <legend> inside the <fieldset>.',
      'Using <fieldset> for layout purposes instead of grouping related controls.',
      'Using <div role="group"> when <fieldset> would suffice.',
    ],
    relatedWcagCriteria: ['1.3.1', '3.3.2'],
    mdnUrl: mdnUrl('fieldset'),
  },

  legend: {
    element: 'legend',
    implicitRole: '',
    description: 'A caption for a <fieldset>.',
    correctUsage: 'Use as the first child of <fieldset> to provide a group label.',
    commonMistakes: [
      'Placing <legend> outside of <fieldset>.',
      'Using headings inside <legend> without considering screen reader announcement.',
      'Hiding the legend with display: none (use visually-hidden CSS instead if needed).',
    ],
    relatedWcagCriteria: ['1.3.1', '3.3.2'],
    mdnUrl: mdnUrl('legend'),
  },

  select: {
    element: 'select',
    implicitRole: 'combobox',
    description: 'A control that provides a menu of options.',
    correctUsage:
      'Use for choosing from predefined options. Associate with a <label>. Use multiple attribute for multi-select.',
    commonMistakes: [
      'Not associating with a <label>.',
      'Building a custom dropdown with <div> instead of using native <select>.',
      'Using <select> for navigation (use links instead).',
    ],
    relatedWcagCriteria: ['1.3.1', '2.1.1', '3.3.2', '4.1.2'],
    mdnUrl: mdnUrl('select'),
  },

  optgroup: {
    element: 'optgroup',
    implicitRole: 'group',
    description: 'A grouping of <option> elements within a <select>.',
    correctUsage: 'Use the label attribute to name the group in long option lists.',
    commonMistakes: [
      'Not providing a label attribute on <optgroup>.',
      'Nesting <optgroup> elements (not allowed).',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('optgroup'),
  },

  option: {
    element: 'option',
    implicitRole: 'option',
    description: 'An option in a <select>, <optgroup>, or <datalist>.',
    correctUsage: 'Use inside <select> or <datalist>. Provide meaningful text content.',
    commonMistakes: [
      'Using empty <option> elements without an accessible label.',
      'Using an <option> as a placeholder without disabling it.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('option'),
  },

  datalist: {
    element: 'datalist',
    implicitRole: 'listbox',
    description:
      'Contains a set of <option> elements representing permissible or recommended values for an input.',
    correctUsage: 'Connect to an <input> via the list attribute for autocomplete suggestions.',
    commonMistakes: [
      'Not connecting the datalist to an input with the list attribute.',
      'Expecting datalist to enforce values — it only provides suggestions.',
    ],
    relatedWcagCriteria: ['1.3.1', '4.1.2'],
    mdnUrl: mdnUrl('datalist'),
  },

  textarea: {
    element: 'textarea',
    implicitRole: 'textbox',
    description: 'A multi-line plain-text editing control.',
    correctUsage: 'Use for multi-line text input. Always associate with a <label>.',
    commonMistakes: [
      'Not associating with a <label>.',
      'Using placeholder as the only label.',
      'Using contenteditable <div> instead of <textarea> for plain text.',
    ],
    relatedWcagCriteria: ['1.3.1', '3.3.2', '4.1.2'],
    mdnUrl: mdnUrl('textarea'),
  },

  output: {
    element: 'output',
    implicitRole: 'status',
    description: 'The result of a calculation or user action.',
    correctUsage:
      'Use the for attribute to reference the controls that contribute to the output. Announced by screen readers via implicit aria-live="polite".',
    commonMistakes: [
      'Using <span> instead of <output> for calculation results.',
      'Not using the for attribute to associate inputs with the output.',
    ],
    relatedWcagCriteria: ['1.3.1', '4.1.3'],
    mdnUrl: mdnUrl('output'),
  },

  progress: {
    element: 'progress',
    implicitRole: 'progressbar',
    description: 'Displays the completion progress of a task.',
    correctUsage:
      'Use with value and max attributes for determinate progress. Omit value for indeterminate.',
    commonMistakes: [
      'Not providing an accessible label.',
      'Confusing <progress> with <meter> — progress is for task completion, meter is for scalar values.',
      'Using <div> with width percentage instead of <progress>.',
    ],
    relatedWcagCriteria: ['1.3.1', '4.1.2'],
    mdnUrl: mdnUrl('progress'),
  },

  meter: {
    element: 'meter',
    implicitRole: 'meter',
    description:
      'A scalar measurement within a known range, such as disk usage or password strength.',
    correctUsage: 'Use with min, max, value, and optionally low, high, optimum attributes.',
    commonMistakes: [
      'Using <meter> for task progress (use <progress> instead).',
      'Not providing an accessible label.',
      'Forgetting the min and max attributes.',
    ],
    relatedWcagCriteria: ['1.3.1', '4.1.2'],
    mdnUrl: mdnUrl('meter'),
  },

  // =========================================================================
  // Input Types
  // =========================================================================

  'input-text': {
    element: 'input[type="text"]',
    implicitRole: 'textbox',
    description: 'A single-line text input.',
    correctUsage: 'Use for short text input. Always associate with a <label>.',
    commonMistakes: [
      'Using placeholder as the only accessible label.',
      'Not associating with a <label> via the for/id pattern.',
      'Using <div contenteditable> instead of <input>.',
    ],
    relatedWcagCriteria: ['1.3.1', '3.3.2', '4.1.2'],
    mdnUrl: mdnInputUrl('text'),
  },

  'input-email': {
    element: 'input[type="email"]',
    implicitRole: 'textbox',
    description: 'An input for email addresses with built-in validation.',
    correctUsage:
      'Use for email input. Provides autocomplete suggestions and mobile keyboard optimisation.',
    commonMistakes: [
      'Using type="text" for email fields, losing built-in validation and mobile keyboard hints.',
      'Not associating with a <label>.',
    ],
    relatedWcagCriteria: ['1.3.1', '1.3.5', '3.3.2', '4.1.2'],
    mdnUrl: mdnInputUrl('email'),
  },

  'input-password': {
    element: 'input[type="password"]',
    implicitRole: '',
    description: 'An input that masks the entered characters for sensitive data.',
    correctUsage:
      'Use for passwords and other sensitive text. Associate with a <label> and provide a show/hide toggle.',
    commonMistakes: [
      'Not associating with a <label>.',
      'Not providing a "show password" toggle for accessibility.',
      'Using autocomplete="off" when autocomplete="current-password" or "new-password" is appropriate.',
    ],
    relatedWcagCriteria: ['1.3.1', '1.3.5', '3.3.2', '4.1.2'],
    mdnUrl: mdnInputUrl('password'),
  },

  'input-search': {
    element: 'input[type="search"]',
    implicitRole: 'searchbox',
    description: 'A text field designed for entering search queries.',
    correctUsage:
      'Use inside a <form> or <search> element for search functionality. Associate with a <label>.',
    commonMistakes: [
      'Using type="text" for search fields, missing semantic hints for assistive technologies.',
      'Not wrapping in a <search> landmark or role="search".',
    ],
    relatedWcagCriteria: ['1.3.1', '2.4.5', '3.3.2', '4.1.2'],
    mdnUrl: mdnInputUrl('search'),
  },

  'input-tel': {
    element: 'input[type="tel"]',
    implicitRole: 'textbox',
    description: 'An input for telephone numbers.',
    correctUsage: 'Use for phone number input. Provides optimised mobile keyboard.',
    commonMistakes: [
      'Not using autocomplete="tel" for auto-fill support.',
      'Not associating with a <label>.',
    ],
    relatedWcagCriteria: ['1.3.1', '1.3.5', '3.3.2', '4.1.2'],
    mdnUrl: mdnInputUrl('tel'),
  },

  'input-url': {
    element: 'input[type="url"]',
    implicitRole: 'textbox',
    description: 'An input for URLs with built-in validation.',
    correctUsage: 'Use for URL input. Provides URL-specific validation and mobile keyboard.',
    commonMistakes: ['Using type="text" for URL fields.', 'Not associating with a <label>.'],
    relatedWcagCriteria: ['1.3.1', '1.3.5', '3.3.2', '4.1.2'],
    mdnUrl: mdnInputUrl('url'),
  },

  'input-number': {
    element: 'input[type="number"]',
    implicitRole: 'spinbutton',
    description: 'An input for numeric values with a built-in spinner.',
    correctUsage: 'Use for numeric input with min, max, and step attributes.',
    commonMistakes: [
      'Using type="number" for non-mathematical numbers like phone, zip code, or credit card (use type="text" with inputmode="numeric").',
      'Not associating with a <label>.',
      'Not providing min/max/step attributes when appropriate.',
    ],
    relatedWcagCriteria: ['1.3.1', '3.3.2', '4.1.2'],
    mdnUrl: mdnInputUrl('number'),
  },

  'input-range': {
    element: 'input[type="range"]',
    implicitRole: 'slider',
    description: 'A slider control for selecting a numeric value within a range.',
    correctUsage:
      'Use for imprecise numeric input. Set min, max, and step. Always associate with a <label>.',
    commonMistakes: [
      'Not displaying the current value to the user.',
      'Not associating with a <label>.',
      'Building a custom slider instead of using native <input type="range">.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.1.1', '4.1.2'],
    mdnUrl: mdnInputUrl('range'),
  },

  'input-checkbox': {
    element: 'input[type="checkbox"]',
    implicitRole: 'checkbox',
    description: 'A checkable box that toggles between two states (checked/unchecked).',
    correctUsage:
      'Use for boolean choices. Associate with a <label>. Group related checkboxes with <fieldset>/<legend>.',
    commonMistakes: [
      'Not associating with a <label>.',
      'Using <div role="checkbox"> instead of native <input type="checkbox">.',
      'Not grouping related checkboxes with <fieldset>/<legend>.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.1.1', '3.3.2', '4.1.2'],
    mdnUrl: mdnInputUrl('checkbox'),
  },

  'input-radio': {
    element: 'input[type="radio"]',
    implicitRole: 'radio',
    description: 'A radio button — part of a group where only one can be selected.',
    correctUsage:
      'Group radios with the same name attribute inside <fieldset>/<legend>. Associate each with a <label>.',
    commonMistakes: [
      'Not grouping radios with the same name attribute.',
      'Not using <fieldset>/<legend> for the radio group.',
      'Using checkboxes when only one selection is allowed.',
    ],
    relatedWcagCriteria: ['1.3.1', '2.1.1', '3.3.2', '4.1.2'],
    mdnUrl: mdnInputUrl('radio'),
  },

  'input-date': {
    element: 'input[type="date"]',
    implicitRole: '',
    description: 'A date picker input for selecting a calendar date.',
    correctUsage:
      'Use for date input. Associate with a <label>. Provide a text fallback for older browsers.',
    commonMistakes: [
      'Not associating with a <label>.',
      'Not providing a fallback for browsers that do not support the date picker.',
      'Using a complex custom date picker when the native one suffices.',
    ],
    relatedWcagCriteria: ['1.3.1', '3.3.2', '4.1.2'],
    mdnUrl: mdnInputUrl('date'),
  },

  'input-file': {
    element: 'input[type="file"]',
    implicitRole: '',
    description: 'A file upload control.',
    correctUsage:
      'Use for file uploads. Associate with a <label>. Use accept to specify allowed file types.',
    commonMistakes: [
      'Hiding the native file input and not making the custom replacement accessible.',
      'Not associating with a <label>.',
      'Not informing users about file size or type restrictions.',
    ],
    relatedWcagCriteria: ['1.3.1', '3.3.2', '4.1.2'],
    mdnUrl: mdnInputUrl('file'),
  },

  'input-hidden': {
    element: 'input[type="hidden"]',
    implicitRole: '',
    description: 'A hidden input not visible or accessible to the user.',
    correctUsage:
      'Use for form data that needs to be submitted but not seen or edited by the user.',
    commonMistakes: ['Storing security-sensitive data that should be server-side.'],
    relatedWcagCriteria: [],
    mdnUrl: mdnInputUrl('hidden'),
  },

  'input-submit': {
    element: 'input[type="submit"]',
    implicitRole: 'button',
    description: 'A button that submits the form.',
    correctUsage:
      'Use to submit forms. The value attribute provides the button text. Prefer <button type="submit"> for more flexibility.',
    commonMistakes: [
      'Using a generic value like "Submit" without context of what is being submitted.',
      'Using <input type="submit"> when <button type="submit"> would allow richer content.',
    ],
    relatedWcagCriteria: ['2.1.1', '3.3.4', '4.1.2'],
    mdnUrl: mdnInputUrl('submit'),
  },

  'input-reset': {
    element: 'input[type="reset"]',
    implicitRole: 'button',
    description: 'A button that resets form controls to their initial values.',
    correctUsage: 'Use sparingly — resetting forms is often unexpected and can cause data loss.',
    commonMistakes: [
      'Including a reset button that users may accidentally activate, losing form data.',
    ],
    relatedWcagCriteria: ['3.3.4'],
    mdnUrl: mdnInputUrl('reset'),
  },

  'input-button': {
    element: 'input[type="button"]',
    implicitRole: 'button',
    description: 'A generic button with no default behaviour.',
    correctUsage:
      'Prefer <button type="button"> instead, which allows richer content (icons, formatting).',
    commonMistakes: [
      'Using <input type="button"> when <button> provides the same semantics with more flexibility.',
    ],
    relatedWcagCriteria: ['2.1.1', '4.1.2'],
    mdnUrl: mdnInputUrl('button'),
  },

  'input-color': {
    element: 'input[type="color"]',
    implicitRole: '',
    description: 'A color picker control.',
    correctUsage: 'Use for colour selection. Associate with a <label>.',
    commonMistakes: [
      'Not associating with a <label>.',
      'Not providing a text alternative showing the selected colour value.',
    ],
    relatedWcagCriteria: ['1.3.1', '3.3.2', '4.1.2'],
    mdnUrl: mdnInputUrl('color'),
  },

  'input-image': {
    element: 'input[type="image"]',
    implicitRole: 'button',
    description: 'A graphical submit button.',
    correctUsage:
      'Provide a descriptive alt attribute. Prefer <button type="submit"> with an <img> inside instead.',
    commonMistakes: [
      'Missing alt attribute (critical — acts as the accessible name).',
      'Using a non-descriptive alt like "button" or "image".',
    ],
    relatedWcagCriteria: ['1.1.1', '2.1.1', '4.1.2'],
    mdnUrl: mdnInputUrl('image'),
  },

  // =========================================================================
  // Tables
  // =========================================================================

  table: {
    element: 'table',
    implicitRole: 'table',
    description: 'Tabular data arranged in rows and columns.',
    correctUsage:
      'Use for data that has a natural tabular structure. Include <caption> for the table name and <th> with scope for headers.',
    commonMistakes: [
      'Using <table> for page layout.',
      'Not providing <caption> or aria-labelledby.',
      'Not using <th scope="col"> or <th scope="row">.',
      'Using <div>-based grid layout for tabular data.',
    ],
    relatedWcagCriteria: ['1.3.1', '1.3.2'],
    mdnUrl: mdnUrl('table'),
  },

  caption: {
    element: 'caption',
    implicitRole: 'caption',
    description: 'The title or caption of a table.',
    correctUsage: 'Use as the first child of <table> to provide an accessible table name.',
    commonMistakes: [
      'Using a heading above the table instead of <caption>.',
      'Hiding the caption with display: none (use visually-hidden CSS instead).',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('caption'),
  },

  thead: {
    element: 'thead',
    implicitRole: 'rowgroup',
    description: 'Groups the header rows of a table.',
    correctUsage: 'Wrap header <tr> rows in <thead>.',
    commonMistakes: ['Not using <thead> in data tables, reducing structural clarity.'],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('thead'),
  },

  tbody: {
    element: 'tbody',
    implicitRole: 'rowgroup',
    description: 'Groups the body rows of a table.',
    correctUsage: 'Wrap data <tr> rows in <tbody>.',
    commonMistakes: [
      'Omitting <tbody> — browsers insert it implicitly, but explicit use improves clarity.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('tbody'),
  },

  tfoot: {
    element: 'tfoot',
    implicitRole: 'rowgroup',
    description: 'Groups the footer rows of a table.',
    correctUsage: 'Use for summary rows, totals, or footnotes at the bottom of a table.',
    commonMistakes: ['Not using <tfoot> for summary/total rows.'],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('tfoot'),
  },

  tr: {
    element: 'tr',
    implicitRole: 'row',
    description: 'A row of cells in a table.',
    correctUsage: 'Use inside <thead>, <tbody>, or <tfoot>.',
    commonMistakes: ['Using <tr> outside of a table structure.'],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('tr'),
  },

  th: {
    element: 'th',
    implicitRole: 'columnheader',
    description:
      'A header cell in a table. Implicit role is columnheader (scope="col") or rowheader (scope="row").',
    correctUsage:
      'Use in <thead> for column headers with scope="col", or in rows with scope="row".',
    commonMistakes: [
      'Not adding the scope attribute.',
      'Using <td> with bold text instead of <th>.',
      'Missing headers attribute for complex tables with spanning cells.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('th'),
  },

  td: {
    element: 'td',
    implicitRole: 'cell',
    description: 'A data cell in a table.',
    correctUsage: 'Use for data cells within <tr>. Use headers attribute for complex tables.',
    commonMistakes: [
      'Using <td> for header cells instead of <th>.',
      'Using empty <td> for layout spacing.',
    ],
    relatedWcagCriteria: ['1.3.1'],
    mdnUrl: mdnUrl('td'),
  },

  // =========================================================================
  // Media
  // =========================================================================

  img: {
    element: 'img',
    implicitRole: 'img',
    description:
      'An image. If alt text is empty, the implicit role becomes "presentation" (decorative).',
    correctUsage:
      'Always provide an alt attribute. Use descriptive alt for informative images. Use alt="" for decorative images.',
    commonMistakes: [
      'Missing alt attribute entirely.',
      'Using non-descriptive alt like "image" or "photo".',
      'Not using alt="" for decorative images, causing screen readers to announce the filename.',
      'Using alt text that repeats adjacent text content.',
    ],
    relatedWcagCriteria: ['1.1.1', '1.4.5'],
    mdnUrl: mdnUrl('img'),
  },

  figure: {
    element: 'figure',
    implicitRole: 'figure',
    description:
      'Self-contained content, potentially with a caption, such as illustrations, diagrams, or code listings.',
    correctUsage: 'Use with <figcaption> to provide a caption for the content.',
    commonMistakes: [
      'Not including a <figcaption>.',
      'Using <figure> for content that is not self-contained.',
    ],
    relatedWcagCriteria: ['1.1.1', '1.3.1'],
    mdnUrl: mdnUrl('figure'),
  },

  figcaption: {
    element: 'figcaption',
    implicitRole: '',
    description: 'A caption for a <figure> element.',
    correctUsage: 'Use as the first or last child of <figure>.',
    commonMistakes: [
      'Using <figcaption> outside of <figure>.',
      'Duplicating the alt text of an image in the figcaption.',
    ],
    relatedWcagCriteria: ['1.1.1', '1.3.1'],
    mdnUrl: mdnUrl('figcaption'),
  },

  picture: {
    element: 'picture',
    implicitRole: '',
    description:
      'A container for <source> elements and one <img> element, providing responsive image selection.',
    correctUsage:
      'Use to provide alternative image sources based on media conditions. The <img> inside must have alt.',
    commonMistakes: [
      'Forgetting the <img> fallback inside <picture>.',
      'Not providing alt on the <img> inside <picture>.',
    ],
    relatedWcagCriteria: ['1.1.1'],
    mdnUrl: mdnUrl('picture'),
  },

  audio: {
    element: 'audio',
    implicitRole: '',
    description: 'An audio player for embedding sound content.',
    correctUsage: 'Use with controls attribute. Provide text transcripts for audio content.',
    commonMistakes: [
      'Not providing a text transcript for audio content.',
      'Auto-playing audio without user action.',
      'Not including the controls attribute, making it impossible to pause.',
    ],
    relatedWcagCriteria: ['1.2.1', '1.4.2'],
    mdnUrl: mdnUrl('audio'),
  },

  video: {
    element: 'video',
    implicitRole: '',
    description: 'A video player for embedding video content.',
    correctUsage:
      'Use with controls attribute. Provide captions (<track kind="captions">) and audio descriptions.',
    commonMistakes: [
      'Not providing captions for video content.',
      'Auto-playing video without user action.',
      'Not including the controls attribute.',
      'Missing audio descriptions for visual content that is not described in the audio track.',
    ],
    relatedWcagCriteria: ['1.2.1', '1.2.2', '1.2.3', '1.2.5', '1.4.2'],
    mdnUrl: mdnUrl('video'),
  },

  iframe: {
    element: 'iframe',
    implicitRole: '',
    description: 'Embeds another HTML document within the current page.',
    correctUsage:
      'Always provide a descriptive title attribute. Use sandbox for untrusted content.',
    commonMistakes: [
      'Missing the title attribute, leaving the iframe unnamed for screen readers.',
      'Using a non-descriptive title like "iframe".',
      'Not considering keyboard navigation into and out of the iframe.',
    ],
    relatedWcagCriteria: ['2.4.1', '4.1.2'],
    mdnUrl: mdnUrl('iframe'),
  },
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** Get a single element by its tag name or key (e.g. 'nav', 'input-checkbox'). */
export function getElement(tag: string): SemanticHtmlElement | undefined {
  return SEMANTIC_HTML_ELEMENTS[tag];
}

/** Get all elements as an array, sorted alphabetically by element name. */
export function getAllElements(): SemanticHtmlElement[] {
  return Object.values(SEMANTIC_HTML_ELEMENTS).sort((a, b) => a.element.localeCompare(b.element));
}

/** Get all elements that map to the given implicit ARIA role. */
export function getElementsForRole(role: string): SemanticHtmlElement[] {
  const lower = role.toLowerCase();
  return Object.values(SEMANTIC_HTML_ELEMENTS).filter(
    el => el.implicitRole.toLowerCase() === lower,
  );
}
