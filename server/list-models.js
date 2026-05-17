import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
    try {
        // Hit the REST API directly to list models for the configured API key.
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            console.error('No API Key found!');
            return;
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log('Available Models:');
            data.models.forEach((m) => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log('No models found or error:', data);
        }
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
