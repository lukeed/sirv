const { resolve } = require('node:path');
const { promisify } = require('node:util');
const { execFile } = require('node:child_process');

const BIN = require.resolve('bundt');
const run = promisify(execFile);

(async function () {
	let output = await run(BIN, ['index.mjs'], {
		env: { ...process.env, FORCE_COLOR: '1' },
		cwd: resolve('packages/sirv'),
	});

	process.stdout.write(output.stdout.substring(1));
})().catch(err => {
	console.log('ERROR', err.stack);
	process.exit(1);
});
