const { createServer } = require('http');
const sirv = require('sirv');

const { PORT=3000 } = process.env;

// const handler = sirv('public', { dev: true });
const handler = sirv('public', { dev: false });

createServer(handler).listen(PORT);
