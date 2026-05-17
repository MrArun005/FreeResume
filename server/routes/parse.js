// Resume parser. Accepts a PDF, DOCX, or plain-text upload and returns a
// structured Resume JSON object using Gemini's native PDF support (for
// PDFs) or text extraction via mammoth (for DOCX).

import { Router } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import { generateFromParts } from '../lib/gemini.js';
import { extractJson, normalizeRaw, sendError } from '../lib/utils.js';
import { SCHEMA_PARSED_RESUME } from '../lib/schemas.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const SYSTEM_PROMPT = `
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

router.post('/parse-resume', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let rawText = '';
        const buffer = req.file.buffer;
        let mimeType = req.file.mimetype;

        console.log(`Processing file: ${req.file.originalname} (${mimeType})`);

        if (mimeType === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
            mimeType = 'application/pdf';
            console.log('PDF detected, passing buffer to Gemini...');
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            req.file.originalname.toLowerCase().endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ buffer });
            rawText = result.value;
        } else {
            rawText = buffer.toString('utf-8');
        }

        rawText = normalizeRaw(rawText);
        console.log('Extracted Text Length:', rawText.length);

        let parts = [];
        if (mimeType === 'application/pdf') {
            parts = [
                { text: SYSTEM_PROMPT },
                {
                    inlineData: {
                        mimeType: 'application/pdf',
                        data: buffer.toString('base64'),
                    },
                },
            ];
        } else {
            parts = [{ text: SYSTEM_PROMPT }, { text: `Resume Text:\n${rawText}` }];
        }

        const textResponse = await generateFromParts(parts, SCHEMA_PARSED_RESUME);
        const parsedData = extractJson(textResponse);
        res.json(parsedData);
    } catch (error) {
        console.error('Error parsing resume:', error);
        if (error.name === 'InvalidCharacterError' || error.message.includes('match the expected pattern')) {
            console.error('Likely an issue with base64 decoding in a dependency.');
        }
        sendError(res, 500, 'Failed to parse resume', error.message);
    }
});

export default router;
