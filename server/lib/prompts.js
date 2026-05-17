// Prompt builders + grounding helpers shared across AI routes.
//
// Each AI endpoint composes its full prompt from:
//   1. A task-specific instruction block (lives in the route file).
//   2. INFER_CONTEXT_PREAMBLE — tells Gemini to silently infer the
//      candidate's target role / seniority / industry before producing
//      output, so advice is calibrated rather than generic.
//   3. deriveResumeContext(resumeData) — a compact, human-readable
//      snapshot of the candidate that anchors the model.

// Standard preamble that every full-resume prompt uses. Asks Gemini to
// first infer the target role/seniority/industry, then tailor its output.
export const INFER_CONTEXT_PREAMBLE = `Before writing your output, silently infer the following from the resume:
1. The candidate's likely target role (use most recent title + skills + experience to triangulate).
2. Seniority level: entry / mid / senior / lead / principal.
3. Industry vertical: tech / finance / healthcare / consulting / education / other.
4. Approximate years of experience.

Use these inferences to tailor every piece of advice. Keyword suggestions, score severity, tone, and depth must all match the inferred target. Do not output your inferences — just let them shape the response.`;

// Build a compact, human-readable summary of the candidate that we prepend
// to every full-resume AI prompt. This forces Gemini to anchor its advice
// to the candidate's actual seniority, industry, and target role instead
// of drifting toward generic resume-coach platitudes.
//
// Kept short (a few hundred tokens) — the full resumeData is still in the
// prompt; this is just the lens.
export function deriveResumeContext(resumeData) {
    if (!resumeData) return '';
    const personal = resumeData.personal || {};
    const experience = resumeData.experience || [];
    const skills = resumeData.skills || [];
    const education = resumeData.education || [];

    const currentRole = experience[0]?.role || personal.title || 'unspecified';
    const currentCompany = experience[0]?.company || 'unspecified';
    const numRoles = experience.length;

    // Rough years-of-experience signal from the count of distinct roles
    // (good enough as a coarse hint; we don't parse free-text dates).
    const yoeHint =
        numRoles >= 5
            ? '5+ years (senior signal)'
            : numRoles >= 3
              ? '3-5 years (mid signal)'
              : numRoles >= 1
                ? '0-3 years (entry/mid signal)'
                : 'no work history listed';

    const skillSample = skills
        .slice(0, 12)
        .map((s) => (typeof s === 'string' ? s : ''))
        .filter(Boolean)
        .join(', ');
    const educationTop = education[0]
        ? `${education[0].degree || ''} from ${education[0].school || 'unspecified'}`.trim()
        : 'unspecified';

    return [
        `Candidate snapshot (for grounding — infer target role from this):`,
        `- Title/Most recent role: ${currentRole} at ${currentCompany}`,
        `- Roles listed: ${numRoles}, ${yoeHint}`,
        `- Education: ${educationTop}`,
        skillSample ? `- Skills sample: ${skillSample}` : '',
    ]
        .filter(Boolean)
        .join('\n');
}
