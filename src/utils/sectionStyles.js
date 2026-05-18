// Path B: per-section size scaling.
//
// Each section (Summary, Experience, Education, Skills, Projects, or any
// custom section) can be set to compact / normal / large independently of
// the global Path A typography prefs. The mechanism is a CSS custom
// property `--section-scale` that the section wrapper sets inline; the
// scoped rules in src/index.css multiply it into --resume-heading-size,
// --resume-body-size, and --resume-bullet-size via calc(). Default is 1
// (no scaling), so resumes without this field render identically.
//
// Multipliers are gentle on purpose. A user who picks "Compact" on a
// section while also having global "Body: Compact" gets a noticeable but
// still-readable result (e.g. 12px × 0.85 = ~10px). Aggressive multipliers
// would push composition past the legibility floor.

export const SECTION_SCALES = {
    compact: { label: 'Compact', factor: 0.85, description: 'Tighten this section.' },
    normal: { label: 'Normal', factor: 1.0, description: 'Match the global setting.' },
    large: { label: 'Large', factor: 1.15, description: 'Emphasize this section.' },
};

export const DEFAULT_SECTION_SCALE = 'normal';

/**
 * Resolve a section's saved preset key into its numeric multiplier.
 * Returns 1 (no scaling) for unset/unknown values so callers can
 * unconditionally multiply.
 */
export function getScaleFactor(presetKey) {
    return SECTION_SCALES[presetKey]?.factor ?? 1;
}

/**
 * Build the inline-style object a section wrapper should spread. Returns
 * `undefined` for normal/missing scales so we don't emit dead style attrs
 * (lets React skip the style update and keeps the DOM cleaner).
 *
 * Usage in a layout:
 *   <section id={`section-${id}`} style={sectionStyle(data, id)}>...</section>
 */
export function sectionStyle(resume, sectionId) {
    const factor = getScaleFactor(resume?.sectionStyles?.[sectionId]);
    if (factor === 1) return undefined;
    return { '--section-scale': factor };
}

/**
 * Read the active preset for a section, defaulting to 'normal'. Used by
 * the editor sidebar size pickers to highlight the currently-selected
 * button.
 */
export function getActiveScale(resume, sectionId) {
    const key = resume?.sectionStyles?.[sectionId];
    return key && key in SECTION_SCALES ? key : DEFAULT_SECTION_SCALE;
}
