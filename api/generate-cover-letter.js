import { generateWithFallback } from './_utils/gemini.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { resumeData, jobDescription } = req.body;
        if (!resumeData || !jobDescription) return res.status(400).json({ error: 'Missing resume data or job description' });

        const prompt = `
        Act as a professional career coach. Write a compelling Cover Letter for the candidate based on their Resume and the target Job Description.
        
        Resume: ${JSON.stringify(resumeData)}
        
        Job Description:
        "${jobDescription}"

        Requirements:
        - Professional, enthusiastic tone.
        - Connect specific past achievements to JD requirements.
        - Keep it concise (3-4 paragraphs).
        - Return ONLY the cover letter text (no markdown, no "Here is your cover letter").
        `;

        const coverLetter = (await generateWithFallback(prompt)).trim();
        res.status(200).json({ coverLetter });

    } catch (error) {
        console.error('Error generating cover letter:', error);
        res.status(500).json({ error: 'Failed to generate cover letter', details: error.message });
    }
}
