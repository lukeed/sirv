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

// --

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
