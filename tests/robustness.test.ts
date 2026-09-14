import { describe, expect, it } from "vitest";
import { generate, normalize, list, get, register } from "../src/index";
import { RefResolver } from "../src/core/refs";
import { parameter } from "../src/core/serialize";
import { example } from "../src/core/example";
import { compile } from "../src/core/request";
import type { RequestIR } from "../src/types";

describe("production robustness edge cases", () => {
  describe("generate() with malformed documents", () => {
    it("handles document with null paths", () => {
      expect(() =>
        generate({
          document: { openapi: "3.1.0", info: { title: "Test" }, paths: null },
          path: "/test",
          method: "get",
          language: "javascript",
          client: "fetch",
        }),
      ).toThrow();
    });

    it("handles document with empty paths", () => {
      expect(() =>
        generate({
          document: { openapi: "3.1.0", info: { title: "Test" }, paths: {} },
          path: "/test",
          method: "get",
          language: "javascript",
          client: "fetch",
        }),
      ).toThrow("Path not found");
    });

    it("handles path item that is not an object", () => {
      expect(() =>
        generate({
          document: {
            openapi: "3.1.0",
            info: { title: "Test" },
            paths: { "/test": "not-an-object" },
          },
          path: "/test",
          method: "get",
          language: "javascript",
          client: "fetch",
        }),
      ).toThrow();
    });

    it("handles operation that is not an object", () => {
      expect(() =>
        generate({
          document: {
            openapi: "3.1.0",
            info: { title: "Test" },
            paths: { "/test": { get: "not-an-object" } },
          },
          path: "/test",
          method: "get",
          language: "javascript",
          client: "fetch",
        }),
      ).toThrow();
    });

    it("handles parameters that are not arrays", () => {
      const code = generate({
        document: {
          openapi: "3.1.0",
          info: { title: "Test" },
          paths: {
            "/test": {
              get: {
                parameters: "not-an-array",
                responses: { "200": { description: "OK" } },
              },
            },
          },
        },
        path: "/test",
        method: "get",
        language: "javascript",
        client: "fetch",
      });
      expect(typeof code).toBe("string");
      expect(code.length).toBeGreaterThan(0);
    });

    it("handles requestBody that is not an object", () => {
      const code = generate({
        document: {
          openapi: "3.1.0",
          info: { title: "Test" },
          paths: {
            "/test": {
              post: {
                requestBody: "not-an-object",
                responses: { "200": { description: "OK" } },
              },
            },
          },
        },
        path: "/test",
        method: "post",
        language: "javascript",
        client: "fetch",
      });
      expect(typeof code).toBe("string");
    });

    it("handles content that is not an object", () => {
      const code = generate({
        document: {
          openapi: "3.1.0",
          info: { title: "Test" },
          paths: {
            "/test": {
              post: {
                requestBody: { content: "not-an-object" },
                responses: { "200": { description: "OK" } },
              },
            },
          },
        },
        path: "/test",
        method: "post",
        language: "javascript",
        client: "fetch",
      });
      expect(typeof code).toBe("string");
    });

    it("handles security schemes that are not an object", () => {
      const code = generate({
        document: {
          openapi: "3.1.0",
          info: { title: "Test" },
          components: { securitySchemes: "not-an-object" },
          paths: {
            "/test": {
              get: { responses: { "200": { description: "OK" } } },
            },
          },
        },
        path: "/test",
        method: "get",
        language: "javascript",
        client: "fetch",
      });
      expect(typeof code).toBe("string");
    });

    it("handles security requirement that is not an object", () => {
      const code = generate({
        document: {
          openapi: "3.1.0",
          info: { title: "Test" },
          paths: {
            "/test": {
              get: {
                security: ["not-an-object", null],
                responses: { "200": { description: "OK" } },
              },
            },
          },
        },
        path: "/test",
        method: "get",
        language: "javascript",
        client: "fetch",
      });
      expect(typeof code).toBe("string");
    });
  });

  describe("RefResolver edge cases", () => {
    it("handles deeply nested references", () => {
      const doc = {
        a: { b: { c: { d: { e: { f: { g: { h: "deep" } } } } } } },
      };
      const resolver = new RefResolver(doc);
      const result = resolver.deref({ $ref: "#/a/b/c/d/e/f/g/h" });
      expect(result).toBe("deep");
    });

    it("handles references with array indices", () => {
      const doc = {
        items: [{ name: "first" }, { name: "second" }],
      };
      const resolver = new RefResolver(doc);
      expect(resolver.deref({ $ref: "#/items/0/name" })).toBe("first");
      expect(resolver.deref({ $ref: "#/items/1/name" })).toBe("second");
    });

    it("handles JSON Pointer escaped characters", () => {
      const doc = {
        "a/b": { "c~d": "value" },
      };
      const resolver = new RefResolver(doc);
      expect(resolver.deref({ $ref: "#/a~1b/c~0d" })).toBe("value");
    });

    it("clearCache works correctly", () => {
      const doc = { value: "original" };
      const resolver = new RefResolver(doc);
      expect(resolver.deref({ $ref: "#/value" })).toBe("original");

      // Mutate document after cache
      (doc as Record<string, unknown>).value = "modified";
      expect(resolver.deref({ $ref: "#/value" })).toBe("original"); // cached

      resolver.clearCache();
      expect(resolver.deref({ $ref: "#/value" })).toBe("modified"); // re-resolved
    });

    it("softMode returns value for broken refs without throwing", () => {
      const resolver = new RefResolver({}, true);
      const original = { $ref: "#/nonexistent" };
      const result = resolver.deref(original);
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });

    it("softMode handles circular references", () => {
      const doc = {
        a: { $ref: "#/b" },
        b: { $ref: "#/a" },
      };
      const resolver = new RefResolver(doc, true);
      expect(() => resolver.deref({ $ref: "#/a" })).not.toThrow();
    });
  });

  describe("parameter serialization edge cases", () => {
    it("handles empty string parameter name", () => {
      const result = parameter({
        name: "",
        in: "query",
        value: "test",
      });
      expect(result).toEqual([["", "test"]]);
    });

    it("handles special characters in parameter name", () => {
      const result = parameter({
        name: "x-custom[]",
        in: "query",
        value: "test",
      });
      expect(result[0][0]).toContain("x-custom");
    });

    it("handles very long string values", () => {
      const longValue = "a".repeat(10000);
      const result = parameter({
        name: "data",
        in: "query",
        value: longValue,
      });
      expect(result[0][1].length).toBe(10000);
    });

    it("handles unicode values", () => {
      const result = parameter({
        name: "q",
        in: "query",
        value: "こんにちは 🌍",
      });
      expect(result[0][1]).toContain("%E3%81%93");
    });

    it("handles object with null values in deepObject", () => {
      const result = parameter({
        name: "filter",
        in: "query",
        style: "deepObject",
        value: { a: null, b: undefined, c: "value" },
      });
      expect(result).toContainEqual(["filter%5Ba%5D", "null"]);
      expect(result).toContainEqual(["filter%5Bc%5D", "value"]);
    });
  });

  describe("example generation edge cases", () => {
    it("handles schema with const null", () => {
      const resolver = new RefResolver({});
      expect(example({ const: null }, resolver)).toBeNull();
    });

    it("handles schema with empty enum", () => {
      const resolver = new RefResolver({});
      const result = example({ type: "string", enum: [] }, resolver);
      expect(result).toBeDefined();
    });

    it("handles schema with minLength greater than maxLength", () => {
      const resolver = new RefResolver({});
      const result = example({ type: "string", minLength: 100, maxLength: 10 }, resolver) as string;
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it("handles schema with minimum greater than maximum", () => {
      const resolver = new RefResolver({});
      const result = example({ type: "integer", minimum: 100, maximum: 10 }, resolver) as number;
      expect(result).toBeLessThanOrEqual(10);
    });

    it("handles deeply nested allOf", () => {
      const resolver = new RefResolver({});
      const result = example(
        {
          allOf: [
            { allOf: [{ type: "object", properties: { a: { type: "string" } } }] },
            { type: "object", properties: { b: { type: "integer" } } },
          ],
        },
        resolver,
      );
      expect(typeof result).toBe("object");
      expect(result).not.toBeNull();
    });

    it("handles oneOf with empty array", () => {
      const resolver = new RefResolver({});
      const result = example({ oneOf: [] }, resolver);
      expect(result).toBeDefined();
    });
  });

  describe("compile() edge cases", () => {
    it("handles request with no parameters", () => {
      const request: RequestIR = {
        method: "GET",
        baseUrl: "https://example.com",
        path: "/test",
        parameters: [],
        headers: [],
        body: undefined,
        security: [],
      };
      const result = compile(request);
      expect(result.url).toBe("https://example.com/test");
      expect(result.headers).toEqual([]);
      expect(result.queryPairs).toEqual([]);
    });

    it("handles baseUrl that is empty string", () => {
      const request: RequestIR = {
        method: "GET",
        baseUrl: "",
        path: "/test",
        parameters: [],
        headers: [],
        body: undefined,
        security: [],
      };
      const result = compile(request);
      expect(result.url).toBe("/test");
    });

    it("handles path that is already absolute URL", () => {
      const request: RequestIR = {
        method: "GET",
        baseUrl: "https://base.example.com",
        path: "https://other.example.com/resource",
        parameters: [],
        headers: [],
        body: undefined,
        security: [],
      };
      const result = compile(request);
      expect(result.url).toBe("https://other.example.com/resource");
    });
  });

  describe("registry edge cases", () => {
    it("registering same generator twice does not duplicate", () => {
      const before = list().length;
      register({
        language: "test-lang",
        client: "test-client",
        generate: () => "test",
      });
      register({
        language: "test-lang",
        client: "test-client",
        generate: () => "test-updated",
      });
      expect(list().length).toBe(before + 1);
      expect(get("test-lang", "test-client")?.generate({} as never)).toBe("test-updated");
    });

    it("all generators produce non-empty output for a simple request", () => {
      const doc = {
        openapi: "3.1.0",
        info: { title: "Test", version: "1.0.0" },
        paths: {
          "/test": {
            get: { responses: { "200": { description: "OK" } } },
          },
        },
      };

      for (const { language, client } of list()) {
        const code = generate({
          document: doc,
          path: "/test",
          method: "get",
          language,
          client,
        });
        expect(typeof code).toBe("string");
        expect(code.length).toBeGreaterThan(0);
      }
    });
  });

  describe("normalize() edge cases", () => {
    it("throws for non-object options", () => {
      expect(() => normalize(null as never)).toThrow(TypeError);
      expect(() => normalize("string" as never)).toThrow(TypeError);
    });

    it("throws for non-object document", () => {
      expect(() =>
        normalize({ document: "string", path: "/test", method: "get" } as never),
      ).toThrow(TypeError);
    });

    it("throws for empty path", () => {
      expect(() =>
        normalize({
          document: { openapi: "3.1.0", info: { title: "Test" }, paths: {} },
          path: "",
          method: "get",
        }),
      ).toThrow("non-empty string");
    });

    it("throws for whitespace-only path", () => {
      expect(() =>
        normalize({
          document: { openapi: "3.1.0", info: { title: "Test" }, paths: {} },
          path: "   ",
          method: "get",
        }),
      ).toThrow("non-empty string");
    });

    it("handles OpenAPI 3.0 documents", () => {
      const result = normalize({
        document: {
          openapi: "3.0.0",
          info: { title: "Test", version: "1.0.0" },
          paths: {
            "/test": {
              get: { responses: { "200": { description: "OK" } } },
            },
          },
        },
        path: "/test",
        method: "get",
      });
      expect(result.method).toBe("GET");
      expect(result.path).toBe("/test");
    });

    it("handles OpenAPI 3.2 documents", () => {
      const result = normalize({
        document: {
          openapi: "3.2.0",
          info: { title: "Test", version: "1.0.0" },
          paths: {
            "/test": {
              get: { responses: { "200": { description: "OK" } } },
            },
          },
        },
        path: "/test",
        method: "get",
      });
      expect(result.method).toBe("GET");
    });

    it("includes preWarnings for malformed documents", () => {
      const result = normalize({
        document: {
          openapi: "3.1.0",
          paths: {
            "/test": {
              get: { responses: { "200": { description: "OK" } } },
            },
          },
        },
        path: "/test",
        method: "get",
      });
      expect(Array.isArray(result.preWarnings)).toBe(true);
      expect(result.preWarnings.length).toBeGreaterThan(0);
    });
  });
});
