const { test } = require('uvu');
const assert = require('uvu/assert');
const { Writable } = require('stream');
const sirv = require('../packages/sirv');

async function runMiddleware(fn, req) {
	const out = {
		headers: {},
		statusCode: -1,
	}

	await new Promise((resolve, reject) => {
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
	});

	return out;
}
import { test } from 'uvu';
import assert from 'uvu/assert';
import { Writable } from 'stream';
import sirv from '../packages/sirv';

test('exports', () => {
	assert.type(sirv, 'function');
});

test('prevents directory traversal attacks :: prod', async () => {
	const handler = sirv(__dirname, { dev: false });

	const res = await runMiddleware(handler, {
		headers: {},
		path: encodeURIComponent('../package.json'),
	});

	assert.is(res.statusCode, 404);
});

test('prevents directory traversal attacks :: dev', async () => {
	const handler = sirv(__dirname, { dev: true });

	const res = await runMiddleware(handler, {
		headers: {},
		path: encodeURIComponent('../package.json'),
	});

	assert.is(res.statusCode, 404);
});

test.run();
