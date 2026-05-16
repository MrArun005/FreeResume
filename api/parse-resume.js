import multer from 'multer';
import { getGeminiClient, generateContentWithRetry } from './_utils/gemini.js';
import { extractTextFromDOCX } from './_utils/parsing.js';
import { normalizeRaw } from './_utils/helpers.js';

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Gemini Parsing Logic
async function parseWithGemini(fileBuffer, mimeType, textContent = null) {
    const genAI = getGeminiClient();
    // Use Flash for speed and multimodal capabilities
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
            const parsed = JSON.parse(textResponse);

            // Add IDs
            if (parsed.experience) {
                parsed.experience = parsed.experience.map((e, i) => ({ ...e, id: Date.now() + i }));
            }
            if (parsed.education) {
                parsed.education = parsed.education.map((e, i) => ({ ...e, id: Date.now() + i + 100 }));
            }

            return parsed;
        } catch (error) {
            console.warn(`Failed with model ${modelName}:`, error.message);
            if (modelName === modelsToTry[modelsToTry.length - 1]) throw error;
        }
    }
}

// Serverless function handler
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
        // Use multer middleware
        await new Promise((resolve, reject) => {
            upload.single('file')(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let mimeType = req.file.mimetype;
        const buffer = req.file.buffer;
        let textContent = null;

        console.log(`Processing file: ${req.file.originalname} (${mimeType})`);

        // Handle DOCX extraction locally
        if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            req.file.originalname.toLowerCase().endsWith('.docx')) {
            textContent = await extractTextFromDOCX(buffer);
        }
        // Handle PDF
        else if (mimeType === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
            mimeType = 'application/pdf'; // Ensure correct mimeType for Gemini
            // PDF is handled directly by Gemini (textContent remains null)
        }
        // Handle Text files
        else if (mimeType === 'text/plain') {
            textContent = normalizeRaw(buffer.toString('utf-8'));
        }

        const parsedData = await parseWithGemini(buffer, mimeType, textContent);
        res.status(200).json(parsedData);

    } catch (error) {
        console.error('Error parsing resume:', error);
        res.status(500).json({ error: 'Failed to parse resume', details: error.message });
    }
}
