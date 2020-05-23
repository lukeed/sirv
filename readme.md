# sirv ![CI](https://github.com/lukeed/sirv/workflows/CI/badge.svg?event=push)

> An optimized middleware & CLI application for serving static files~!

* **sirv**<br>
  [GitHub](https://github.com/lukeed/sirv/tree/master/packages/sirv) · [Package](https://www.npmjs.com/package/sirv) <br>
  _The core module, returning a middleware function for use in [Polka](https://github.com/lukeed/polka) & Express-like frameworks._

* **sirv-cli**<br>
  [GitHub](https://github.com/lukeed/sirv/tree/master/packages/sirv-cli) · [Package](https://www.npmjs.com/package/sirv-cli) <br>
  _The standalone CLI application, allowing for instant previews of static sites._



## Benchmarks

All benchmarks are taken using the same [Polka](https://github.com/lukeed/polka) application on Node v8.9.0.

Please note that the actual numbers don't really matter; however, the percentage differences between them do!

***File Exists***

```
$ wrk -t8 -c100 -d10s http://localhost:3000/
```

```
serve-static
    Thread Stats   Avg      Stdev     Max   +/- Stdev
        Latency     8.74ms  596.13us  14.44ms   79.26%
        Req/Sec     1.38k    56.04     1.45k    69.62%
      109872 requests in 10.02s, 40.66MB read
    Requests/sec:  10969.49
    Transfer/sec:      4.06MB

sirv
    Thread Stats   Avg      Stdev     Max   +/- Stdev
        Latency     7.87ms    2.53ms  15.59ms   81.37%
        Req/Sec     1.53k    69.36     2.07k    71.25%
      122047 requests in 10.03s, 33.87MB read
    Requests/sec:  12174.15
    Transfer/sec:      3.38MB
```

***File Missing***

```
$ wrk -t8 -c100 -d10s http://localhost:3000/foobar
```

```
serve-static
    Thread Stats   Avg      Stdev     Max   +/- Stdev
        Latency     4.00ms  257.09us   7.81ms   76.04%
        Req/Sec     3.01k    65.66     3.15k    74.62%
      239800 requests in 10.01s, 26.30MB read
      Non-2xx or 3xx responses: 239800
    Requests/sec:  23962.46
    Transfer/sec:      2.63MB

sirv
    Thread Stats   Avg      Stdev     Max   +/- Stdev
        Latency     2.89ms  256.70us   6.62ms   72.19%
        Req/Sec     4.17k   157.94     4.93k    75.22%
      334715 requests in 10.10s, 44.69MB read
      Non-2xx or 3xx responses: 334715
    Requests/sec:  33130.72
    Transfer/sec:      4.42MB
```


## License

MIT © [Luke Edwards](https://lukeed.com)
