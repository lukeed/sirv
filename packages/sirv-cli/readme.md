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

Quickly start a server to preview the assets of _any_ directory!

Just like [`serve`](https://github.com/zeit/serve), you may install and use `sirv-cli` globally or on a per-project basis.


## Install

```
$ npm install --save sirv-cli
```

> **Note:** This module can also be installed and used globally~!

## Usage

Running `sirv` as a standalone command is an alias of `sirv start`, with the sole exception of displaying help text!

> **Note:** This is because `sirv-cli` may include new commands in the future. <br>For example, compression may be extracted to a `compress` command, or `watch` may be added.

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
    -D, --dev          Enable "dev" mode
    -e, --etag         Enable "Etag" header
    -d, --dotfiles     Enable dotfile asset requests
    -c, --cors         Enable "CORS" headers to allow any origin requestor
    -m, --maxage       Enable "Cache-Control" header & define its "max-age" value (sec)
    -i, --immutable    Enable the "immutable" directive for "Cache-Control" header
    -s, --single       Serve single-page applications
    -q, --quiet        Disable logging to terminal
    -H, --host         Hostname to bind  (default localhost)
    -p, --port         Port to bind  (default 5000)
    -h, --help         Displays this message
```

> **Note:** The `HOST` and `PORT` environment variables will override flag values.


## License

MIT © [Luke Edwards](https://lukeed.com)
