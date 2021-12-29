# sirv ![CI](https://github.com/lukeed/sirv/workflows/CI/badge.svg)

> An optimized middleware & CLI application for serving static files~!

* **sirv**<br>
  [GitHub](https://github.com/lukeed/sirv/tree/master/packages/sirv) · [Package](https://www.npmjs.com/package/sirv) <br>
  _The core module, returning a middleware function for use in [Polka](https://github.com/lukeed/polka) & Express-like frameworks._

* **sirv-cli**<br>
  [GitHub](https://github.com/lukeed/sirv/tree/master/packages/sirv-cli) · [Package](https://www.npmjs.com/package/sirv-cli) <br>
  _The standalone CLI application, allowing for instant previews of static sites._



## Benchmarks

All results are taken with the following command:

```sh
$ wrk -t8 -c100 -d10s http://localhost:$PORT/
#=> wrk -t8 -c100 -d10s http://localhost:8080
```

> **Note:** Expand each section to view results :thinking:


### Programmatic

> Running the [`/bench`](/bench) directory with Node.js v10.13.0

Compares `sirv` against `serve-static`, both of which require programmatic usage for use within existing Node servers.

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

### CLI

> Each command was run independently on Node 16.13.0

Compares `sirv-cli` against `http-server`, both of which are standalone CLI utilities.

<details>
<summary><strong>GET "/" (200)</strong></summary>

```
http-server :: Cache = YES
  $ http-server tests/public
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    18.32ms    4.08ms  69.85ms   89.77%
    Req/Sec   659.44     93.04   767.00     90.62%
  52614 requests in 10.03s, 29.30MB read
Requests/sec:   5247.35
Transfer/sec:      2.92MB


http-server :: Cache = NO
  $ http-server tests/public -c-1
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    18.89ms    4.58ms  73.49ms   89.99%
    Req/Sec   639.83    105.69   727.00     89.00%
  51052 requests in 10.03s, 29.55MB read
Requests/sec:   5091.65
Transfer/sec:      2.95MB


sirv-cli :: Cache = YES
  $ sirv tests/public
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     8.19ms    6.18ms 106.92ms   95.99%
    Req/Sec     1.59k   300.50     1.82k    89.75%
  126322 requests in 10.02s, 60.72MB read
Requests/sec:  12612.53
Transfer/sec:      6.06MB


sirv-cli :: Cache = NO
  $ sirv tests/public --dev
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    11.32ms    1.99ms  54.04ms   94.70%
    Req/Sec     1.07k   122.82     1.21k    90.00%
  85069 requests in 10.02s, 42.92MB read
Requests/sec:   8490.92
Transfer/sec:      4.28MB


sirv-cli :: Cache = YES :: Logs = NO
  $ sirv tests/public --no-logs
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     7.05ms    1.78ms  33.87ms   94.72%
    Req/Sec     1.72k   295.83     6.89k    93.38%
  137539 requests in 10.11s, 66.11MB read
Requests/sec:  13609.61
Transfer/sec:      6.54MB


sirv-cli :: Cache = NO :: Logs = NO
  $ sirv tests/public --no-logs --dev
---
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     9.49ms    2.10ms  44.24ms   94.50%
    Req/Sec     1.28k   175.71     1.45k    87.88%
  101753 requests in 10.02s, 51.33MB read
Requests/sec:  10157.38
Transfer/sec:      5.12MB
```
</details>


## Notice

There is zero relationship between `sirv.com` and this module or its author.


## License

MIT © [Luke Edwards](https://lukeed.com)
