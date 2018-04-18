const fs = require('fs');
const { join } = require('path');
const { createServer } = require('http');
const tglob = require('tiny-glob/sync');
const parseurl = require('parseurl');
const mime = require('mime/lite');

const FILES = {};
const noop = () => {};

// opts = {
// 	// etag,
// 	// dot, // serve dot files (glob)
// 	// cache, // string to append?
// 	// maxAge + immutable + lastModified
// 	manifest, // push manifest
// 	compress, // gzip (default), brotli, zopfli ~> compress on init
// 	// setHeaders // function
// 	// onNoMatch
// }

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

module.exports = function (dir, opts={}) {
	let cc = opts.maxAge && `public,max-age=${opts.maxAge}`;
	cc && opts.immutable && (cc += ',immutable');

	opts.cwd = dir;
	let abs, stats, headers;
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
		FILES['/' + str] = { abs, stats, headers };
	});

	let setHeaders = opts.setHeaders || noop;
	let extensions = opts.extensions || ['html', 'htm'];
	let onNoMatch = opts.onNoMatch || (res => (res.statusCode=404,res.end()));

	return createServer((req, res) => {
		let pathname = req.path || req.pathname || parseurl(req).pathname;
		let data = find(pathname, extensions);
		if (!data) return onNoMatch(res);

		res.writeHead(200, data.headers);
		setHeaders(res, pathname, data.stats);

		fs.createReadStream(data.abs).pipe(res);
	});
}
