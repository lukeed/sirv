const http2 = require('http2');
module.exports = function (dir, opts={}) {
	return http2.createSecureServer(opts, (req, res) => {
		//
	});
}
