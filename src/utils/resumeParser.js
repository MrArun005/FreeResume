/**
 * Resume parser — uploads a file to the backend for AI parsing.
 * Wrapped in apiFetch so the click + request lifecycle is logged
 * client-side AND beaconed to the server, so refusals upstream of the
 * actual AI call are still visible in Render logs.
 */

import { apiFetch, logAiClick } from './aiLogger';

export async function parseResume(file) {
    if (!file) throw new Error('No file provided to parseResume');
    logAiClick('parse-resume', {
        filename: file.name,
        size: file.size,
        type: file.type,
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await apiFetch(
            '/api/parse-resume',
            {
                method: 'POST',
                body: formData,
            },
            'parse-resume'
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Failed to parse resume on backend');
        }

        const parsedData = await response.json();
        return parsedData;
    } catch (error) {
        console.error('Error in parseResume:', error);
        throw error;
    }
}
