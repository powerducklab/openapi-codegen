# @powerduck/openapi-codegen

[![npm version](https://img.shields.io/npm/v/@powerduck/openapi-codegen)](https://www.npmjs.com/package/@powerduck/openapi-codegen)
[![license](https://img.shields.io/npm/l/@powerduck/openapi-codegen)](https://github.com/powerducklab/openapi-codegen/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/@powerduck/openapi-codegen)](https://www.npmjs.com/package/@powerduck/openapi-codegen)

Generate runnable HTTP request examples from OpenAPI documents. Supports 21 languages and 41 language/client combinations. Browser-compatible, zero runtime dependencies.

---

Powerduck is an open-source developer tooling platform for teams building modern API workflows.

- **21 Languages** — JavaScript, TypeScript, Python, Go, Rust, Java, PHP, Ruby, C#, Kotlin, Swift, Dart, and more
- **41 Client Combinations** — fetch, axios, requests, httpx, http.client, Faraday, Guzzle, RestSharp, and more
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
- [Live Demo](https://www.powerduck.com/demo/openapi-codegen)
- [GitHub](https://github.com/powerducklab/openapi-codegen)
- [npm](https://www.npmjs.com/package/@powerduck/openapi-codegen)

---

## Supported Languages & Clients

| Language   | Clients                                            |
| ---------- | -------------------------------------------------- |
| JavaScript | fetch, axios, XMLHttpRequest, jQuery, Node.js http |
| TypeScript | fetch, axios                                       |
| Python     | requests, httpx, http.client, aiohttp              |
| Go         | net/http, resty, fasthttp                          |
| Rust       | reqwest, hyper                                     |
| Java       | OkHttp, HttpClient, Unirest, Retrofit              |
| PHP        | cURL, Guzzle, HTTP_Request2                        |
| Ruby       | Net::HTTP, Faraday, RestClient                     |
| C#         | HttpClient, RestSharp, WebRequest                  |
| Kotlin     | OkHttp, Fuel                                       |
| Swift      | URLSession, Alamofire                              |
| Dart       | http, Dio                                          |
| Shell      | cURL, wget, HTTPie                                 |
| PowerShell | Invoke-RestMethod, Invoke-WebRequest               |
| R          | httr, RCurl                                        |
| MATLAB     | webread, urlwrite                                  |
| Elixir     | HTTPoison, Tesla                                   |
| Haskell    | http-conduit, wreq                                 |
| Clojure    | clj-http, http-kit                                 |
| Scala      | sttp, akka-http                                    |

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
  parameterValues: { limit: 10, offset: 0 },
});
```

#### Options

| Option            | Type                      | Required | Description                                                |
| ----------------- | ------------------------- | -------- | ---------------------------------------------------------- |
| `document`        | `OpenAPIDocument`         | Yes      | Parsed OpenAPI document object                             |
| `path`            | `string`                  | Yes      | API path (e.g., `/pets/{id}`)                              |
| `method`          | `string`                  | Yes      | HTTP method (get, post, put, delete, patch, head, options) |
| `language`        | `string`                  | Yes      | Target language                                            |
| `client`          | `string`                  | Yes      | HTTP client library                                        |
| `securityValues`  | `Record<string, string>`  | No       | Security scheme values                                     |
| `parameterValues` | `Record<string, unknown>` | No       | Parameter values                                           |
| `requestBody`     | `unknown`                 | No       | Request body value                                         |
| `headers`         | `Record<string, string>`  | No       | Additional headers                                         |
| `timeout`         | `number`                  | No       | Request timeout in ms                                      |
| `indent`          | `string`                  | No       | Indentation string (default: 2 spaces)                     |
| `quote`           | `"single" \| "double"`    | No       | Quote style (default: language-specific)                   |

### `list()`

List all available language/client combinations.

```typescript
import { list } from "@powerduck/openapi-codegen";

const generators = list();
// [{ language: "javascript", client: "fetch" }, ...]
```

### `normalize(document)`

Normalize and validate an OpenAPI document.

```typescript
import { normalize } from "@powerduck/openapi-codegen";

const normalized = normalize(rawDocument);
```

---

## TypeScript Types

```typescript
import type {
  GenerateOptions,
  GeneratorInfo,
  OpenAPIDocument,
  SecurityScheme,
  Parameter,
  RequestBody,
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
