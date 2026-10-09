# @powerduck/openapi-codegen

[![npm version](https://img.shields.io/npm/v/@powerduck/openapi-codegen)](https://www.npmjs.com/package/@powerduck/openapi-codegen)
[![license](https://img.shields.io/npm/l/@powerduck/openapi-codegen)](https://github.com/powerducklab/openapi-codegen/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/@powerduck/openapi-codegen)](https://www.npmjs.com/package/@powerduck/openapi-codegen)

Generate runnable HTTP request examples from OpenAPI documents. Supports 21 languages and 41 language/client combinations. Browser-compatible, zero runtime dependencies.

---

Powerduck is an open-source developer tooling platform for teams building modern API workflows.

- **21 Languages** — JavaScript, Python, Go, Rust, Java, PHP, Ruby, C#, F#, Kotlin, Swift, Dart, and more
- **41 Client Combinations** — fetch, axios, requests, httpx, http.client, aiohttp, Guzzle, RestSharp, and more
- **OpenAPI 3.0/3.1/3.2** — Full support for modern OpenAPI specifications
- **Security Schemes** — Bearer tokens, API keys, Basic auth, OAuth2, and custom headers
- **Parameter Handling** — Path, query, header, and cookie parameters with proper encoding
- **Request Bodies** — JSON, form-data, x-www-form-urlencoded, and raw payloads
- **Browser Compatible** — Pure TypeScript, no Node.js dependencies, works in any modern browser
- **Dual ESM/CJS** — Works with `import` and `require`, with bundled TypeScript declarations

---

## Quick Start

### Install

```bash
npm install @powerduck/openapi-codegen
```

### Generate from a document

```typescript
import { generate } from "@powerduck/openapi-codegen";

const code = generate({
  document: openApiDocument,
  path: "/pets/{id}",
  method: "get",
  language: "javascript",
  client: "fetch",
});

console.log(code);
```

### List available generators

```typescript
import { list } from "@powerduck/openapi-codegen";

for (const { language, client } of list()) {
  console.log(`${language}/${client}`);
}
```

### Provide credentials

```typescript
const code = generate({
  document,
  path: "/pets/{id}",
  method: "get",
  language: "javascript",
  client: "fetch",
  securityValues: {
    bearerAuth: "your-token-here",
    apiKey: "your-api-key",
  },
});
```

---

## Links

- [Official Website](https://www.powerduck.com/opensource/openapi-codegen.html)
- [Documentation](https://www.powerduck.com/docs/openapi-codegen/introduction)
- [Live Demo](https://www.powerduck.com/demo/)
- [GitHub](https://github.com/powerducklab/openapi-codegen)
- [npm](https://www.npmjs.com/package/@powerduck/openapi-codegen)

---

## Supported Languages & Clients

| Language (`language`) | Clients (`client`)                                              |
| --------------------- | --------------------------------------------------------------- |
| `c`                   | `libcurl`                                                       |
| `csharp`              | `httpclient`, `restsharp`                                       |
| `clojure`             | `clj-http`                                                      |
| `dart`                | `http`                                                          |
| `fsharp`              | `httpclient`                                                    |
| `go`                  | `new-request`                                                   |
| `http`                | `http1`                                                         |
| `java`                | `asynchttp`, `java-net-http`, `okhttp`, `unirest`               |
| `javascript`          | `axios`, `fetch`, `jquery`, `ofetch`, `xhr`                     |
| `kotlin`              | `okhttp`                                                        |
| `node`                | `axios`, `fetch`, `ofetch`, `undici`                            |
| `objc`                | `nsurlsession`                                                  |
| `ocaml`               | `cohttp`                                                        |
| `php`                 | `curl`, `guzzle`, `laravel-http`                                |
| `powershell`          | `invoke-restmethod`, `invoke-webrequest`                        |
| `python`              | `aiohttp`, `http-client`, `httpx-async`, `httpx-sync`, `requests` |
| `r`                   | `httr2`                                                         |
| `ruby`                | `net-http`                                                      |
| `rust`                | `reqwest`                                                       |
| `shell`               | `curl`, `httpie`, `wget`                                        |
| `swift`               | `nsurlsession`                                                  |

---

## API Reference

### `generate(options)`

Generate HTTP request code from an OpenAPI document.

```typescript
import { generate } from "@powerduck/openapi-codegen";

const code = generate({
  document: openApiDocument,
  path: "/pets",
  method: "post",
  language: "python",
  client: "requests",
  securityValues: { bearerAuth: "token" },
});
```

#### Options

| Option           | Type                     | Required | Description                                                |
| ---------------- | ------------------------ | -------- | ---------------------------------------------------------- |
| `language`       | `string`                 | Yes      | Target language id (see the table above)                   |
| `client`         | `string`                 | Yes      | HTTP client id (see the table above)                       |
| `document`       | `unknown`                | Yes*     | Parsed OpenAPI document object                             |
| `path`           | `string`                 | Yes*     | API path (e.g. `/pets/{id}`)                               |
| `method`         | `string`                 | Yes*     | HTTP method (get, post, put, delete, patch, head, options) |
| `request`        | `RequestIR`              | No       | Pre-built intermediate request; skips document normalization |
| `serverUrl`      | `string`                 | No       | Override the resolved base URL                             |
| `securityValues` | `Record<string, string>` | No       | Security scheme values                                     |
| `softRefMode`    | `boolean`                | No       | Lenient `$ref` resolution for partially available documents |

`*` Required when `request` is not provided. The common path is `document` + `path` + `method`; pass a pre-built `request` only when you have already normalized the operation yourself.

### `list()`

List all available language/client combinations.

```typescript
import { list } from "@powerduck/openapi-codegen";

const generators = list();
// [{ language: "javascript", client: "fetch" }, ...]
```

### `normalize(options)`

Normalize one operation into the intermediate request shape and validate its inputs.

```typescript
import { normalize } from "@powerduck/openapi-codegen";

const normalized = normalize({
  document: rawDocument,
  path: "/pets/{id}",
  method: "get",
});
```

---

## TypeScript Types

```typescript
import type {
  GenerateOptions,
  Generator,
  Parameter,
  Security,
  Body,
} from "@powerduck/openapi-codegen";
```

---

## Browser Usage

```html
<script type="module">
  import { generate, list } from "https://esm.sh/@powerduck/openapi-codegen";

  const code = generate({
    document: openApiDoc,
    path: "/users",
    method: "get",
    language: "javascript",
    client: "fetch",
  });
</script>
```

---

## License

MIT © [POWERDUCK LIMITED](https://www.powerduck.com)

## 0.6.4 — Circular parameter values

Serializing a circular `deepObject` query parameter now throws a descriptive `TypeError` instead of looping indefinitely. Shared acyclic objects are still serialized at every occurrence.
