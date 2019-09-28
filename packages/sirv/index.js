const fs = require('fs');
const { join, resolve } = require('path');
const parser = require('@polka/url');
const mime = require('mime/lite');

const FILES = {};
const noop = () => {};

function toAssume(uri, extns) {
	let i=0, x, len=uri.length - 1;
	if (uri.charCodeAt(len) === 47) {
		uri = uri.substring(0, len);
	}

	let arr=[], tmp=`${uri}/index`;
	for (; i < extns.length; i++) {
		x = extns[i] ? `.${extns[i]}` : '';
		if (uri) arr.push(uri + x);
		arr.push(tmp + x);
	}

	return arr;
}

function viaCache(uri, extns) {
	let i=0, data, arr=toAssume(uri, extns);
	for (; i < arr.length; i++) {
		if (data = FILES[arr[i]]) return data;
	}
}

function viaLocal(uri, extns, dir, isEtag) {
	let i=0, arr=toAssume(uri, extns);
	let abs, stats, name, headers;
	for (; i < arr.length; i++) {
		if (fs.existsSync(abs = join(dir, name=arr[i]))) {
			stats = fs.statSync(abs);
			if (stats.isDirectory()) continue;
			headers = toHeaders(name, stats, isEtag);
			return { abs, stats, headers };
		}
	}
}

function is404(req, res) {
	return (res.statusCode=404,res.end());
}

function list(dir, fn, pre='') {
	let i=0, abs, stats;
	let arr = fs.readdirSync(dir);
	for (; i < arr.length; i++) {
		abs = join(dir, arr[i]);
		stats = fs.statSync(abs);
		stats.isDirectory()
			? list(abs, fn, join(pre, arr[i]))
			: fn(join(pre, arr[i]), abs, stats);
	}
}

function send(req, res, file, stats, headers={}) {
	let code=200, tmp, opts={}

	if (tmp = res.getHeader('content-type')) {
		headers['Content-Type'] = tmp;
	}

	if (req.headers.range) {
		code = 206;
		let [x, y] = req.headers.range.replace('bytes=', '').split('-');
		let end = opts.end = parseInt(y, 10) || stats.size - 1;
		let start = opts.start = parseInt(x, 10) || 0;

		if (start >= stats.size || end >= stats.size) {
			res.setHeader('Content-Range', `bytes */${stats.size}`);
			res.statusCode = 416;
			return res.end();
		}

		headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`;
		headers['Content-Length'] = (end - start + 1);
		headers['Accept-Ranges'] = 'bytes';
	}

	res.writeHead(code, headers);
	fs.createReadStream(file, opts).pipe(res);
}

function isEncoding(name, type, headers) {
	headers['Content-Encoding'] = type;
	headers['Content-Type'] = mime.getType(name.replace(/\.([^.]*)$/, '')) || '';
}

function toHeaders(name, stats, isEtag) {
	let headers = {
		'Content-Length': stats.size,
		'Content-Type': mime.getType(name) || '',
		'Last-Modified': stats.mtime.toUTCString(),
	};
	if (isEtag) headers['ETag'] = `W/"${stats.size}-${stats.mtime.getTime()}"`;
	if (/\.br$/.test(name)) isEncoding(name, 'brotli', headers);
	if (/\.gz$/.test(name)) isEncoding(name, 'gzip', headers);
	return headers;
}

module.exports = function (dir, opts={}) {
	dir = resolve(dir || '.');

	let isNotFound = opts.onNoMatch || is404;
	let setHeaders = opts.setHeaders || noop;

	let extensions = opts.extensions || ['html', 'htm'];
	let gzips = opts.gzip && extensions.map(x => `${x}.gz`).concat('gz');
	let brots = opts.brotli && extensions.map(x => `${x}.br`).concat('br');

	let fallback = '/';
	let isEtag = !!opts.etag;
	let isSPA = !!opts.single;
	if (typeof opts.single === 'string') {
		let idx = opts.single.lastIndexOf('.');
		fallback += !!~idx ? opts.single.substring(0, idx) : opts.single;
	}

	let cc = opts.maxAge != null && `public,max-age=${opts.maxAge}`;
	if (cc && opts.immutable) cc += ',immutable';

	list(dir, (name, abs, stats) => {
		if (!opts.dotfiles && name.charAt(0) === '.') return;

		let headers = toHeaders(name, stats, isEtag);
		if (cc) headers['Cache-Control'] = cc;

		FILES['/' + name.replace(/\\+/g, '/')] = { abs, stats, headers };
	});

	return function (req, res, next) {
		let extns = [];
		let val = req.headers['accept-encoding'] || '';
		if (gzips && val.includes('gzip')) extns=gzips.concat(extns);
		if (brots && /(br|brotli)/i.test(val)) extns=brots.concat(extns);
		extns = extns.concat('', extensions); // [...br, ...gz, orig, ...exts]

		let fn = opts.dev ? viaLocal : viaCache;
		let pathname = req.path || parser(req, true).pathname;
		let data = fn(pathname, extns, dir, isEtag) || isSPA && fn(fallback, extns, dir, isEtag);
		if (!data) return next ? next() : isNotFound(req, res);

		setHeaders(res, pathname, data.stats);
		send(req, res, data.abs, data.stats, data.headers);
	};
}
