import * as fs from 'fs';
import { join } from 'path';
import mime from 'mime/lite';
import { send } from 'httpie';
import { promisify } from 'util';
import { createServer } from 'http';
import * as assert from 'uvu/assert';
import sirv from '../packages/sirv';

const www = join(__dirname, 'public');

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
	return CACHE[filepath] = {
		data: filedata,
		size: stats.size,
		type: mime.getType(full) || '',
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
}

export async function remove(file) {
	let filename = join(www, file);
	await removefile(filename);
}
