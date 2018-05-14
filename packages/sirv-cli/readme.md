<div align="center">
  <img src="https://github.com/lukeed/sirv/raw/master/sirv-cli.png" alt="sirv-cli" width="350" />
</div>

<h1 align="center">sirv-cli</h1>

<div align="center">
  <a href="https://npmjs.org/package/sirv-cli">
    <img src="https://img.shields.io/npm/v/sirv-cli.svg" alt="version" />
  </a>
  <a href="https://travis-ci.org/lukeed/sirv">
    <img src="https://img.shields.io/travis/lukeed/sirv.svg" alt="travis" />
  </a>
  <a href="https://npmjs.org/package/sirv-cli">
    <img src="https://img.shields.io/npm/dm/sirv-cli.svg" alt="downloads" />
  </a>
</div>

<div align="center">A lightweight CLI program to serve static sites~!</div>

<br />

- This is the CLI counterpart to the `sirv` library and the `@polka/static` middleware.
- Unlike `sirv`, will compress files on init
- Quickly start a server on your static assets, or preview _any_ directory if installed globally.
- Link to [`serve`](https://github.com/zeit/serve) for comparison


## Install

```
$ npm install --save sirv-cli
```

> **Note:** This module can also be installed and used globally~!

## Usage

Running `sirv` as a standalone command is an alias of `sirv start`, with the sole exception of displaying help text (via `-h` or `--help`).

```
$ sirv --help

  Usage
    $ sirv <command> [options]

  Available Commands
    start    Start a static file server.

  For more info, run any command with the `--help` flag
    $ sirv start --help

  Options
    -v, --version    Displays current version
    -h, --help       Displays this message

  Examples
    $ sirv build --cors --port 8080
    $ sirv start build --cors --port 8080
    $ sirv public --quiet --etag --maxage 31536000 --immutable
    $ sirv start public -qeim 31536000
    $ sirv --port 8080 --etag
```

```
$ sirv start --help

  Description
    Start a static file server.

  Usage
    $ sirv start [dir] [options]

  Options
    -e, --etag         Enable "Etag" header
    -d, --dotfiles     Enable dotfile asset requests
    -c, --cors         Enable "CORS" headers to allow any origin requestor
    -m, --maxage       Enable "Cache-Control" header & define its "max-age" value (sec)
    -i, --immutable    Enable the "immutable" directive for "Cache-Control" header
    -q, --quiet        Disable logging to terminal
    -p, --port         Port to listen  (default 5000)
    -h, --help         Displays this message
```


## License

MIT © [Luke Edwards](https://lukeed.com)
