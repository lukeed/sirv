const test = require('tape');
const sirv = require('../packages/sirv');

test('exports', t => {
	t.is(typeof sirv, 'function', 'exports a function');
	t.end();
});
