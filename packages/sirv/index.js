const fs = require('fs');
const { join, resolve } = require('path');
const tglob = require('tiny-glob/sync');
const parser = require('@polka/url');
const mime = require('mime/lite');

const FILES = {};
const noop = () => {};

function toAssume(uri, extns) {
	let i=0, x, len=uri.length - 1;
	if (uri.charCodeAt(len) === 47) uri=uri.substring(0, len);

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

function toEtag(obj) {
	return `W/"${obj.size.toString(16)}-${obj.mtime.getTime().toString(16)}"`;
}

function is404(res) {
	return (res.statusCode=404,res.end());
}

module.exports = function (dir, opts={}) {
	dir = resolve(dir || '.');

	let isNotFound = opts.onNoMatch || is404;
	let extensions = opts.extensions || ['html', 'htm'];

	if (opts.dev) {
		return function (req, res, next) {
			let uri = decodeURIComponent(req.path || req.pathname || parser(req).pathname);
			let arr = uri.includes('.') ? [uri] : toAssume(uri, extensions);
			let file = arr.map(x => join(dir, x)).find(fs.existsSync);
			if (!file) return next ? next() : isNotFound(res);
			res.setHeader('Content-Type', mime.getType(file));
			fs.createReadStream(file).pipe(res);
		}
	}

	let setHeaders = opts.setHeaders || noop;
	let cc = opts.maxAge != null && `public,max-age=${opts.maxAge}`;
	if (cc && opts.immutable) cc += ',immutable';

	opts.cwd = dir;
	let abs, stats, headers;
	opts.dot = !!opts.dotfiles;
	tglob('**/*.*', opts).forEach(str => {
		abs = join(dir, str);
		stats = fs.statSync(abs);
		headers = {
			'Content-Length': stats.size,
			'Content-Type': mime.getType(str),
			'Last-Modified': stats.mtime.toUTCString()
		};
		if (cc) headers['Cache-Control'] = cc;
		if (opts.etag) headers['ETag'] = toEtag(stats);
		FILES['/' + str.replace(/\\+/g, '/')] = { abs, stats, headers };
	});

	return function (req, res, next) {
		let pathname = decodeURIComponent(req.path || req.pathname || parser(req).pathname);
		let data = find(pathname, extensions);
		if (!data) return next ? next() : isNotFound(res);

		setHeaders(res, pathname, data.stats);
		res.writeHead(200, data.headers);

		fs.createReadStream(data.abs).pipe(res);
	}
}
