/**
 * resume-parser-v2.js
 * - Sends file to backend for parsing
 */

export async function parseResume(file) {
    console.log('parseResume called with:', file);
    if (!file) throw new Error('No file provided to parseResume');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/parse-resume', {
            method: 'POST',
            body: formData,
        });

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
