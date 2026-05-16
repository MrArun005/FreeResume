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
        Act as a ruthless, sarcastic, but ultimately helpful Senior Hiring Manager who has seen thousands of bad resumes. 
        Your task is to "Roast" the following resume.
        
        Resume Data: ${JSON.stringify(resumeData)}

        Instructions:
        1. **Tone:** Witty, slightly mean, sarcastic, brutally honest. Think "Gordon Ramsay reviews a resume".
        2. **Content:** Point out clichés ("motivated self-starter"), vague metrics, bad formatting choices (implied), and weak descriptions.
        3. **Structure:** Return a JSON object (NO markdown) with:
           - "score": number (0-100, be harsh!)
           - "oneLiner": string (A devastating single sentence summary of the resume)
           - "roast": string (A paragraph-long rant about the resume's overall vibe)
           - "burns": ["string", "string", "string"] (3-4 specific, biting bullet points about specific sections)
           - "redFlags": ["string", "string"] (2-3 serious issues that would get it rejected)
        
        Make it funny enough that they'll want to share it, but true enough that they'll want to fix it.
        `;

        let textResponse = await generateWithFallback(prompt);
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const roastAnalysis = JSON.parse(textResponse);
        res.status(200).json(roastAnalysis);

    } catch (error) {
        console.error('Error roasting resume:', error);
        res.status(500).json({ error: 'Failed to roast resume', details: error.message });
    }
}
