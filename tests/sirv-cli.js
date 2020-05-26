import { suite } from 'uvu';
import assert from 'uvu/assert';
import * as utils from './helpers';

const help = suite('help');

help('--help', () => {
	let pid = utils.exec('--help');
	assert.is(pid.status, 0);
	assert.snapshot(
		// prints extra NL; dedent doesnt cooperate
		pid.stdout.toString().trimRight() + '\n      ',
		`
      Description
        Run a static file server

      Usage
        $ sirv [dir] [options]

      Options
        -D, --dev          Enable "dev" mode
        -e, --etag         Enable "ETag" header
        -d, --dotfiles     Enable dotfile asset requests
        -c, --cors         Enable "CORS" headers to allow any origin requestor
        -G, --gzip         Send precompiled "*.gz" files when "gzip" is supported  (default true)
        -B, --brotli       Send precompiled "*.br" files when "brotli" is supported  (default true)
        -m, --maxage       Enable "Cache-Control" header & define its "max-age" value (sec)
        -i, --immutable    Enable the "immutable" directive for "Cache-Control" header
        -k, --http2        Enable the HTTP/2 protocol. Requires Node.js 8.4.0+
        -C, --cert         Path to certificate file for HTTP/2 server
        -K, --key          Path to certificate key for HTTP/2 server
        -P, --pass         Passphrase to decrypt a certificate key
        -s, --single       Serve single-page applications
        -q, --quiet        Disable logging to terminal
        -H, --host         Hostname to bind  (default localhost)
        -p, --port         Port to bind  (default 5000)
        -v, --version      Displays current version
        -h, --help         Displays this message

      Examples
        $ sirv build --cors --port 8080
        $ sirv public --quiet --etag --maxage 31536000 --immutable
        $ sirv public --http2 --key priv.pem --cert cert.pem
        $ sirv public -qeim 31536000
        $ sirv --port 8080 --etag
        $ sirv --dev
    `
	);
});

help.run();

// ---

const basic = suite('basic');

basic('should start a server', async () => {
	let server = await utils.spawn();

	try {
		let res = await server.send('GET', '/');
		await utils.matches(res, 200, 'index.html', 'utf8');
	} finally {
		server.close();
	}
});

basic.run();
