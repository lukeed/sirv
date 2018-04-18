const fs = require('fs');
const http2 = require('http2');
const { join } = require('path');
const parseurl = require('parseurl');
const tglob = require('tiny-glob');
const mime = require('mime/lite');

const FILES = {};
const noop = () => {};
const { HTTP2_HEADER_PATH } = http2.constants;

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

function push(stream, path) {
	let d = FILES[path.substring(1)];
	if (!d) return Promise.resolve();
	return new Promise((res, rej) => {
		stream.pushStream({ [HTTP2_HEADER_PATH]: path }, (err, pstream) => {
			pstream.once('error', rej).once('finish', res);
			pstream.respondWithFD(d.descriptor, d.headers);
		});
	});
}

function find(uri, extns) {
	uri = uri.substring(1);

	if (!!~uri.lastIndexOf('.')) {
		return { file:uri, data:FILES[uri] };
	}

	let i, j, x, arr=[], file, data, len=uri.length-1;
	if (uri.charCodeAt(len) === 47) uri=uri.substring(0, len);

	let tmp = uri ? [uri, `${uri}/index`] : ['index'];
	for (i=0; i < extns.length; i++) {
		x = '.' + extns[i];
		for (j=0; j < tmp.length; j++) {
			arr.push(tmp[j] + x);
		}
	}

	for (i=0; i < arr.length; i++) {
		if (data=FILES[file=arr[i]]) break;
	}

	return { file, data };
}

// TODO: CLI prompt to create local/dev SSL if empty
module.exports = async function (dir, opts={}) {
	if (!opts.key || !opts.cert) {
		throw new Error('HTTP/2 requires "key" and "cert" values!');
	}

	let headers = {}; // etag, cache-control

	opts.cwd = dir;
	// stash(dir, files); ?
	await tglob('**/*.*', opts).then(arr => {
		let stats, tunnel;
		arr.forEach(str => {
			tunnel = fs.openSync(join(dir, str), 'r');
			stats = fs.fstatSync(tunnel);
			FILES[str] = {
				descriptor: tunnel,
				headers: {
					...headers,
					'content-length': stats.size,
					'content-type': mime.getType(str),
					'last-modified': stats.mtime.toUTCString()
				}
			};
		});
	});

	let server = http2.createSecureServer(opts);
	let extensions = opts.extensions || ['html', 'htm'];
	let onNoMatch = opts.onNoMatch || (res => (res.statusCode=404,res.end()));
	let manifest = opts.manifest || {};

	server.on('stream', async (stream, headers) => {
		// todo (fallback): req.stream.session vs req
		// let isPush = req.httpVersion === '2.0';
		// opts.allowHTTP1 = true;

		let url = headers[HTTP2_HEADER_PATH];
		let { pathname } = parseurl({ url });
		// let pathname = req.path || req.pathname || parseurl(req).pathname;
		let { data } = find(pathname, extensions);
		if (!data) return onNoMatch(res);

		// Look for assets to Push
		let assets = manifest[pathname];
		if (stream.pushAllowed && assets !== void 0) {
			let k, fns=[];
			for (k in assets) fns.push(push(stream, k));
			await Promise.all(fns);
		}

		stream.respondWithFD(data.descriptor, data.headers);
	});

	return server;
}
