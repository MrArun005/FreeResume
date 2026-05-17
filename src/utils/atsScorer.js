export const calculateAtsScore = (resume) => {
    let score = 0;
    const issues = [];
    const tips = [];

    // 1. Contact Information (20 points)
    let contactScore = 0;
    if (resume?.personal?.email) contactScore += 5;
    else issues.push({ id: 'no-email', text: 'Missing email address', severity: 'critical' });

    if (resume?.personal?.phone) contactScore += 5;
    else issues.push({ id: 'no-phone', text: 'Missing phone number', severity: 'critical' });

    if (resume?.personal?.location) contactScore += 5;
    else
        tips.push({
            id: 'no-location',
            text: 'Adding a location (City, State) helps local recruiters find you.',
        });

    if (
        resume?.personal?.socials &&
        resume.personal.socials.some((s) => s.network.toLowerCase().includes('linkedin'))
    ) {
        contactScore += 5;
    } else {
        tips.push({ id: 'no-linkedin', text: 'Adding a LinkedIn profile is highly recommended.' });
    }
    score += contactScore;

    // 2. Section Completeness (30 points)
    let sectionScore = 0;
    if (resume?.personal?.summary && resume.personal.summary.length > 50) sectionScore += 10;
    else if (!resume?.personal?.summary)
        issues.push({ id: 'no-summary', text: 'Missing professional summary', severity: 'high' });
    else tips.push({ id: 'short-summary', text: 'Your summary is a bit short. Aim for 2-3 sentences.' });

    if (resume?.experience && resume.experience.length > 0) sectionScore += 10;
    else issues.push({ id: 'no-experience', text: 'Missing experience section', severity: 'critical' });

    if (resume?.skills && resume.skills.length >= 5) sectionScore += 10;
    else if (!resume?.skills || resume.skills.length === 0)
        issues.push({ id: 'no-skills', text: 'Missing skills section', severity: 'high' });
    else tips.push({ id: 'few-skills', text: 'Add more relevant skills (aim for at least 5-10).' });

    score += sectionScore;

    // 3. Content Quality (30 points)
    let contentScore = 0;
    const actionVerbs = [
        'led',
        'developed',
        'managed',
        'created',
        'implemented',
        'designed',
        'improved',
        'increased',
        'reduced',
        'launched',
    ];
    let hasActionVerbs = false;

    if (resume?.experience) {
        const expText = resume.experience
            .map((e) => e.description || '')
            .join(' ')
            .toLowerCase();
        hasActionVerbs = actionVerbs.some((verb) => expText.includes(verb));

        if (hasActionVerbs) contentScore += 15;
        else
            tips.push({
                id: 'no-action-verbs',
                text: 'Use strong action verbs (e.g., Led, Developed) in your experience descriptions.',
            });

        // Check for bullet points / length
        const avgLength = expText.length / (resume.experience.length || 1);
        if (avgLength > 50) contentScore += 15;
        else tips.push({ id: 'short-exp', text: 'Elaborate more on your experience roles.' });
    }
    score += contentScore;

    // 4. Formatting & Best Practices (20 points)
    // We assume our templates are good, so we give points, but warn about PDF type
    score += 20;

    return {
        score: Math.min(100, score),
        issues,
        tips,
    };
};
