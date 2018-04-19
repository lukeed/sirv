const sirv = require('sirv');
const { resolve } = require('path');
const { find } = require('port-authority');

function toMS(arr) {
	return `${(arr[1] / 1e6).toFixed(2)}ms`;
}

module.exports = function (dir, opts) {
	dir = resolve(dir || '.');

	let server = sirv(dir, opts);

	if (!opts.quiet) {
		let { hrtime, stdout } = process;
		server.on('request', (req, res) => {
			let dur, start=hrtime();
			req.once('end', _ => {
				dur = hrtime(start);
				stdout.write(`[${res.statusCode}] — ${toMS(dur)} — ${req.originalUrl || req.url}\n`);
			})
		});
	}

	find(opts.port).then(port => {
		let isOther = port !== opts.port;
		server.listen(port, err => {
			if (err) throw err;
			console.log('running', port, opts.port);
		});
	});
}
