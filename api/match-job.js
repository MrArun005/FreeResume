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
        const { resumeData, jobDescription } = req.body;
        if (!resumeData || !jobDescription)
            return res.status(400).json({ error: 'Missing resume data or job description' });

        const prompt = `
        Act as an expert Recruiter and ATS. Compare the following Resume against the Job Description (JD).
        
        Resume: ${JSON.stringify(resumeData)}
        
        Job Description:
        "${jobDescription}"

        Provide a detailed match analysis in JSON format (NO markdown):
        {
            "score": number (0-100),
            "matchSummary": "string (1-2 sentences on overall fit)",
            "missingKeywords": ["string (critical skills in JD missing from Resume)"],
            "tailoringAdvice": ["string (specific actionable tips to improve match)"]
        }
        `;

        let textResponse = await generateWithFallback(prompt);
        textResponse = textResponse
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const matchAnalysis = JSON.parse(textResponse);
        res.status(200).json(matchAnalysis);
    } catch (error) {
        console.error('Error matching job:', error);
        res.status(500).json({ error: 'Failed to match job', details: error.message });
    }
}
