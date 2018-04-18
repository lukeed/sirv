#!/usr/bin/env node
const fs = require('fs');
const sade = require('sade');
const create = require('sirv');
const { resolve } = require('path');
const pkg = require('./package');
// const { logMsg } = require('./util');

sade('sirv')
	.version(pkg.version)
	.example('start') // TODO: more
	.command('start [dir]', 'Start an HTTP/2 file server.', { default:true })
	.option('--key', 'Path to SSL certificate key (Required)')
	.option('--cert', 'Path to SSL certificate file (Required)')
	.option('--cacert', 'Path to SSL certificate authority (Optional)')
	.option('-m, --manifest', 'Path to HTTP/2 push manifest file')
	.option('-d, --dot', 'Enable dotfile assets')
	.option('-e, --etag', 'Enable "Etag" headers')
	.option('-c, --compress', 'Enable file compression with specified format', 'gzip')
	.option('-q, --quiet', 'Disable logging to terminal')
	.option('-p, --port', 'Port to listen', 5000)
		// s, single
		// C? cache
		// C? cors
		// q, quiet (no log)
	.action(async (dir, opts) => {
		dir = resolve(dir || '.');

		opts.key = resolve(__dirname, './ssl/key.pem');
		opts.cert = resolve(__dirname, './ssl/cert.pem');

		if (!opts.key || !opts.cert) {
			return console.log('KEY & CERT ARE REQUIRED; todo: generate prompt');
		}

		opts.key = fs.readFileSync(opts.key);
		opts.cert = fs.readFileSync(opts.cert);
		opts.ca = opts.cacert && fs.readFileSync(opts.cacert);

		if (opts.manifest) {
			opts.manifest = require(opts.manifest);
		}

		let server = await create(dir, opts);

		if (!opts.quiet) {
			server.on('request', req => {
				console.log(`[${Date.now()}] [SEND] ${req.url}`);
			});
			server.on('stream', (stream, headers) => {
				console.log(headers[':path']);
				// console.log('> stream', stream);
			})
		}

		server.listen(opts.port, err => {
			if (err) throw err;
		});
	})
	.parse(process.argv);
