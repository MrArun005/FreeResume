// Text normalization helper
export function normalizeRaw(text) {
    if (!text) return '';
    let t = text.replace(/\u00A0/g, ' ');
    t = t.replace(/-\n\s*/g, '');
    t = t.replace(/[ \t]{2,}/g, ' ');
    t = t.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    t = t.replace(/\n{3,}/g, '\n\n');
    return t.trim();
}
