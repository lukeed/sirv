// TODO: temporary
const { promisify } = require('util');
const { execFile } = require('child_process');
const { packages } = require('./bump.json');

const ENV = { ...process.env, FORCE_COLOR: '1' };
const BIN = require.resolve('bundt');
const run = promisify(execFile);

(async function () {
	for (let dir of packages) {
		console.log('~> "%s"', dir);
		let output = await run(BIN, ['index.js'], { env:ENV, cwd:dir });
		process.stdout.write(output.stdout.substring(1));
	}
})().catch(err => {
	console.log('ERROR', err.stack);
	process.exit(1);
});
