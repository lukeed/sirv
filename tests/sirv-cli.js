const test = require('tape');
const boot = require('../packages/sirv-cli/boot');

test('exports', t => {
	t.is(typeof boot, 'function', 'exports a function');
	t.end();
});
