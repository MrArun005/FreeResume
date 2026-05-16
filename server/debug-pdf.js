import pdfParse from 'pdf-parse';

console.log('Imported pdfParse:', pdfParse);
console.log('Type of pdfParse:', typeof pdfParse);

async function test() {
    try {
        // Create a dummy PDF buffer (minimal valid PDF)
        // This is a very basic PDF header/trailer structure
        const pdfData = `%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 24 Tf
100 700 Td
(Hello World) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000117 00000 n
0000000234 00000 n
0000000302 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
400
%%EOF`;

        const buffer = Buffer.from(pdfData);

        console.log('Testing parsing...');
        const data = await pdfParse(buffer);
        console.log('Parsed text:', data.text);
        console.log('Success!');
    } catch (e) {
        console.error('Test failed:', e);
    }
}

test();
