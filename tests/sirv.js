import { test } from 'uvu';
import assert from 'uvu/assert';
import sirv from '../packages/sirv';
import { middleware } from './helpers';

test('exports', () => {
	assert.type(sirv, 'function');
});

test('prevents directory traversal attacks :: prod', async () => {
	const handler = sirv(__dirname, { dev: false });

	const res = await middleware(handler, {
		headers: {},
		path: encodeURIComponent('../package.json'),
	});

	assert.is(res.statusCode, 404);
});

test('prevents directory traversal attacks :: dev', async () => {
	const handler = sirv(__dirname, { dev: true });

	const res = await middleware(handler, {
		headers: {},
		path: encodeURIComponent('../package.json'),
	});

	assert.is(res.statusCode, 404);
});

test.run();
