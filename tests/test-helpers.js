const { Writable } = require("stream")

async function runMiddleware(fn, req) {
	const out = {
		headers: {},
		statusCode: -1,
	}
	await new Promise((resolve, reject) => {
		const res = new Writable({
			write() {}
		});
		Object.defineProperty(res, 'statusCode', {
			set(value) {
				out.statusCode = value;
			}
		})
		res.on('error', reject)
		res.on('finish', resolve);
		res.writeHead = (code, headers) => {
			out.statusCode = code;
			Object.assign(out.headers, headers);
		}
		fn(req, res);
	});

	return out
}

module.exports = {
	runMiddleware,
}
