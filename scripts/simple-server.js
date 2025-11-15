import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';

const PORT = 3000;
const ROOT = '/home/user/operator';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = createServer(async (req, res) => {
  let filePath = join(ROOT, req.url === '/' ? 'index.html' : req.url);

  if (filePath.endsWith('/')) {
    filePath = join(filePath, 'index.html');
  }

  try {
    const content = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
    res.end(content);
  } catch (err) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
