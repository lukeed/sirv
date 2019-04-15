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
		x = '.' + extns[i];
		if (uri) arr.push(uri + x);
		arr.push(tmp + x);
	}

	return arr;
}

function find(uri, extns) {
	if (!!~uri.lastIndexOf('.')) return FILES[uri];
	let i=0, data, arr=toAssume(uri, extns);
	for (; i < arr.length; i++) {
		if (data=FILES[arr[i]]) break;
	}
	return data;
}

function is404(res) {
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
	let code=200, opts={};

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

module.exports = function (dir, opts={}) {
	dir = resolve(dir || '.');

	let isNotFound = opts.onNoMatch || is404;
	let extensions = opts.extensions || ['html', 'htm'];

	if (opts.dev) {
		return function (req, res, next) {
			let [start=0, end=Infinity] = (req.headers.range || '').replace('bytes=', '').split('-');
			let uri = decodeURIComponent(req.path || req.pathname || parser(req).pathname);
			let arr = uri.includes('.') ? [uri] : toAssume(uri, extensions);
			let file = arr.map(x => join(dir, x)).find(fs.existsSync);
			if (!file) return next ? next() : isNotFound(res);

			let stats = fs.statSync(file);
			send(req, res, file, stats, {
				'Content-Type': mime.getType(file),
				'Last-Modified': stats.mtime.toUTCString(),
				'Content-Length': stats.size,
			});
		}
	}

	let setHeaders = opts.setHeaders || noop;
	let cc = opts.maxAge != null && `public,max-age=${opts.maxAge}`;
	if (cc && opts.immutable) cc += ',immutable';

	list(dir, (name, abs, stats) => {
		if (!opts.dotfiles && name.charAt(0) === '.') {
			return;
		}

		let headers = {
			'Content-Length': stats.size,
			'Content-Type': mime.getType(name),
			'Last-Modified': stats.mtime.toUTCString(),
		};

		if (cc) headers['Cache-Control'] = cc;
		if (opts.etag) headers['ETag'] = `W/"${stats.size}-${stats.mtime.getTime()}"`;

		FILES['/' + name.replace(/\\+/g, '/')] = { abs, stats, headers };
	});

	return function (req, res, next) {
		let pathname = decodeURIComponent(req.path || req.pathname || parser(req).pathname);
		let data = find(pathname, extensions);
		if (!data) return next ? next() : isNotFound(res);

		setHeaders(res, pathname, data.stats);
		send(req, res, data.abs, data.stats, data.headers);
	};
}
