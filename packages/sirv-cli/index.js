#!/usr/bin/env node
const fs = require('fs');
const sade = require('sade');
const pkg = require('./package');
const boot = require('./boot');

sade('sirv')
	.version(pkg.version)
	.example('start') // TODO: more
	.command('start [dir]', 'Start a static file server.', { default:true })
	.option('-e, --etag', 'Enable "Etag" header')
	.option('-d, --dotfiles', 'Enable dotfile asset requests')
	.option('-c, --cors', 'Enable "CORS" headers to allow any origin requestor')
	.option('-m, --maxage', 'Enable "Cache-Control" header & define its "max-age" value (sec)')
	.option('-i, --immutable', 'Enable the "immutable" directive for "Cache-Control" header')
	.option('-q, --quiet', 'Disable logging to terminal')
	.option('-p, --port', 'Port to listen', 5000)
	.action(boot)
	.parse(process.argv);
