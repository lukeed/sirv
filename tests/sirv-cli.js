import { suite } from 'uvu';
import assert from 'uvu/assert';
import selfsigned from 'selfsigned';
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
        -s, --single       Serve as single-page application with "index.html" fallback
        -I, --ignores      Any URL pattern(s) to ignore "index.html" assumptions
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
		await server.close();
	}
});

basic.run();

// ---

const cors = suite('cors');

cors('should attach CORS headers to response', async () => {
	let server = await utils.spawn('--cors');

	try {
		let res = await server.send('GET', '/blog');
		await utils.matches(res, 200, 'blog.html', 'utf8');
		assert.is(res.headers['access-control-allow-origin'], '*');
		assert.is(res.headers['access-control-allow-headers'], 'Origin, Content-Type, Accept, Range');
	} finally {
		server.close();
	}
});

cors.run();

// ---

const port = suite('port');

port('should customize port via flag', async () => {
	let server = await utils.spawn('--port', '8080');
	try {
		assert.is(server.address.hostname, 'localhost');
		assert.is(server.address.port, '8080');
	} finally {
		server.close();
	}
});

port.run();

// ---

const host = suite('host');

host('should expose to network via empty host flag', async () => {
	let server = await utils.spawn('--host');
	try {
		assert.is(server.address.hostname, '0.0.0.0');
	} finally {
		server.close();
	}
});

host.run();

// ---

const http2 = suite('http2');

http2('requires "key" path argument', async () => {
	let pid = await utils.exec('--http2');
	assert.ok(pid.stderr.toString().includes(`HTTP/2 requires "key" and "cert" values`));
	assert.is(pid.status, 1);
});

http2('requires "cert" path argument', async () => {
	let pid = await utils.exec('--http2', '--key', 'foo');
	assert.ok(pid.stderr.toString().includes(`HTTP/2 requires "key" and "cert" values`));
	assert.is(pid.status, 1);
});

http2('should start a HTTP/2 server with valid args', async () => {
	let pems = selfsigned.generate();
	let key = await utils.write('foobar.key', pems.private);
	let cert = await utils.write('foobar.cert', pems.cert);

	let server = await utils.spawn('--http2', '--key', key, '--cert', cert);

	try {
		assert.is(server.address.protocol, 'https:');
	} finally {
		server.close();
	}
});

http2.run();
