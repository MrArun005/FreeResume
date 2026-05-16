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
        const { resumeData } = req.body;
        if (!resumeData) return res.status(400).json({ error: 'No resume data provided' });

        const prompt = `
        Act as an expert Professional Resume Writer. Your task is to IMPROVE the content of the following resume to be more impactful, professional, and ATS-friendly.
        
        INSTRUCTIONS:
        1. Professional Summary: Rewrite to be engaging, highlighting key strengths (max 4 sentences).
        2. Experience: Rewrite bullet points to use strong action verbs and "Accomplished [X] as measured by [Y], by doing [Z]" formula where possible. Keep it concise.
        3. Skills: Ensure skills are relevant and well-categorized if possible (but keep the simple list format).
        4. DO NOT change the structure or keys of the JSON. Only change the *values* of the strings.
        5. DO NOT invent false information. Enhance the existing content.
        
        Resume Data: ${JSON.stringify(resumeData)}

        Return ONLY the improved resume JSON object (no markdown).
        `;

        let textResponse = await generateWithFallback(prompt);
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const improvedResume = JSON.parse(textResponse);
        res.status(200).json({ improvedResume });

    } catch (error) {
        console.error('Error improving resume:', error);
        res.status(500).json({ error: 'Failed to improve resume', details: error.message });
    }
}
