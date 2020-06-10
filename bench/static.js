const { createServer } = require('http');
const serve = require('serve-static');

const { PORT=3000 } = process.env;

const handler = serve('public');
// const handler = sirv('public', { dev: false });

createServer((req, res) => {
	handler(req, res, () => {
		res.statusCode = 404;
		res.end('');
	});
}).listen(PORT);
