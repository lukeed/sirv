import { suite } from 'uvu';
import assert from 'uvu/assert';
import sirv from '../packages/sirv';
import * as utils from './helpers';

const types = suite('types');

types('should export a function', () => {
	assert.type(sirv, 'function');
});

types('should be usable without arguments', () => {
	assert.type(sirv(), 'function'); // traverses ENTIRE repo
});

types('should be usable with `dir` argument only', () => {
	assert.type(sirv('tests'), 'function');
});

types('should be usable with `dir` and `opts` arguments', () => {
	assert.type(sirv('tests', { dev: true }), 'function');
});

types('should throw error if `dir` is not found', () => {
	assert.throws(() => sirv('foobar'), /ENOENT/);
});

types.run();

// ---

const basic = suite('basics');

basic('should return the file if found', async () => {
	let server = utils.http();

	try {
		let res1 = await server.send('GET', '/bundle.67329.js');
		await utils.matches(res1, 200, 'bundle.67329.js', 'utf8');

		let res2 = await server.send('GET', '/bundle.a5039.css');
		await utils.matches(res2, 200, 'bundle.a5039.css', 'utf8');
	} finally {
		server.close();
	}
});

basic('should return a 404 response (default) if not found', async () => {
	let server = utils.http();

	try {
		await server.send('GET', '/bundle.js').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/bundle.css').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/deeper/bundle.js').catch(err => {
			assert.is(err.statusCode, 404);
		});
	} finally {
		server.close();
	}
});

basic.run();

// ---

const index = suite('index.html');

index('should handle direct "index.html" requests', async () => {
	let server = utils.http();

	try {
		let res = await server.send('GET', '/index.html');
		await utils.matches(res, 200, 'index.html', 'utf8');
	} finally {
		server.close();
	}
});

index('should treat "/" as "/index.html" request', async () => {
	let server = utils.http();

	try {
		let res = await server.send('GET', '/');
		await utils.matches(res, 200, 'index.html', 'utf8');
	} finally {
		server.close();
	}
});

index('should treat "/about" as "/about/index.htm" request', async () => {
	let server = utils.http();

	try {
		let res = await server.send('GET', '/about');
		await utils.matches(res, 200, 'about/index.htm', 'utf8');
	} finally {
		server.close();
	}
});

index('should treat "/contact" as "/contact/index.html" request', async () => {
	let server = utils.http();

	try {
		let res = await server.send('GET', '/contact');
		await utils.matches(res, 200, 'contact/index.html', 'utf8');
	} finally {
		server.close();
	}
});

index('should treat "/blog" as "/blog.html" request', async () => {
	let server = utils.http();

	try {
		let res = await server.send('GET', '/blog');
		await utils.matches(res, 200, 'blog.html', 'utf8');
	} finally {
		server.close();
	}
});

index.run();

// ---

const extensions = suite('extensions');

extensions('should limit which extensions are assumed for index lookup', async () => {
	let server = utils.http({ extensions: ['html'] });

	try {
		await server.send('GET', '/about').catch(err => {
			assert.is(err.statusCode, 404);
		});
	} finally {
		server.close();
	}
});

extensions('should extend which extensions are assumed for any request', async () => {
	let server = utils.http({
		extensions: ['js', 'css']
	});

	try {
		let res1 = await server.send('GET', '/bundle.67329');
		await utils.matches(res1, 200, 'bundle.67329.js', 'utf8');

		let res2 = await server.send('GET', '/bundle.a5039');
		await utils.matches(res2, 200, 'bundle.a5039.css', 'utf8');
	} finally {
		server.close();
	}
});

extensions.run();

// ---

const security = suite('security');

security('should prevent directory traversal attacks :: prod', async () => {
	let server = utils.http({ dev: false });

	try {
		await server.send('GET', '/../../package.json');
	} catch (err) {
		assert.is(err.statusCode, 404);
	} finally {
		server.close();
	}
});

security('should prevent directory traversal attacks :: dev', async () => {
	let server = utils.http({ dev: true });

	try {
		await server.send('GET', '/../../package.json');
	} catch (err) {
		assert.is(err.statusCode, 404);
	} finally {
		server.close();
	}
});

security.run();

// ---

const single = suite('single');

single('should maintain "index.html" assumptions', async () => {
	let server = utils.http({ single: true });

	try {
		let res1 = await server.send('GET', '/');
		await utils.matches(res1, 200, 'index.html', 'utf8');

		let res2 = await server.send('GET', '/about');
		await utils.matches(res2, 200, 'about/index.htm', 'utf8');

		let res3 = await server.send('GET', '/contact');
		await utils.matches(res3, 200, 'contact/index.html', 'utf8');

		let res4 = await server.send('GET', '/blog');
		await utils.matches(res4, 200, 'blog.html', 'utf8');
	} finally {
		server.close();
	}
});

single('should serve assets when requested directly', async () => {
	let server = utils.http({ single: true });

	try {
		let res1 = await server.send('GET', '/bundle.67329.js');
		await utils.matches(res1, 200, 'bundle.67329.js', 'utf8');

		let res2 = await server.send('GET', '/bundle.a5039.css');
		await utils.matches(res2, 200, 'bundle.a5039.css', 'utf8');
	} finally {
		server.close();
	}
});

single('should serve root "index.html" for paths without assets', async () => {
	let server = utils.http({ single: true });

	try {
		let res1 = await server.send('GET', '/foobar');
		await utils.matches(res1, 200, 'index.html', 'utf8');

		let res2 = await server.send('GET', '/foo/bar');
		await utils.matches(res2, 200, 'index.html', 'utf8');

		let res3 = await server.send('GET', '/about/foobar');
		await utils.matches(res3, 200, 'index.html', 'utf8');

		let res4 = await server.send('GET', '/bundle.foobar.js');
		await utils.matches(res4, 200, 'index.html', 'utf8');
	} finally {
		server.close();
	}
});

single('should use custom fallback when `single` is a string', async () => {
	let server = utils.http({ single: 'about/index.htm' });

	try {
		let res1 = await server.send('GET', '/foobar');
		await utils.matches(res1, 200, 'about/index.htm', 'utf8');

		let res2 = await server.send('GET', '/foo/bar');
		await utils.matches(res2, 200, 'about/index.htm', 'utf8');

		let res3 = await server.send('GET', '/about/foobar');
		await utils.matches(res3, 200, 'about/index.htm', 'utf8');
	} finally {
		server.close();
	}
});

single.run();

// ---

const dotfiles = suite('dotfiles');

dotfiles('should reject hidden files (dotfiles) by default', async () => {
	let server = utils.http();

	try {
		await server.send('GET', '/.hello').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/foo/.world').catch(err => {
			assert.is(err.statusCode, 404);
		});
	} finally {
		server.close();
	}
});

dotfiles('should treat dotfiles with fallback during `single` mode', async () => {
	let server = utils.http({ single: true });

	try {
		let res1 = await server.send('GET', '/.hello');
		await utils.matches(res1, 200, 'index.html', 'utf8');

		let res2 = await server.send('GET', '/foo/.world');
		await utils.matches(res2, 200, 'index.html', 'utf8');
	} finally {
		server.close();
	}
});

dotfiles('should always allow access to ".well-known" directory contents', async () => {
	let server = utils.http();

	try {
		let res = await server.send('GET', '/.well-known/example');
		await utils.matches(res, 200, '.well-known/example', 'utf8');
	} finally {
		server.close();
	}
});

dotfiles('should allow requests to hidden files only when enabled', async () => {
	let server = utils.http({ dotfiles: true });

	try {
		let res1 = await server.send('GET', '/.hello');
		await utils.matches(res1, 200, '.hello', 'utf8');

		let res2 = await server.send('GET', '/foo/.world');
		await utils.matches(res2, 200, 'foo/.world', 'utf8');
	} finally {
		server.close();
	}
});

dotfiles.run();

// ---

const dev = suite('dev');

dev('should not rely on initial Cache fill', async () => {
	let server = utils.http({ dev: true });

	try {
		await server.send('GET', '/foo.bar.js').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await utils.write('foo.bar.js', 'hello there');

		// matches() helper will work but assert here
		let res = await server.send('GET', '/foo.bar.js');
		assert.is(res.headers['content-type'], 'application/javascript');
		assert.is(res.headers['content-length'], '11');
		assert.is(res.data, 'hello there');
		assert.is(res.statusCode, 200);
	} finally {
		await utils.remove('foo.bar.js');
		server.close();
	}
});

dev('should not rely on file cached data', async () => {
	let server = utils.http({ dev: true });

	try {
		await utils.write('foo.js', 'version 1');

		// matches() helper will work but assert here
		let res1 = await server.send('GET', '/foo.js');
		assert.is(res1.data, 'version 1');
		assert.is(res1.statusCode, 200);

		await utils.write('foo.js', 'version 2');

		// matches() helper will work but assert here
		let res2 = await server.send('GET', '/foo.js');
		assert.is(res2.data, 'version 2');
		assert.is(res2.statusCode, 200);
	} finally {
		await utils.remove('foo.js');
		server.close();
	}
});

dev.run();

// ---

const etag = suite('etag');

etag('should include an "ETag" HTTP header value', async () => {
	let server = utils.http({ etag: true });

	try {
		let res = await server.send('GET', '/bundle.67329.js');
		await utils.matches(res, 200, 'bundle.67329.js', 'utf8');
		assert.ok(res.headers['etag']);
	} finally {
		server.close();
	}
});

etag('should be "weak" variant and calculated from file stats', async () => {
	let server = utils.http({ etag: true });

	try {
		let res = await server.send('GET', '/bundle.67329.js');
		let file = await utils.lookup('bundle.67329.js', 'utf8');
		assert.is(res.headers['etag'], `W/"${file.size}-${file.mtime}"`);
	} finally {
		server.close();
	}
});

etag('should allow "If-None-Match" directive to function', async () => {
	let server = utils.http({ etag: true });

	try {
		let res1 = await server.send('GET', '/bundle.67329.js');
		assert.is(res1.statusCode, 200, 'normal request');

		let headers = { 'If-None-Match': res1.headers['etag'] };
		let res2 = await server.send('GET', '/bundle.67329.js', { headers });
		assert.is(res2.statusCode, 304, 'send 304 for "no change" signal');
		assert.is(res2.data, '', 'send empty response body');
	} finally {
		server.close();
	}
});

etag.run();

// ---

const gzip = suite('gzip');

gzip('should require "Accept-Encoding" match to do anything', async () => {
	let server = utils.http({ gzip: true });
	let headers = { 'Accept-Encoding': 'br,gzip' };

	try {
		await server.send('GET', '/data.js').catch(err => {
			assert.is(err.statusCode, 404, 'does not find plain file');
		});

		// the `matches` helper assumes wrong mime type
		let res = await server.send('GET', '/data.js', { headers });
		assert.is(res.headers['content-type'], 'application/javascript');
		assert.is(res.data, 'gzip js file\n');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

gzip('should serve prepared `.gz` file of any asset, if found', async () => {
	let server = utils.http({ gzip: true });
	let headers = { 'Accept-Encoding': 'br,gzip' };

	try {
		let res1 = await server.send('GET', '/', { headers });
		assert.is(res1.headers['content-type'], 'text/html');
		assert.is(res1.data, 'gzip html\n');
		assert.is(res1.statusCode, 200);

		let res2 = await server.send('GET', '/bundle.67329.js', { headers });
		await utils.matches(res2, 200, 'bundle.67329.js', 'utf8'); // no gz
	} finally {
		server.close();
	}
});

gzip('should defer to brotli when "Accept-Encoding" allows both', async () => {
	let server = utils.http({ gzip: true, brotli: true });
	let headers = { 'Accept-Encoding': 'br,gzip' };

	try {
		let res1 = await server.send('GET', '/', { headers });
		assert.is(res1.headers['content-type'], 'text/html');
		assert.is(res1.data, 'brotli html\n');
		assert.is(res1.statusCode, 200);

		let res2 = await server.send('GET', '/data.js', { headers });
		assert.is(res2.headers['content-type'], 'application/javascript');
		assert.is(res2.data, 'brotli js file\n');
		assert.is(res2.statusCode, 200);
	} finally {
		server.close();
	}
});

gzip.run();

// ---

const brotli = suite('brotli');

brotli('should require "Accept-Encoding" match to do anything', async () => {
	let server = utils.http({ brotli: true });
	let headers = { 'Accept-Encoding': 'br,gzip' };

	try {
		await server.send('GET', '/data.js').catch(err => {
			assert.is(err.statusCode, 404, 'does not find plain file');
		});

		// the `matches` helper assumes wrong mime type
		let res = await server.send('GET', '/data.js', { headers });
		assert.is(res.headers['content-type'], 'application/javascript');
		assert.is(res.data, 'brotli js file\n');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

brotli('should serve prepared `.gz` file of any asset, if found', async () => {
	let server = utils.http({ brotli: true });
	let headers = { 'Accept-Encoding': 'br,gzip' };

	try {
		let res1 = await server.send('GET', '/', { headers });
		assert.is(res1.headers['content-type'], 'text/html');
		assert.is(res1.data, 'brotli html\n');
		assert.is(res1.statusCode, 200);

		let res2 = await server.send('GET', '/bundle.67329.js', { headers });
		await utils.matches(res2, 200, 'bundle.67329.js', 'utf8'); // no brotli
	} finally {
		server.close();
	}
});

brotli('should be preferred when "Accept-Encoding" allows both', async () => {
	let server = utils.http({ gzip: true, brotli: true });
	let headers = { 'Accept-Encoding': 'br,gzip' };

	try {
		let res1 = await server.send('GET', '/', { headers });
		assert.is(res1.headers['content-type'], 'text/html');
		assert.is(res1.data, 'brotli html\n');
		assert.is(res1.statusCode, 200);

		let res2 = await server.send('GET', '/data.js', { headers });
		assert.is(res2.headers['content-type'], 'application/javascript');
		assert.is(res2.data, 'brotli js file\n');
		assert.is(res2.statusCode, 200);
	} finally {
		server.close();
	}
});

brotli.run();

// ---

const maxAge = suite('maxAge');

maxAge('should set the "Cache-Control" HTTP header value', async () => {
	let server = utils.http({ maxAge: 100 });

	try {
		let res = await server.send('GET', '/bundle.67329.js');
		assert.is(res.headers['cache-control'], 'public,max-age=100');
	} finally {
		server.close();
	}
});

maxAge('should accept `0` value', async () => {
	let server = utils.http({ maxAge: 0 });

	try {
		let res = await server.send('GET', '/bundle.67329.js');
		assert.is(res.headers['cache-control'], 'public,max-age=0');
	} finally {
		server.close();
	}
});

maxAge('should ignore `null` value', async () => {
	let server = utils.http({ maxAge: null });

	try {
		let res = await server.send('GET', '/bundle.67329.js');
		assert.not(res.headers['cache-control']);
	} finally {
		server.close();
	}
});

maxAge.run();

// ---

const immutable = suite('immutable');

immutable('should append the `immutable` directive to "Cache-Control" header value', async () => {
	let server = utils.http({ maxAge: 1234, immutable: true });

	try {
		let res = await server.send('GET', '/bundle.67329.js');
		assert.is(res.headers['cache-control'], 'public,max-age=1234,immutable');
	} finally {
		server.close();
	}
});

immutable('should work with `maxAge=0` value', async () => {
	let server = utils.http({ maxAge: 0, immutable: true });

	try {
		let res = await server.send('GET', '/bundle.67329.js');
		assert.is(res.headers['cache-control'], 'public,max-age=0,immutable');
	} finally {
		server.close();
	}
});

immutable('should not do anything without a `maxAge` option enabled', async () => {
	let server = utils.http({ immutable: true });

	try {
		let res = await server.send('GET', '/bundle.67329.js');
		assert.not(res.headers['cache-control']);
	} finally {
		server.close();
	}
});

immutable.run();

// ---

const ranges = suite('ranges');

ranges('should send the requested "Range" slice :: start', async () => {
	let server = utils.http();

	try {
		let headers = { Range: 'bytes=0-10' };
		let file = await utils.lookup('bundle.67329.js', 'utf8');
		let res = await server.send('GET', '/bundle.67329.js', { headers });

		assert.is(res.statusCode, 206);
		assert.is(res.headers['content-length'], '11');
		assert.is(res.headers['accept-ranges'], 'bytes');
		assert.is(res.headers['content-range'], `bytes 0-10/${file.size}`);
	} finally {
		server.close();
	}
});

ranges('should send the requested "Range" slice :: middle', async () => {
	let server = utils.http();

	try {
		let headers = { Range: 'bytes=6-96' };
		let file = await utils.lookup('bundle.67329.js', 'utf8');
		let res = await server.send('GET', '/bundle.67329.js', { headers });

		assert.is(res.statusCode, 206);
		assert.is(res.headers['content-length'], '91');
		assert.is(res.headers['accept-ranges'], 'bytes');
		assert.is(res.headers['content-range'], `bytes 6-96/${file.size}`);
	} finally {
		server.close();
	}
});

ranges('should send the requested "Range" slice :: end', async () => {
	let server = utils.http();

	try {
		let headers = { Range: 'bytes=80-115' };
		let file = await utils.lookup('bundle.67329.js', 'utf8');
		let res = await server.send('GET', '/bundle.67329.js', { headers });

		assert.is(res.statusCode, 206);
		assert.is(res.headers['content-length'], '36');
		assert.is(res.headers['accept-ranges'], 'bytes');
		assert.is(res.headers['content-range'], `bytes 80-115/${file.size}`);
	} finally {
		server.close();
	}
});

ranges('should send the requested "Range" slice :: full', async () => {
	let server = utils.http();

	try {
		let headers = { Range: 'bytes=0-115' };
		let file = await utils.lookup('bundle.67329.js', 'utf8');
		let res = await server.send('GET', '/bundle.67329.js', { headers });

		assert.is(res.statusCode, 206);
		assert.is(res.headers['content-length'], '116');
		assert.is(res.headers['accept-ranges'], 'bytes');
		assert.is(res.headers['content-range'], `bytes 0-115/${file.size}`);
	} finally {
		server.close();
	}
});

ranges('should assume the end-value is final byte when not included', async () => {
	let server = utils.http();

	try {
		let headers = { Range: 'bytes=2' };
		let file = await utils.lookup('bundle.67329.js', 'utf8');
		let res = await server.send('GET', '/bundle.67329.js', { headers });

		assert.is(res.statusCode, 206);
		assert.is(res.headers['content-length'], '114');
		assert.is(res.headers['accept-ranges'], 'bytes');
		assert.is(res.headers['content-range'], `bytes 2-115/${file.size}`);
	} finally {
		server.close();
	}
});

ranges('should assume the end-value is final byte when not included :: full', async () => {
	let server = utils.http();

	try {
		let headers = { Range: 'bytes=0' };
		let file = await utils.lookup('bundle.67329.js', 'utf8');
		let res = await server.send('GET', '/bundle.67329.js', { headers });

		assert.is(res.statusCode, 206);
		assert.is(res.headers['content-length'], '116');
		assert.is(res.headers['accept-ranges'], 'bytes');
		assert.is(res.headers['content-range'], `bytes 0-115/${file.size}`);
	} finally {
		server.close();
	}
});

ranges('should throw `416` when range cannot be met (overflow)', async () => {
	let server = utils.http();

	try {
		let headers = { Range: 'bytes=0-123456' };
		let file = await utils.lookup('bundle.67329.js', 'utf8');
		await server.send('GET', '/bundle.67329.js', { headers }).catch(err => {
			assert.is(err.headers['content-range'], `bytes */${file.size}`);
			assert.is(err.statusCode, 416);
		});
	} finally {
		server.close();
	}
});

ranges.run();
