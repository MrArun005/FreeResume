const pdf = require('pdf-parse');
console.log('Type of pdf:', typeof pdf);
console.log('Is pdf a function?', typeof pdf === 'function');
console.log('pdf keys:', Object.keys(pdf));

if (pdf.PDFParse) {
    console.log('Type of pdf.PDFParse:', typeof pdf.PDFParse);
}
