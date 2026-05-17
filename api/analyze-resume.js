import { generateWithFallback } from './_utils/gemini.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { resumeData } = req.body;
        if (!resumeData) return res.status(400).json({ error: 'No resume data provided' });

        const prompt = `
        Act as an expert ATS (Applicant Tracking System) scanner and Resume Coach. Analyze the following resume JSON data.
        
        Resume Data: ${JSON.stringify(resumeData)}

        Provide a strict, detailed analysis in the following JSON format (NO markdown):
        {
            "score": number (0-100),
            "summary": "string (brief overall feedback)",
            "criticalIssues": [
                { "id": "string", "text": "string (description of issue)", "section": "string" }
            ],
            "improvements": [
                { "id": "string", "text": "string (suggestion)", "section": "string" }
            ],
            "keywordsFound": ["string"],
            "missingKeywords": ["string (suggested keywords based on role)"]
        }
        `;

        let textResponse = await generateWithFallback(prompt);
        textResponse = textResponse
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const analysis = JSON.parse(textResponse);
        res.status(200).json(analysis);
    } catch (error) {
        console.error('Error analyzing resume:', error);
        res.status(500).json({ error: 'Failed to analyze resume', details: error.message });
    }
}
