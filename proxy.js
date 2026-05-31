const http = require('http');

const BACKEND = { host: 'localhost', port: 8000 };
const PROXY_PORT = 8010;

http.createServer((req, res) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
    return;
  }

  const proxy = http.request({ ...BACKEND, path: req.url, method: req.method, headers: req.headers }, (backRes) => {
    res.writeHead(backRes.statusCode, { ...backRes.headers, ...headers });
    backRes.pipe(res);
  });

  proxy.on('error', () => { res.writeHead(502); res.end('Backend no disponible'); });
  req.pipe(proxy);
}).listen(PROXY_PORT, () => console.log(`Proxy corriendo en http://localhost:${PROXY_PORT}`));
