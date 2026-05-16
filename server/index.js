import express from 'express';
import cors from 'cors';
import multer from 'multer';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';

import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

app.use((req, res, next) => {
    console.log(`[DEBUG] Request: ${req.method} ${req.url}`);
    console.log(`[DEBUG] Content-Length: ${req.headers['content-length']}`);
    next();
});

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to clean text
function normalizeRaw(text) {
    if (!text) return "";
    let t = text.replace(/\u00A0/g, " ");
    t = t.replace(/-\n\s*/g, "");
    t = t.replace(/[ \t]{2,}/g, " ");
    t = t.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    t = t.replace(/\n{3,}/g, "\n\n");
    return t.trim();
}

// Gemini Native PDF Parsing (No local library needed)
const MAX_RETRIES = 3;
const INITIAL_DELAY = 2000;

async function generateContentWithRetry(model, promptOrParts) {
    let retries = 0;
    while (true) {
        try {
            const result = await model.generateContent(promptOrParts);
            const response = await result.response;
            return response.text();
        } catch (error) {
            const isRateLimit = error.message.includes('429') ||
                error.message.includes('Too Many Requests') ||
                error.message.includes('Resource exhausted');

            if (isRateLimit && retries < MAX_RETRIES) {
                const delay = INITIAL_DELAY * Math.pow(2, retries);
                console.warn(`Gemini 429 error. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retries++;
            } else {
                throw error;
            }
        }
    }
}

async function parseWithGemini(fileBuffer, mimeType, textContent = null) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash-preview-09-2025", "gemini-flash-latest"];

    const systemPrompt = `
  You are an expert resume parser. Extract the following information from the resume provided.
  Return ONLY a valid JSON object with no markdown formatting or backticks.
  
  Structure:
  {
    "personal": {
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "linkedin": "string",
      "github": "string",
      "website": "string",
      "location": "string",
      "summary": "string (short professional summary)",
      "title": "string (current job title)"
    },
    "experience": [
      { 
        "id": number (timestamp), 
        "role": "string", 
        "company": "string", 
        "date": "string (e.g. Jan 2020 - Present)", 
        "bullets": ["string (list of accomplishments)"] 
      }
    ],
    "education": [
      { 
        "id": number (timestamp), 
        "degree": "string", 
        "school": "string", 
        "date": "string (year or range)" 
      }
    ],
    "skills": ["string"]
  }
  `;

    let parts = [];

    if (mimeType === 'application/pdf') {
        // Native PDF support
        parts = [
            { text: systemPrompt },
            {
                inlineData: {
                    mimeType: "application/pdf",
                    data: fileBuffer.toString("base64")
                }
            }
        ];
    } else {
        // Text-based (DOCX converted to text, or plain text)
        parts = [
            { text: systemPrompt },
            { text: `Resume Text:\n${textContent}` }
        ];
    }

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting to parse with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            let textResponse = await generateContentWithRetry(model, parts);

            // Clean up markdown
            textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(textResponse);
        } catch (error) {
            console.warn(`Failed with model ${modelName}:`, error.message);
            if (modelName === modelsToTry[modelsToTry.length - 1]) throw error;
        }
    }
}


// Generate PDF with Puppeteer
app.post('/api/generate-pdf', async (req, res) => {
    let browser = null;
    try {
        const { html } = req.body;
        if (!html) return res.status(400).json({ error: 'Missing HTML content' });

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'] // Allow local file links if any
        });
        const page = await browser.newPage();

        // Important: Set viewport to match A4 size to ensure correct media queries and layout calculations
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

        // Set content and wait for network/fonts to load
        await page.setContent(html, {
            waitUntil: ['load', 'networkidle0']
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
            preferCSSPageSize: true, // Respect @page CSS
            displayHeaderFooter: false
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=resume.pdf',
            'Content-Length': pdfBuffer.length
        });
        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

// API Routes
app.post('/api/parse-resume', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let rawText = "";
        const buffer = req.file.buffer;
        let mimeType = req.file.mimetype;

        console.log(`Processing file: ${req.file.originalname} (${mimeType})`);

        if (mimeType === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
            // Ensure mimeType is correct for Gemini
            mimeType = 'application/pdf';
            // PDF is handled natively by Gemini, no local text extraction needed
            console.log("PDF detected, passing buffer to Gemini...");
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            req.file.originalname.toLowerCase().endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ buffer });
            rawText = result.value;
        } else {
            // Fallback to text
            rawText = buffer.toString('utf-8');
        }

        rawText = normalizeRaw(rawText);
        console.log("Extracted Text Length:", rawText.length);

        // PDF is handled directly by Gemini (textContent remains null)

        const parsedData = await parseWithGemini(buffer, mimeType, rawText);
        res.json(parsedData);

    } catch (error) {
        console.error('Error parsing resume:', error);
        // Check if it's the specific atob error
        if (error.name === 'InvalidCharacterError' || error.message.includes('match the expected pattern')) {
            console.error('Likely an issue with base64 decoding in a dependency.');
        }
        res.status(500).json({ error: 'Failed to parse resume', details: error.message, stack: error.stack });
    }
});

// --- NEW AI FEATURES ---

// Helper to get a working model
async function generateWithFallback(prompt) {
    // Based on available models in this environment
    const models = [
        "gemini-2.0-flash",
        "gemini-2.5-flash-preview-09-2025",
        "gemini-flash-latest"
    ];

    let lastError = null;

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            return await generateContentWithRetry(model, prompt);
        } catch (error) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;
        }
    }
    throw lastError;
}

// 1. Improve Grammar & Tone
app.post('/api/improve-text', async (req, res) => {
    try {
        const { text, type } = req.body; // type: 'summary' | 'bullet'
        if (!text) return res.status(400).json({ error: 'No text provided' });

        const prompt = type === 'bullet'
            ? `Rewrite this resume bullet point to be more impactful, using strong action verbs and professional tone. Keep it concise. Return ONLY the rewritten text. Input: "${text}"`
            : `Rewrite this professional summary to be more engaging and professional. Keep it under 4 sentences. Return ONLY the rewritten text. Input: "${text}"`;

        const improvedText = (await generateWithFallback(prompt)).trim();
        res.json({ improvedText });

    } catch (error) {
        console.error('Error improving text:', error);
        res.status(500).json({ error: 'Failed to improve text', details: error.message });
    }
});

// 2. Comprehensive ATS Scan
app.post('/api/analyze-resume', async (req, res) => {
    try {
        const { resumeData } = req.body;
        if (!resumeData) return res.status(400).json({ error: 'No resume data provided' });

        const prompt = `
        Act as an expert ATS (Applicant Tracking System) scanner and Resume Coach. Analyze the following resume JSON data. Be strict with scoring to prevent grade inflation.
        
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
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const analysis = JSON.parse(textResponse);
        res.json(analysis);

    } catch (error) {
        console.error('Error analyzing resume:', error);
        res.status(500).json({ error: 'Failed to analyze resume', details: error.message });
    }
});

// 3. Improve Entire Resume
app.post('/api/improve-resume', async (req, res) => {
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
        res.json({ improvedResume });

    } catch (error) {
        console.error('Error improving resume:', error);
        res.status(500).json({ error: 'Failed to improve resume', details: error.message });
    }
});

// 4. Job Description Match & Tailoring
app.post('/api/match-job', async (req, res) => {
    try {
        const { resumeData, jobDescription } = req.body;
        if (!resumeData || !jobDescription) return res.status(400).json({ error: 'Missing resume data or job description' });

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
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const matchAnalysis = JSON.parse(textResponse);
        res.json(matchAnalysis);

    } catch (error) {
        console.error('Error matching job:', error);
        res.status(500).json({ error: 'Failed to match job', details: error.message });
    }
});

// 5. Generate Cover Letter
app.post('/api/generate-cover-letter', async (req, res) => {
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
        res.json({ coverLetter });

    } catch (error) {
        console.error('Error generating cover letter:', error);
        res.status(500).json({ error: 'Failed to generate cover letter', details: error.message });
    }
});

// Import cheerio and axios at the top (I will add imports in a separate edit if needed, but assuming I can add them here or they are already available)
import * as cheerio from 'cheerio';
import axios from 'axios';

// ...

// 6. Tailor Resume from URL
app.post('/api/tailor-resume', async (req, res) => {
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
        res.json({ tailoredResume, jobDescription }); // Return JD too so user can see what was extracted

    } catch (error) {
        console.error('Error tailoring resume:', error);
        res.status(500).json({ error: 'Failed to tailor resume', details: error.message });
    }
});

// 7. Roast My Resume
app.post('/api/roast-resume', async (req, res) => {
    try {
        const { resumeData } = req.body;
        if (!resumeData) return res.status(400).json({ error: 'No resume data provided' });

        const prompt = `
        Act as a ruthless, witty, and sarcastic Senior Tech Recruiter who has seen thousands of terrible resumes. Your job is to "roast" the following resume.
        
        Resume Data: ${JSON.stringify(resumeData)}

        Provide the output in the following JSON format (NO markdown):
        {
            "score": number (0-100, rate hireability strictly but fairly based on content quality),
            "oneLiner": "string (a short, biting headline about the resume)",
            "roast": "string (a paragraph-long savage critique of the overall vibe, formatting, and content)",
            "burns": ["string (3-4 specific, short, witty insults about specific parts)"],
            "redFlags": ["string (3-4 serious issues that would get this rejected)"]
        }
        
        Be funny but constructive. Don't hold back.
        `;

        let textResponse = await generateWithFallback(prompt);
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const roastData = JSON.parse(textResponse);
        res.json(roastData);

    } catch (error) {
        console.error('Error roasting resume:', error);
        res.status(500).json({ error: 'Failed to roast resume', details: error.message });
    }
});

const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

export default app;
