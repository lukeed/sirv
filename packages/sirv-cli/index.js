const sirv = require('sirv');
const colors = require('kleur');
const semiver = require('semiver');
const { resolve } = require('path');
const { readFileSync } = require('fs');
const laccess = require('local-access');
const clear = require('console-clear');
const tinydate = require('tinydate');
const toPort = require('get-port');

const PAD = '  ';
const { HOST, PORT } = process.env;
const stamp = tinydate('{HH}:{mm}:{ss}');

function toTime() {
	return '[' + colors.magenta(stamp()) + '] ';
}

function toMS(arr) {
	return colors.white().bold(`${(arr[1] / 1e6).toFixed(2)}ms`);
}

function toCode(code) {
	let fn = code >= 400 ? 'red' : code > 300 ? 'yellow' : 'green';
	return colors[fn](code);
}

function exit(msg) {
	process.stderr.write('\n' + PAD + colors.red().bold('ERROR: ') + msg + '\n\n');
	process.exit(1);
}

module.exports = function (dir, opts) {
	dir = resolve(dir || '.');
	opts.maxAge = opts.m;

	if (opts.cors) {
		opts.setHeaders = res => {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Range');
		}
	}

	let server;
	let fn = sirv(dir, opts);
	let { hrtime, stdout } = process;

	if (opts.http2) {
		if (semiver(process.version.substring(1), '8.4.0') < 0) {
			return exit('HTTP/2 requires Node v8.4.0 or greater');
		}

		if (!opts.key || !opts.cert) {
			return exit('HTTP/2 requires "key" and "cert" values');
		}

		opts.key = readFileSync(opts.key);
		opts.cert = readFileSync(opts.cert);
		if (opts.cacert) opts.cacert = readFileSync(opts.cacert);
		if (opts.pass) opts.passphrase = opts.pass;

		server = require('http2').createSecureServer(opts, fn);
	} else {
		server = require('http').createServer(fn);
	}

	if (!opts.quiet) {
		let uri, dur, start, dash=colors.gray(' ─ ');
		server.on('request', (req, res) => {
			start = hrtime();
			req.once('end', _ => {
				dur = hrtime(start);
				uri = req.originalUrl || req.url;
				stdout.write(PAD + toTime() + toCode(res.statusCode) + dash + toMS(dur) + dash + uri + '\n');
			});
		});
	}

	opts.port = PORT || opts.port;
	let hostname = HOST || opts.host || '0.0.0.0';
	toPort({ host: hostname, port: opts.port }).then(port => {
		let isOther = port != opts.port;
		let https = opts.http2 || !!opts.ssl; // TODO
		server.listen(port, hostname, err => {
			if (err) throw err;
			if (opts.quiet) return;

			clear(true); // wipe screen, but not history
			let { local, network } = laccess({ port, hostname, https });
			stdout.write('\n' + PAD + colors.green('Your application is ready~! 🚀\n\n'));
			isOther && stdout.write(PAD + colors.italic().dim(`➡ Port ${opts.port} is taken; using ${port} instead\n\n`));
			stdout.write(PAD + `${colors.bold('- Local:')}      ${local}\n`);
			stdout.write(PAD + `${colors.bold('- Network:')}    ${/localhost/i.test(hostname) ? colors.dim('Add `--host` to expose') : network}\n`);
			let border = '─'.repeat(Math.min(stdout.columns, 36) / 2);
			stdout.write('\n' + border + colors.inverse(' LOGS ') + border + '\n\n');
		});
	});
}
