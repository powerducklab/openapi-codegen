import { describe, expect, it } from "vitest";
import {
  use,
  register,
  get,
  list,
  generate,
  applyPlugin,
} from "../src/index";
import {
  stringifyLiteral,
  mergeAllOfSchemas,
  lightweightOpenAPIPreCheck,
  collectByLocation,
  firstDefined,
  assertIsNumber,
  isBrowserForbiddenHeader,
  browserHeaders,
  kotlinValue,
  formFieldValue,
  escapeJs,
  escapePy,
  escapeGo,
  escapeRust,
  escapeSwift,
  escapeR,
  escapeOCaml,
  escapeFSharp,
  escapeClojure,
  escapeSh,
  escapePhp,
  escapeRuby,
  escapePowerShell,
  escapeCSharp,
  escapeJava,
  escapeObjC,
  indent,
  sanitizeIdentifier,
  isContentTypeHeader,
  isContentLengthHeader,
  isTransferEncodingHeader,
  normalizeMethod,
  supportsRequestBody,
  requiresRequestBody,
  nonBlankString,
  hasJsonBody,
  hasFormBody,
  hasMultipartBody,
  toHeaderObject,
  toKeyValueBody,
  isRecord,
  isFileValue,
  assertIsRecord,
  assertIsString,
  fileComment,
} from "../src/core/helpers";
import { RefResolver } from "../src/core/refs";
import { example } from "../src/core/example";
import type { RequestIR, Plugin } from "../src/types";

describe("coverage supplement tests", () => {
  describe("use() and applyPlugin()", () => {
    it("use() applies a plugin that registers a generator", () => {
      const before = list().length;
      const plugin: Plugin = {
        register(api) {
          api.register({
            language: "plugin-lang-2",
            client: "plugin-client-2",
            generate: () => "plugin-generated-2",
          });
        },
      };

      use(plugin);
      expect(list().length).toBe(before + 1);
      expect(get("plugin-lang-2", "plugin-client-2")?.generate({} as never)).toBe(
        "plugin-generated-2",
      );
    });

    it("applyPlugin() calls plugin.register with api", () => {
      let receivedApi: unknown = null;
      const plugin: Plugin = {
        register(api) {
          receivedApi = api;
        },
      };

      applyPlugin(plugin, { register });
      expect(receivedApi).toBeDefined();
      expect(typeof (receivedApi as { register: unknown }).register).toBe("function");
    });
  });

  describe("stringifyLiteral() edge cases", () => {
    it("handles circular reference by falling back to String()", () => {
      const circular: Record<string, unknown> = { name: "test" };
      circular.self = circular;

      const result = stringifyLiteral(circular);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("handles BigInt values", () => {
      const result = stringifyLiteral(BigInt(123));
      expect(typeof result).toBe("string");
    });

    it("handles null value", () => {
      expect(stringifyLiteral(null)).toBe("null");
    });

    it("handles undefined value", () => {
      expect(stringifyLiteral(undefined)).toBe("null");
    });
  });

  describe("mergeAllOfSchemas() edge cases", () => {
    const resolver = new RefResolver({});

    it("returns undefined when a schema is false", () => {
      const result = mergeAllOfSchemas([true, false], resolver);
      expect(result).toBeUndefined();
    });

    it("ignores true boolean schemas", () => {
      const result = mergeAllOfSchemas(
        [true, { type: "string" }],
        resolver,
      );
      expect(result?.type).toBe("string");
    });

    it("ignores non-object schemas", () => {
      const result = mergeAllOfSchemas(
        ["string", 123, null, { type: "string" }],
        resolver,
      );
      expect(result?.type).toBe("string");
    });

    it("merges required arrays with deduplication", () => {
      const result = mergeAllOfSchemas(
        [
          { required: ["a", "b"] },
          { required: ["b", "c"] },
        ],
        resolver,
      );
      expect(result?.required).toEqual(["a", "b", "c"]);
    });

    it("handles required that is not an array", () => {
      const result = mergeAllOfSchemas(
        [{ required: "not-an-array" }, { required: ["a"] }],
        resolver,
      );
      expect(result?.required).toEqual(["a"]);
    });

    it("merges type strings into array when multiple", () => {
      const result = mergeAllOfSchemas(
        [{ type: "string" }, { type: "integer" }],
        resolver,
      );
      expect(result?.type).toEqual(["string", "integer"]);
    });

    it("keeps single type as string", () => {
      const result = mergeAllOfSchemas(
        [{ type: "string" }, { type: "string" }],
        resolver,
      );
      expect(result?.type).toBe("string");
    });

    it("handles type that is already an array", () => {
      const result = mergeAllOfSchemas(
        [{ type: ["string", "null"] }, { type: "integer" }],
        resolver,
      );
      expect(result?.type).toEqual(["string", "null", "integer"]);
    });

    it("handles type that is not string or array", () => {
      const result = mergeAllOfSchemas(
        [{ type: 123 }, { type: "string" }],
        resolver,
      );
      expect(result?.type).toBe("string");
    });

    it("concatenates allOf/oneOf/anyOf arrays", () => {
      const result = mergeAllOfSchemas(
        [
          { allOf: [{ type: "string" }] },
          { allOf: [{ type: "integer" }] },
        ],
        resolver,
      );
      expect(Array.isArray(result?.allOf)).toBe(true);
      expect(result?.allOf).toHaveLength(2);
    });

    it("handles allOf that is not an array", () => {
      const result = mergeAllOfSchemas(
        [{ allOf: "not-an-array" }, { allOf: [{ type: "string" }] }],
        resolver,
      );
      expect(result?.allOf).toHaveLength(1);
    });

    it("returns undefined for empty collected object", () => {
      const result = mergeAllOfSchemas([true, "string"], resolver);
      expect(result).toBeUndefined();
    });

    it("merges properties objects", () => {
      const result = mergeAllOfSchemas(
        [
          { properties: { a: { type: "string" } } },
          { properties: { b: { type: "integer" } } },
        ],
        resolver,
      );
      expect(result?.properties).toEqual({
        a: { type: "string" },
        b: { type: "integer" },
      });
    });
  });

  describe("lightweightOpenAPIPreCheck() edge cases", () => {
    it("returns warning for non-object doc", () => {
      const warnings = lightweightOpenAPIPreCheck("string");
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain("plain object");
    });

    it("returns warning for null doc", () => {
      const warnings = lightweightOpenAPIPreCheck(null);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it("returns warning for missing openapi field", () => {
      const warnings = lightweightOpenAPIPreCheck({
        info: { title: "Test" },
        paths: {},
      });
      expect(warnings).toContain("Missing or non-string openapi version field");
    });

    it("returns warning for non-string openapi field", () => {
      const warnings = lightweightOpenAPIPreCheck({
        openapi: 3.1,
        info: { title: "Test" },
        paths: {},
      });
      expect(warnings).toContain("Missing or non-string openapi version field");
    });

    it("returns warning for missing info object", () => {
      const warnings = lightweightOpenAPIPreCheck({
        openapi: "3.1.0",
        paths: {},
      });
      expect(warnings).toContain("info object missing or not an object");
    });

    it("returns warning for non-object info", () => {
      const warnings = lightweightOpenAPIPreCheck({
        openapi: "3.1.0",
        info: "not-an-object",
        paths: {},
      });
      expect(warnings).toContain("info object missing or not an object");
    });

    it("returns warning for non-object paths", () => {
      const warnings = lightweightOpenAPIPreCheck({
        openapi: "3.1.0",
        info: { title: "Test" },
        paths: "not-an-object",
      });
      expect(warnings).toContain("paths must be an object when defined");
    });

    it("returns warning for non-object components", () => {
      const warnings = lightweightOpenAPIPreCheck({
        openapi: "3.1.0",
        info: { title: "Test" },
        paths: {},
        components: "not-an-object",
      });
      expect(warnings).toContain("components must be an object when defined");
    });

    it("returns no warnings for valid document", () => {
      const warnings = lightweightOpenAPIPreCheck({
        openapi: "3.1.0",
        info: { title: "Test", version: "1.0.0" },
        paths: {},
      });
      expect(warnings).toEqual([]);
    });
  });

  describe("collectByLocation() edge cases", () => {
    it("handles request with no parameters array", () => {
      const request = { parameters: undefined } as unknown as RequestIR;
      const result = collectByLocation(request, "query");
      expect(result).toEqual([]);
    });

    it("filters by location correctly", () => {
      const request = {
        parameters: [
          { name: "a", in: "query" },
          { name: "b", in: "header" },
          { name: "c", in: "query" },
        ],
      } as unknown as RequestIR;
      const result = collectByLocation(request, "query");
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("a");
      expect(result[1].name).toBe("c");
    });
  });

  describe("firstDefined() edge cases", () => {
    it("returns first defined value", () => {
      expect(firstDefined(undefined, null, "first", "second")).toBe(null);
    });

    it("returns undefined when all are undefined", () => {
      expect(firstDefined(undefined, undefined)).toBeUndefined();
    });

    it("handles empty arguments", () => {
      expect(firstDefined()).toBeUndefined();
    });
  });

  describe("assertIsNumber() edge cases", () => {
    it("throws for non-number", () => {
      expect(() => assertIsNumber("string")).toThrow(TypeError);
    });

    it("throws for NaN", () => {
      expect(() => assertIsNumber(NaN)).toThrow(TypeError);
    });

    it("throws for Infinity", () => {
      expect(() => assertIsNumber(Infinity)).toThrow(TypeError);
    });

    it("passes for valid number", () => {
      expect(() => assertIsNumber(42)).not.toThrow();
    });

    it("uses custom error message", () => {
      expect(() => assertIsNumber("x", "Custom message")).toThrow("Custom message");
    });
  });

  describe("assertIsRecord() and assertIsString()", () => {
    it("assertIsRecord passes for object", () => {
      expect(() => assertIsRecord({})).not.toThrow();
    });

    it("assertIsRecord throws for string", () => {
      expect(() => assertIsRecord("string")).toThrow(TypeError);
    });

    it("assertIsString passes for string", () => {
      expect(() => assertIsString("hello")).not.toThrow();
    });

    it("assertIsString throws for number", () => {
      expect(() => assertIsString(123)).toThrow(TypeError);
    });
  });

  describe("isBrowserForbiddenHeader() edge cases", () => {
    it("returns true for forbidden headers", () => {
      expect(isBrowserForbiddenHeader("Content-Length")).toBe(true);
      expect(isBrowserForbiddenHeader("Host")).toBe(true);
      expect(isBrowserForbiddenHeader("Origin")).toBe(true);
    });

    it("returns false for allowed headers", () => {
      expect(isBrowserForbiddenHeader("Accept")).toBe(false);
      expect(isBrowserForbiddenHeader("Authorization")).toBe(false);
    });

    it("is case-insensitive", () => {
      expect(isBrowserForbiddenHeader("content-length")).toBe(true);
      expect(isBrowserForbiddenHeader("CONTENT-LENGTH")).toBe(true);
    });
  });

  describe("browserHeaders() edge cases", () => {
    it("removes forbidden headers", () => {
      const headers: Array<[string, string]> = [
        ["Accept", "application/json"],
        ["Content-Length", "100"],
        ["Host", "example.com"],
      ];
      const result = browserHeaders(headers, false);
      expect(result).toHaveLength(1);
      expect(result[0][0]).toBe("Accept");
    });

    it("removes Content-Type for multipart", () => {
      const headers: Array<[string, string]> = [
        ["Content-Type", "multipart/form-data"],
        ["Accept", "application/json"],
      ];
      const result = browserHeaders(headers, true);
      expect(result).toHaveLength(1);
      expect(result[0][0]).toBe("Accept");
    });

    it("keeps Content-Type for non-multipart", () => {
      const headers: Array<[string, string]> = [
        ["Content-Type", "application/json"],
        ["Accept", "application/json"],
      ];
      const result = browserHeaders(headers, false);
      expect(result).toHaveLength(2);
    });
  });

  describe("RefResolver softMode branches", () => {
    it("softMode does not throw for external ref in deref", () => {
      const resolver = new RefResolver({}, true);
      const original = { $ref: "https://example.com/schema.json" };
      expect(() => resolver.deref(original)).not.toThrow();
    });

    it("softMode returns ref object for external ref in resolveRef", () => {
      const resolver = new RefResolver({}, true);
      const result = resolver.resolveRef("https://example.com/schema.json");
      expect(result).toEqual({ $ref: "https://example.com/schema.json" });
    });

    it("softMode returns ref object for broken ref", () => {
      const resolver = new RefResolver({}, true);
      const result = resolver.resolveRef("#/nonexistent/path");
      expect(result).toEqual({ $ref: "#/nonexistent/path" });
    });

    it("softMode handles broken ref when current is null", () => {
      const resolver = new RefResolver({ a: null }, true);
      const result = resolver.resolveRef("#/a/b");
      expect(result).toEqual({ $ref: "#/a/b" });
    });

    it("softMode handles circular ref", () => {
      const doc = {
        a: { $ref: "#/b" },
        b: { $ref: "#/a" },
      };
      const resolver = new RefResolver(doc, true);
      expect(() => resolver.resolveRef("#/a")).not.toThrow();
    });
  });

  describe("example() edge cases", () => {
    const resolver = new RefResolver({});

    it("handles schema with writeOnly property", () => {
      const result = example(
        {
          type: "object",
          properties: {
            visible: { type: "string" },
            secret: { type: "string", writeOnly: true },
          },
        },
        resolver,
      );
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });

    it("handles schema with readOnly property", () => {
      const result = example(
        {
          type: "object",
          properties: {
            id: { type: "string", readOnly: true },
            name: { type: "string" },
          },
        },
        resolver,
      );
      expect(result).toBeDefined();
    });

    it("handles schema with deprecated property", () => {
      const result = example(
        {
          type: "object",
          properties: {
            old: { type: "string", deprecated: true },
            new: { type: "string" },
          },
        },
        resolver,
      );
      expect(result).toBeDefined();
    });

    it("handles integer with exclusiveMinimum and exclusiveMaximum", () => {
      const result = example(
        {
          type: "integer",
          exclusiveMinimum: 0,
          exclusiveMaximum: 100,
        },
        resolver,
      );
      expect(typeof result).toBe("number");
    });

    it("handles number with multipleOf", () => {
      const result = example(
        {
          type: "number",
          multipleOf: 0.5,
          minimum: 1,
          maximum: 10,
        },
        resolver,
      ) as number;
      expect(result % 0.5).toBeCloseTo(0, 5);
    });

    it("handles string with pattern", () => {
      const result = example(
        {
          type: "string",
          pattern: "^[a-z]{3}$",
        },
        resolver,
      ) as string;
      expect(result).toMatch(/^[a-z]{3}$/);
    });

    it("handles array with uniqueItems", () => {
      const result = example(
        {
          type: "array",
          items: { type: "integer", minimum: 1, maximum: 10 },
          minItems: 3,
          maxItems: 3,
          uniqueItems: true,
        },
        resolver,
      );
      expect(Array.isArray(result)).toBe(true);
    });

    it("handles object with additionalProperties as schema", () => {
      const result = example(
        {
          type: "object",
          additionalProperties: { type: "string" },
        },
        resolver,
      );
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });

    it("handles object with additionalProperties as boolean true", () => {
      const result = example(
        {
          type: "object",
          additionalProperties: true,
          properties: { name: { type: "string" } },
        },
        resolver,
      );
      expect(result).toBeDefined();
    });

    it("handles object with maxProperties", () => {
      const result = example(
        {
          type: "object",
          properties: {
            a: { type: "string" },
            b: { type: "string" },
            c: { type: "string" },
          },
          maxProperties: 2,
        },
        resolver,
      );
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });
  });

  describe("escape functions edge cases", () => {
    it("all JSON-based escape functions produce valid JSON strings", () => {
      const value = 'hello "world" \n\t\r';
      expect(escapeJs(value)).toBe(JSON.stringify(value));
      expect(escapePy(value)).toBe(JSON.stringify(value));
      expect(escapeGo(value)).toBe(JSON.stringify(value));
      expect(escapeRust(value)).toBe(JSON.stringify(value));
      expect(escapeSwift(value)).toBe(JSON.stringify(value));
      expect(escapeR(value)).toBe(JSON.stringify(value));
      expect(escapeOCaml(value)).toBe(JSON.stringify(value));
      expect(escapeFSharp(value)).toBe(JSON.stringify(value));
      expect(escapeClojure(value)).toBe(JSON.stringify(value));
      expect(escapeJava(value)).toBe(JSON.stringify(value));
    });

    it("escapeSh handles single quotes", () => {
      expect(escapeSh("it's")).toBe("'it'\\''s'");
    });

    it("escapePhp handles backslashes and quotes", () => {
      expect(escapePhp("path\\to'file")).toBe("'path\\\\to\\'file'");
    });

    it("escapeRuby uses %Q{} for multiline", () => {
      const result = escapeRuby("line1\nline2");
      expect(result).toContain("%Q{");
    });

    it("escapeRuby uses single quotes for single line", () => {
      const result = escapeRuby("hello");
      expect(result).toBe("'hello'");
    });

    it("escapePowerShell doubles single quotes", () => {
      expect(escapePowerShell("it's")).toBe("'it''s'");
    });

    it("escapeCSharp doubles double quotes", () => {
      expect(escapeCSharp('say "hello"')).toBe('@"say ""hello"""');
    });

    it("escapeObjC handles special chars", () => {
      const result = escapeObjC('hello "world" \n');
      expect(typeof result).toBe("string");
    });
  });

  describe("kotlinValue and formFieldValue", () => {
    it("both produce same output for strings", () => {
      expect(kotlinValue("hello")).toBe(formFieldValue("hello"));
    });

    it("both produce same output for numbers", () => {
      expect(kotlinValue(42)).toBe(formFieldValue(42));
    });

    it("both produce same output for booleans", () => {
      expect(kotlinValue(true)).toBe(formFieldValue(true));
    });

    it("both produce same output for null", () => {
      expect(kotlinValue(null)).toBe(formFieldValue(null));
    });
  });

  describe("header detection helpers", () => {
    it("isContentTypeHeader detects content-type", () => {
      expect(isContentTypeHeader("Content-Type")).toBe(true);
      expect(isContentTypeHeader("Accept")).toBe(false);
    });

    it("isContentLengthHeader detects content-length", () => {
      expect(isContentLengthHeader("Content-Length")).toBe(true);
      expect(isContentLengthHeader("Accept")).toBe(false);
    });

    it("isTransferEncodingHeader detects transfer-encoding", () => {
      expect(isTransferEncodingHeader("Transfer-Encoding")).toBe(true);
      expect(isTransferEncodingHeader("Accept")).toBe(false);
    });
  });

  describe("method helpers", () => {
    it("normalizeMethod handles common methods", () => {
      expect(normalizeMethod("get")).toBe("GET");
      expect(normalizeMethod("post")).toBe("POST");
    });

    it("supportsRequestBody returns true for POST/PUT/PATCH", () => {
      expect(supportsRequestBody("post")).toBe(true);
      expect(supportsRequestBody("put")).toBe(true);
      expect(supportsRequestBody("patch")).toBe(true);
      expect(supportsRequestBody("get")).toBe(false);
    });

    it("requiresRequestBody returns true for POST/PUT/PATCH", () => {
      expect(requiresRequestBody("post")).toBe(true);
      expect(requiresRequestBody("put")).toBe(true);
      expect(requiresRequestBody("get")).toBe(false);
    });
  });

  describe("nonBlankString()", () => {
    it("returns undefined for empty string", () => {
      expect(nonBlankString("")).toBeUndefined();
    });

    it("returns undefined for whitespace", () => {
      expect(nonBlankString("   ")).toBeUndefined();
    });

    it("returns string for non-empty", () => {
      expect(nonBlankString("hello")).toBe("hello");
    });

    it("returns fallback when provided", () => {
      expect(nonBlankString("", "default")).toBe("default");
    });
  });

  describe("body type helpers", () => {
    it("hasJsonBody detects json content type", () => {
      const request = {
        body: { mediaType: "application/json", value: {} },
      } as RequestIR;
      expect(hasJsonBody(request)).toBe(true);
    });

    it("hasFormBody detects form-urlencoded", () => {
      const request = {
        body: { mediaType: "application/x-www-form-urlencoded", value: {} },
      } as RequestIR;
      expect(hasFormBody(request)).toBe(true);
    });

    it("hasMultipartBody detects multipart", () => {
      const request = {
        body: { mediaType: "multipart/form-data", value: {} },
      } as RequestIR;
      expect(hasMultipartBody(request)).toBe(true);
    });
  });

  describe("toHeaderObject and toKeyValueBody", () => {
    it("toHeaderObject converts header pairs to object", () => {
      const headers: Array<[string, string]> = [
        ["Accept", "application/json"],
        ["Authorization", "Bearer token"],
      ];
      const result = toHeaderObject(headers);
      expect(result).toEqual({
        Accept: "application/json",
        Authorization: "Bearer token",
      });
    });

    it("toKeyValueBody converts pairs to form body", () => {
      const pairs: Array<[string, string]> = [
        ["username", "admin"],
        ["password", "secret"],
      ];
      const result = toKeyValueBody(pairs);
      expect(result).toBeDefined();
    });
  });

  describe("isRecord and isFileValue", () => {
    it("isRecord returns true for plain objects", () => {
      expect(isRecord({})).toBe(true);
      expect(isRecord({ a: 1 })).toBe(true);
    });

    it("isRecord returns false for non-objects", () => {
      expect(isRecord(null)).toBe(false);
      expect(isRecord("string")).toBe(false);
      expect(isRecord(123)).toBe(false);
      expect(isRecord([])).toBe(false);
    });

    it("isFileValue detects file objects", () => {
      expect(isFileValue({ __file: "/tmp/test.bin" })).toBe(true);
      expect(isFileValue({ name: "test" })).toBe(false);
    });
  });

  describe("fileComment", () => {
    it("generates file comment with path and field name", () => {
      const result = fileComment("/tmp/test.bin", "file");
      expect(result).toContain("/tmp/test.bin");
      expect(result).toContain("file");
    });
  });

  describe("indent()", () => {
    it("indents multi-line text", () => {
      const result = indent("line1\nline2\nline3", "  ");
      expect(result).toBe("  line1\n  line2\n  line3");
    });

    it("handles empty string", () => {
      expect(indent("", "  ")).toBe("");
    });

    it("handles single line", () => {
      expect(indent("hello", "  ")).toBe("  hello");
    });
  });

  describe("sanitizeIdentifier", () => {
    it("handles empty string", () => {
      expect(sanitizeIdentifier("")).toBe("value");
    });

    it("handles leading digits", () => {
      expect(sanitizeIdentifier("123abc")).toMatch(/^[a-zA-Z_]/);
    });

    it("preserves valid identifiers", () => {
      expect(sanitizeIdentifier("validIdentifier_123")).toBe("validIdentifier_123");
    });
  });

  describe("generate() with pre-normalized request", () => {
    it("accepts pre-normalized request directly", () => {
      const request: RequestIR = {
        method: "GET",
        baseUrl: "https://example.com",
        path: "/test",
        parameters: [],
        headers: [],
        body: undefined,
        security: [],
      };

      const code = generate({
        request,
        language: "javascript",
        client: "fetch",
      });

      expect(typeof code).toBe("string");
      expect(code.length).toBeGreaterThan(0);
    });
  });
});
