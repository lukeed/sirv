const sirv = require('sirv');
const { resolve } = require('path');

module.exports = function (dir, opts) {
	dir = resolve(dir || '.');

	let server = sirv(dir, opts);

	if (!opts.quiet) {
		server.on('request', req => {
			console.log(`[${Date.now()}] [SEND] ${req.url}`);
		});
	}

	// TODO: port-authority
	server.listen(opts.port, err => {
		if (err) throw err;
	});
}
