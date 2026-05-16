import http from 'http';
const server = http.createServer((req, res) => res.end('ok'));
server.listen(3000, () => {
  console.log('HTTP running');
});
process.on('exit', (code) => console.log('exit', code));
