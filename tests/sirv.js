const { test } = require('uvu');
const assert = require('uvu/assert');
const { Writable } = require('stream');
const sirv = require('../packages/sirv');

function runMiddleware(fn, req) {
	const out = {
		headers: {},
		statusCode: -1,
	}
	return new Promise((resolve, reject) => {
		const res = new Writable({
			write() {}
		});
		Object.defineProperty(res, 'statusCode', {
			set(value) {
				out.statusCode = value;
			}
		})
		res.on('error', reject)
		res.on('finish', resolve);
		res.writeHead = (code, headers) => {
			out.statusCode = code;
			Object.assign(out.headers, headers);
		}
		fn(req, res);
	}).then(() => out);
}

test('exports', () => {
	assert.type(sirv, 'function');
});

test('prevents directory traversal attacks :: prod', () => {
	const handler = sirv(__dirname, { dev: false });

	const req = {
		headers: {},
		path: encodeURIComponent('../package.json'),
	};

	runMiddleware(handler, req).then(res => {
		assert.is(res.statusCode, 404);
	});
});

test('prevents directory traversal attacks :: dev', () => {
	const handler = sirv(__dirname, { dev: true });

	const req = {
		headers: {},
		path: encodeURIComponent('../package.json'),
	};

	runMiddleware(handler, req).then(res => {
		assert.is(res.statusCode, 404);
	});
});

test.run();
