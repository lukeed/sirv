const http2 = require('http2');
const parse = require('parseurl');
const tglob = require('tiny-glob');

const noop = () => {};
const FILES = new Map();

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
	uri = uri.substring(1);

	if (!!~file.lastIndexOf('.')) {
		return { file:uri, data:FILES.get(uri) };
	}

	let x, arr=[], file, data, len=uri.length-1;
	if (uri.charCodeAt(len) === 47) uri=uri.substring(0, len);

	let i=0, idx=`${uri}/index`;
	for (; i < extns.length; i++) {
		x = '.' + extns[i];
		arr.push(uri + x, idx + x);
	}

	for (i=0; i < arr.length; i++) {
		if (data=FILES.get(file=arr[i])) break;
	}

	return { file, data };
}

// TODO: CLI prompt to create local/dev SSL if empty
module.exports = async function (dir, opts={}) {
	if (!opts.key || !opts.cert) {
		throw new Error('HTTP/2 requires "key" and "cert" values!');
	}

	// glob & populate FILES
	await tglob()

	let extensions = opts.extensions || ['html', 'htm'];
	let onNoMatch = opts.onNoMatch || res => (res.statusCode=404,res.end());
	let manifest = opts.manifest || {};

	return http2.createSecureServer(opts, (req, res) => {
		let name = req.path || req.pathname || parse(req).pathname;
		let { file, data } = find(name, extensions);
		if (!data) return onNoMatch(res);
	});
}
