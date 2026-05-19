// Resume parser. Accepts a PDF, DOCX, or plain-text upload and returns a
// structured Resume JSON object using Gemini's native PDF support (for
// PDFs) or text extraction via mammoth (for DOCX).

import { Router } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import { createRequire } from 'module';
import { generateFromParts } from '../lib/gemini.js';
import { extractJson, normalizeRaw, sendError } from '../lib/utils.js';
import { SCHEMA_PARSED_RESUME } from '../lib/schemas.js';

// pdf-parse is CommonJS — load via createRequire so we can keep this file
// ESM. We import the internal lib file directly because the package's main
// entry runs a debug test on import that tries to read a hardcoded test PDF
// from disk and crashes the server in production. Well-known issue; this
// workaround is what every Node project doing PDF parsing ends up using.
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

// Threshold below which we assume the PDF text extraction came up empty or
// near-empty (e.g. image-only scanned resume) and fall back to letting
// Gemini parse the PDF natively (slower but still works).
const MIN_TEXT_LENGTH = 120;

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
            // Speed win: extract PDF text locally with pdf-parse first. Sending
            // plain text to Gemini is dramatically faster than sending a base64
            // PDF binary (Gemini skips its vision/OCR pass and gets a smaller
            // payload). For most native-text PDFs (recruiter-friendly resumes)
            // this is the fast path. For image-only/scanned PDFs we fall back
            // to native PDF input below.
            try {
                const t0 = Date.now();
                const result = await pdfParse(buffer);
                console.log(`pdf-parse done in ${Date.now() - t0}ms, text length: ${result.text.length}`);
                if (result.text && result.text.length >= MIN_TEXT_LENGTH) {
                    rawText = result.text;
                    mimeType = 'text/plain'; // signal text-mode downstream
                }
            } catch (err) {
                console.warn('pdf-parse failed, will fall back to native PDF input:', err.message);
            }
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
            // Image-only PDF — let Gemini handle it natively as fallback.
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
