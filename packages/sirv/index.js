const http2 = require('http2');
const parse = require('parseurl');

module.exports = function (dir, opts={}) {
	if (!opts.key || !opts.cert) {
		throw new Error('HTTP/2 requires "key" and "cert" values!');
	}
	return http2.createSecureServer(opts, (req, res) => {
		let name = req.path || req.pathname || parse(req).pathname;
	});
}
