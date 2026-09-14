/**
 * Unified emitter registry.
 *
 * This module replaces the redundant src/generators/ directory.
 * Each emitter exports an `emit` function; we wrap it with createGenerator
 * and register all built-in generators here.
 */

import { createGenerator } from "../core/generator";
import type { Generator } from "../types";

import { emit as cLibcurl } from "./c/libcurl";
import { emit as csharpHttpclient } from "./csharp/httpclient";
import { emit as csharpRestsharp } from "./csharp/restsharp";
import { emit as clojureCljHttp } from "./clojure/clj-http";
import { emit as dartHttp } from "./dart/http";
import { emit as fsharpHttpclient } from "./fsharp/httpclient";
import { emit as goNewRequest } from "./go/new-request";
import { emit as httpHttp1 } from "./http/http1";
import { emit as javaAsynchttp } from "./java/asynchttp";
import { emit as javaJavaNetHttp } from "./java/java-net-http";
import { emit as javaOkhttp } from "./java/okhttp";
import { emit as javaUnirest } from "./java/unirest";
import { emit as javascriptAxios } from "./javascript/axios";
import { emit as javascriptFetch } from "./javascript/fetch";
import { emit as javascriptJquery } from "./javascript/jquery";
import { emit as javascriptOfetch } from "./javascript/ofetch";
import { emit as javascriptXhr } from "./javascript/xhr";
import { emit as kotlinOkhttp } from "./kotlin/okhttp";
import { emit as nodeAxios } from "./node/axios";
import { emit as nodeFetch } from "./node/fetch";
import { emit as nodeOfetch } from "./node/ofetch";
import { emit as nodeUndici } from "./node/undici";
import { emit as objcNsurlsession } from "./objc/nsurlsession";
import { emit as ocamlCohttp } from "./ocaml/cohttp";
import { emit as phpCurl } from "./php/curl";
import { emit as phpGuzzle } from "./php/guzzle";
import { emit as phpLaravelHttp } from "./php/laravel-http";
import { emit as powershellInvokeRestmethod } from "./powershell/invoke-restmethod";
import { emit as powershellInvokeWebrequest } from "./powershell/invoke-webrequest";
import { emit as pythonAiohttp } from "./python/aiohttp";
import { emit as pythonHttpClient } from "./python/http-client";
import { emit as pythonHttpxAsync } from "./python/httpx-async";
import { emit as pythonHttpxSync } from "./python/httpx-sync";
import { emit as pythonRequests } from "./python/requests";
import { emit as rHttr2 } from "./r/httr2";
import { emit as rubyNetHttp } from "./ruby/net-http";
import { emit as rustReqwest } from "./rust/reqwest";
import { emit as shellCurl } from "./shell/curl";
import { emit as shellHttpie } from "./shell/httpie";
import { emit as shellWget } from "./shell/wget";
import { emit as swiftNsurlsession } from "./swift/nsurlsession";

/**
 * All built-in generators, defined as [language, client, emitter] tuples.
 * This is the single source of truth for built-in generator registration.
 */
export const builtinGenerators: Generator[] = [
  createGenerator("c", "libcurl", cLibcurl),
  createGenerator("csharp", "httpclient", csharpHttpclient),
  createGenerator("csharp", "restsharp", csharpRestsharp),
  createGenerator("clojure", "clj-http", clojureCljHttp),
  createGenerator("dart", "http", dartHttp),
  createGenerator("fsharp", "httpclient", fsharpHttpclient),
  createGenerator("go", "new-request", goNewRequest),
  createGenerator("http", "http1", httpHttp1),
  createGenerator("java", "asynchttp", javaAsynchttp),
  createGenerator("java", "java-net-http", javaJavaNetHttp),
  createGenerator("java", "okhttp", javaOkhttp),
  createGenerator("java", "unirest", javaUnirest),
  createGenerator("javascript", "axios", javascriptAxios),
  createGenerator("javascript", "fetch", javascriptFetch),
  createGenerator("javascript", "jquery", javascriptJquery),
  createGenerator("javascript", "ofetch", javascriptOfetch),
  createGenerator("javascript", "xhr", javascriptXhr),
  createGenerator("kotlin", "okhttp", kotlinOkhttp),
  createGenerator("node", "axios", nodeAxios),
  createGenerator("node", "fetch", nodeFetch),
  createGenerator("node", "ofetch", nodeOfetch),
  createGenerator("node", "undici", nodeUndici),
  createGenerator("objc", "nsurlsession", objcNsurlsession),
  createGenerator("ocaml", "cohttp", ocamlCohttp),
  createGenerator("php", "curl", phpCurl),
  createGenerator("php", "guzzle", phpGuzzle),
  createGenerator("php", "laravel-http", phpLaravelHttp),
  createGenerator("powershell", "invoke-restmethod", powershellInvokeRestmethod),
  createGenerator("powershell", "invoke-webrequest", powershellInvokeWebrequest),
  createGenerator("python", "aiohttp", pythonAiohttp),
  createGenerator("python", "http-client", pythonHttpClient),
  createGenerator("python", "httpx-async", pythonHttpxAsync),
  createGenerator("python", "httpx-sync", pythonHttpxSync),
  createGenerator("python", "requests", pythonRequests),
  createGenerator("r", "httr2", rHttr2),
  createGenerator("ruby", "net-http", rubyNetHttp),
  createGenerator("rust", "reqwest", rustReqwest),
  createGenerator("shell", "curl", shellCurl),
  createGenerator("shell", "httpie", shellHttpie),
  createGenerator("shell", "wget", shellWget),
  createGenerator("swift", "nsurlsession", swiftNsurlsession),
];
