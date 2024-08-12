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

const encode = suite('URI encoding');

encode('should work when the request path contains accented characters :: dev', async () => {
	let server = utils.http({ dev: true });

	try {
		let res = await server.send('GET', '/fünke.txt');
		assert.is(res.headers['content-type'], 'text/plain');
		assert.is(res.data, 'fünke.txt\n');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

encode('should work when the request path contains encoded characters :: dev', async () => {
	let server = utils.http({ dev: true });

	try {
		let res = await server.send('GET', '/f%C3%BCnke.txt');
		assert.is(res.headers['content-type'], 'text/plain');
		assert.is(res.data, 'fünke.txt\n');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

encode('should work when the request path contains accented characters :: prod', async () => {
	let server = utils.http({ dev: false });

	try {
		let res = await server.send('GET', '/fünke.txt');
		assert.is(res.headers['content-type'], 'text/plain');
		assert.is(res.data, 'fünke.txt\n');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

encode('should work when the request path contains encoded characters :: prod', async () => {
	let server = utils.http({ dev: false });

	try {
		let res = await server.send('GET', '/f%C3%BCnke.txt');
		assert.is(res.headers['content-type'], 'text/plain');
		assert.is(res.data, 'fünke.txt\n');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

encode('should work when the request path contains space encoded :: dev', async () => {
	let server = utils.http({ dev:  true });

	try {
		let res = await server.send('GET', '/with%20space.txt');
		assert.is(res.headers['content-type'], 'text/plain');
		assert.is(res.data, 'with space.txt\n');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

encode('should work when the request path contains space encoded :: prod', async () => {
	let server = utils.http({ dev: false });

	try {
		let res = await server.send('GET', '/with%20space.txt');
		assert.is(res.headers['content-type'], 'text/plain');
		assert.is(res.data, 'with space.txt\n');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

encode('should not treat "/foo%2Fbar.txt" the same as "/foo.bar.txt" path :: dev', async () => {
	let server = utils.http({ dev: true });

	try {
		let res1 = await server.send('GET', '/about/index.htm');
		assert.is(res1.statusCode, 200);

		let res2 = await server.send('GET', '/about%2Findex.htm').catch(r => r);
		assert.is(res2.statusCode, 404);
	} finally {
		server.close();
	}
});

encode('should not treat "/foo%2Fbar.txt" the same as "/foo.bar.txt" path :: prod', async () => {
	let server = utils.http({ dev: false });

	try {
		let res1 = await server.send('GET', '/about/index.htm');
		assert.is(res1.statusCode, 200);

		let res2 = await server.send('GET', '/about%2Findex.htm').catch(r => r);
		assert.is(res2.statusCode, 404);
	} finally {
		server.close();
	}
});

encode.run();

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
	let server = utils.http({
		extensions: ['html']
	});

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

single('should NOT fallback to "index.html" for URLs with extension', async () => {
	let server = utils.http({ single: true });

	try {
		await server.send('GET', '/404.css').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/404.js').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/foo/bar/baz.bat').catch(err => {
			assert.is(err.statusCode, 404);
		});
	} finally {
		server.close();
	}
});

single.run();

// ---

const ignores = suite('ignores');

ignores('should be able to fallback any URL to "index.html" when desired', async () => {
	let server = utils.http({ single:true, ignores:false });

	try {
		let res1 = await server.send('GET', '/404.css');
		await utils.matches(res1, 200, 'index.html', 'utf8');

		let res2 = await server.send('GET', '/404.js');
		await utils.matches(res2, 200, 'index.html', 'utf8');

		let res3 = await server.send('GET', '/foo/bar/baz.bat');
		await utils.matches(res3, 200, 'index.html', 'utf8');
	} finally {
		server.close();
	}
});

ignores('should provide custom RegExp pattern to ignore', async () => {
	let server = utils.http({
		single: true,
		ignores: /^[/]foo/
	});

	try {
		await server.send('GET', '/foo/404').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/foobar/baz').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/foo/bar/baz').catch(err => {
			assert.is(err.statusCode, 404);
		});

		let res = await server.send('GET', '/hello/world');
		await utils.matches(res, 200, 'index.html', 'utf8');
	} finally {
		server.close();
	}
});

ignores('should provide custom String pattern to ignore', async () => {
	let server = utils.http({
		single: true,
		ignores: '^/foo'
	});

	try {
		await server.send('GET', '/foo/404').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/foobar/baz').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/foo/bar/baz').catch(err => {
			assert.is(err.statusCode, 404);
		});

		let res = await server.send('GET', '/hello/world');
		await utils.matches(res, 200, 'index.html', 'utf8');
	} finally {
		server.close();
	}
});

ignores('should provide mulitple RegExp patterns to ignore', async () => {
	let server = utils.http({
		single: true,
		ignores: [/^[/]foo/, /bar/]
	});

	try {
		await server.send('GET', '/foo/404').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/hello/bar/baz').catch(err => {
			assert.is(err.statusCode, 404);
		});

		let res = await server.send('GET', '/hello/world');
		await utils.matches(res, 200, 'index.html', 'utf8');
	} finally {
		server.close();
	}
});

ignores('should provide mulitple String patterns to ignore', async () => {
	let server = utils.http({
		single: true,
		ignores: ['^/foo', 'bar']
	});

	try {
		await server.send('GET', '/foo/404').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/hello/bar/baz').catch(err => {
			assert.is(err.statusCode, 404);
		});

		let res = await server.send('GET', '/hello/world');
		await utils.matches(res, 200, 'index.html', 'utf8');
	} finally {
		server.close();
	}
});

ignores.run();

// ---

const dotfiles = suite('dotfiles');

dotfiles('should reject hidden files by default (dev: false)', async () => {
	let server = utils.http();

	try {
		await server.send('GET', '/.hello').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/foo/.world').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/.hello.txt').catch(err => {
			assert.is(err.statusCode, 404);
		});
	} finally {
		server.close();
	}
});

dotfiles('should reject hidden files by default (dev: true)', async () => {
	let server = utils.http({ dev: true });

	try {
		await server.send('GET', '/.hello').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/foo/.world').catch(err => {
			assert.is(err.statusCode, 404);
		});

		await server.send('GET', '/.hello.txt').catch(err => {
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

		let res3 = await server.send('GET', '/.hello.txt');
		await utils.matches(res3, 200, '.hello.txt', 'utf8');
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
		assert.is(res.headers['content-type'], 'text/javascript');
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

dev('should set default `Cache-Control` header value', async () => {
	let server = utils.http({ dev: true });

	try {
		let res1 = await server.send('GET', '/bundle.67329.js');
		assert.is(res1.headers['cache-control'], 'no-store');
	} finally {
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

etag('should force `Cache-Control` header in `dev` mode', async () => {
	let server = utils.http({ etag: true, dev: true });

	try {
		let res1 = await server.send('GET', '/bundle.67329.js');
		assert.is(res1.headers['cache-control'], 'no-cache');

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
		assert.is(res.headers['content-type'], 'text/javascript');
		assert.is(res.headers['content-encoding'], 'br');
		assert.is(res.data, 'brotli js file\n');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

brotli('should serve prepared `.br` file of any asset, if found', async () => {
	let server = utils.http({ brotli: true });
	let headers = { 'Accept-Encoding': 'br,gzip' };

	try {
		let res1 = await server.send('GET', '/', { headers });
		assert.is(res1.headers['content-type'], 'text/html;charset=utf-8');
		assert.is(res1.headers['content-encoding'], 'br');
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
		assert.is(res1.headers['content-type'], 'text/html;charset=utf-8');
		assert.is(res1.headers['content-encoding'], 'br');
		assert.is(res1.data, 'brotli html\n');
		assert.is(res1.statusCode, 200);

		let res2 = await server.send('GET', '/data.js', { headers });
		assert.is(res2.headers['content-type'], 'text/javascript');
		assert.is(res2.headers['content-encoding'], 'br');
		assert.is(res2.data, 'brotli js file\n');
		assert.is(res2.statusCode, 200);
	} finally {
		server.close();
	}
});

brotli.run();

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
		assert.is(res.headers['content-type'], 'text/javascript');
		assert.is(res.headers['content-encoding'], 'gzip');
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
		assert.is(res1.headers['content-type'], 'text/html;charset=utf-8');
		assert.is(res1.headers['content-encoding'], 'gzip');
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
		assert.is(res1.headers['content-type'], 'text/html;charset=utf-8');
		assert.is(res1.headers['content-encoding'], 'br');
		assert.is(res1.data, 'brotli html\n');
		assert.is(res1.statusCode, 200);

		let res2 = await server.send('GET', '/data.js', { headers });
		assert.is(res2.headers['content-type'], 'text/javascript');
		assert.is(res2.headers['content-encoding'], 'br');
		assert.is(res2.data, 'brotli js file\n');
		assert.is(res2.statusCode, 200);
	} finally {
		server.close();
	}
});

gzip('should not set "Content-Encoding" for a direct request of a copressed file (dev: true)', async () => {
	let server = utils.http({ dev: true, gzip: true });
	try {
		await testGzipDirectRequest(server);
	} finally {
		server.close();
	}
});

gzip('should not set "Content-Encoding" for a direct request of a copressed file (dev: false)', async () => {
	let server = utils.http({ dev: false, gzip: true });
	try {
		await testGzipDirectRequest(server);
	} finally {
		server.close();
	}
});

async function testGzipDirectRequest(server) {
	let headers = { 'Accept-Encoding': 'gzip' };

	{
		let res = await server.send('GET', '/test.csv.gz.gz', { headers });
		assert.is(res.headers['content-type'], 'application/gzip');
		assert.is(res.headers['content-encoding'], undefined);
		assert.is(res.data, 'test.csv.gz.gz\n');
		assert.is(res.statusCode, 200);
	}

	{
		let res = await server.send('GET', '/test.csv.gz', { headers });
		assert.is(res.headers['content-type'], 'application/gzip');
		assert.is(res.headers['content-encoding'], 'gzip');
		assert.is(res.data, 'test.csv.gz.gz\n');
		assert.is(res.statusCode, 200);
	}

	{
		let res = await server.send('GET', '/test.csv', { headers });
		assert.is(res.headers['content-type'], 'text/csv');
		assert.is(res.headers['content-encoding'], 'gzip');
		assert.is(res.data, 'test.csv.gz\n');
		assert.is(res.statusCode, 200);
	}

	{
		let res = await server.send('GET', '/test.csv.gz.gz');
		assert.is(res.headers['content-type'], 'application/gzip');
		assert.is(res.headers['content-encoding'], undefined);
		assert.is(res.data, 'test.csv.gz.gz\n');
		assert.is(res.statusCode, 200);
	}

	{
		let res = await server.send('GET', '/test.csv.gz');
		assert.is(res.headers['content-type'], 'application/gzip');
		assert.is(res.headers['content-encoding'], undefined);
		assert.is(res.data, 'test.csv.gz\n');
		assert.is(res.statusCode, 200);
	}

	{
		let res = await server.send('GET', '/test.csv');
		assert.is(res.headers['content-type'], 'text/csv');
		assert.is(res.headers['content-encoding'], undefined);
		assert.is(res.data, 'test.csv\n');
		assert.is(res.statusCode, 200);
	}
}

gzip.run();

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
		assert.is(res.headers['cache-control'], 'public,max-age=0,must-revalidate');
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

ranges('should throw `416` when range start cannot be met (overflow)', async () => {
	let server = utils.http();

	try {
		let headers = { Range: 'bytes=123456-234567' };
		let file = await utils.lookup('bundle.67329.js', 'utf8');
		await server.send('GET', '/bundle.67329.js', { headers }).catch(err => {
			assert.is(err.headers['content-range'], `bytes */${file.size}`);
			assert.is(err.statusCode, 416);
		});
	} finally {
		server.close();
	}
});

ranges('should shrink range end if it cannot be met (overflow)', async () => {
	let server = utils.http();

	try {
		let headers = { Range: 'bytes=10-123456' };
		let file = await utils.lookup('bundle.67329.js', 'utf8');
		let res = await server.send('GET', '/bundle.67329.js', { headers });
		assert.is(res.headers['content-range'], `bytes 10-${file.size - 1}/${file.size}`);
		assert.is(res.statusCode, 206);
	} finally {
		server.close();
	}
});

ranges('should not mutate response headers on subsequent non-Range requests :: dev', async () => {
	let server = utils.http({ dev: true });

	try {
		let file = await utils.lookup('bundle.67329.js', 'utf8');

		let headers = { Range: 'bytes=0-10' };
		let res1 = await server.send('GET', '/bundle.67329.js', { headers });
		assert.ok(res1.headers['content-range']);
		assert.ok(res1.headers['accept-ranges']);

		let res2 = await server.send('GET', '/bundle.67329.js');
		assert.is(res2.statusCode, 200);
		assert.is(res2.headers['content-length'], `${file.size}`);
		assert.not(res2.headers['content-range']);
		assert.not(res2.headers['accept-ranges']);

	} finally {
		server.close();
	}
});

ranges('should not mutate response headers on subsequent non-Range requests :: prod', async () => {
	let server = utils.http({ dev: false });

	try {
		let file = await utils.lookup('bundle.67329.js', 'utf8');

		let headers = { Range: 'bytes=0-10' };
		let res1 = await server.send('GET', '/bundle.67329.js', { headers });
		assert.ok(res1.headers['content-range']);
		assert.ok(res1.headers['accept-ranges']);

		let res2 = await server.send('GET', '/bundle.67329.js');
		assert.is(res2.statusCode, 200);
		assert.is(res2.headers['content-length'], `${file.size}`);
		assert.not(res2.headers['content-range']);
		assert.not(res2.headers['accept-ranges']);

	} finally {
		server.close();
	}
});

ranges.run();

// ---

const setHeaders = suite('setHeaders');

setHeaders('should be able to set new response headers', async () => {
	let server = utils.http({
		setHeaders(res) {
			res.setHeader('x-foo', 'bar');
		}
	});

	try {
		let res = await server.send('GET', '/sw.js');
		assert.is(res.headers['x-foo'], 'bar');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

setHeaders('should be able to customize "Content-Type" header', async () => {
	let server = utils.http({
		setHeaders(res) {
			res.setHeader('Content-Type', 'text/foobar');
		}
	});

	try {
		let res = await server.send('GET', '/sw.js');
		assert.is(res.headers['content-type'], 'text/foobar');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

setHeaders('should be able to customize "Cache-Control" header', async () => {
	let server = utils.http({
		maxAge: 100,
		immutable: true,
		setHeaders(res) {
			res.setHeader('Cache-Control', 'private,foobar');
		}
	});

	try {
		let res = await server.send('GET', '/sw.js');
		assert.is(res.headers['cache-control'], 'private,foobar');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

setHeaders('should be able to customize "Last-Modified" header', async () => {
	let server = utils.http({
		etag: true,
		setHeaders(res) {
			res.setHeader('Last-Modified', 'hello world');
		}
	});

	try {
		let res = await server.send('GET', '/sw.js');
		assert.is(res.headers['last-modified'], 'hello world');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

setHeaders('should receive "path" argument', async () => {
	let server = utils.http({
		setHeaders(res, path) {
			res.setHeader('Cache-Control', path === '/sw.js' ? 'private' : 'public');
		}
	});

	try {
		let res1 = await server.send('GET', '/sw.js');
		assert.is(res1.headers['cache-control'], 'private');
		await utils.matches(res1, 200, 'sw.js', 'utf8');

		let res2 = await server.send('GET', '/test.svg');
		assert.is(res2.headers['cache-control'], 'public');
		await utils.matches(res2, 200, 'test.svg', 'utf8');
	} finally {
		server.close();
	}
});

setHeaders('should receive "stats" argument', async () => {
	let server = utils.http({
		setHeaders(res, path, stats) {
			res.setHeader('x-filesize', stats.size);
		}
	});

	try {
		let res = await server.send('GET', '/sw.js');
		let file = await utils.lookup('sw.js', 'utf8');
		assert.is(res.headers['x-filesize'], String(file.size));
	} finally {
		server.close();
	}
});

setHeaders.run();

// ---

const onNoMatch = suite('onNoMatch');

onNoMatch('should be called instead of default 404 response', async () => {
	let server = utils.http({
		onNoMatch(req, res) {
			res.setHeader('x-foo', 'bar');
			res.end('not found');
		}
	});

	try {
		let res = await server.send('GET', '/1234');
		assert.is(res.headers['x-foo'], 'bar');
		assert.is(res.data, 'not found');
		assert.is(res.statusCode, 200);
	} finally {
		server.close();
	}
});

onNoMatch.run();
