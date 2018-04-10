const http2 = require('http2');
module.exports = function (dir, opts={}) {
	if (!opts.key || !opts.cert) {
		throw new Error('HTTP/2 requires "key" and "cert" values!');
	}
	return http2.createSecureServer(opts, (req, res) => {
		//
	});
}
