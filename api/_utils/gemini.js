import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MAX_RETRIES = 3;
const INITIAL_DELAY = 2000; // 2 seconds

export async function generateContentWithRetry(model, promptOrParts) {
    let retries = 0;
    while (true) {
        try {
            const result = await model.generateContent(promptOrParts);
            const response = await result.response;
            return response.text();
        } catch (error) {
            const isRateLimit =
                error.message.includes('429') ||
                error.message.includes('Too Many Requests') ||
                error.message.includes('Resource exhausted');

            if (isRateLimit && retries < MAX_RETRIES) {
                const delay = INITIAL_DELAY * Math.pow(2, retries);
                console.warn(`Gemini 429 error. Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                retries++;
            } else {
                throw error;
            }
        }
    }
}

// Helper to generate content with fallback models
export async function generateWithFallback(prompt) {
    const models = ['gemini-2.0-flash', 'gemini-2.5-flash-preview-09-2025', 'gemini-flash-latest'];

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

// Get Gemini client instance
export function getGeminiClient() {
    return genAI;
}
