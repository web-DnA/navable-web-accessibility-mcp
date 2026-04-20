/**
 * WCAG 2.1 + 2.2 Success Criteria — Single Source of Truth
 *
 * All 86 success criteria from WCAG 2.2 (including 4.1.1 Parsing, marked as removed).
 * Verified against the official W3C specifications:
 *   - https://www.w3.org/TR/WCAG22/
 *   - https://www.w3.org/TR/WCAG21/
 *
 * Each criterion includes EN 301 549 mapping, axe-core rule IDs,
 * testability classification, and developer guidance.
 *
 * Last verified: 2025-06-28
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WcagLevel = 'A' | 'AA' | 'AAA';
export type WcagVersion = '2.0' | '2.1' | '2.2';
export type WcagPrinciple = 'perceivable' | 'operable' | 'understandable' | 'robust';
export type Testability = 'automated' | 'semi-automated' | 'manual';

export interface WcagCriterion {
  /** Success criterion number, e.g. "1.1.1" */
  sc: string;
  /** Official name, e.g. "Non-text Content" */
  name: string;
  /** Conformance level */
  level: WcagLevel;
  /** WCAG version where this SC was introduced */
  version: WcagVersion;
  /** Which WCAG principle this SC belongs to */
  principle: WcagPrinciple;
  /** Parent guideline number + name */
  guideline: string;
  /** Concise description from the official spec */
  description: string;
  /** Link to the normative WCAG 2.2 spec */
  wcagUrl: string;
  /** Link to the "Understanding" document (practical guidance) */
  understandingUrl: string;
  /** Link to the "How to Meet" quick reference */
  howToMeetUrl: string;
  /** EN 301 549 clause reference (e.g. "9.1.1.1" for web content) */
  en301549: string;
  /** Whether automated tools can fully test this criterion */
  testability: Testability;
  /** axe-core rule IDs that map to this SC (empty for manual-only) */
  axeRules: string[];
  /** One actionable sentence for developers */
  developerNote: string;
  /** Key exceptions or notes from the spec */
  notes?: string;
  /** Whether this SC was removed in WCAG 2.2 (only 4.1.1) */
  removed?: boolean;
}

// ---------------------------------------------------------------------------
// URL Helpers
// ---------------------------------------------------------------------------

const WCAG_BASE = 'https://www.w3.org/TR/WCAG22';
const UNDERSTANDING_BASE = 'https://www.w3.org/WAI/WCAG22/Understanding';
const QUICKREF_BASE = 'https://www.w3.org/WAI/WCAG22/quickref';

function wcagUrl(slug: string): string {
  return `${WCAG_BASE}/#${slug}`;
}

function understandingUrl(slug: string): string {
  return `${UNDERSTANDING_BASE}/${slug}.html`;
}

function howToMeetUrl(slug: string): string {
  return `${QUICKREF_BASE}/#${slug}`;
}

// ---------------------------------------------------------------------------
// WCAG 2.2 Success Criteria — All 86 Criteria
// ---------------------------------------------------------------------------

export const WCAG_CRITERIA: Record<string, WcagCriterion> = {
  // =========================================================================
  // PRINCIPLE 1: PERCEIVABLE
  // =========================================================================

  // --- Guideline 1.1: Text Alternatives ---

  '1.1.1': {
    sc: '1.1.1',
    name: 'Non-text Content',
    level: 'A',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.1 Text Alternatives',
    description:
      'All non-text content that is presented to the user has a text alternative that serves the equivalent purpose.',
    wcagUrl: wcagUrl('non-text-content'),
    understandingUrl: understandingUrl('non-text-content'),
    howToMeetUrl: howToMeetUrl('non-text-content'),
    en301549: '9.1.1.1',
    testability: 'semi-automated',
    axeRules: [
      'image-alt',
      'input-image-alt',
      'area-alt',
      'object-alt',
      'svg-img-alt',
      'role-img-alt',
    ],
    developerNote:
      'Add descriptive alt text to images; use alt="" for decorative images; ensure all <img>, <svg>, <object>, and image <input> elements have text alternatives.',
    notes:
      'Exceptions: controls/inputs (covered by 4.1.2), time-based media (covered by 1.2), tests, sensory experiences, CAPTCHA, and pure decoration.',
  },

  // --- Guideline 1.2: Time-based Media ---

  '1.2.1': {
    sc: '1.2.1',
    name: 'Audio-only and Video-only (Prerecorded)',
    level: 'A',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.2 Time-based Media',
    description:
      'For prerecorded audio-only and prerecorded video-only media, an alternative is provided.',
    wcagUrl: wcagUrl('audio-only-and-video-only-prerecorded'),
    understandingUrl: understandingUrl('audio-only-and-video-only-prerecorded'),
    howToMeetUrl: howToMeetUrl('audio-only-and-video-only-prerecorded'),
    en301549: '9.1.2.1',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide a transcript for audio-only content and either a transcript or audio track for video-only content.',
  },

  '1.2.2': {
    sc: '1.2.2',
    name: 'Captions (Prerecorded)',
    level: 'A',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.2 Time-based Media',
    description: 'Captions are provided for all prerecorded audio content in synchronized media.',
    wcagUrl: wcagUrl('captions-prerecorded'),
    understandingUrl: understandingUrl('captions-prerecorded'),
    howToMeetUrl: howToMeetUrl('captions-prerecorded'),
    en301549: '9.1.2.2',
    testability: 'manual',
    axeRules: ['video-caption'],
    developerNote:
      'Add synchronized captions (Untertitel) to all prerecorded videos with audio. Use <track kind="captions"> for HTML5 video.',
    notes: 'Exception: when the media is a labeled alternative for text.',
  },

  '1.2.3': {
    sc: '1.2.3',
    name: 'Audio Description or Media Alternative (Prerecorded)',
    level: 'A',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.2 Time-based Media',
    description:
      'An alternative for time-based media or audio description of the prerecorded video content is provided for synchronized media.',
    wcagUrl: wcagUrl('audio-description-or-media-alternative-prerecorded'),
    understandingUrl: understandingUrl('audio-description-or-media-alternative-prerecorded'),
    howToMeetUrl: howToMeetUrl('audio-description-or-media-alternative-prerecorded'),
    en301549: '9.1.2.3',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide audio description or a full text transcript for prerecorded video with synchronized audio.',
  },

  '1.2.4': {
    sc: '1.2.4',
    name: 'Captions (Live)',
    level: 'AA',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.2 Time-based Media',
    description: 'Captions are provided for all live audio content in synchronized media.',
    wcagUrl: wcagUrl('captions-live'),
    understandingUrl: understandingUrl('captions-live'),
    howToMeetUrl: howToMeetUrl('captions-live'),
    en301549: '9.1.2.4',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide real-time captions for live audio content in synchronized media (e.g., live streams, webinars).',
  },

  '1.2.5': {
    sc: '1.2.5',
    name: 'Audio Description (Prerecorded)',
    level: 'AA',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.2 Time-based Media',
    description:
      'Audio description is provided for all prerecorded video content in synchronized media.',
    wcagUrl: wcagUrl('audio-description-prerecorded'),
    understandingUrl: understandingUrl('audio-description-prerecorded'),
    howToMeetUrl: howToMeetUrl('audio-description-prerecorded'),
    en301549: '9.1.2.5',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Add an audio description track (Audiodeskription) to prerecorded videos describing important visual content.',
  },

  '1.2.6': {
    sc: '1.2.6',
    name: 'Sign Language (Prerecorded)',
    level: 'AAA',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.2 Time-based Media',
    description:
      'Sign language interpretation is provided for all prerecorded audio content in synchronized media.',
    wcagUrl: wcagUrl('sign-language-prerecorded'),
    understandingUrl: understandingUrl('sign-language-prerecorded'),
    howToMeetUrl: howToMeetUrl('sign-language-prerecorded'),
    en301549: '9.1.2.6',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide sign language interpretation (Gebärdensprache) for prerecorded audio in synchronized media.',
  },

  '1.2.7': {
    sc: '1.2.7',
    name: 'Extended Audio Description (Prerecorded)',
    level: 'AAA',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.2 Time-based Media',
    description:
      'Where pauses in foreground audio are insufficient to allow audio descriptions to convey the sense of the video, extended audio description is provided.',
    wcagUrl: wcagUrl('extended-audio-description-prerecorded'),
    understandingUrl: understandingUrl('extended-audio-description-prerecorded'),
    howToMeetUrl: howToMeetUrl('extended-audio-description-prerecorded'),
    en301549: '9.1.2.7',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Pause video playback to insert extended audio descriptions when standard pauses are insufficient.',
  },

  '1.2.8': {
    sc: '1.2.8',
    name: 'Media Alternative (Prerecorded)',
    level: 'AAA',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.2 Time-based Media',
    description:
      'An alternative for time-based media is provided for all prerecorded synchronized media and for all prerecorded video-only media.',
    wcagUrl: wcagUrl('media-alternative-prerecorded'),
    understandingUrl: understandingUrl('media-alternative-prerecorded'),
    howToMeetUrl: howToMeetUrl('media-alternative-prerecorded'),
    en301549: '9.1.2.8',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide a full text alternative (transcript with visual descriptions) for all prerecorded synchronized and video-only media.',
  },

  '1.2.9': {
    sc: '1.2.9',
    name: 'Audio-only (Live)',
    level: 'AAA',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.2 Time-based Media',
    description:
      'An alternative for time-based media that presents equivalent information for live audio-only content is provided.',
    wcagUrl: wcagUrl('audio-only-live'),
    understandingUrl: understandingUrl('audio-only-live'),
    howToMeetUrl: howToMeetUrl('audio-only-live'),
    en301549: '9.1.2.9',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide a real-time text alternative for live audio-only content (e.g., live captioning of a speech).',
  },

  // --- Guideline 1.3: Adaptable ---

  '1.3.1': {
    sc: '1.3.1',
    name: 'Info and Relationships',
    level: 'A',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.3 Adaptable',
    description:
      'Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.',
    wcagUrl: wcagUrl('info-and-relationships'),
    understandingUrl: understandingUrl('info-and-relationships'),
    howToMeetUrl: howToMeetUrl('info-and-relationships'),
    en301549: '9.1.3.1',
    testability: 'semi-automated',
    axeRules: [
      'definition-list',
      'dlitem',
      'heading-order',
      'list',
      'listitem',
      'th-has-data-cells',
      'td-has-header',
      'table-fake-caption',
      'p-as-heading',
      'landmark-one-main',
      'region',
    ],
    developerNote:
      'Use semantic HTML to convey structure: headings for sections, <table> with <th> for data, <ul>/<ol> for lists, <fieldset>/<legend> for form groups, landmarks for page regions.',
  },

  '1.3.2': {
    sc: '1.3.2',
    name: 'Meaningful Sequence',
    level: 'A',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.3 Adaptable',
    description:
      'When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.',
    wcagUrl: wcagUrl('meaningful-sequence'),
    understandingUrl: understandingUrl('meaningful-sequence'),
    howToMeetUrl: howToMeetUrl('meaningful-sequence'),
    en301549: '9.1.3.2',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      'Ensure DOM order matches visual order. Avoid using CSS to rearrange content in a way that changes meaning when read linearly.',
  },

  '1.3.3': {
    sc: '1.3.3',
    name: 'Sensory Characteristics',
    level: 'A',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.3 Adaptable',
    description:
      'Instructions provided for understanding and operating content do not rely solely on sensory characteristics such as shape, color, size, visual location, orientation, or sound.',
    wcagUrl: wcagUrl('sensory-characteristics'),
    understandingUrl: understandingUrl('sensory-characteristics'),
    howToMeetUrl: howToMeetUrl('sensory-characteristics'),
    en301549: '9.1.3.3',
    testability: 'manual',
    axeRules: [],
    developerNote:
      "Don't rely on shape, color, size, or position alone for instructions. Instead of 'click the green button', say 'click the Submit button'.",
  },

  '1.3.4': {
    sc: '1.3.4',
    name: 'Orientation',
    level: 'AA',
    version: '2.1',
    principle: 'perceivable',
    guideline: '1.3 Adaptable',
    description:
      'Content does not restrict its view and operation to a single display orientation, such as portrait or landscape, unless a specific display orientation is essential.',
    wcagUrl: wcagUrl('orientation'),
    understandingUrl: understandingUrl('orientation'),
    howToMeetUrl: howToMeetUrl('orientation'),
    en301549: '9.1.3.4',
    testability: 'semi-automated',
    axeRules: ['css-orientation-lock'],
    developerNote:
      "Don't lock the display to portrait or landscape. Remove CSS orientation locks unless the content requires a specific orientation (e.g., a piano app).",
    notes: 'Essential exceptions: bank checks, piano apps, projector slides.',
  },

  '1.3.5': {
    sc: '1.3.5',
    name: 'Identify Input Purpose',
    level: 'AA',
    version: '2.1',
    principle: 'perceivable',
    guideline: '1.3 Adaptable',
    description:
      'The purpose of each input field collecting information about the user can be programmatically determined when the input field serves a purpose identified in the Input Purposes for User Interface Components section.',
    wcagUrl: wcagUrl('identify-input-purpose'),
    understandingUrl: understandingUrl('identify-input-purpose'),
    howToMeetUrl: howToMeetUrl('identify-input-purpose'),
    en301549: '9.1.3.5',
    testability: 'automated',
    axeRules: ['autocomplete-valid'],
    developerNote:
      'Add correct autocomplete attributes to user input fields (e.g., autocomplete="name", autocomplete="email") so browsers and assistive tech can autofill.',
  },

  '1.3.6': {
    sc: '1.3.6',
    name: 'Identify Purpose',
    level: 'AAA',
    version: '2.1',
    principle: 'perceivable',
    guideline: '1.3 Adaptable',
    description:
      'In content implemented using markup languages, the purpose of user interface components, icons, and regions can be programmatically determined.',
    wcagUrl: wcagUrl('identify-purpose'),
    understandingUrl: understandingUrl('identify-purpose'),
    howToMeetUrl: howToMeetUrl('identify-purpose'),
    en301549: '9.1.3.6',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Use ARIA landmarks, semantic HTML roles, and standard icon conventions so user agents can identify the purpose of UI components and regions.',
  },

  // --- Guideline 1.4: Distinguishable ---

  '1.4.1': {
    sc: '1.4.1',
    name: 'Use of Color',
    level: 'A',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    description:
      'Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.',
    wcagUrl: wcagUrl('use-of-color'),
    understandingUrl: understandingUrl('use-of-color'),
    howToMeetUrl: howToMeetUrl('use-of-color'),
    en301549: '9.1.4.1',
    testability: 'semi-automated',
    axeRules: ['link-in-text-block'],
    developerNote:
      "Don't rely on color alone to convey meaning. Add text labels, icons, patterns, or underlines alongside color cues. Links in text need more than just color difference.",
  },

  '1.4.2': {
    sc: '1.4.2',
    name: 'Audio Control',
    level: 'A',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    description:
      'If any audio on a web page plays automatically for more than 3 seconds, either a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level.',
    wcagUrl: wcagUrl('audio-control'),
    understandingUrl: understandingUrl('audio-control'),
    howToMeetUrl: howToMeetUrl('audio-control'),
    en301549: '9.1.4.2',
    testability: 'semi-automated',
    axeRules: ['no-autoplay-audio'],
    developerNote:
      "Don't autoplay audio for more than 3 seconds. If you must, provide a pause/stop/mute control accessible at the top of the page.",
    notes: 'Non-interference requirement: failure can block use of the entire page.',
  },

  '1.4.3': {
    sc: '1.4.3',
    name: 'Contrast (Minimum)',
    level: 'AA',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    description:
      'The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for large text (3:1), incidental text, and logotypes.',
    wcagUrl: wcagUrl('contrast-minimum'),
    understandingUrl: understandingUrl('contrast-minimum'),
    howToMeetUrl: howToMeetUrl('contrast-minimum'),
    en301549: '9.1.4.3',
    testability: 'automated',
    axeRules: ['color-contrast'],
    developerNote:
      'Ensure text has at least 4.5:1 contrast against its background (3:1 for large text ≥18pt or ≥14pt bold). Check with a contrast checker tool.',
    notes: 'Exceptions: inactive UI components, pure decoration, logos.',
  },

  '1.4.4': {
    sc: '1.4.4',
    name: 'Resize Text',
    level: 'AA',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    description:
      'Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality.',
    wcagUrl: wcagUrl('resize-text'),
    understandingUrl: understandingUrl('resize-text'),
    howToMeetUrl: howToMeetUrl('resize-text'),
    en301549: '9.1.4.4',
    testability: 'semi-automated',
    axeRules: ['meta-viewport'],
    developerNote:
      "Use relative units (rem, em, %) for font sizes. Don't set maximum-scale=1 or user-scalable=no in the viewport meta tag. Test at 200% zoom.",
  },

  '1.4.5': {
    sc: '1.4.5',
    name: 'Images of Text',
    level: 'AA',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    description:
      'If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text.',
    wcagUrl: wcagUrl('images-of-text'),
    understandingUrl: understandingUrl('images-of-text'),
    howToMeetUrl: howToMeetUrl('images-of-text'),
    en301549: '9.1.4.5',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Use real text styled with CSS instead of images of text. Exceptions: logos and customizable images of text.',
    notes: 'Exceptions: customizable images of text and logotypes.',
  },

  '1.4.6': {
    sc: '1.4.6',
    name: 'Contrast (Enhanced)',
    level: 'AAA',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    description:
      'The visual presentation of text and images of text has a contrast ratio of at least 7:1, except for large text (4.5:1), incidental text, and logotypes.',
    wcagUrl: wcagUrl('contrast-enhanced'),
    understandingUrl: understandingUrl('contrast-enhanced'),
    howToMeetUrl: howToMeetUrl('contrast-enhanced'),
    en301549: '9.1.4.6',
    testability: 'automated',
    axeRules: ['color-contrast-enhanced'],
    developerNote:
      'For enhanced accessibility, aim for 7:1 contrast for normal text and 4.5:1 for large text.',
  },

  '1.4.7': {
    sc: '1.4.7',
    name: 'Low or No Background Audio',
    level: 'AAA',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    description:
      'For prerecorded audio-only content that contains primarily speech, background sounds are at least 20 dB lower than the foreground speech content, can be turned off, or are absent.',
    wcagUrl: wcagUrl('low-or-no-background-audio'),
    understandingUrl: understandingUrl('low-or-no-background-audio'),
    howToMeetUrl: howToMeetUrl('low-or-no-background-audio'),
    en301549: '9.1.4.7',
    testability: 'manual',
    axeRules: [],
    developerNote:
      "Keep background audio at least 20 dB lower than speech, provide a way to turn it off, or don't include background audio.",
  },

  '1.4.8': {
    sc: '1.4.8',
    name: 'Visual Presentation',
    level: 'AAA',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    description:
      'For the visual presentation of blocks of text, a mechanism is available to select foreground/background colors, set width ≤80 characters, avoid justified text, set line spacing ≥1.5, and resize text up to 200% without horizontal scrolling.',
    wcagUrl: wcagUrl('visual-presentation'),
    understandingUrl: understandingUrl('visual-presentation'),
    howToMeetUrl: howToMeetUrl('visual-presentation'),
    en301549: '9.1.4.8',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide mechanisms for users to customize text display: color, width (≤80 chars), no justification, line spacing (≥1.5x), and resizable without horizontal scroll.',
  },

  '1.4.9': {
    sc: '1.4.9',
    name: 'Images of Text (No Exception)',
    level: 'AAA',
    version: '2.0',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    description:
      'Images of text are only used for pure decoration or where a particular presentation of text is essential to the information being conveyed.',
    wcagUrl: wcagUrl('images-of-text-no-exception'),
    understandingUrl: understandingUrl('images-of-text-no-exception'),
    howToMeetUrl: howToMeetUrl('images-of-text-no-exception'),
    en301549: '9.1.4.9',
    testability: 'manual',
    axeRules: [],
    developerNote: 'Never use images of text except for logos. Use real text with CSS styling.',
    notes: 'Stricter than 1.4.5 — no customizable exception.',
  },

  '1.4.10': {
    sc: '1.4.10',
    name: 'Reflow',
    level: 'AA',
    version: '2.1',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    description:
      'Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for vertical scrolling content at a width of 320 CSS pixels, and for horizontal scrolling content at a height of 256 CSS pixels.',
    wcagUrl: wcagUrl('reflow'),
    understandingUrl: understandingUrl('reflow'),
    howToMeetUrl: howToMeetUrl('reflow'),
    en301549: '9.1.4.10',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      'Content must reflow at 320px width (equivalent to 400% zoom on 1280px viewport) without horizontal scrolling. Use responsive CSS, avoid fixed widths.',
    notes: 'Exception: content requiring 2D layout (data tables, maps, diagrams).',
  },

  '1.4.11': {
    sc: '1.4.11',
    name: 'Non-text Contrast',
    level: 'AA',
    version: '2.1',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    description:
      'The visual presentation of UI components and graphical objects have a contrast ratio of at least 3:1 against adjacent colors.',
    wcagUrl: wcagUrl('non-text-contrast'),
    understandingUrl: understandingUrl('non-text-contrast'),
    howToMeetUrl: howToMeetUrl('non-text-contrast'),
    en301549: '9.1.4.11',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      'Ensure UI controls (borders, focus indicators, icons) and meaningful graphical objects have at least 3:1 contrast against adjacent colors.',
    notes: 'Exceptions: inactive components, user-agent-determined appearance.',
  },

  '1.4.12': {
    sc: '1.4.12',
    name: 'Text Spacing',
    level: 'AA',
    version: '2.1',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    description:
      'No loss of content or functionality occurs when users override line height to 1.5x, paragraph spacing to 2x, letter spacing to 0.12x, and word spacing to 0.16x the font size.',
    wcagUrl: wcagUrl('text-spacing'),
    understandingUrl: understandingUrl('text-spacing'),
    howToMeetUrl: howToMeetUrl('text-spacing'),
    en301549: '9.1.4.12',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      "Don't use fixed-height containers that clip text when spacing is increased. Test with a text-spacing bookmarklet to verify no content is lost.",
    notes: "Exception: human languages/scripts that don't use these text properties.",
  },

  '1.4.13': {
    sc: '1.4.13',
    name: 'Content on Hover or Focus',
    level: 'AA',
    version: '2.1',
    principle: 'perceivable',
    guideline: '1.4 Distinguishable',
    description:
      'Where receiving and then removing pointer hover or keyboard focus triggers additional content to become visible and then hidden, the additional content is dismissible, hoverable, and persistent.',
    wcagUrl: wcagUrl('content-on-hover-or-focus'),
    understandingUrl: understandingUrl('content-on-hover-or-focus'),
    howToMeetUrl: howToMeetUrl('content-on-hover-or-focus'),
    en301549: '9.1.4.13',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Tooltips and popovers triggered by hover/focus must be: dismissible (Escape key), hoverable (user can move pointer over them), and persistent (stay visible until dismissed or trigger removed).',
    notes: 'Exception: user-agent-controlled content like native browser tooltips.',
  },

  // =========================================================================
  // PRINCIPLE 2: OPERABLE
  // =========================================================================

  // --- Guideline 2.1: Keyboard Accessible ---

  '2.1.1': {
    sc: '2.1.1',
    name: 'Keyboard',
    level: 'A',
    version: '2.0',
    principle: 'operable',
    guideline: '2.1 Keyboard Accessible',
    description:
      'All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.',
    wcagUrl: wcagUrl('keyboard'),
    understandingUrl: understandingUrl('keyboard'),
    howToMeetUrl: howToMeetUrl('keyboard'),
    en301549: '9.2.1.1',
    testability: 'semi-automated',
    axeRules: ['keyboard'],
    developerNote:
      'All interactive elements must be operable with keyboard alone (Tab, Enter, Space, Arrow keys, Escape). Avoid mouse-only interactions like drag-and-drop without keyboard alternatives.',
    notes: 'Exception: functions requiring path-dependent input (e.g., freehand drawing).',
  },

  '2.1.2': {
    sc: '2.1.2',
    name: 'No Keyboard Trap',
    level: 'A',
    version: '2.0',
    principle: 'operable',
    guideline: '2.1 Keyboard Accessible',
    description:
      'If keyboard focus can be moved to a component of the page using a keyboard interface, then focus can be moved away from that component using only a keyboard interface.',
    wcagUrl: wcagUrl('no-keyboard-trap'),
    understandingUrl: understandingUrl('no-keyboard-trap'),
    howToMeetUrl: howToMeetUrl('no-keyboard-trap'),
    en301549: '9.2.1.2',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      'Ensure users can Tab into and out of every component. Watch for focus traps in modals, embedded content (iframes), and custom widgets. If non-standard exit methods are needed, inform the user.',
    notes: 'Non-interference requirement: failure can block use of the entire page.',
  },

  '2.1.3': {
    sc: '2.1.3',
    name: 'Keyboard (No Exception)',
    level: 'AAA',
    version: '2.0',
    principle: 'operable',
    guideline: '2.1 Keyboard Accessible',
    description:
      'All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.',
    wcagUrl: wcagUrl('keyboard-no-exception'),
    understandingUrl: understandingUrl('keyboard-no-exception'),
    howToMeetUrl: howToMeetUrl('keyboard-no-exception'),
    en301549: '9.2.1.3',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'All functionality must be keyboard operable — no exceptions, not even path-dependent input.',
    notes: 'Stricter than 2.1.1 — no path-dependent exception.',
  },

  '2.1.4': {
    sc: '2.1.4',
    name: 'Character Key Shortcuts',
    level: 'A',
    version: '2.1',
    principle: 'operable',
    guideline: '2.1 Keyboard Accessible',
    description:
      'If a keyboard shortcut is implemented using only letter, punctuation, number, or symbol characters, then the shortcut can be turned off, remapped, or only activates on focus.',
    wcagUrl: wcagUrl('character-key-shortcuts'),
    understandingUrl: understandingUrl('character-key-shortcuts'),
    howToMeetUrl: howToMeetUrl('character-key-shortcuts'),
    en301549: '9.2.1.4',
    testability: 'manual',
    axeRules: ['accesskeys'],
    developerNote:
      "If you use single-character keyboard shortcuts (e.g., 'S' for search), provide a way to turn them off, remap them, or only activate them when the relevant component has focus.",
  },

  // --- Guideline 2.2: Enough Time ---

  '2.2.1': {
    sc: '2.2.1',
    name: 'Timing Adjustable',
    level: 'A',
    version: '2.0',
    principle: 'operable',
    guideline: '2.2 Enough Time',
    description:
      'For each time limit set by the content, the user can turn off, adjust, or extend the time limit.',
    wcagUrl: wcagUrl('timing-adjustable'),
    understandingUrl: understandingUrl('timing-adjustable'),
    howToMeetUrl: howToMeetUrl('timing-adjustable'),
    en301549: '9.2.2.1',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Allow users to turn off, adjust, or extend time limits. Warn before expiry and give at least 20 seconds to extend with a simple action.',
    notes: 'Exceptions: real-time events, essential time limits, and limits longer than 20 hours.',
  },

  '2.2.2': {
    sc: '2.2.2',
    name: 'Pause, Stop, Hide',
    level: 'A',
    version: '2.0',
    principle: 'operable',
    guideline: '2.2 Enough Time',
    description:
      'For moving, blinking, scrolling, or auto-updating information, there is a mechanism for the user to pause, stop, or hide it.',
    wcagUrl: wcagUrl('pause-stop-hide'),
    understandingUrl: understandingUrl('pause-stop-hide'),
    howToMeetUrl: howToMeetUrl('pause-stop-hide'),
    en301549: '9.2.2.2',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      'Provide pause/stop/hide controls for carousels, auto-scrolling, animations, and auto-updating content (e.g., live feeds) that last more than 5 seconds.',
    notes:
      'Non-interference requirement. Applies to moving/blinking content shown in parallel with other content.',
  },

  '2.2.3': {
    sc: '2.2.3',
    name: 'No Timing',
    level: 'AAA',
    version: '2.0',
    principle: 'operable',
    guideline: '2.2 Enough Time',
    description:
      'Timing is not an essential part of the event or activity presented by the content.',
    wcagUrl: wcagUrl('no-timing'),
    understandingUrl: understandingUrl('no-timing'),
    howToMeetUrl: howToMeetUrl('no-timing'),
    en301549: '9.2.2.3',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Remove all time limits from content unless they are part of real-time events or non-interactive synchronized media.',
    notes: 'Exceptions: non-interactive synchronized media and real-time events.',
  },

  '2.2.4': {
    sc: '2.2.4',
    name: 'Interruptions',
    level: 'AAA',
    version: '2.0',
    principle: 'operable',
    guideline: '2.2 Enough Time',
    description:
      'Interruptions can be postponed or suppressed by the user, except interruptions involving an emergency.',
    wcagUrl: wcagUrl('interruptions'),
    understandingUrl: understandingUrl('interruptions'),
    howToMeetUrl: howToMeetUrl('interruptions'),
    en301549: '9.2.2.4',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Allow users to postpone or suppress notifications and interruptions. Exception: emergencies.',
  },

  '2.2.5': {
    sc: '2.2.5',
    name: 'Re-authenticating',
    level: 'AAA',
    version: '2.0',
    principle: 'operable',
    guideline: '2.2 Enough Time',
    description:
      'When an authenticated session expires, the user can continue the activity without loss of data after re-authenticating.',
    wcagUrl: wcagUrl('re-authenticating'),
    understandingUrl: understandingUrl('re-authenticating'),
    howToMeetUrl: howToMeetUrl('re-authenticating'),
    en301549: '9.2.2.5',
    testability: 'manual',
    axeRules: [],
    developerNote:
      "Preserve user data (unsaved form content) when session expires. After re-login, restore the user's place and data.",
  },

  '2.2.6': {
    sc: '2.2.6',
    name: 'Timeouts',
    level: 'AAA',
    version: '2.1',
    principle: 'operable',
    guideline: '2.2 Enough Time',
    description:
      'Users are warned of the duration of any user inactivity that could cause data loss, unless the data is preserved for more than 20 hours.',
    wcagUrl: wcagUrl('timeouts'),
    understandingUrl: understandingUrl('timeouts'),
    howToMeetUrl: howToMeetUrl('timeouts'),
    en301549: '9.2.2.6',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Warn users about inactivity timeouts at the start of the process, or preserve data for at least 20 hours.',
    notes: 'Privacy regulations may affect data preservation approaches.',
  },

  // --- Guideline 2.3: Seizures and Physical Reactions ---

  '2.3.1': {
    sc: '2.3.1',
    name: 'Three Flashes or Below Threshold',
    level: 'A',
    version: '2.0',
    principle: 'operable',
    guideline: '2.3 Seizures and Physical Reactions',
    description:
      'Web pages do not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds.',
    wcagUrl: wcagUrl('three-flashes-or-below-threshold'),
    understandingUrl: understandingUrl('three-flashes-or-below-threshold'),
    howToMeetUrl: howToMeetUrl('three-flashes-or-below-threshold'),
    en301549: '9.2.3.1',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      'Avoid content that flashes more than 3 times per second. This is critical — flashing content can trigger seizures in people with photosensitive epilepsy.',
    notes: 'Non-interference requirement: failure can block use of the entire page.',
  },

  '2.3.2': {
    sc: '2.3.2',
    name: 'Three Flashes',
    level: 'AAA',
    version: '2.0',
    principle: 'operable',
    guideline: '2.3 Seizures and Physical Reactions',
    description:
      'Web pages do not contain anything that flashes more than three times in any one second period.',
    wcagUrl: wcagUrl('three-flashes'),
    understandingUrl: understandingUrl('three-flashes'),
    howToMeetUrl: howToMeetUrl('three-flashes'),
    en301549: '9.2.3.2',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      'No flashing content at all above 3 times per second — stricter than 2.3.1 with no threshold exception.',
  },

  '2.3.3': {
    sc: '2.3.3',
    name: 'Animation from Interactions',
    level: 'AAA',
    version: '2.1',
    principle: 'operable',
    guideline: '2.3 Seizures and Physical Reactions',
    description:
      'Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed.',
    wcagUrl: wcagUrl('animation-from-interactions'),
    understandingUrl: understandingUrl('animation-from-interactions'),
    howToMeetUrl: howToMeetUrl('animation-from-interactions'),
    en301549: '9.2.3.3',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Respect prefers-reduced-motion media query. Provide a way to disable non-essential motion animations triggered by user interaction.',
  },

  // --- Guideline 2.4: Navigable ---

  '2.4.1': {
    sc: '2.4.1',
    name: 'Bypass Blocks',
    level: 'A',
    version: '2.0',
    principle: 'operable',
    guideline: '2.4 Navigable',
    description:
      'A mechanism is available to bypass blocks of content that are repeated on multiple web pages.',
    wcagUrl: wcagUrl('bypass-blocks'),
    understandingUrl: understandingUrl('bypass-blocks'),
    howToMeetUrl: howToMeetUrl('bypass-blocks'),
    en301549: '9.2.4.1',
    testability: 'semi-automated',
    axeRules: ['bypass'],
    developerNote:
      "Add a 'Skip to main content' link (Sprungnavigation) as the first focusable element, and use landmark regions (<header>, <nav>, <main>, <footer>).",
  },

  '2.4.2': {
    sc: '2.4.2',
    name: 'Page Titled',
    level: 'A',
    version: '2.0',
    principle: 'operable',
    guideline: '2.4 Navigable',
    description: 'Web pages have titles that describe topic or purpose.',
    wcagUrl: wcagUrl('page-titled'),
    understandingUrl: understandingUrl('page-titled'),
    howToMeetUrl: howToMeetUrl('page-titled'),
    en301549: '9.2.4.2',
    testability: 'automated',
    axeRules: ['document-title'],
    developerNote:
      'Every page must have a descriptive <title> element. For SPAs, update the title on each route change.',
  },

  '2.4.3': {
    sc: '2.4.3',
    name: 'Focus Order',
    level: 'A',
    version: '2.0',
    principle: 'operable',
    guideline: '2.4 Navigable',
    description:
      'If a web page can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.',
    wcagUrl: wcagUrl('focus-order'),
    understandingUrl: understandingUrl('focus-order'),
    howToMeetUrl: howToMeetUrl('focus-order'),
    en301549: '9.2.4.3',
    testability: 'semi-automated',
    axeRules: ['tabindex', 'focus-order-semantics'],
    developerNote:
      'Ensure Tab order follows a logical sequence matching the visual layout. Avoid positive tabindex values. Use DOM order to control focus sequence.',
  },

  '2.4.4': {
    sc: '2.4.4',
    name: 'Link Purpose (In Context)',
    level: 'A',
    version: '2.0',
    principle: 'operable',
    guideline: '2.4 Navigable',
    description:
      'The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined link context.',
    wcagUrl: wcagUrl('link-purpose-in-context'),
    understandingUrl: understandingUrl('link-purpose-in-context'),
    howToMeetUrl: howToMeetUrl('link-purpose-in-context'),
    en301549: '9.2.4.4',
    testability: 'semi-automated',
    axeRules: ['link-name'],
    developerNote:
      "Make link text descriptive. Avoid 'click here', 'read more', 'hier klicken', 'weiterlesen'. Use aria-label or aria-labelledby when link text alone is ambiguous.",
  },

  '2.4.5': {
    sc: '2.4.5',
    name: 'Multiple Ways',
    level: 'AA',
    version: '2.0',
    principle: 'operable',
    guideline: '2.4 Navigable',
    description:
      'More than one way is available to locate a web page within a set of web pages except where the web page is the result of, or a step in, a process.',
    wcagUrl: wcagUrl('multiple-ways'),
    understandingUrl: understandingUrl('multiple-ways'),
    howToMeetUrl: howToMeetUrl('multiple-ways'),
    en301549: '9.2.4.5',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide at least two ways to find pages: navigation menu, search, sitemap, table of contents, or links between related pages.',
  },

  '2.4.6': {
    sc: '2.4.6',
    name: 'Headings and Labels',
    level: 'AA',
    version: '2.0',
    principle: 'operable',
    guideline: '2.4 Navigable',
    description: 'Headings and labels describe topic or purpose.',
    wcagUrl: wcagUrl('headings-and-labels'),
    understandingUrl: understandingUrl('headings-and-labels'),
    howToMeetUrl: howToMeetUrl('headings-and-labels'),
    en301549: '9.2.4.6',
    testability: 'semi-automated',
    axeRules: ['empty-heading', 'page-has-heading-one'],
    developerNote:
      "Headings must describe the content that follows. Labels must describe the purpose of the form control. Don't use empty headings or vague labels.",
  },

  '2.4.7': {
    sc: '2.4.7',
    name: 'Focus Visible',
    level: 'AA',
    version: '2.0',
    principle: 'operable',
    guideline: '2.4 Navigable',
    description:
      'Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.',
    wcagUrl: wcagUrl('focus-visible'),
    understandingUrl: understandingUrl('focus-visible'),
    howToMeetUrl: howToMeetUrl('focus-visible'),
    en301549: '9.2.4.7',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      'Never set outline: none without providing a visible alternative focus indicator. Use :focus-visible for custom focus styles that are clearly visible.',
  },

  '2.4.8': {
    sc: '2.4.8',
    name: 'Location',
    level: 'AAA',
    version: '2.0',
    principle: 'operable',
    guideline: '2.4 Navigable',
    description: "Information about the user's location within a set of web pages is available.",
    wcagUrl: wcagUrl('location'),
    understandingUrl: understandingUrl('location'),
    howToMeetUrl: howToMeetUrl('location'),
    en301549: '9.2.4.8',
    testability: 'manual',
    axeRules: [],
    developerNote:
      "Provide breadcrumb navigation, highlight the current page in navigation, or indicate the user's location within a multi-step process.",
  },

  '2.4.9': {
    sc: '2.4.9',
    name: 'Link Purpose (Link Only)',
    level: 'AAA',
    version: '2.0',
    principle: 'operable',
    guideline: '2.4 Navigable',
    description:
      'A mechanism is available to allow the purpose of each link to be identified from link text alone.',
    wcagUrl: wcagUrl('link-purpose-link-only'),
    understandingUrl: understandingUrl('link-purpose-link-only'),
    howToMeetUrl: howToMeetUrl('link-purpose-link-only'),
    en301549: '9.2.4.9',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      "Every link's purpose must be clear from its text alone — no reliance on surrounding context. Stricter than 2.4.4.",
  },

  '2.4.10': {
    sc: '2.4.10',
    name: 'Section Headings',
    level: 'AAA',
    version: '2.0',
    principle: 'operable',
    guideline: '2.4 Navigable',
    description: 'Section headings are used to organize the content.',
    wcagUrl: wcagUrl('section-headings'),
    understandingUrl: understandingUrl('section-headings'),
    howToMeetUrl: howToMeetUrl('section-headings'),
    en301549: '9.2.4.10',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Use headings to organize all content sections. Applies to written content, not UI components (covered by 4.1.2).',
  },

  '2.4.11': {
    sc: '2.4.11',
    name: 'Focus Not Obscured (Minimum)',
    level: 'AA',
    version: '2.2',
    principle: 'operable',
    guideline: '2.4 Navigable',
    description:
      'When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content.',
    wcagUrl: wcagUrl('focus-not-obscured-minimum'),
    understandingUrl: understandingUrl('focus-not-obscured-minimum'),
    howToMeetUrl: howToMeetUrl('focus-not-obscured-minimum'),
    en301549: '9.2.4.11',
    testability: 'semi-automated',
    axeRules: [],
    notes: 'New in WCAG 2.2. Not yet required by EN 301 549 v3.2.1. Recommended best practice.',
    developerNote:
      'Ensure focused elements are not completely hidden behind sticky headers, cookie banners, or other overlapping content. At least part of the focused element must be visible.',
  },

  '2.4.12': {
    sc: '2.4.12',
    name: 'Focus Not Obscured (Enhanced)',
    level: 'AAA',
    version: '2.2',
    principle: 'operable',
    guideline: '2.4 Navigable',
    description:
      'When a user interface component receives keyboard focus, no part of the component is hidden by author-created content.',
    wcagUrl: wcagUrl('focus-not-obscured-enhanced'),
    understandingUrl: understandingUrl('focus-not-obscured-enhanced'),
    howToMeetUrl: howToMeetUrl('focus-not-obscured-enhanced'),
    en301549: '9.2.4.12',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      'The entire focused element must be visible — not even partially hidden. Stricter than 2.4.11.',
  },

  '2.4.13': {
    sc: '2.4.13',
    name: 'Focus Appearance',
    level: 'AAA',
    version: '2.2',
    principle: 'operable',
    guideline: '2.4 Navigable',
    description:
      'When the keyboard focus indicator is visible, the focus indicator area is at least as large as a 2 CSS pixel thick perimeter of the unfocused component, and has a contrast ratio of at least 3:1 between focused and unfocused states.',
    wcagUrl: wcagUrl('focus-appearance'),
    understandingUrl: understandingUrl('focus-appearance'),
    howToMeetUrl: howToMeetUrl('focus-appearance'),
    en301549: '9.2.4.13',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      'Focus indicators must be at least 2px thick, cover the full perimeter, and have 3:1 contrast between focused and unfocused states.',
    notes: 'Exceptions: user-agent-determined focus indicators, unmodified author styles.',
  },

  // --- Guideline 2.5: Input Modalities ---

  '2.5.1': {
    sc: '2.5.1',
    name: 'Pointer Gestures',
    level: 'A',
    version: '2.1',
    principle: 'operable',
    guideline: '2.5 Input Modalities',
    description:
      'All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture.',
    wcagUrl: wcagUrl('pointer-gestures'),
    understandingUrl: understandingUrl('pointer-gestures'),
    howToMeetUrl: howToMeetUrl('pointer-gestures'),
    en301549: '9.2.5.1',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide single-pointer alternatives for multi-touch gestures (pinch-to-zoom, swipe). E.g., add +/- buttons alongside pinch-to-zoom on a map.',
    notes: 'Exception: when the multipoint/path gesture is essential.',
  },

  '2.5.2': {
    sc: '2.5.2',
    name: 'Pointer Cancellation',
    level: 'A',
    version: '2.1',
    principle: 'operable',
    guideline: '2.5 Input Modalities',
    description:
      'For functionality that can be operated using a single pointer, at least one of the following is true: the down-event is not used, it can be aborted/undone, the up-event reverses it, or it is essential.',
    wcagUrl: wcagUrl('pointer-cancellation'),
    understandingUrl: understandingUrl('pointer-cancellation'),
    howToMeetUrl: howToMeetUrl('pointer-cancellation'),
    en301549: '9.2.5.2',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Trigger actions on the up-event (mouseup/touchend), not on the down-event (mousedown/touchstart). Allow users to cancel by moving the pointer away before releasing.',
  },

  '2.5.3': {
    sc: '2.5.3',
    name: 'Label in Name',
    level: 'A',
    version: '2.1',
    principle: 'operable',
    guideline: '2.5 Input Modalities',
    description:
      'For user interface components with labels that include text or images of text, the accessible name contains the text that is presented visually.',
    wcagUrl: wcagUrl('label-in-name'),
    understandingUrl: understandingUrl('label-in-name'),
    howToMeetUrl: howToMeetUrl('label-in-name'),
    en301549: '9.2.5.3',
    testability: 'automated',
    axeRules: ['label-content-name-mismatch'],
    developerNote:
      'The accessible name (aria-label, <label>) must contain the visible label text. Best practice: start the accessible name with the visible text.',
  },

  '2.5.4': {
    sc: '2.5.4',
    name: 'Motion Actuation',
    level: 'A',
    version: '2.1',
    principle: 'operable',
    guideline: '2.5 Input Modalities',
    description:
      'Functionality that can be operated by device motion or user motion can also be operated by user interface components, and responding to the motion can be disabled.',
    wcagUrl: wcagUrl('motion-actuation'),
    understandingUrl: understandingUrl('motion-actuation'),
    howToMeetUrl: howToMeetUrl('motion-actuation'),
    en301549: '9.2.5.4',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide UI button alternatives for shake-to-undo, tilt-to-scroll, etc. Allow disabling motion-triggered features to prevent accidental activation.',
    notes: 'Exceptions: accessibility-supported interfaces, essential motion functions.',
  },

  '2.5.5': {
    sc: '2.5.5',
    name: 'Target Size (Enhanced)',
    level: 'AAA',
    version: '2.1',
    principle: 'operable',
    guideline: '2.5 Input Modalities',
    description: 'The size of the target for pointer inputs is at least 44 by 44 CSS pixels.',
    wcagUrl: wcagUrl('target-size-enhanced'),
    understandingUrl: understandingUrl('target-size-enhanced'),
    howToMeetUrl: howToMeetUrl('target-size-enhanced'),
    en301549: '9.2.5.5',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      'Make all interactive targets at least 44×44 CSS pixels for enhanced touch accessibility.',
    notes: 'Exceptions: equivalent targets, inline targets, user-agent-controlled, essential.',
  },

  '2.5.6': {
    sc: '2.5.6',
    name: 'Concurrent Input Mechanisms',
    level: 'AAA',
    version: '2.1',
    principle: 'operable',
    guideline: '2.5 Input Modalities',
    description:
      'Web content does not restrict use of input modalities available on a platform except where the restriction is essential, required to ensure security, or required to respect user settings.',
    wcagUrl: wcagUrl('concurrent-input-mechanisms'),
    understandingUrl: understandingUrl('concurrent-input-mechanisms'),
    howToMeetUrl: howToMeetUrl('concurrent-input-mechanisms'),
    en301549: '9.2.5.6',
    testability: 'manual',
    axeRules: [],
    developerNote:
      "Don't restrict input to one modality. Allow users to switch freely between touch, mouse, keyboard, and other inputs.",
  },

  '2.5.7': {
    sc: '2.5.7',
    name: 'Dragging Movements',
    level: 'AA',
    version: '2.2',
    principle: 'operable',
    guideline: '2.5 Input Modalities',
    description:
      'All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent.',
    wcagUrl: wcagUrl('dragging-movements'),
    understandingUrl: understandingUrl('dragging-movements'),
    howToMeetUrl: howToMeetUrl('dragging-movements'),
    en301549: '9.2.5.7',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide click/tap alternatives for drag-and-drop. E.g., add up/down buttons to reorder items, use click-to-move instead of drag.',
    notes: 'New in WCAG 2.2. Exception: when dragging is essential to the functionality.',
  },

  '2.5.8': {
    sc: '2.5.8',
    name: 'Target Size (Minimum)',
    level: 'AA',
    version: '2.2',
    principle: 'operable',
    guideline: '2.5 Input Modalities',
    description:
      'The size of the target for pointer inputs is at least 24 by 24 CSS pixels, with exceptions for spacing, equivalent targets, inline targets, user-agent-controlled, and essential presentations.',
    wcagUrl: wcagUrl('target-size-minimum'),
    understandingUrl: understandingUrl('target-size-minimum'),
    howToMeetUrl: howToMeetUrl('target-size-minimum'),
    en301549: '9.2.5.8',
    testability: 'semi-automated',
    axeRules: ['target-size'],
    developerNote:
      "Make interactive targets at least 24×24 CSS pixels, or ensure undersized targets have enough spacing (24px circle around each target doesn't overlap others).",
    notes:
      'New in WCAG 2.2. Exceptions: spacing provides equivalent area, equivalent controls exist, inline targets, user-agent-controlled, and essential sizes.',
  },

  // =========================================================================
  // PRINCIPLE 3: UNDERSTANDABLE
  // =========================================================================

  // --- Guideline 3.1: Readable ---

  '3.1.1': {
    sc: '3.1.1',
    name: 'Language of Page',
    level: 'A',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.1 Readable',
    description: 'The default human language of each web page can be programmatically determined.',
    wcagUrl: wcagUrl('language-of-page'),
    understandingUrl: understandingUrl('language-of-page'),
    howToMeetUrl: howToMeetUrl('language-of-page'),
    en301549: '9.3.1.1',
    testability: 'automated',
    axeRules: ['html-has-lang', 'html-lang-valid'],
    developerNote:
      'Set a valid lang attribute on the <html> element (e.g., lang="de" for German, lang="en" for English). Must be a valid BCP 47 tag.',
  },

  '3.1.2': {
    sc: '3.1.2',
    name: 'Language of Parts',
    level: 'AA',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.1 Readable',
    description:
      'The human language of each passage or phrase in the content can be programmatically determined.',
    wcagUrl: wcagUrl('language-of-parts'),
    understandingUrl: understandingUrl('language-of-parts'),
    howToMeetUrl: howToMeetUrl('language-of-parts'),
    en301549: '9.3.1.2',
    testability: 'semi-automated',
    axeRules: ['valid-lang'],
    developerNote:
      'Mark language changes with the lang attribute (e.g., <span lang="en">Click here</span> within German content). Exceptions: proper names, technical terms, vernacular words.',
  },

  '3.1.3': {
    sc: '3.1.3',
    name: 'Unusual Words',
    level: 'AAA',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.1 Readable',
    description:
      'A mechanism is available for identifying specific definitions of words or phrases used in an unusual or restricted way, including idioms and jargon.',
    wcagUrl: wcagUrl('unusual-words'),
    understandingUrl: understandingUrl('unusual-words'),
    howToMeetUrl: howToMeetUrl('unusual-words'),
    en301549: '9.3.1.3',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide a glossary, inline definitions, or <dfn> elements for jargon, idioms, and technical terms.',
  },

  '3.1.4': {
    sc: '3.1.4',
    name: 'Abbreviations',
    level: 'AAA',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.1 Readable',
    description:
      'A mechanism for identifying the expanded form or meaning of abbreviations is available.',
    wcagUrl: wcagUrl('abbreviations'),
    understandingUrl: understandingUrl('abbreviations'),
    howToMeetUrl: howToMeetUrl('abbreviations'),
    en301549: '9.3.1.4',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Use <abbr title="..."> to expand abbreviations, or spell them out on first use (e.g., \'HTML (HyperText Markup Language)\').',
  },

  '3.1.5': {
    sc: '3.1.5',
    name: 'Reading Level',
    level: 'AAA',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.1 Readable',
    description:
      'When text requires reading ability more advanced than the lower secondary education level, supplemental content or a version that does not require reading ability more advanced than the lower secondary education level is available.',
    wcagUrl: wcagUrl('reading-level'),
    understandingUrl: understandingUrl('reading-level'),
    howToMeetUrl: howToMeetUrl('reading-level'),
    en301549: '9.3.1.5',
    testability: 'manual',
    axeRules: [],
    developerNote: 'Provide simplified versions of complex text using plain-language techniques.',
    notes:
      'AAA criterion. Leichte Sprache (Easy Language) is separately required for German federal public sector bodies under BITV 2.0 § 4.',
  },

  '3.1.6': {
    sc: '3.1.6',
    name: 'Pronunciation',
    level: 'AAA',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.1 Readable',
    description:
      'A mechanism is available for identifying specific pronunciation of words where meaning of the words, in context, is ambiguous without knowing the pronunciation.',
    wcagUrl: wcagUrl('pronunciation'),
    understandingUrl: understandingUrl('pronunciation'),
    howToMeetUrl: howToMeetUrl('pronunciation'),
    en301549: '9.3.1.6',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide pronunciation guides for words whose meaning is ambiguous without pronunciation context (e.g., homographs).',
  },

  // --- Guideline 3.2: Predictable ---

  '3.2.1': {
    sc: '3.2.1',
    name: 'On Focus',
    level: 'A',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.2 Predictable',
    description:
      'When any user interface component receives focus, it does not initiate a change of context.',
    wcagUrl: wcagUrl('on-focus'),
    understandingUrl: understandingUrl('on-focus'),
    howToMeetUrl: howToMeetUrl('on-focus'),
    en301549: '9.3.2.1',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      "Don't trigger navigation, form submission, or modal openings just because an element receives focus. Only change context on explicit user actions like click or Enter.",
  },

  '3.2.2': {
    sc: '3.2.2',
    name: 'On Input',
    level: 'A',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.2 Predictable',
    description:
      'Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised of the behavior before using the component.',
    wcagUrl: wcagUrl('on-input'),
    understandingUrl: understandingUrl('on-input'),
    howToMeetUrl: howToMeetUrl('on-input'),
    en301549: '9.3.2.2',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      "Don't auto-submit forms or navigate away when a user changes a select/radio/checkbox. If you must, warn the user in advance.",
  },

  '3.2.3': {
    sc: '3.2.3',
    name: 'Consistent Navigation',
    level: 'AA',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.2 Predictable',
    description:
      'Navigational mechanisms that are repeated on multiple web pages within a set of web pages occur in the same relative order each time they are repeated.',
    wcagUrl: wcagUrl('consistent-navigation'),
    understandingUrl: understandingUrl('consistent-navigation'),
    howToMeetUrl: howToMeetUrl('consistent-navigation'),
    en301549: '9.3.2.3',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Keep navigation menus, search bars, and other repeated elements in the same relative position across all pages.',
  },

  '3.2.4': {
    sc: '3.2.4',
    name: 'Consistent Identification',
    level: 'AA',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.2 Predictable',
    description:
      'Components that have the same functionality within a set of web pages are identified consistently.',
    wcagUrl: wcagUrl('consistent-identification'),
    understandingUrl: understandingUrl('consistent-identification'),
    howToMeetUrl: howToMeetUrl('consistent-identification'),
    en301549: '9.3.2.4',
    testability: 'manual',
    axeRules: [],
    developerNote:
      "Use the same labels for the same functions across pages. Don't call it 'Search' on one page and 'Find' on another.",
  },

  '3.2.5': {
    sc: '3.2.5',
    name: 'Change on Request',
    level: 'AAA',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.2 Predictable',
    description:
      'Changes of context are initiated only by user request or a mechanism is available to turn off such changes.',
    wcagUrl: wcagUrl('change-on-request'),
    understandingUrl: understandingUrl('change-on-request'),
    howToMeetUrl: howToMeetUrl('change-on-request'),
    en301549: '9.3.2.5',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Only change context (navigation, new windows, form submissions) when the user explicitly requests it, or provide a way to turn off automatic context changes.',
  },

  '3.2.6': {
    sc: '3.2.6',
    name: 'Consistent Help',
    level: 'A',
    version: '2.2',
    principle: 'understandable',
    guideline: '3.2 Predictable',
    description:
      'If a web page contains help mechanisms (human contact details, contact mechanism, self-help option, or automated contact mechanism) that are repeated on multiple pages, they occur in the same relative order.',
    wcagUrl: wcagUrl('consistent-help'),
    understandingUrl: understandingUrl('consistent-help'),
    howToMeetUrl: howToMeetUrl('consistent-help'),
    en301549: '9.3.2.6',
    testability: 'manual',
    axeRules: [],
    notes: 'New in WCAG 2.2. Not yet required by EN 301 549 v3.2.1. Recommended best practice.',
    developerNote:
      'Keep help links, contact information, chat widgets, and support mechanisms in the same position across all pages.',
  },

  // --- Guideline 3.3: Input Assistance ---

  '3.3.1': {
    sc: '3.3.1',
    name: 'Error Identification',
    level: 'A',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.3 Input Assistance',
    description:
      'If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.',
    wcagUrl: wcagUrl('error-identification'),
    understandingUrl: understandingUrl('error-identification'),
    howToMeetUrl: howToMeetUrl('error-identification'),
    en301549: '9.3.3.1',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      "When form validation fails, identify the field in error and describe the error in text. Don't rely on color alone. Use aria-describedby or aria-errormessage to associate error messages with fields.",
  },

  '3.3.2': {
    sc: '3.3.2',
    name: 'Labels or Instructions',
    level: 'A',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.3 Input Assistance',
    description: 'Labels or instructions are provided when content requires user input.',
    wcagUrl: wcagUrl('labels-or-instructions'),
    understandingUrl: understandingUrl('labels-or-instructions'),
    howToMeetUrl: howToMeetUrl('labels-or-instructions'),
    en301549: '9.3.3.2',
    testability: 'semi-automated',
    axeRules: ['label', 'select-name'],
    developerNote:
      "Every form input needs a visible <label> or clear instructions. Don't use placeholder text as the only label — it disappears on focus.",
  },

  '3.3.3': {
    sc: '3.3.3',
    name: 'Error Suggestion',
    level: 'AA',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.3 Input Assistance',
    description:
      'If an input error is automatically detected and suggestions for correction are known, then the suggestions are provided to the user.',
    wcagUrl: wcagUrl('error-suggestion'),
    understandingUrl: understandingUrl('error-suggestion'),
    howToMeetUrl: howToMeetUrl('error-suggestion'),
    en301549: '9.3.3.3',
    testability: 'manual',
    axeRules: [],
    developerNote:
      "When a form error is detected and you know how to fix it, suggest the fix (e.g., 'Date must be in DD.MM.YYYY format'). Exception: security-sensitive fields.",
  },

  '3.3.4': {
    sc: '3.3.4',
    name: 'Error Prevention (Legal, Financial, Data)',
    level: 'AA',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.3 Input Assistance',
    description:
      'For web pages that cause legal commitments or financial transactions, that modify or delete user data, or that submit test responses, submissions are reversible, checked for errors, or confirmable.',
    wcagUrl: wcagUrl('error-prevention-legal-financial-data'),
    understandingUrl: understandingUrl('error-prevention-legal-financial-data'),
    howToMeetUrl: howToMeetUrl('error-prevention-legal-financial-data'),
    en301549: '9.3.3.4',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'For legal/financial/data-modifying actions: allow undo, provide error checking before submission, or add a confirmation step (review page before final submit).',
  },

  '3.3.5': {
    sc: '3.3.5',
    name: 'Help',
    level: 'AAA',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.3 Input Assistance',
    description: 'Context-sensitive help is available.',
    wcagUrl: wcagUrl('help'),
    understandingUrl: understandingUrl('help'),
    howToMeetUrl: howToMeetUrl('help'),
    en301549: '9.3.3.5',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Provide context-sensitive help for complex forms (e.g., tooltips, help links next to fields, example inputs).',
  },

  '3.3.6': {
    sc: '3.3.6',
    name: 'Error Prevention (All)',
    level: 'AAA',
    version: '2.0',
    principle: 'understandable',
    guideline: '3.3 Input Assistance',
    description:
      'For web pages that require the user to submit information, submissions are reversible, checked for errors, or confirmable.',
    wcagUrl: wcagUrl('error-prevention-all'),
    understandingUrl: understandingUrl('error-prevention-all'),
    howToMeetUrl: howToMeetUrl('error-prevention-all'),
    en301549: '9.3.3.6',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'Allow undo, provide error checking, or add confirmation for all form submissions — not just legal/financial. Stricter than 3.3.4.',
  },

  '3.3.7': {
    sc: '3.3.7',
    name: 'Redundant Entry',
    level: 'A',
    version: '2.2',
    principle: 'understandable',
    guideline: '3.3 Input Assistance',
    description:
      'Information previously entered by or provided to the user that is required to be entered again in the same process is either auto-populated or available for the user to select.',
    wcagUrl: wcagUrl('redundant-entry'),
    understandingUrl: understandingUrl('redundant-entry'),
    howToMeetUrl: howToMeetUrl('redundant-entry'),
    en301549: '9.3.3.7',
    testability: 'manual',
    axeRules: [],
    developerNote:
      "Don't ask users to re-enter information they've already provided in the same process. Auto-fill or provide a selection (e.g., 'Shipping address same as billing').",
    notes:
      'New in WCAG 2.2. Exceptions: re-entering for security, when stored data is no longer valid, and essential re-entry.',
  },

  '3.3.8': {
    sc: '3.3.8',
    name: 'Accessible Authentication (Minimum)',
    level: 'AA',
    version: '2.2',
    principle: 'understandable',
    guideline: '3.3 Input Assistance',
    description:
      'A cognitive function test is not required for any step in an authentication process unless an alternative method, a mechanism to assist, object recognition, or personal content is provided.',
    wcagUrl: wcagUrl('accessible-authentication-minimum'),
    understandingUrl: understandingUrl('accessible-authentication-minimum'),
    howToMeetUrl: howToMeetUrl('accessible-authentication-minimum'),
    en301549: '9.3.3.8',
    testability: 'manual',
    axeRules: [],
    developerNote:
      "Don't require memorizing or transcribing passwords/codes for login. Support password managers (allow paste), provide alternative auth methods (magic links, biometrics), or use object recognition.",
    notes: 'New in WCAG 2.2. Object recognition and personal content are allowed exceptions.',
  },

  '3.3.9': {
    sc: '3.3.9',
    name: 'Accessible Authentication (Enhanced)',
    level: 'AAA',
    version: '2.2',
    principle: 'understandable',
    guideline: '3.3 Input Assistance',
    description:
      'A cognitive function test is not required for any step in an authentication process unless an alternative method or a mechanism to assist is provided.',
    wcagUrl: wcagUrl('accessible-authentication-enhanced'),
    understandingUrl: understandingUrl('accessible-authentication-enhanced'),
    howToMeetUrl: howToMeetUrl('accessible-authentication-enhanced'),
    en301549: '9.3.3.9',
    testability: 'manual',
    axeRules: [],
    developerNote:
      'No cognitive function tests for authentication — even object recognition and personal content are not allowed as exceptions. Stricter than 3.3.8.',
    notes: 'Stricter than 3.3.8 — no object recognition or personal content exceptions.',
  },

  // =========================================================================
  // PRINCIPLE 4: ROBUST
  // =========================================================================

  // --- Guideline 4.1: Compatible ---

  '4.1.1': {
    sc: '4.1.1',
    name: 'Parsing',
    level: 'A',
    version: '2.0',
    principle: 'robust',
    guideline: '4.1 Compatible',
    description:
      'This criterion was originally adopted to address problems that assistive technology had directly parsing HTML. It is obsolete and removed in WCAG 2.2.',
    wcagUrl: wcagUrl('parsing'),
    understandingUrl: understandingUrl('parsing'),
    howToMeetUrl: howToMeetUrl('parsing'),
    en301549: '9.4.1.1',
    testability: 'automated',
    axeRules: [],
    developerNote:
      'Obsolete in WCAG 2.2 but still legally referenced by EN 301 549 v3.2.1. navable auto-passes this criterion. Issues like duplicate IDs are covered by 4.1.2.',
    notes:
      'Removed in WCAG 2.2 but EN 301 549 v3.2.1 clause 9.4.1.1 remains legally in force. Auto-pass for modern HTML content.',
    removed: true,
  },

  '4.1.2': {
    sc: '4.1.2',
    name: 'Name, Role, Value',
    level: 'A',
    version: '2.0',
    principle: 'robust',
    guideline: '4.1 Compatible',
    description:
      'For all user interface components, the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies.',
    wcagUrl: wcagUrl('name-role-value'),
    understandingUrl: understandingUrl('name-role-value'),
    howToMeetUrl: howToMeetUrl('name-role-value'),
    en301549: '9.4.1.2',
    testability: 'semi-automated',
    axeRules: [
      'aria-allowed-attr',
      'aria-allowed-role',
      'aria-hidden-focus',
      'aria-required-attr',
      'aria-required-children',
      'aria-required-parent',
      'aria-roles',
      'aria-valid-attr',
      'aria-valid-attr-value',
      'button-name',
      'duplicate-id',
      'duplicate-id-aria',
      'frame-title',
      'input-button-name',
      'link-name',
    ],
    developerNote:
      'Use semantic HTML elements (<button>, <a>, <input>) instead of <div>/<span> with ARIA. When ARIA is needed, ensure all roles, states, and properties are valid and complete. All interactive elements must have accessible names.',
    notes: 'Standard HTML controls used according to spec already satisfy this criterion.',
  },

  '4.1.3': {
    sc: '4.1.3',
    name: 'Status Messages',
    level: 'AA',
    version: '2.1',
    principle: 'robust',
    guideline: '4.1 Compatible',
    description:
      'In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus.',
    wcagUrl: wcagUrl('status-messages'),
    understandingUrl: understandingUrl('status-messages'),
    howToMeetUrl: howToMeetUrl('status-messages'),
    en301549: '9.4.1.3',
    testability: 'semi-automated',
    axeRules: [],
    developerNote:
      'Use role="status", role="alert", role="log", or aria-live regions to announce status messages (form success, errors, search results count, loading states) to screen readers without moving focus.',
    notes:
      'No axe-core rule directly tests this criterion. Manual verification required to confirm all status messages use appropriate ARIA live regions.',
  },
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** Get all criteria as an array */
export function getAllCriteria(): WcagCriterion[] {
  return Object.values(WCAG_CRITERIA);
}

/** Filter criteria by conformance level */
export function getByLevel(level: WcagLevel): WcagCriterion[] {
  return getAllCriteria().filter(c => c.level === level && !c.removed);
}

/** Filter criteria by WCAG principle */
export function getByPrinciple(principle: WcagPrinciple): WcagCriterion[] {
  return getAllCriteria().filter(c => c.principle === principle && !c.removed);
}

/** Get all WCAG 2.1 Level A + AA criteria (excludes removed SC 4.1.1) */
export function getWcag21AA(): WcagCriterion[] {
  return getAllCriteria().filter(
    c => c.version !== '2.2' && (c.level === 'A' || c.level === 'AA') && !c.removed,
  );
}

/** Get all criteria that have axe-core rules for partial or full detection */
export function getAutomatable(): WcagCriterion[] {
  return getAllCriteria().filter(c => c.axeRules.length > 0 && !c.removed);
}

/** Reverse lookup: find WCAG criteria for a given axe-core rule ID */
export function getForAxeRule(ruleId: string): WcagCriterion[] {
  return getAllCriteria().filter(c => c.axeRules.includes(ruleId) && !c.removed);
}

/** Get criteria introduced in a specific WCAG version */
export function getByVersion(version: WcagVersion): WcagCriterion[] {
  return getAllCriteria().filter(c => c.version === version);
}

/** Get criteria by testability type */
export function getByTestability(testability: Testability): WcagCriterion[] {
  return getAllCriteria().filter(c => c.testability === testability && !c.removed);
}

/** Get WCAG 2.2 A/AA criteria (new in 2.2, not yet required by EN 301 549 v3.2.1) */
export function getWcag22Recommended(): WcagCriterion[] {
  return getAllCriteria().filter(c => c.version === '2.2' && (c.level === 'A' || c.level === 'AA'));
}
