import mammoth from 'mammoth';
import { normalizeRaw } from './helpers.js';

// DOCX parsing
export async function extractTextFromDOCX(buffer) {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return normalizeRaw(result.value);
    } catch (error) {
        console.error("DOCX Parse Error:", error);
        throw new Error("Failed to parse DOCX content");
    }
}
