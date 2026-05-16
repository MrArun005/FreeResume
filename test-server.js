import express from 'express';
const app = express();
app.listen(3000, () => {
    console.log('Minimal server running on 3000');
});
process.on('exit', (code) => {
    console.log('Process exiting with code:', code);
});
process.on('uncaughtException', (err) => {
    console.log('Uncaught:', err);
});
