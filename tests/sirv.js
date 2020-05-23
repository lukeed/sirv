const test = require('tape');
const sirv = require('../packages/sirv');
const { runMiddleware } = require('./test-helpers');

test('exports', t => {
	t.is(typeof sirv, 'function', 'exports a function');
	t.end();
});

test('prevents directory traversal attacks', t => {
	const request = {
		headers: {},
		path: encodeURIComponent('../package.json'),
	};

	t.plan(1)
	runMiddleware(
		sirv(__dirname),
		request
	)
	.then(response => {
		t.is(response.statusCode, 404);
		t.end();
	})
	.catch(err => {
		t.fail(err.message)
	});
});

test('prevents directory traversal attacks in dev mode', t => {
	const request = {
		headers: {},
		path: encodeURIComponent('../package.json'),
	};

	t.plan(1)
	runMiddleware(
		sirv(__dirname, { dev: true }),
		request
	)
	.then(response => {
		t.is(response.statusCode, 404);
		t.end();
	})
	.catch(err => {
		t.fail(err.message)
	});
});
