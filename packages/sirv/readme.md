# sirv [![Build Status](https://travis-ci.org/lukeed/sirv.svg?branch=master)](https://travis-ci.org/lukeed/sirv)

> The optimized and lightweight middleware for serving requests to static assets

You may use `sirv` as a *very* fast and lightweight alternative to [`serve-static`](https://www.npmjs.com/package/serve-static). While (currently), `sirv` may not have the same options, it handles the majority of use cases without a hitch!

The massive performance advantage over `serve-static` is explained by **not** relying on the file system for existence checks on every request. These are expensive interactions & must be avoided whenever possible! Instead, `sirv` performs all its work upfront and recycles the initial resultset for existence checks & writing header values based on files' stats.

This middleware will work out of the box for [Polka](https://github.com/lukeed/polka) and other Express-like frameworks. It requires _very_ little effort to modify/wrap it for servers that don't accept the `(req, res, next)` signature.

:bulb: For a feature-complete CLI application, check out the sibling [`sirv-cli`](https://github.com/lukeed/sirv/tree/master/packages/sirv-cli) package as an alternative to [`zeit/serve`](https://github.com/zeit/serve)~!

## Install

```
$ npm install --save sirv
```


## Usage

```js
const sirv = require('sirv');
const polka = require('polka');
const compress = require('compression')();

// Init `sirv` handler
const assets = sirv('public', {
  maxAge: 31536000, // 1Y
  immutable: true
});

polka()
  .use(compress, assets)
  .use('/api', require('./api'))
  .listen(3000)
  .then(() => {
    console.log('> Ready on localhost:3000~!');
  });
```


## API

### sirv(dir, opts={})

Returns: `Function`

The returned function is a middleware in the standard Express-like signature: `(req, res, next)`, where `req` is the [`http.IncomingMessage`](https://nodejs.org/api/http.html#http_class_http_incomingmessage), `res` is the [`http.ServerResponse`](https://nodejs.org/dist/latest-v9.x/docs/api/http.html#http_class_http_serverresponse), and `next` (in this case) is the function to call if no file was found for the given path.

For `sirv`, the `next()` callback is functionally synonymous with [`opts.onNoMatch`](#optsonnomatch); however `next()` is given priority if/when defined and **will not** receive the `res` as an argument.

#### dir
Type: `String`<br>
Default: `.`

The directory from which to read and serve assets. It is resolved to an absolute path &mdash; you must provide an absolute path yourself if `process.cwd()` is not the correct assumption.

#### opts.dev
Type: `Boolean`<br>
Default: `false`

Enable "dev" mode, which disables/skips caching. Instead, `sirv` will traverse the file system ***on every request***.

Additionally, `dev` mode will ignore `maxAge`, `immutable`, `etag`, and `setHeaders` as these options are geared towards production response headers.

> **Important:** Do not use `dev` mode in production!

#### opts.etag
Type: `Boolean`<br>
Default: `false`

Generate and attach an `ETag` header to responses.

#### opts.dotfiles
Type: `Boolean`<br>
Default: `false`

Allow requests to dotfiles (files or directories beginning with a `.`).

#### opts.extensions
Type: `Array`<br>
Default: `['html', 'htm']`

The file extension fallbacks to check for if a pathame is not initially found. For example, if a `/login` request cannot find a `login` filename, it will then look for `login.html` and `login.htm` before giving up~!

> **Important:** Actually, `sirv` will **also** look for `login/index.html` and `login/index.htm` before calling it quits.

#### opts.maxAge
Type: `Number`<br>
Default: `undefined`

Enables the `Cache-Control` header on responses & sets the `max-age` value (in seconds). For example `31536000` is equivalent to one year.

#### opts.immutable
Type: `Boolean`<br>
Default: `false`

Appends the [`immutable` directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#Revalidation_and_reloading) on your `Cache-Control` header, used for uniquely-named assets that will not change!

> **Note:** Requires `opts.maxAge` to contain a value!

#### opts.onNoMatch
Type: `Function`

A custom function to run if a file cannot be found for a given request. <br>By default, `sirv` will send a basic `(404) Not found` response.

The function receives the current `req <IncomingMessage>, res <ServerResponse>` pair for as its two arguments.

> **Note:** This won't run if a `next` callback has been provided to the middleware; see [`sirv`](#sirvdir-opts) description.

#### opts.setHeaders
Type: `Function`

A custom function to append or change any headers on the outgoing response. There is no default.

Its signature is `(res, pathname, stats)`, where `res` is the `ServerResponse`, `pathname` is incoming request path (stripped of queries), and `stats` is the file's result from [`fs.statSync`](https://nodejs.org/api/fs.html#fs_fs_statsync_path).


## License

MIT © [Luke Edwards](https://lukeed.com)
