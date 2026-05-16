import { generateWithFallback } from './_utils/gemini.js';
import * as cheerio from 'cheerio';
import axios from 'axios';

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
        const { resumeData, jobUrl } = req.body;
        if (!resumeData || !jobUrl) return res.status(400).json({ error: 'Missing resume data or job URL' });

        console.log(`Fetching job description from: ${jobUrl}`);

        // 1. Scrape the Job Description
        let jobDescription = '';
        try {
            const { data } = await axios.get(jobUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const $ = cheerio.load(data);

            // Remove scripts, styles, and navs to clean up text
            $('script, style, nav, header, footer, .nav, .menu').remove();

            // Extract text from main content areas (heuristics)
            jobDescription = $('main, article, .job-description, #job-description, body').text().replace(/\s+/g, ' ').trim();

            // Truncate if too long (Gemini limit)
            if (jobDescription.length > 20000) jobDescription = jobDescription.substring(0, 20000);

        } catch (scrapeError) {
            console.error('Scraping failed:', scrapeError.message);
            return res.status(400).json({ error: 'Failed to fetch job details from URL. Please paste the description manually.' });
        }

        if (jobDescription.length < 100) {
            return res.status(400).json({ error: 'Could not extract meaningful content from the URL. Please paste the description manually.' });
        }

        // 2. AI Tailoring
        const prompt = `
        Act as an expert Resume Writer. Tailor the following Resume to match the Job Description provided.
        
        Job Description (Extracted):
        "${jobDescription.substring(0, 5000)}..."

        Resume (JSON):
        ${JSON.stringify(resumeData)}

        Instructions:
        1. **Summary:** Rewrite the professional summary to highlight experience relevant to this specific job.
        2. **Skills:** Reorder and add relevant skills from the JD (only if the candidate likely has them based on experience).
        3. **Experience:** Rewrite bullet points to emphasize achievements that match the JD's requirements. Use strong action verbs.
        4. **Keywords:** Naturally integrate keywords from the JD.
        5. **Structure:** Keep the exact same JSON structure as the input resume.
        
        Return ONLY the valid JSON object of the tailored resume.
        `;

        let textResponse = await generateWithFallback(prompt);
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const tailoredResume = JSON.parse(textResponse);
        res.status(200).json({ tailoredResume, jobDescription }); // Return JD too so user can see what was extracted

    } catch (error) {
        console.error('Error tailoring resume:', error);
        res.status(500).json({ error: 'Failed to tailor resume', details: error.message });
    }
}
