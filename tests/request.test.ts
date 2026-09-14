import { describe, expect, it } from "vitest";
import { compile, form } from "../src/core/request";
import type { RequestIR } from "../src/types";

describe("compile()", () => {
  const baseRequest: RequestIR = {
    method: "GET",
    baseUrl: "https://api.example.com",
    path: "/users",
    parameters: [],
    headers: [],
    body: undefined,
    security: [],
  };

  it("compiles a simple GET request", () => {
    const result = compile(baseRequest);
    expect(result.url).toContain("api.example.com");
    expect(result.url).toContain("/users");
  });

  it("includes query parameters in URL", () => {
    const request: RequestIR = {
      ...baseRequest,
      parameters: [
        { name: "limit", in: "query", value: "10" },
        { name: "offset", in: "query", value: "0" },
      ],
    };
    const result = compile(request);
    expect(result.url).toContain("limit=10");
    expect(result.url).toContain("offset=0");
  });

  it("replaces path parameters", () => {
    const request: RequestIR = {
      ...baseRequest,
      path: "/users/{id}",
      parameters: [{ name: "id", in: "path", value: "123" }],
    };
    const result = compile(request);
    expect(result.url).toContain("/users/123");
    expect(result.url).not.toContain("{id}");
  });

  it("includes headers as pairs", () => {
    const request: RequestIR = {
      ...baseRequest,
      headers: [
        { name: "X-Request-ID", in: "header", value: "abc-123" },
        { name: "Accept", in: "header", value: "application/json" },
      ],
    };
    const result = compile(request);
    expect(result.headers).toContainEqual(["X-Request-ID", "abc-123"]);
    expect(result.headers).toContainEqual(["Accept", "application/json"]);
  });

  it("includes JSON body", () => {
    const request: RequestIR = {
      ...baseRequest,
      method: "POST",
      body: {
        mediaType: "application/json",
        value: { name: "test" },
      },
    };
    const result = compile(request);
    expect(result.body).toBeDefined();
    expect(result.body?.mediaType).toContain("application/json");
  });

  it("includes form-urlencoded body", () => {
    const request: RequestIR = {
      ...baseRequest,
      method: "POST",
      body: {
        mediaType: "application/x-www-form-urlencoded",
        value: { username: "admin", password: "secret" },
      },
    };
    const result = compile(request);
    expect(result.body).toBeDefined();
    expect(result.body?.mediaType).toContain("x-www-form-urlencoded");
  });

  it("includes bearer security header", () => {
    const request: RequestIR = {
      ...baseRequest,
      security: [
        { name: "bearer", type: "http", scheme: "bearer", value: "my-token" },
      ],
    };
    const result = compile(request);
    expect(result.headers).toContainEqual(["Authorization", "Bearer my-token"]);
  });

  it("includes basic security header", () => {
    const request: RequestIR = {
      ...baseRequest,
      security: [
        { name: "basic", type: "http", scheme: "basic", value: "dXNlcjpwYXNz" },
      ],
    };
    const result = compile(request);
    expect(result.headers).toContainEqual(["Authorization", "Basic dXNlcjpwYXNz"]);
  });

  it("includes API key security in header", () => {
    const request: RequestIR = {
      ...baseRequest,
      security: [
        { name: "apiKey", type: "apiKey", in: "header", paramName: "X-API-Key", value: "my-key" },
      ],
    };
    const result = compile(request);
    expect(result.headers).toContainEqual(["X-API-Key", "my-key"]);
  });

  it("includes API key security in query", () => {
    const request: RequestIR = {
      ...baseRequest,
      security: [
        { name: "apiKey", type: "apiKey", in: "query", paramName: "api_key", value: "my-key" },
      ],
    };
    const result = compile(request);
    expect(result.url).toContain("api_key=my-key");
  });

  it("includes API key security in cookie", () => {
    const request: RequestIR = {
      ...baseRequest,
      security: [
        { name: "apiKey", type: "apiKey", in: "cookie", paramName: "session", value: "my-key" },
      ],
    };
    const result = compile(request);
    expect(result.headers.some(([name]) => name === "Cookie")).toBe(true);
  });

  it("handles empty parameters", () => {
    const result = compile(baseRequest);
    expect(result.url).toContain("/users");
    expect(result.url).not.toContain("?");
  });

  it("handles baseUrl with trailing slash", () => {
    const request: RequestIR = {
      ...baseRequest,
      baseUrl: "https://api.example.com/",
    };
    const result = compile(request);
    expect(result.url).toContain("api.example.com/users");
    expect(result.url).not.toContain("//users");
  });

  it("handles baseUrl without trailing slash", () => {
    const request: RequestIR = {
      ...baseRequest,
      baseUrl: "https://api.example.com",
    };
    const result = compile(request);
    expect(result.url).toContain("api.example.com/users");
  });

  it("returns queryPairs separately", () => {
    const request: RequestIR = {
      ...baseRequest,
      parameters: [{ name: "q", in: "query", value: "test" }],
    };
    const result = compile(request);
    expect(result.queryPairs).toBeDefined();
    expect(result.queryPairs).toHaveLength(1);
    expect(result.queryPairs[0]).toEqual(["q", "test"]);
  });

  it("returns cookiePairs separately", () => {
    const request: RequestIR = {
      ...baseRequest,
      parameters: [{ name: "session", in: "cookie", value: "abc123" }],
    };
    const result = compile(request);
    expect(result.cookiePairs).toBeDefined();
    expect(result.cookiePairs).toHaveLength(1);
    expect(result.cookiePairs[0]).toEqual(["session", "abc123"]);
  });

  it("handles absolute path in path field", () => {
    const request: RequestIR = {
      ...baseRequest,
      path: "https://other.example.com/resource",
    };
    const result = compile(request);
    expect(result.url).toContain("other.example.com/resource");
    expect(result.url).not.toContain("api.example.com");
  });
});

describe("form()", () => {
  it("serializes form data object", () => {
    const result = form({ username: "admin", password: "secret" });
    expect(result).toContain("username=admin");
    expect(result).toContain("password=secret");
  });

  it("handles arrays in form data", () => {
    const result = form({ tags: ["a", "b"] });
    expect(result).toContain("tags=a");
    expect(result).toContain("tags=b");
  });

  it("returns empty string for non-object", () => {
    expect(form(null)).toBe("");
    expect(form(undefined)).toBe("");
    expect(form("string")).toBe("");
    expect(form(["array"])).toBe("");
  });

  it("URL-encodes special characters", () => {
    const result = form({ q: "hello world" });
    expect(result).toContain("q=hello%20world");
  });

  it("handles empty object", () => {
    expect(form({})).toBe("");
  });
});
