import * as fs from 'node:fs';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync, execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { send } from 'httpie';
import * as mime from 'mrmime';
import * as assert from 'uvu/assert';
import sirv from '../packages/sirv/index.mjs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const www = join(__dirname, 'public');
const BIN = require.resolve('../packages/sirv-cli/bin.js');

const statfile = promisify(fs.stat);
const readfile = promisify(fs.readFile);
const writefile = promisify(fs.writeFile);
const removefile = promisify(fs.unlink);

export const setup = (opts={}) => sirv(www, opts);

export function http(opts) {
	let server = createServer(setup(opts));
	let address = new URL(listen(server));
	return {
		close: server.close.bind(server),
		send(method, path, opts) {
			let uri = new URL(path, address);
			return send(method, uri, opts);
		}
	};
}

export function exec(...argv) {
	return spawnSync('node', [BIN, www, ...argv]);
}

export function spawn(...argv) {
	return new Promise(r => {
		let address, output='';
		let pid = execFile('node', [BIN, www, ...argv]);

		pid.stdout.on('data', x => {
			output += x.toString();

			if (/Local\:/.test(output)) {
				let addr = new URL(output.match(/https?:\/\/.*/)[0]);
				return r({
					address: addr,
					close() {
						return new Promise(res => {
							pid.on('exit', res);
							pid.kill('SIGTERM');
						});
					},
					send(method, path, opts) {
						let uri = new URL(path, addr);
						return send(method, uri, opts);
					}
				});
			}
		});
	});
}

export function listen(server) {
	server.listen(); // boots
	let { port } = server.address();
	return `http://localhost:${port}`;
}

const CACHE = {};
export async function lookup(filepath, enc) {
	let filedata = CACHE[filepath];
	if (filedata) return filedata;

	let full = join(www, filepath);
	let stats = await statfile(full);
	filedata = await readfile(full, enc);

	let ctype = mime.lookup(full) || '';
	if (ctype === 'text/html') ctype += ';charset=utf-8';

	return CACHE[filepath] = {
		data: filedata,
		size: stats.size,
		type: ctype,
		mtime: stats.mtime.getTime(),
	};
}

export async function matches(res, code, filepath, enc) {
	let file = await lookup(filepath, enc);
	assert.is(+res.headers['content-length'], file.size);
	assert.is(res.headers['content-type'], file.type);
	assert.is(res.statusCode, code);
	assert.is(res.data, file.data);
}

export async function write(file, data) {
	let filename = join(www, file);
	await writefile(filename, data);
	return filename;
}

export async function remove(file) {
	let filename = join(www, file);
	await removefile(filename);
}
