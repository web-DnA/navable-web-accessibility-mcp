/**
 * WAI-ARIA Authoring Practices Guide (APG) — Pattern Reference
 *
 * 25 common ARIA widget patterns with required roles, keyboard interactions,
 * focus management guidance, and common mistakes.
 * Verified against the official WAI-ARIA APG:
 *   - https://www.w3.org/WAI/ARIA/apg/patterns/
 *
 * Each pattern includes WCAG success criteria references and links to the
 * authoritative APG documentation.
 *
 * Last verified: 2025-06-28
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KeyboardInteraction {
  /** Key or key combination, e.g. "Enter", "Arrow Down", "Shift + Tab" */
  key: string;
  /** What the key does in context of this pattern */
  action: string;
}

export interface AriaPattern {
  /** Slug identifier, e.g. 'dialog-modal' */
  id: string;
  /** Human-readable name, e.g. 'Dialog (Modal)' */
  name: string;
  /** 1–2 sentence summary of the pattern */
  description: string;
  /** Required ARIA roles for this pattern */
  roles: string[];
  /** ARIA attributes that must be present */
  requiredAttributes: string[];
  /** Commonly used optional ARIA attributes */
  optionalAttributes: string[];
  /** Keyboard interactions defined by the APG */
  keyboardInteractions: KeyboardInteraction[];
  /** Native HTML element equivalent, if one exists */
  nativeHtmlEquivalent?: string;
  /** Prose description of focus behavior */
  focusManagement: string;
  /** Related WCAG success criteria numbers */
  wcagCriteria: string[];
  /** Link to the WAI-ARIA APG page */
  apgUrl: string;
  /** Things developers commonly get wrong */
  commonMistakes: string[];
  /** When this pattern is the right choice */
  useWhen: string;
  /** When native HTML or a simpler pattern is better — helps the LLM avoid overengineering */
  avoidWhen: string;
  /** Implementation complexity: low = near-native, medium = moderate ARIA + keyboard, high = complex focus/state management */
  complexity: 'low' | 'medium' | 'high';
}

// ---------------------------------------------------------------------------
// APG URL Helper
// ---------------------------------------------------------------------------

const APG_BASE = 'https://www.w3.org/WAI/ARIA/apg/patterns';

function apgUrl(slug: string): string {
  return `${APG_BASE}/${slug}/`;
}

// ---------------------------------------------------------------------------
// Pattern Data
// ---------------------------------------------------------------------------

export const ARIA_PATTERNS: Record<string, AriaPattern> = {
  // -------------------------------------------------------------------------
  // Accordion
  // -------------------------------------------------------------------------
  accordion: {
    id: 'accordion',
    name: 'Accordion',
    description:
      'A vertically stacked set of interactive headings that each reveal or hide an associated section of content.',
    roles: ['heading', 'button', 'region'],
    requiredAttributes: ['aria-expanded', 'aria-controls'],
    optionalAttributes: ['aria-disabled', 'aria-labelledby'],
    keyboardInteractions: [
      {
        key: 'Enter',
        action: 'Expands or collapses the associated panel when focus is on the accordion header.',
      },
      {
        key: 'Space',
        action: 'Expands or collapses the associated panel when focus is on the accordion header.',
      },
      { key: 'Tab', action: 'Moves focus to the next focusable element in the page tab sequence.' },
      {
        key: 'Shift + Tab',
        action: 'Moves focus to the previous focusable element in the page tab sequence.',
      },
      { key: 'Down Arrow', action: 'Moves focus to the next accordion header (optional).' },
      { key: 'Up Arrow', action: 'Moves focus to the previous accordion header (optional).' },
      { key: 'Home', action: 'Moves focus to the first accordion header (optional).' },
      { key: 'End', action: 'Moves focus to the last accordion header (optional).' },
    ],
    nativeHtmlEquivalent: '<details>/<summary>',
    focusManagement:
      'Focus stays on the accordion header button after expanding or collapsing a panel. All focusable elements inside accordion panels are part of the page Tab sequence.',
    wcagCriteria: ['1.3.1', '2.1.1', '4.1.2'],
    apgUrl: apgUrl('accordion'),
    commonMistakes: [
      'Using div elements instead of heading elements for accordion headers.',
      'Missing aria-expanded on the header button.',
      'Not wrapping the header button inside an element with a proper heading role and aria-level.',
      'Forgetting aria-controls to associate the header with its panel.',
      'Not using native <details>/<summary> when custom styling is not required.',
    ],
    useWhen:
      'Showing collapsible content sections where only one (or a few) sections are visible at a time, and native <details>/<summary> lacks the multi-panel coordination or styling control you need.',
    avoidWhen:
      'A single show/hide toggle suffices (use disclosure or native <details>/<summary>). Also avoid if the content sections are short enough to show without collapsing.',
    complexity: 'medium',
  },

  // -------------------------------------------------------------------------
  // Alert
  // -------------------------------------------------------------------------
  alert: {
    id: 'alert',
    name: 'Alert',
    description:
      "An element that displays a brief, important message in a way that attracts attention without interrupting the user's task.",
    roles: ['alert'],
    requiredAttributes: [],
    optionalAttributes: ['aria-live', 'aria-atomic'],
    keyboardInteractions: [],
    focusManagement:
      'Alerts do not receive focus. They are announced by screen readers via the implicit aria-live="assertive" and aria-atomic="true" on the alert role. Focus must not move to the alert.',
    wcagCriteria: ['4.1.3'],
    apgUrl: apgUrl('alert'),
    commonMistakes: [
      "Moving focus to the alert element, which interrupts the user's task.",
      'Using alerts for information that is not time-sensitive or important.',
      'Creating alerts that disappear automatically before the user can read them.',
      'Using role="alert" instead of role="alertdialog" when user response is required.',
      'Overusing alerts, causing frequent interruptions for assistive technology users.',
    ],
    useWhen:
      'Displaying time-sensitive, important messages (form errors, status changes) that must be announced immediately without stealing focus.',
    avoidWhen:
      'The user must acknowledge or respond to the message (use alertdialog instead). Also avoid for non-urgent status updates (use role="status" with aria-live="polite" instead).',
    complexity: 'low',
  },

  // -------------------------------------------------------------------------
  // Alert Dialog
  // -------------------------------------------------------------------------
  alertdialog: {
    id: 'alertdialog',
    name: 'Alert Dialog',
    description:
      "A modal dialog that interrupts the user's workflow to communicate an important message and acquire a response, such as a confirmation prompt.",
    roles: ['alertdialog'],
    requiredAttributes: ['aria-labelledby', 'aria-describedby'],
    optionalAttributes: ['aria-modal'],
    keyboardInteractions: [
      {
        key: 'Tab',
        action:
          'Moves focus to the next tabbable element inside the dialog. Wraps from last to first.',
      },
      {
        key: 'Shift + Tab',
        action:
          'Moves focus to the previous tabbable element inside the dialog. Wraps from first to last.',
      },
      { key: 'Escape', action: 'Closes the dialog.' },
    ],
    focusManagement:
      'When the alert dialog opens, focus moves to an element inside the dialog — typically the least destructive action button. When closed, focus returns to the element that invoked the dialog.',
    wcagCriteria: ['2.1.1', '2.1.2', '2.4.3', '4.1.2'],
    apgUrl: apgUrl('alertdialog'),
    commonMistakes: [
      'Using role="alert" instead of role="alertdialog" when a response is required.',
      'Not trapping focus inside the dialog.',
      'Missing aria-describedby pointing to the alert message text.',
      'Setting initial focus on a destructive action like "Delete" instead of "Cancel".',
      'Not returning focus to the triggering element when the dialog closes.',
    ],
    useWhen:
      'Interrupting the user to confirm a destructive or irreversible action (delete, discard changes, submit payment).',
    avoidWhen:
      'The message is informational only and needs no response (use alert). Or the dialog content is complex with multiple actions (use a regular dialog-modal).',
    complexity: 'medium',
  },

  // -------------------------------------------------------------------------
  // Breadcrumb
  // -------------------------------------------------------------------------
  breadcrumb: {
    id: 'breadcrumb',
    name: 'Breadcrumb',
    description:
      'A trail of links to parent pages of the current page in hierarchical order, helping users find their place within a website.',
    roles: ['navigation'],
    requiredAttributes: ['aria-label'],
    optionalAttributes: ['aria-current'],
    keyboardInteractions: [],
    nativeHtmlEquivalent: '<nav> with <ol>',
    focusManagement:
      'No special focus management. Links within the breadcrumb participate in the normal page Tab sequence. The current page link has aria-current="page".',
    wcagCriteria: ['2.4.4', '2.4.8', '3.2.3'],
    apgUrl: apgUrl('breadcrumb'),
    commonMistakes: [
      'Not wrapping the breadcrumb in a <nav> element or element with role="navigation".',
      'Missing aria-label (e.g., "Breadcrumb") on the nav element.',
      'Not using an ordered list (<ol>) for the link structure.',
      'Omitting aria-current="page" on the link to the current page.',
      'Using visual-only separators that are announced by screen readers.',
    ],
    useWhen:
      "Showing the user's location in a site hierarchy (multi-level navigation). Standard pattern for e-commerce, documentation sites, and portals.",
    avoidWhen:
      'The site is flat (one or two levels deep) or the hierarchy is already obvious from the page layout.',
    complexity: 'low',
  },

  // -------------------------------------------------------------------------
  // Button
  // -------------------------------------------------------------------------
  button: {
    id: 'button',
    name: 'Button',
    description:
      'A widget that enables users to trigger an action or event, such as submitting a form, opening a dialog, or performing a delete operation.',
    roles: ['button'],
    requiredAttributes: [],
    optionalAttributes: [
      'aria-pressed',
      'aria-expanded',
      'aria-haspopup',
      'aria-disabled',
      'aria-describedby',
    ],
    keyboardInteractions: [
      { key: 'Enter', action: 'Activates the button.' },
      { key: 'Space', action: 'Activates the button.' },
    ],
    nativeHtmlEquivalent: '<button>',
    focusManagement:
      'After activation, focus placement depends on the action: if a dialog opens, focus moves into it; otherwise, focus typically remains on the button.',
    wcagCriteria: ['2.1.1', '4.1.2'],
    apgUrl: apgUrl('button'),
    commonMistakes: [
      'Using <div> or <span> with an onclick handler instead of <button>.',
      'Forgetting to add tabindex="0" and keyboard event handlers when role="button" is used on a non-interactive element.',
      'Not providing Enter and Space key support when building a custom button.',
      'Changing the label of a toggle button based on its state instead of using aria-pressed.',
      'Adding role="button" to an <a> element that navigates to another page.',
    ],
    useWhen:
      'Triggering an in-page action (submit, toggle, open dialog, delete). Always prefer native <button> over a custom ARIA button.',
    avoidWhen:
      'The element navigates to a different page or URL (use <a href> instead). Do not use role="button" to avoid building <button> styling.',
    complexity: 'low',
  },

  // -------------------------------------------------------------------------
  // Carousel
  // -------------------------------------------------------------------------
  carousel: {
    id: 'carousel',
    name: 'Carousel (Slide Show)',
    description:
      'Presents a set of items (slides) by sequentially displaying a subset, with controls to navigate between slides and optionally auto-rotate.',
    roles: ['region', 'group'],
    requiredAttributes: ['aria-roledescription', 'aria-label'],
    optionalAttributes: ['aria-live', 'aria-atomic', 'aria-labelledby'],
    keyboardInteractions: [
      {
        key: 'Tab',
        action:
          'Moves focus through interactive carousel controls (rotation, prev, next, slide pickers).',
      },
      { key: 'Enter', action: 'Activates buttons for next/previous/rotation control.' },
      { key: 'Space', action: 'Activates buttons for next/previous/rotation control.' },
    ],
    focusManagement:
      'Auto-rotation stops when any element in the carousel receives keyboard focus and does not resume unless the user reactivates it. The rotation control should be the first element in the Tab sequence inside the carousel.',
    wcagCriteria: ['1.3.1', '2.1.1', '2.2.2', '4.1.2'],
    apgUrl: apgUrl('carousel'),
    commonMistakes: [
      'Not stopping auto-rotation when the carousel receives keyboard focus or mouse hover.',
      'Missing a visible pause/stop button for auto-rotation.',
      'Not setting aria-roledescription="carousel" on the container and "slide" on each slide.',
      'Making non-visible slides focusable, confusing screen reader users.',
      'Not providing aria-live="polite" on the slide container when auto-rotation is off.',
    ],
    useWhen:
      'Showcasing a set of related content items (images, promotions, testimonials) where screen space is limited and sequential presentation is acceptable.',
    avoidWhen:
      'All items should be visible at once, or the content is essential (users may miss auto-rotated slides). Consider a static grid, list, or tabs instead.',
    complexity: 'high',
  },

  // -------------------------------------------------------------------------
  // Checkbox
  // -------------------------------------------------------------------------
  checkbox: {
    id: 'checkbox',
    name: 'Checkbox',
    description:
      'A checkable input that supports two states (checked/unchecked) or three states (checked/unchecked/partially checked for tri-state checkboxes).',
    roles: ['checkbox'],
    requiredAttributes: ['aria-checked'],
    optionalAttributes: ['aria-labelledby', 'aria-label', 'aria-describedby', 'aria-disabled'],
    keyboardInteractions: [
      { key: 'Space', action: 'Toggles the checkbox between checked and unchecked states.' },
    ],
    nativeHtmlEquivalent: '<input type="checkbox">',
    focusManagement:
      'Focus remains on the checkbox after toggling. Checkboxes in a group participate in the normal Tab sequence.',
    wcagCriteria: ['1.3.1', '2.1.1', '4.1.2'],
    apgUrl: apgUrl('checkbox'),
    commonMistakes: [
      'Using a <div> with a click handler instead of <input type="checkbox">.',
      'Forgetting aria-checked when using role="checkbox" on a custom element.',
      'Using aria-checked="yes" instead of the valid value "true".',
      'Not using a <fieldset>/<legend> or role="group" with aria-labelledby for checkbox groups.',
      'Missing keyboard Space support on custom checkbox implementations.',
    ],
    useWhen:
      'Binary or tri-state selection (agree/disagree, enable/disable features, select multiple items). Always prefer native <input type="checkbox"> first.',
    avoidWhen:
      'Only one option can be selected from a group (use radio group). Or the choice is on/off with immediate effect (consider switch instead).',
    complexity: 'low',
  },

  // -------------------------------------------------------------------------
  // Combobox
  // -------------------------------------------------------------------------
  combobox: {
    id: 'combobox',
    name: 'Combobox',
    description:
      'An input widget with an associated popup (listbox, grid, tree, or dialog) that helps the user set the value of the input.',
    roles: ['combobox', 'listbox', 'option'],
    requiredAttributes: ['aria-expanded', 'aria-controls'],
    optionalAttributes: [
      'aria-haspopup',
      'aria-activedescendant',
      'aria-autocomplete',
      'aria-labelledby',
      'aria-label',
    ],
    keyboardInteractions: [
      {
        key: 'Down Arrow',
        action:
          'Opens the popup if closed; moves focus into the popup to the first or next option.',
      },
      {
        key: 'Up Arrow',
        action: 'Opens the popup if closed (optional); moves focus to the last or previous option.',
      },
      { key: 'Escape', action: 'Dismisses the popup if visible; optionally clears the combobox.' },
      {
        key: 'Enter',
        action:
          'Accepts the selected suggestion, closing the popup and placing the value in the input.',
      },
      { key: 'Alt + Down Arrow', action: 'Opens the popup without moving focus (optional).' },
      {
        key: 'Alt + Up Arrow',
        action: 'Closes the popup and returns focus to the combobox (optional).',
      },
    ],
    nativeHtmlEquivalent: '<select> or <input> with <datalist>',
    focusManagement:
      'DOM focus stays on the combobox input. aria-activedescendant is used to indicate the focused option in the popup. When the popup closes, focus remains on the combobox.',
    wcagCriteria: ['1.3.1', '2.1.1', '2.4.3', '4.1.2'],
    apgUrl: apgUrl('combobox'),
    commonMistakes: [
      'Not setting aria-expanded to reflect popup visibility state.',
      'Using aria-owns instead of aria-controls (deprecated ARIA 1.0 pattern).',
      'Not implementing aria-activedescendant for virtual focus management in the popup.',
      'Missing aria-autocomplete to declare the autocomplete behavior.',
      'Not suppressing default browser autocomplete with autocomplete="off" when providing custom suggestions.',
      'Failing to close the popup on Escape key.',
    ],
    useWhen:
      'The user needs to search, filter, or autocomplete from a large or dynamic set of options. Essential for search-as-you-type, tagging, and location pickers.',
    avoidWhen:
      'The option set is small and fixed (under ~15 items) — use native <select> instead. If suggestions are not needed and the value is free text, use a plain <input>.',
    complexity: 'high',
  },

  // -------------------------------------------------------------------------
  // Dialog (Modal)
  // -------------------------------------------------------------------------
  'dialog-modal': {
    id: 'dialog-modal',
    name: 'Dialog (Modal)',
    description:
      'A window overlaid on the primary window or another dialog. Modal dialogs make underlying content inert and trap focus inside the dialog.',
    roles: ['dialog'],
    requiredAttributes: ['aria-modal', 'aria-labelledby'],
    optionalAttributes: ['aria-describedby', 'aria-label'],
    keyboardInteractions: [
      {
        key: 'Tab',
        action:
          'Moves focus to the next tabbable element inside the dialog. Wraps from last to first.',
      },
      {
        key: 'Shift + Tab',
        action:
          'Moves focus to the previous tabbable element inside the dialog. Wraps from first to last.',
      },
      { key: 'Escape', action: 'Closes the dialog.' },
    ],
    focusManagement:
      'Focus moves to the first focusable element inside the dialog on open (or a static element with tabindex="-1" at the start of content for complex dialogs). Focus returns to the triggering element on close. Tab/Shift+Tab must be trapped inside the dialog.',
    wcagCriteria: ['2.1.1', '2.1.2', '2.4.3', '4.1.2'],
    apgUrl: apgUrl('dialog-modal'),
    commonMistakes: [
      'Not trapping focus inside the modal (allowing Tab to reach elements behind the dialog).',
      'Missing aria-modal="true", causing assistive technologies to announce background content.',
      'Not returning focus to the trigger element when the dialog closes.',
      'Forgetting aria-labelledby to reference the dialog title.',
      'Using aria-hidden on an ancestor of the dialog element.',
      'Not including a visible close button with role="button".',
    ],
    useWhen:
      "Content or actions that require the user's focused attention and should block interaction with the rest of the page (confirmations, forms, detail views). Prefer native <dialog> with showModal() first.",
    avoidWhen:
      "The content is supplementary and doesn't need to block the page (use a non-modal dialog or disclosure instead). Avoid for simple alerts that need no user input (use alert).",
    complexity: 'high',
  },

  // -------------------------------------------------------------------------
  // Disclosure
  // -------------------------------------------------------------------------
  disclosure: {
    id: 'disclosure',
    name: 'Disclosure (Show/Hide)',
    description:
      'A widget that enables content to be either collapsed (hidden) or expanded (visible), typically a button that toggles visibility of a section.',
    roles: ['button'],
    requiredAttributes: ['aria-expanded', 'aria-controls'],
    optionalAttributes: [],
    keyboardInteractions: [
      { key: 'Enter', action: 'Toggles the visibility of the controlled content.' },
      { key: 'Space', action: 'Toggles the visibility of the controlled content.' },
    ],
    nativeHtmlEquivalent: '<details>/<summary>',
    focusManagement:
      'Focus remains on the disclosure trigger button after toggling. Content revealed by the disclosure participates in the normal Tab sequence.',
    wcagCriteria: ['1.3.1', '2.1.1', '4.1.2'],
    apgUrl: apgUrl('disclosure'),
    commonMistakes: [
      'Not using aria-expanded on the trigger button.',
      'Using display:none on content but not updating aria-expanded accordingly.',
      'Forgetting aria-controls to link the button to the content it reveals.',
      'Using a link (<a>) instead of a <button> for the disclosure trigger.',
      'Not using native <details>/<summary> when custom behavior is not needed.',
    ],
    useWhen:
      'A single show/hide toggle for a content section (FAQ answers, expandable help text, "read more" sections). Strongly prefer native <details>/<summary> first.',
    avoidWhen:
      'Multiple coordinated collapsible sections where only one should be open (use accordion). Or the content requires a modal overlay (use dialog).',
    complexity: 'low',
  },

  // -------------------------------------------------------------------------
  // Feed
  // -------------------------------------------------------------------------
  feed: {
    id: 'feed',
    name: 'Feed',
    description:
      'A section of a page that automatically loads new sections of content as the user scrolls, such as a social media feed or news stream.',
    roles: ['feed', 'article'],
    requiredAttributes: ['aria-labelledby', 'aria-describedby'],
    optionalAttributes: ['aria-setsize', 'aria-posinset', 'aria-busy'],
    keyboardInteractions: [
      { key: 'Page Down', action: 'Moves focus to the next article in the feed.' },
      { key: 'Page Up', action: 'Moves focus to the previous article in the feed.' },
      {
        key: 'Control + End',
        action: 'Moves focus to the first focusable element after the feed.',
      },
      {
        key: 'Control + Home',
        action: 'Moves focus to the first focusable element before the feed.',
      },
    ],
    focusManagement:
      'Each article in the feed should be focusable (tabindex="0" or contain a focusable element). Page Down/Up move focus between articles. aria-busy="true" should be set on the feed while new content is loading.',
    wcagCriteria: ['1.3.1', '2.1.1', '2.4.3', '4.1.2'],
    apgUrl: apgUrl('feed'),
    commonMistakes: [
      'Not using role="article" on each item in the feed.',
      'Missing aria-labelledby on the feed container.',
      'Not setting aria-setsize and aria-posinset on articles when the total count is known.',
      'Forgetting to set aria-busy="true" while new content is loading.',
      'Not making articles keyboard-navigable with Page Down/Up.',
    ],
    useWhen:
      'Infinite-scroll or load-more content streams where articles are added dynamically (social feeds, news streams, activity logs).',
    avoidWhen:
      'Content is paginated with explicit "next page" links, or the full list is known upfront (use a simple list or table).',
    complexity: 'high',
  },

  // -------------------------------------------------------------------------
  // Grid
  // -------------------------------------------------------------------------
  grid: {
    id: 'grid',
    name: 'Grid',
    description:
      'An interactive tabular structure containing one or more rows of cells that can be navigated using directional arrow keys, similar to a spreadsheet.',
    roles: ['grid', 'row', 'gridcell', 'rowheader', 'columnheader'],
    requiredAttributes: ['aria-labelledby'],
    optionalAttributes: [
      'aria-colcount',
      'aria-rowcount',
      'aria-colindex',
      'aria-rowindex',
      'aria-readonly',
      'aria-selected',
      'aria-label',
    ],
    keyboardInteractions: [
      {
        key: 'Right Arrow',
        action: 'Moves focus one cell to the right. Wraps to next row if at end (optional).',
      },
      {
        key: 'Left Arrow',
        action: 'Moves focus one cell to the left. Wraps to previous row if at start (optional).',
      },
      { key: 'Down Arrow', action: 'Moves focus one cell down.' },
      { key: 'Up Arrow', action: 'Moves focus one cell up.' },
      { key: 'Page Down', action: 'Moves focus down a page-determined number of rows (optional).' },
      { key: 'Page Up', action: 'Moves focus up a page-determined number of rows (optional).' },
      { key: 'Home', action: 'Moves focus to the first cell in the row.' },
      { key: 'End', action: 'Moves focus to the last cell in the row.' },
      { key: 'Control + Home', action: 'Moves focus to the first cell in the first row.' },
      { key: 'Control + End', action: 'Moves focus to the last cell in the last row.' },
    ],
    nativeHtmlEquivalent: '<table> (for static data)',
    focusManagement:
      'Focus is managed with a roving tabindex: the grid has a single Tab stop, and arrow keys move focus between cells. Only the focused cell has tabindex="0"; all other cells have tabindex="-1".',
    wcagCriteria: ['1.3.1', '2.1.1', '2.4.3', '4.1.2'],
    apgUrl: apgUrl('grid'),
    commonMistakes: [
      'Not implementing arrow key navigation between cells.',
      'Using role="grid" for static, non-interactive tabular data (use role="table" instead).',
      'Missing row and gridcell roles in the grid structure.',
      'Not providing column and row headers for accessible context.',
      'Not managing roving tabindex, making every cell a Tab stop.',
    ],
    useWhen:
      'Tabular data where individual cells are interactive (editable spreadsheets, data grids with inline editing or selection, layout grids with focusable items).',
    avoidWhen:
      'The table is read-only and non-interactive (use native <table> with role="table"). Also avoid for simple lists of items (use listbox or plain list).',
    complexity: 'high',
  },

  // -------------------------------------------------------------------------
  // Link
  // -------------------------------------------------------------------------
  link: {
    id: 'link',
    name: 'Link',
    description:
      'An interactive reference to a resource. When activated, the link navigates the user to the referenced resource.',
    roles: ['link'],
    requiredAttributes: [],
    optionalAttributes: ['aria-label', 'aria-labelledby', 'aria-describedby', 'aria-current'],
    keyboardInteractions: [
      { key: 'Enter', action: 'Activates the link and navigates to the referenced resource.' },
    ],
    nativeHtmlEquivalent: '<a href="...">',
    focusManagement:
      'Links participate in the normal Tab sequence. No special focus management is required.',
    wcagCriteria: ['2.1.1', '2.4.4', '4.1.2'],
    apgUrl: apgUrl('link'),
    commonMistakes: [
      'Using <span> or <div> with an onclick instead of <a href>.',
      'Adding role="link" without tabindex="0" and Enter key support.',
      'Using non-descriptive link text like "click here" or "read more".',
      'Opening links in new windows without warning the user.',
      'Removing the visible focus indicator on links.',
    ],
    useWhen:
      'Navigating to a different page, resource, or anchor. Always prefer native <a href> first.',
    avoidWhen:
      'The element triggers an in-page action (use <button> instead). Do not style <a> as a button for actions.',
    complexity: 'low',
  },

  // -------------------------------------------------------------------------
  // Listbox
  // -------------------------------------------------------------------------
  listbox: {
    id: 'listbox',
    name: 'Listbox',
    description:
      'A widget that presents a list of options and allows the user to select one or more of them.',
    roles: ['listbox', 'option'],
    requiredAttributes: ['aria-labelledby'],
    optionalAttributes: [
      'aria-multiselectable',
      'aria-selected',
      'aria-activedescendant',
      'aria-orientation',
      'aria-label',
      'aria-disabled',
    ],
    keyboardInteractions: [
      { key: 'Down Arrow', action: 'Moves focus to the next option.' },
      { key: 'Up Arrow', action: 'Moves focus to the previous option.' },
      { key: 'Home', action: 'Moves focus to the first option.' },
      { key: 'End', action: 'Moves focus to the last option.' },
      {
        key: 'Space',
        action: 'Toggles selection of the focused option in multi-select listboxes.',
      },
      {
        key: 'Shift + Down Arrow',
        action: 'Selects from the focused option to the next option (multi-select).',
      },
      {
        key: 'Shift + Up Arrow',
        action: 'Selects from the focused option to the previous option (multi-select).',
      },
      { key: 'Control + A', action: 'Selects all options (multi-select, optional).' },
    ],
    nativeHtmlEquivalent: '<select size="N">',
    focusManagement:
      'The listbox has a single Tab stop. Arrow keys move focus between options. In single-select mode, selection follows focus. In multi-select, use Space and Shift+Arrow to manage selection.',
    wcagCriteria: ['1.3.1', '2.1.1', '4.1.2'],
    apgUrl: apgUrl('listbox'),
    commonMistakes: [
      'Not using role="option" on each item in the listbox.',
      'Missing aria-selected on options.',
      'Implementing multi-select without Shift and Control key modifiers.',
      'Not providing typeahead: typing a character should move focus to the next matching option.',
      'Making every option a Tab stop instead of using arrow key navigation.',
    ],
    useWhen:
      'Selecting one or more items from a visible list of options (multi-select transfers, option panels, rearrangeable lists). Use when <select> is insufficient due to styling or multi-select UX needs.',
    avoidWhen:
      'A simple dropdown suffices (use native <select>). Or the list needs search/filter (use combobox with listbox popup instead).',
    complexity: 'medium',
  },

  // -------------------------------------------------------------------------
  // Menu / Menubar
  // -------------------------------------------------------------------------
  'menu-menubar': {
    id: 'menu-menubar',
    name: 'Menu and Menubar',
    description:
      'A menu is a widget offering a list of choices (actions or functions) to the user. A menubar is a horizontal menu typically found at the top of a window or application.',
    roles: ['menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio'],
    requiredAttributes: ['aria-labelledby'],
    optionalAttributes: [
      'aria-haspopup',
      'aria-expanded',
      'aria-orientation',
      'aria-label',
      'aria-disabled',
      'aria-checked',
    ],
    keyboardInteractions: [
      { key: 'Enter', action: 'Activates the focused menu item. If it has a submenu, opens it.' },
      {
        key: 'Space',
        action: 'Activates the focused menu item. Toggles state for menuitemcheckbox/radio.',
      },
      {
        key: 'Down Arrow',
        action: 'In a vertical menu, moves focus to the next item. In a menubar, opens a submenu.',
      },
      { key: 'Up Arrow', action: 'In a vertical menu, moves focus to the previous item.' },
      {
        key: 'Right Arrow',
        action: 'In a menubar, moves focus to the next top-level item. In a menu, opens a submenu.',
      },
      {
        key: 'Left Arrow',
        action:
          'In a menubar, moves focus to the previous top-level item. In a submenu, closes it and returns focus to parent.',
      },
      {
        key: 'Escape',
        action:
          'Closes the current menu and returns focus to the menu trigger or parent menubar item.',
      },
      { key: 'Home', action: 'Moves focus to the first item in the menu.' },
      { key: 'End', action: 'Moves focus to the last item in the menu.' },
    ],
    focusManagement:
      'The menubar has a single Tab stop using roving tabindex. Arrow keys move focus between items. When a submenu opens, focus moves to its first item. Escape closes the submenu and returns focus to the parent item.',
    wcagCriteria: ['1.3.1', '2.1.1', '2.4.3', '4.1.2'],
    apgUrl: apgUrl('menubar'),
    commonMistakes: [
      'Using role="menu" for navigation menus (use <nav> with links instead).',
      'Not implementing arrow key navigation in the menu.',
      'Missing aria-haspopup on items with submenus.',
      'Forgetting aria-expanded on submenu triggers.',
      'Not closing submenus on Escape key.',
      'Making every menu item a Tab stop instead of using roving tabindex.',
    ],
    useWhen:
      'Application-style menus offering a list of actions (file menu, context menu, menubar in a web app). Only for actions, not for navigation.',
    avoidWhen:
      'Building site navigation (use <nav> with links). Or listing options for selection (use listbox or select). role="menu" is for desktop-app-style action menus, not website nav.',
    complexity: 'high',
  },

  // -------------------------------------------------------------------------
  // Meter
  // -------------------------------------------------------------------------
  meter: {
    id: 'meter',
    name: 'Meter',
    description:
      'A graphical display of a numeric value that varies within a defined range, such as a battery level indicator or password strength gauge.',
    roles: ['meter'],
    requiredAttributes: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    optionalAttributes: ['aria-labelledby', 'aria-label', 'aria-valuetext'],
    keyboardInteractions: [],
    nativeHtmlEquivalent: '<meter>',
    focusManagement:
      'Meters are not interactive, so no keyboard interaction or focus management is required.',
    wcagCriteria: ['1.1.1', '1.3.1', '4.1.2'],
    apgUrl: apgUrl('meter'),
    commonMistakes: [
      'Confusing meter with progressbar — use meter for known-range scalar values, progressbar for task completion.',
      'Missing aria-valuemin and aria-valuemax.',
      'Not providing aria-valuetext when the numeric value alone is not meaningful.',
      'Not using the native <meter> element when available.',
      'Forgetting an accessible label on the meter.',
    ],
    useWhen:
      'Displaying a known-range scalar measurement (disk usage, signal strength, password strength, battery level). Prefer native <meter> when possible.',
    avoidWhen:
      'Showing task completion progress (use progressbar/<progress> instead). Or if the value is not within a known range.',
    complexity: 'low',
  },

  // -------------------------------------------------------------------------
  // Radio Group
  // -------------------------------------------------------------------------
  'radio-group': {
    id: 'radio-group',
    name: 'Radio Group',
    description:
      'A set of checkable buttons where no more than one button can be checked at a time. Selecting one radio button deselects the previously selected one.',
    roles: ['radiogroup', 'radio'],
    requiredAttributes: ['aria-checked'],
    optionalAttributes: [
      'aria-labelledby',
      'aria-label',
      'aria-disabled',
      'aria-describedby',
      'aria-required',
    ],
    keyboardInteractions: [
      {
        key: 'Tab',
        action:
          'Moves focus into the radio group (to the checked radio or the first radio if none checked).',
      },
      { key: 'Space', action: 'Checks the focused radio button if not already checked.' },
      {
        key: 'Down Arrow',
        action: 'Moves focus and selection to the next radio button. Wraps from last to first.',
      },
      {
        key: 'Right Arrow',
        action: 'Moves focus and selection to the next radio button. Wraps from last to first.',
      },
      {
        key: 'Up Arrow',
        action: 'Moves focus and selection to the previous radio button. Wraps from first to last.',
      },
      {
        key: 'Left Arrow',
        action: 'Moves focus and selection to the previous radio button. Wraps from first to last.',
      },
    ],
    nativeHtmlEquivalent: '<input type="radio"> within a <fieldset>',
    focusManagement:
      'The radio group has a single Tab stop. Arrow keys move focus and selection. If a radio is checked, Tab focuses that radio; otherwise, Tab focuses the first radio in the group.',
    wcagCriteria: ['1.3.1', '2.1.1', '4.1.2'],
    apgUrl: apgUrl('radio'),
    commonMistakes: [
      'Not grouping radios with role="radiogroup" or <fieldset>.',
      'Missing aria-checked on each radio button.',
      'Making each radio button an individual Tab stop instead of using arrow key navigation.',
      'Not wrapping focus from last to first radio and vice versa.',
      'Using checkboxes when only one selection is allowed.',
    ],
    useWhen:
      'Choosing exactly one option from a small, visible set (3–7 options). Prefer native <input type="radio"> within a <fieldset> first.',
    avoidWhen:
      'Multiple selections are allowed (use checkboxes). Or the list is long or needs search (use select or combobox). Or the choice is binary (use checkbox or switch).',
    complexity: 'medium',
  },

  // -------------------------------------------------------------------------
  // Slider
  // -------------------------------------------------------------------------
  slider: {
    id: 'slider',
    name: 'Slider',
    description:
      'An input where the user selects a value from within a given range by moving a thumb along a track.',
    roles: ['slider'],
    requiredAttributes: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    optionalAttributes: ['aria-labelledby', 'aria-label', 'aria-valuetext', 'aria-orientation'],
    keyboardInteractions: [
      { key: 'Right Arrow', action: 'Increases the slider value by one step.' },
      { key: 'Up Arrow', action: 'Increases the slider value by one step.' },
      { key: 'Left Arrow', action: 'Decreases the slider value by one step.' },
      { key: 'Down Arrow', action: 'Decreases the slider value by one step.' },
      { key: 'Home', action: 'Sets the slider to the minimum value.' },
      { key: 'End', action: 'Sets the slider to the maximum value.' },
      { key: 'Page Up', action: 'Increases the slider value by a larger step (optional).' },
      { key: 'Page Down', action: 'Decreases the slider value by a larger step (optional).' },
    ],
    nativeHtmlEquivalent: '<input type="range">',
    focusManagement:
      'Focus is placed on the slider thumb. The thumb is the only focusable element. Arrow keys adjust the value while focus remains on the thumb.',
    wcagCriteria: ['1.3.1', '2.1.1', '2.5.1', '4.1.2'],
    apgUrl: apgUrl('slider'),
    commonMistakes: [
      'Missing aria-valuenow, aria-valuemin, or aria-valuemax.',
      'Not updating aria-valuenow as the user adjusts the slider.',
      'Not providing aria-valuetext when the numeric value is not meaningful (e.g., day names).',
      'Not using native <input type="range"> when sufficient.',
      'Forgetting to provide keyboard support (arrow keys, Home, End).',
    ],
    useWhen:
      'Selecting a numeric value from a continuous range where an approximate value is acceptable (volume, brightness, price range). Prefer <input type="range"> when possible.',
    avoidWhen:
      'An exact numeric value is needed (use spinbutton/<input type="number">). Or the range is discrete with few options (use radio group or select).',
    complexity: 'medium',
  },

  // -------------------------------------------------------------------------
  // Spinbutton
  // -------------------------------------------------------------------------
  spinbutton: {
    id: 'spinbutton',
    name: 'Spinbutton',
    description:
      'An input widget that restricts its value to a set or range of discrete values, providing increment and decrement buttons.',
    roles: ['spinbutton'],
    requiredAttributes: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    optionalAttributes: ['aria-labelledby', 'aria-label', 'aria-valuetext', 'aria-required'],
    keyboardInteractions: [
      { key: 'Up Arrow', action: 'Increases the value by one step.' },
      { key: 'Down Arrow', action: 'Decreases the value by one step.' },
      { key: 'Home', action: 'Sets the value to the minimum.' },
      { key: 'End', action: 'Sets the value to the maximum.' },
      { key: 'Page Up', action: 'Increases the value by a larger step (optional).' },
      { key: 'Page Down', action: 'Decreases the value by a larger step (optional).' },
    ],
    nativeHtmlEquivalent: '<input type="number">',
    focusManagement:
      'Focus is on the spinbutton input field. Users can type a value directly or use arrow keys to increment/decrement.',
    wcagCriteria: ['1.3.1', '2.1.1', '4.1.2'],
    apgUrl: apgUrl('spinbutton'),
    commonMistakes: [
      'Missing aria-valuenow, aria-valuemin, or aria-valuemax.',
      'Not allowing direct text input in addition to arrow key adjustment.',
      'Not providing aria-valuetext when the numeric value represents something else (e.g., day of week).',
      'Forgetting Home/End key support to jump to min/max values.',
      'Not using native <input type="number"> when appropriate.',
    ],
    useWhen:
      'Inputting an exact numeric value within a range, with increment/decrement controls (quantity selectors, page number inputs). Prefer native <input type="number"> first.',
    avoidWhen:
      'The value is approximate (use slider). Or the value is free text that happens to be numeric like a phone number or zip code (use <input type="text" inputmode="numeric">).',
    complexity: 'medium',
  },

  // -------------------------------------------------------------------------
  // Switch
  // -------------------------------------------------------------------------
  switch: {
    id: 'switch',
    name: 'Switch',
    description:
      'A type of checkbox that represents on/off values, similar to a physical toggle switch.',
    roles: ['switch'],
    requiredAttributes: ['aria-checked'],
    optionalAttributes: ['aria-labelledby', 'aria-label', 'aria-disabled'],
    keyboardInteractions: [
      { key: 'Space', action: 'Toggles the switch between on (checked) and off (unchecked).' },
      {
        key: 'Enter',
        action: 'Toggles the switch between on and off (optional, but recommended).',
      },
    ],
    nativeHtmlEquivalent: '<input type="checkbox"> (with visual styling)',
    focusManagement:
      'Focus remains on the switch element after toggling. The switch participates in the normal Tab sequence.',
    wcagCriteria: ['1.3.1', '2.1.1', '4.1.2'],
    apgUrl: apgUrl('switch'),
    commonMistakes: [
      'Using a checkbox role instead of switch when the semantics are on/off.',
      'Forgetting aria-checked to communicate the current state.',
      'Using aria-checked="yes" instead of "true".',
      'Not supporting the Space key for toggling.',
      'Confusing switch with toggle button (switch is on/off; toggle button is pressed/not pressed).',
    ],
    useWhen:
      'An on/off setting that takes immediate effect (dark mode, notifications, feature toggles). Must visually look like a switch, not a checkbox.',
    avoidWhen:
      'The change does not take immediate effect and requires a submit action (use checkbox). Or for pressed/not-pressed semantics (use toggle button with aria-pressed).',
    complexity: 'low',
  },

  // -------------------------------------------------------------------------
  // Tabs (Tab Panel)
  // -------------------------------------------------------------------------
  tabs: {
    id: 'tabs',
    name: 'Tabs (Tab Panel)',
    description:
      'A set of layered sections of content (tab panels) where each panel is associated with a tab element. Only one panel is visible at a time.',
    roles: ['tablist', 'tab', 'tabpanel'],
    requiredAttributes: ['aria-selected', 'aria-controls', 'aria-labelledby'],
    optionalAttributes: ['aria-orientation', 'aria-haspopup', 'aria-label'],
    keyboardInteractions: [
      {
        key: 'Tab',
        action: 'Moves focus into the tablist on the active tab, then out to the tab panel.',
      },
      { key: 'Left Arrow', action: 'Moves focus to the previous tab. Wraps from first to last.' },
      { key: 'Right Arrow', action: 'Moves focus to the next tab. Wraps from last to first.' },
      {
        key: 'Space',
        action: 'Activates the focused tab if not automatically activated on focus.',
      },
      {
        key: 'Enter',
        action: 'Activates the focused tab if not automatically activated on focus.',
      },
      { key: 'Home', action: 'Moves focus to the first tab (optional).' },
      { key: 'End', action: 'Moves focus to the last tab (optional).' },
      {
        key: 'Delete',
        action: 'Closes/removes the focused tab if deletion is allowed (optional).',
      },
    ],
    focusManagement:
      'The tablist has a single Tab stop on the active tab. Arrow keys move focus between tabs. When a tab is activated, its associated panel becomes visible. Tab from the tablist moves focus to the tab panel content. For vertical tablists, Down/Up Arrow replaces Left/Right.',
    wcagCriteria: ['1.3.1', '2.1.1', '2.4.3', '4.1.2'],
    apgUrl: apgUrl('tabs'),
    commonMistakes: [
      'Making every tab a separate Tab stop instead of using arrow key navigation.',
      'Not setting aria-selected="true" on the active tab and "false" on all others.',
      'Missing aria-controls on tabs or aria-labelledby on tab panels.',
      'Not supporting Left/Right arrow navigation between tabs.',
      'Using anchor links styled as tabs without proper ARIA roles.',
      'Forgetting to show automatic activation: tabs should activate on focus when content can be displayed instantly.',
    ],
    useWhen:
      'Organising related content into panels where only one section is visible at a time, and all sections are loaded on the same page (settings pages, product detail sections).',
    avoidWhen:
      'Content should be linkable or bookmarkable separately (use separate pages/routes). Or when the tab panels contain very little content (consider a flat layout). Or for primary navigation (use <nav> with links).',
    complexity: 'medium',
  },

  // -------------------------------------------------------------------------
  // Table (Sortable)
  // -------------------------------------------------------------------------
  'table-sortable': {
    id: 'table-sortable',
    name: 'Table (Sortable)',
    description:
      'A static tabular structure with sortable columns. Unlike grid, a table is not an interactive widget — cells are not individually navigable.',
    roles: ['table', 'row', 'cell', 'rowheader', 'columnheader'],
    requiredAttributes: ['aria-labelledby'],
    optionalAttributes: [
      'aria-sort',
      'aria-colcount',
      'aria-rowcount',
      'aria-colindex',
      'aria-rowindex',
      'aria-describedby',
      'aria-label',
    ],
    keyboardInteractions: [
      { key: 'Enter', action: 'Activates a sortable column header to change the sort order.' },
      { key: 'Space', action: 'Activates a sortable column header to change the sort order.' },
    ],
    nativeHtmlEquivalent: '<table>',
    focusManagement:
      'The table itself is not focusable by convention. Sortable column headers are interactive buttons within the table. Focus follows normal Tab order for interactive elements in headers.',
    wcagCriteria: ['1.3.1', '1.3.2', '4.1.2'],
    apgUrl: apgUrl('table'),
    commonMistakes: [
      'Using role="grid" when the table is static and not interactively navigable.',
      'Not using aria-sort on sortable column headers to indicate current sort direction.',
      'Using div-based layouts instead of native <table>, <th>, <td> elements.',
      'Missing <caption> or aria-labelledby for the table name.',
      'Not using <th scope="col"> or <th scope="row"> for headers.',
    ],
    useWhen:
      'Displaying tabular data with sortable columns. Always prefer native <table> with <th>, <td> and proper scope attributes.',
    avoidWhen:
      'The data is interactively editable per-cell (use grid pattern instead). Or the data is a simple list (use <ul>/<ol>).',
    complexity: 'medium',
  },

  // -------------------------------------------------------------------------
  // Toolbar
  // -------------------------------------------------------------------------
  toolbar: {
    id: 'toolbar',
    name: 'Toolbar',
    description:
      'A container for grouping a set of controls such as buttons, menu buttons, or checkboxes into a single logical unit.',
    roles: ['toolbar'],
    requiredAttributes: ['aria-label'],
    optionalAttributes: ['aria-labelledby', 'aria-orientation', 'aria-controls'],
    keyboardInteractions: [
      { key: 'Left Arrow', action: 'Moves focus to the previous control in the toolbar.' },
      { key: 'Right Arrow', action: 'Moves focus to the next control in the toolbar.' },
      { key: 'Home', action: 'Moves focus to the first control in the toolbar.' },
      { key: 'End', action: 'Moves focus to the last control in the toolbar.' },
    ],
    focusManagement:
      'The toolbar has a single Tab stop using roving tabindex. Left/Right Arrow moves focus between controls. For vertical toolbars, Up/Down Arrow is used instead.',
    wcagCriteria: ['1.3.1', '2.1.1', '4.1.2'],
    apgUrl: apgUrl('toolbar'),
    commonMistakes: [
      'Making every control in the toolbar a separate Tab stop.',
      'Not implementing roving tabindex for arrow key navigation.',
      'Missing aria-label or aria-labelledby on the toolbar.',
      'Not specifying aria-orientation="vertical" for vertical toolbars.',
      'Including non-interactive content inside the toolbar.',
    ],
    useWhen:
      'Grouping a set of related controls (bold/italic/underline, zoom in/out/reset) so screen readers announce them as one unit and arrow keys move between them.',
    avoidWhen:
      'The controls are not logically related or are the only actions on the page. Or the toolbar would contain only one control.',
    complexity: 'medium',
  },

  // -------------------------------------------------------------------------
  // Tooltip
  // -------------------------------------------------------------------------
  tooltip: {
    id: 'tooltip',
    name: 'Tooltip',
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
    roles: ['tooltip'],
    requiredAttributes: ['aria-describedby'],
    optionalAttributes: [],
    keyboardInteractions: [{ key: 'Escape', action: 'Dismisses the tooltip.' }],
    focusManagement:
      'The tooltip does not receive focus. It appears when the trigger element receives focus and disappears when focus leaves or Escape is pressed. The trigger element has aria-describedby referencing the tooltip.',
    wcagCriteria: ['1.4.13', '2.1.1'],
    apgUrl: apgUrl('tooltip'),
    commonMistakes: [
      'Using tooltips for essential information that should be visible without interaction.',
      'Not showing the tooltip on keyboard focus (only on mouse hover).',
      'Not dismissing the tooltip on Escape key.',
      'Placing interactive content inside a tooltip (tooltips should contain only text).',
      'Not meeting WCAG 1.4.13 — tooltip must be hoverable, dismissible, and persistent.',
    ],
    useWhen:
      'Providing brief supplementary descriptions for icon buttons, abbreviations, or truncated text. Tooltip content must be non-essential.',
    avoidWhen:
      'The information is essential (make it visible inline). Or the content needs interactive elements like links (use a popover/dialog instead). Or a label is missing (use aria-label or visible label, not a tooltip as the only name).',
    complexity: 'low',
  },

  // -------------------------------------------------------------------------
  // Tree View
  // -------------------------------------------------------------------------
  'tree-view': {
    id: 'tree-view',
    name: 'Tree View',
    description:
      'A hierarchical list where items may have child items that can be expanded or collapsed, such as a file system navigator.',
    roles: ['tree', 'treeitem', 'group'],
    requiredAttributes: ['aria-expanded', 'aria-labelledby'],
    optionalAttributes: [
      'aria-selected',
      'aria-checked',
      'aria-multiselectable',
      'aria-orientation',
      'aria-level',
      'aria-setsize',
      'aria-posinset',
      'aria-label',
    ],
    keyboardInteractions: [
      {
        key: 'Right Arrow',
        action:
          'On a closed parent node, opens it. On an open parent, moves focus to first child. On end node, does nothing.',
      },
      {
        key: 'Left Arrow',
        action:
          'On an open parent node, closes it. On a child/end/closed node, moves focus to parent.',
      },
      { key: 'Down Arrow', action: 'Moves focus to the next visible treeitem.' },
      { key: 'Up Arrow', action: 'Moves focus to the previous visible treeitem.' },
      { key: 'Home', action: 'Moves focus to the first node in the tree.' },
      { key: 'End', action: 'Moves focus to the last visible node in the tree.' },
      { key: 'Enter', action: 'Activates the focused node (performs its default action).' },
      { key: 'Space', action: 'Toggles selection of the focused node (multi-select trees).' },
      {
        key: '* (asterisk)',
        action: 'Expands all siblings at the same level as the focused node (optional).',
      },
    ],
    focusManagement:
      'The tree has a single Tab stop. Arrow keys navigate between visible nodes. Focus follows a roving tabindex pattern. In single-select trees, selection may follow focus. In multi-select trees, use Space and Shift modifiers.',
    wcagCriteria: ['1.3.1', '2.1.1', '2.4.3', '4.1.2'],
    apgUrl: apgUrl('treeview'),
    commonMistakes: [
      'Not using role="group" to wrap child treeitems under parent nodes.',
      'Missing aria-expanded on parent nodes.',
      'Not implementing Right/Left arrow to expand/collapse and navigate hierarchy.',
      'Making every treeitem a Tab stop instead of using a single Tab stop with arrow navigation.',
      'Confusing tree view with nested lists — tree views require interactive keyboard navigation.',
      'Not using aria-level, aria-setsize, and aria-posinset for dynamically loaded trees.',
    ],
    useWhen:
      'Displaying hierarchical data that users need to browse and expand/collapse (file explorers, nested navigation menus with deeply nested sections, organisational charts).',
    avoidWhen:
      'The hierarchy is only two levels deep (use a disclosure/accordion pattern). Or the user needs to select from a flat list (use listbox). Or it is a navigation menu with only one level of submenu (use menubar or disclosure navigation).',
    complexity: 'high',
  },
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** Get a single pattern by its ID slug. Returns undefined if not found. */
export function getPattern(id: string): AriaPattern | undefined {
  return ARIA_PATTERNS[id];
}

/** Get all patterns as an array, sorted alphabetically by name. */
export function getAllPatterns(): AriaPattern[] {
  return Object.values(ARIA_PATTERNS).sort((a, b) => a.name.localeCompare(b.name));
}

/** Get all patterns that list the given ARIA role. */
export function getPatternsForRole(role: string): AriaPattern[] {
  const lower = role.toLowerCase();
  return Object.values(ARIA_PATTERNS).filter(p => p.roles.some(r => r.toLowerCase() === lower));
}
