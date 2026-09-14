import { describe, expect, it } from "vitest";
import { generate } from "../src/index";
import {
  minimalOpenApi,
  openApiWithRefs,
  openApiWithSecurity,
  openApiWithServers,
  openApi32,
  openApiWithMultipart,
  openApiWithFormUrlEncoded,
  openApiWithHeaders,
} from "./fixtures";

describe("generate()", () => {
  it("generates code for a simple GET request", () => {
    const code = generate({
      document: minimalOpenApi,
      path: "/users",
      method: "get",
      language: "javascript",
      client: "fetch",
    });
    expect(typeof code).toBe("string");
    expect(code.length).toBeGreaterThan(0);
    expect(code).toContain("fetch");
  });

  it("generates code for a POST request with JSON body", () => {
    const code = generate({
      document: minimalOpenApi,
      path: "/users",
      method: "post",
      language: "javascript",
      client: "fetch",
    });
    expect(code).toContain("POST");
    expect(code).toContain("name");
  });

  it("generates code for a path parameter", () => {
    const code = generate({
      document: minimalOpenApi,
      path: "/users/{id}",
      method: "get",
      language: "javascript",
      client: "fetch",
    });
    expect(typeof code).toBe("string");
    expect(code.length).toBeGreaterThan(0);
    // Path parameter should be reflected in the generated code somehow
    expect(code).toMatch(/users|id|path/i);
  });

  it("generates code for all 41 generators", () => {
    const generators = [
      ["c", "libcurl"],
      ["csharp", "httpclient"],
      ["csharp", "restsharp"],
      ["clojure", "clj-http"],
      ["dart", "http"],
      ["fsharp", "httpclient"],
      ["go", "new-request"],
      ["http", "http1"],
      ["java", "asynchttp"],
      ["java", "java-net-http"],
      ["java", "okhttp"],
      ["java", "unirest"],
      ["javascript", "axios"],
      ["javascript", "fetch"],
      ["javascript", "jquery"],
      ["javascript", "ofetch"],
      ["javascript", "xhr"],
      ["kotlin", "okhttp"],
      ["node", "axios"],
      ["node", "fetch"],
      ["node", "ofetch"],
      ["node", "undici"],
      ["objc", "nsurlsession"],
      ["ocaml", "cohttp"],
      ["php", "curl"],
      ["php", "guzzle"],
      ["php", "laravel-http"],
      ["powershell", "invoke-restmethod"],
      ["powershell", "invoke-webrequest"],
      ["python", "aiohttp"],
      ["python", "http-client"],
      ["python", "httpx-async"],
      ["python", "httpx-sync"],
      ["python", "requests"],
      ["r", "httr2"],
      ["ruby", "net-http"],
      ["rust", "reqwest"],
      ["shell", "curl"],
      ["shell", "httpie"],
      ["shell", "wget"],
      ["swift", "nsurlsession"],
    ];

    for (const [language, client] of generators) {
      const code = generate({
        document: minimalOpenApi,
        path: "/users",
        method: "get",
        language,
        client,
      });
      expect(typeof code).toBe("string");
      expect(code.length).toBeGreaterThan(0);
    }
  });

  it("resolves $ref in parameters", () => {
    const code = generate({
      document: openApiWithRefs,
      path: "/users",
      method: "get",
      language: "javascript",
      client: "fetch",
    });
    expect(code).toContain("page");
  });

  it("includes security headers when securityValues provided", () => {
    const code = generate({
      document: openApiWithSecurity,
      path: "/secure",
      method: "get",
      language: "javascript",
      client: "fetch",
      securityValues: {
        bearerAuth: "my-token",
        apiKey: "my-key",
      },
    });
    expect(code).toContain("my-token");
  });

  it("uses server URL from document", () => {
    const code = generate({
      document: openApiWithServers,
      path: "/items",
      method: "get",
      language: "shell",
      client: "curl",
    });
    expect(code).toContain("api.example.com");
  });

  it("supports custom serverUrl override", () => {
    const code = generate({
      document: openApiWithServers,
      path: "/items",
      method: "get",
      language: "shell",
      client: "curl",
      serverUrl: "https://custom.example.com",
    });
    expect(code).toContain("custom.example.com");
  });

  it("supports OpenAPI 3.2 documents", () => {
    const code = generate({
      document: openApi32,
      path: "/v32",
      method: "get",
      language: "javascript",
      client: "fetch",
    });
    expect(typeof code).toBe("string");
    expect(code.length).toBeGreaterThan(0);
  });

  it("generates multipart form data code", () => {
    const code = generate({
      document: openApiWithMultipart,
      path: "/upload",
      method: "post",
      language: "javascript",
      client: "fetch",
    });
    expect(code).toContain("FormData");
  });

  it("generates url-encoded form code", () => {
    const code = generate({
      document: openApiWithFormUrlEncoded,
      path: "/submit",
      method: "post",
      language: "javascript",
      client: "fetch",
    });
    expect(typeof code).toBe("string");
    expect(code.length).toBeGreaterThan(0);
    // Form data should be reflected in the generated code
    expect(code).toMatch(/form|body|username|password/i);
  });

  it("includes header parameters", () => {
    const code = generate({
      document: openApiWithHeaders,
      path: "/headers",
      method: "get",
      language: "javascript",
      client: "fetch",
    });
    expect(code).toContain("X-Request-ID");
  });

  it("throws for unknown language/client", () => {
    expect(() =>
      generate({
        document: minimalOpenApi,
        path: "/users",
        method: "get",
        language: "unknown",
        client: "unknown",
      }),
    ).toThrow("Unsupported generator");
  });

  it("throws when document is missing", () => {
    expect(() =>
      generate({
        path: "/users",
        method: "get",
        language: "javascript",
        client: "fetch",
      } as never),
    ).toThrow("requires either");
  });

  it("throws when path is missing", () => {
    expect(() =>
      generate({
        document: minimalOpenApi,
        method: "get",
        language: "javascript",
        client: "fetch",
      } as never),
    ).toThrow("requires a 'path'");
  });

  it("throws when method is missing", () => {
    expect(() =>
      generate({
        document: minimalOpenApi,
        path: "/users",
        language: "javascript",
        client: "fetch",
      } as never),
    ).toThrow("requires a 'method'");
  });

  it("throws for non-existent path", () => {
    expect(() =>
      generate({
        document: minimalOpenApi,
        path: "/nonexistent",
        method: "get",
        language: "javascript",
        client: "fetch",
      }),
    ).toThrow();
  });

  it("throws for non-existent method on path", () => {
    expect(() =>
      generate({
        document: minimalOpenApi,
        path: "/users",
        method: "patch",
        language: "javascript",
        client: "fetch",
      }),
    ).toThrow();
  });

  it("accepts request directly without document", () => {
    const code = generate({
      language: "shell",
      client: "curl",
      request: {
        method: "GET",
        baseUrl: "https://example.com",
        path: "/test",
        parameters: [],
        headers: [],
        body: undefined,
        security: [],
      } as never,
    });
    expect(code).toContain("example.com");
  });

  it("generates consistent output for same input", () => {
    const options = {
      document: minimalOpenApi,
      path: "/users",
      method: "get",
      language: "javascript",
      client: "fetch",
    };
    const first = generate(options);
    const second = generate(options);
    expect(first).toBe(second);
  });
});
