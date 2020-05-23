import { test } from 'uvu';
import assert from 'uvu/assert';

const boot = require('../packages/sirv-cli');

test('exports', () => {
	assert.type(boot, 'function');
});

test.run();
