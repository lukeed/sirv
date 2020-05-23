const { test } = require('uvu');
const assert = require('uvu/assert');
const boot = require('../packages/sirv-cli/boot');

test('exports', () => {
	assert.type(boot, 'function');
});

test.run();
