const http2 = require('http2');
const parse = require('parseurl');

const FILES = new Map();

function find(uri, extns) {
	uri = uri.substring(1);

	if (!!~uri.lastIndexOf('.')) {
		return { file:uri, data:FILES.get(uri) };
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
		if (data=FILES.get(file=arr[i])) break;
	}

	return { file, data };
}

module.exports = function (dir, opts={}) {
	if (!opts.key || !opts.cert) {
		throw new Error('HTTP/2 requires "key" and "cert" values!');
	}
	let extensions = opts.extensions || ['html', 'htm'];
	let onNoMatch = opts.onNoMatch || res => (res.statusCode=404,res.end());
	return http2.createSecureServer(opts, (req, res) => {
		let name = req.path || req.pathname || parse(req).pathname;
		let { file, data } = find(name, extensions);
		if (!data) return onNoMatch(res);
	});
}
