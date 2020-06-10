# sirv ![CI](https://github.com/lukeed/sirv/workflows/CI/badge.svg)

> An optimized middleware & CLI application for serving static files~!

* **sirv**<br>
  [GitHub](https://github.com/lukeed/sirv/tree/master/packages/sirv) · [Package](https://www.npmjs.com/package/sirv) <br>
  _The core module, returning a middleware function for use in [Polka](https://github.com/lukeed/polka) & Express-like frameworks._

* **sirv-cli**<br>
  [GitHub](https://github.com/lukeed/sirv/tree/master/packages/sirv-cli) · [Package](https://www.npmjs.com/package/sirv-cli) <br>
  _The standalone CLI application, allowing for instant previews of static sites._



## Benchmarks

> Running the [`/bench`](/bench) directory with Node.js v10.13.0

All results are taken with the following command:

```sh
$ wrk -t8 -c100 -d10s http://localhost:3000/
```

> **Note:** Expand each section to view results :thinking:

<details>
<summary><strong>GET "/" (200)</strong></summary>

```
serve-static
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     8.15ms    2.13ms  41.84ms   93.56%
    Req/Sec     1.49k   231.02     1.78k    89.50%
  118927 requests in 10.03s, 35.61MB read
Requests/sec:  11862.86
Transfer/sec:      3.55MB

sirv (dev: false)
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     5.78ms  495.92us   9.50ms   64.76%
    Req/Sec     2.08k   112.73     2.42k    68.50%
  166152 requests in 10.02s, 34.38MB read
Requests/sec:  16586.47
Transfer/sec:      3.43MB

sirv (dev: true)
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    11.79ms    1.95ms  43.30ms   94.02%
    Req/Sec     1.02k   121.86     1.33k    91.25%
  81808 requests in 10.04s, 18.88MB read
Requests/sec:   8147.26
Transfer/sec:      1.88MB
```
</details>

<details>
<summary><strong>GET "/asset.js" (200)</strong></summary>

```
serve-static
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     8.12ms    1.39ms  22.96ms   92.01%
    Req/Sec     1.49k   174.69     2.06k    73.38%
  118413 requests in 10.02s, 34.89MB read
Requests/sec:  11816.18
Transfer/sec:      3.48MB

sirv (dev: false)
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     5.64ms  507.55us   9.45ms   68.96%
    Req/Sec     2.14k    86.26     2.30k    75.50%
  170225 requests in 10.02s, 34.42MB read
Requests/sec:  16996.46
Transfer/sec:      3.44MB

sirv (dev: true)
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     7.21ms  445.13us  12.04ms   85.69%
    Req/Sec     1.67k    52.53     1.81k    76.88%
  133246 requests in 10.02s, 30.12MB read
Requests/sec:  13302.37
Transfer/sec:      3.01MB
```
</details>

<details>
<summary><strong>GET "/404.css" (404)</strong></summary>

```
serve-static
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     3.49ms  814.94us  19.10ms   94.89%
    Req/Sec     3.48k   406.87     5.59k    95.03%
  278809 requests in 10.10s, 28.18MB read
  Non-2xx or 3xx responses: 278809
Requests/sec:  27593.95
Transfer/sec:      2.79MB

sirv (dev: false)
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     2.27ms  328.88us  11.86ms   90.68%
    Req/Sec     5.32k   390.13     6.26k    93.18%
  426843 requests in 10.10s, 43.15MB read
  Non-2xx or 3xx responses: 426843
Requests/sec:  42256.52
Transfer/sec:      4.27MB

sirv (dev: true)
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    24.06ms    1.63ms  52.42ms   97.02%
    Req/Sec   500.47     29.42   640.00     71.62%
  39989 requests in 10.04s, 4.04MB read
  Non-2xx or 3xx responses: 39989
Requests/sec:   3982.45
Transfer/sec:    412.25KB
```
</details>


## Notice

There is zero relationship between `sirv.com` and this module or its author.


## License

MIT © [Luke Edwards](https://lukeed.com)
