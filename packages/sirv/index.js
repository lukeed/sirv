const fs = require('fs');
const { join, sep } = require('path');
const tglob = require('tiny-glob/sync');
const parseurl = require('parseurl');
const mime = require('mime/lite');

const FILES = {};
const noop = () => {};

function find(uri, extns) {
	if (!!~uri.lastIndexOf('.')) return FILES[uri];

	let i, j, x, arr=[], data, len=uri.length-1;
	if (uri.charCodeAt(len) === 47) uri=uri.substring(0, len);

	let tmp = `${uri}/index`;
	for (i=0; i < extns.length; i++) {
		x = '.' + extns[i];
		if (uri) arr.push(uri + x);
		arr.push(tmp + x);
	}

	for (i=0; i < arr.length; i++) {
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
	let cc = opts.maxAge && `public,max-age=${opts.maxAge}`;
	cc && opts.immutable && (cc += ',immutable');

	opts.cwd = dir;
	let abs, stats, headers;
	opts.dot = !!opts.dotfiles;
	tglob('**/*.*', opts).forEach(str => {
		abs = join(dir, str);
		stats = fs.statSync(abs);
		headers = {
			'content-length': stats.size,
			'content-type': mime.getType(str),
			'last-modified': stats.mtime.toUTCString()
		};
		cc && (headers['cache-control'] = cc);
		opts.etag && (headers['etag'] = toEtag(stats));
		FILES['/' + str.replace(sep, '/')] = { abs, stats, headers };
	});

	let notFound = opts.onNoMatch || is404;
	let setHeaders = opts.setHeaders || noop;
	let extensions = opts.extensions || ['html', 'htm'];

	return function (req, res, next) {
		let pathname = req.path || req.pathname || parseurl(req).pathname;
		let data = find(pathname, extensions);
		if (!data) return next ? next() : notFound(res);

		setHeaders(res, pathname, data.stats);
		res.writeHead(200, data.headers);

		fs.createReadStream(data.abs).pipe(res);
	}
}
