const sirv = require('sirv');
const { resolve } = require('path');
const clear = require('console-clear');
const { find } = require('port-authority');
const access = require('local-access');

function toMS(arr) {
	return `${(arr[1] / 1e6).toFixed(2)}ms`;
}

module.exports = function (dir, opts) {
	dir = resolve(dir || '.');

	let server = sirv(dir, opts);
	let { hrtime, stdout } = process;

	if (!opts.quiet) {
		server.on('request', (req, res) => {
			let dur, start=hrtime();
			req.once('end', _ => {
				dur = hrtime(start);
				stdout.write(`[${res.statusCode}] — ${toMS(dur)} — ${req.originalUrl || req.url}\n`);
			});
		});
	}

	find(opts.port).then(port => {
		let https = !!opts.ssl; // TODO
		let isOther = port !== opts.port;
		server.listen(port, err => {
			if (err) throw err;
			if (opts.quiet) return;

			clear(); // wipe screen
			let PAD = '  ';
			let { local, network } = access({ port, https });
			stdout.write('\n' + PAD + 'Your application is ready~! 🚀\n\n');
			isOther && stdout.write(PAD + `Port ${opts.port} is taken; using ${port} instead\n\n`);
			stdout.write(PAD + `Local:      ${local}\n`);
			stdout.write(PAD + `Network:    ${network}\n`);
		});
	});
}
