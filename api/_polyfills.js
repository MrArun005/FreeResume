// Polyfills for Vercel/Node environment
// This must be imported BEFORE pdfjs-dist

if (typeof globalThis.atob === 'undefined') {
    globalThis.atob = (str) => Buffer.from(str, 'base64').toString('binary');
}
if (typeof globalThis.btoa === 'undefined') {
    globalThis.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}

console.log("Polyfills applied: atob/btoa");
