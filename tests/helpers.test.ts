import { describe, expect, it } from "vitest";
import {
  normalizeMethod,
  nonBlankString,
  isRecord,
  firstDefined,
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
  isContentTypeHeader,
  isContentLengthHeader,
  isTransferEncodingHeader,
  isBrowserForbiddenHeader,
  browserHeaders,
  supportsRequestBody,
  requiresRequestBody,
  hasJsonBody,
  hasFormBody,
  hasMultipartBody,
  toKeyValueBody,
  bodyText,
  indent,
  sanitizeIdentifier,
  operationName,
  collectByLocation,
  mergeAllOfSchemas,
  fileComment,
  mediaTypeOf,
  toHeaderObject,
  stringifyLiteral,
  isFileValue,
} from "../src/core/helpers";
import { RefResolver } from "../src/core/refs";
import type { RequestIR } from "../src/types";

describe("normalizeMethod", () => {
  it("normalizes HTTP methods to uppercase", () => {
    expect(normalizeMethod("get")).toBe("GET");
    expect(normalizeMethod("Post")).toBe("POST");
    expect(normalizeMethod("DELETE")).toBe("DELETE");
  });

  it("returns 'GET' for undefined or null", () => {
    expect(normalizeMethod(undefined as never)).toBe("GET");
    expect(normalizeMethod(null as never)).toBe("GET");
  });

  it("returns 'GET' for empty string", () => {
    expect(normalizeMethod("")).toBe("GET");
  });

  it("returns uppercase for non-string values", () => {
    expect(normalizeMethod(123 as never)).toBe("123");
  });
});

describe("nonBlankString", () => {
  it("returns original string for non-empty strings (no trim)", () => {
    expect(nonBlankString("  hello  ")).toBe("  hello  ");
    expect(nonBlankString("world")).toBe("world");
  });

  it("returns undefined for empty or whitespace-only strings", () => {
    expect(nonBlankString("")).toBeUndefined();
    expect(nonBlankString("   ")).toBeUndefined();
    expect(nonBlankString("\t\n")).toBeUndefined();
  });

  it("returns undefined for non-string values", () => {
    expect(nonBlankString(null)).toBeUndefined();
    expect(nonBlankString(undefined)).toBeUndefined();
    expect(nonBlankString(123)).toBeUndefined();
    expect(nonBlankString({})).toBeUndefined();
  });

  it("returns fallback when provided and value is blank", () => {
    expect(nonBlankString("", "default")).toBe("default");
    expect(nonBlankString(null, "default")).toBe("default");
  });

  it("returns original value when provided and value is non-blank", () => {
    expect(nonBlankString("  hello  ", "default")).toBe("  hello  ");
  });
});

describe("isRecord", () => {
  it("returns true for plain objects", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
  });

  it("returns false for arrays", () => {
    expect(isRecord([])).toBe(false);
    expect(isRecord([1, 2, 3])).toBe(false);
  });

  it("returns false for null and undefined", () => {
    expect(isRecord(null)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
  });

  it("returns false for primitives", () => {
    expect(isRecord("string")).toBe(false);
    expect(isRecord(123)).toBe(false);
    expect(isRecord(true)).toBe(false);
  });
});

describe("isFileValue", () => {
  it("returns true for file marker objects", () => {
    expect(isFileValue({ __file: true, name: "test.bin" })).toBe(true);
  });

  it("returns false for regular objects", () => {
    expect(isFileValue({ name: "test" })).toBe(false);
  });

  it("returns false for non-objects", () => {
    expect(isFileValue(null)).toBe(false);
    expect(isFileValue("string")).toBe(false);
  });
});

describe("firstDefined", () => {
  it("returns first defined value", () => {
    expect(firstDefined(undefined, "a", "b")).toBe("a");
    expect(firstDefined("x", "y")).toBe("x");
  });

  it("returns null as a defined value (only checks undefined)", () => {
    expect(firstDefined(null, "a")).toBe(null);
  });

  it("returns undefined when all values are undefined", () => {
    expect(firstDefined(undefined, undefined)).toBeUndefined();
  });

  it("returns 0 or false as valid values", () => {
    expect(firstDefined(0, 1)).toBe(0);
    expect(firstDefined(false, true)).toBe(false);
  });
});

describe("kotlinValue / formFieldValue", () => {
  it("returns empty string for null/undefined", () => {
    expect(kotlinValue(null)).toBe("");
    expect(kotlinValue(undefined)).toBe("");
    expect(formFieldValue(null)).toBe("");
    expect(formFieldValue(undefined)).toBe("");
  });

  it("returns string as-is", () => {
    expect(kotlinValue("hello")).toBe("hello");
    expect(formFieldValue("hello")).toBe("hello");
  });

  it("converts numbers to string", () => {
    expect(kotlinValue(42)).toBe("42");
    expect(formFieldValue(42)).toBe("42");
  });

  it("converts booleans to string", () => {
    expect(kotlinValue(true)).toBe("true");
    expect(formFieldValue(false)).toBe("false");
  });

  it("converts bigint to string", () => {
    expect(kotlinValue(BigInt(123))).toBe("123");
    expect(formFieldValue(BigInt(123))).toBe("123");
  });

  it("serializes objects as JSON", () => {
    expect(kotlinValue({ a: 1 })).toBe('{"a":1}');
    expect(formFieldValue({ a: 1 })).toBe('{"a":1}');
  });

  it("serializes arrays as JSON", () => {
    expect(kotlinValue([1, 2, 3])).toBe("[1,2,3]");
    expect(formFieldValue([1, 2, 3])).toBe("[1,2,3]");
  });
});

describe("escape functions", () => {
  describe("JSON-based escapes (Js, Py, Go, Rust, Swift, R, OCaml, FSharp, Clojure)", () => {
    const escapes = [escapeJs, escapePy, escapeGo, escapeRust, escapeSwift, escapeR, escapeOCaml, escapeFSharp, escapeClojure];

    it("wraps simple strings in quotes", () => {
      for (const escape of escapes) {
        expect(escape("hello")).toBe('"hello"');
      }
    });

    it("escapes double quotes", () => {
      for (const escape of escapes) {
        expect(escape('he said "hi"')).toBe('"he said \\"hi\\""');
      }
    });

    it("escapes newlines", () => {
      for (const escape of escapes) {
        expect(escape("line1\nline2")).toBe('"line1\\nline2"');
      }
    });

    it("escapes backslashes", () => {
      for (const escape of escapes) {
        expect(escape("path\\to\\file")).toBe('"path\\\\to\\\\file"');
      }
    });

    it("converts non-string values to string", () => {
      for (const escape of escapes) {
        expect(escape(123 as never)).toBe('"123"');
      }
    });
  });

  describe("escapeSh", () => {
    it("wraps in single quotes", () => {
      expect(escapeSh("hello")).toBe("'hello'");
    });

    it("escapes single quotes", () => {
      expect(escapeSh("it's")).toBe("'it'\\''s'");
    });
  });

  describe("escapePhp", () => {
    it("wraps in single quotes", () => {
      expect(escapePhp("hello")).toBe("'hello'");
    });

    it("escapes single quotes and backslashes", () => {
      expect(escapePhp("it's \\test")).toBe("'it\\'s \\\\test'");
    });
  });

  describe("escapeRuby", () => {
    it("wraps simple strings in single quotes", () => {
      expect(escapeRuby("hello")).toBe("'hello'");
    });

    it("uses %Q{} for multi-line strings", () => {
      const result = escapeRuby("line1\nline2");
      expect(result).toContain("%Q{");
      expect(result).toContain("line1");
      expect(result).toContain("line2");
    });
  });

  describe("escapePowerShell", () => {
    it("wraps in single quotes and doubles single quotes", () => {
      expect(escapePowerShell("it's")).toBe("'it''s'");
    });
  });

  describe("escapeCSharp", () => {
    it("wraps in verbatim string and doubles double quotes", () => {
      expect(escapeCSharp('he said "hi"')).toBe('@"he said ""hi"""');
    });
  });

  describe("escapeJava", () => {
    it("wraps in double quotes", () => {
      expect(escapeJava("hello")).toBe('"hello"');
    });

    it("escapes Unicode line separators", () => {
      const result = escapeJava("a\u2028b");
      expect(result).toContain("\\u2028");
    });
  });

  describe("escapeObjC", () => {
    it("prefixes with @ and wraps in double quotes", () => {
      expect(escapeObjC("hello")).toBe('@"hello"');
    });
  });
});

describe("header helpers", () => {
  it("identifies content-type headers", () => {
    expect(isContentTypeHeader("content-type")).toBe(true);
    expect(isContentTypeHeader("Content-Type")).toBe(true);
    expect(isContentTypeHeader("accept")).toBe(false);
  });

  it("identifies content-length headers", () => {
    expect(isContentLengthHeader("content-length")).toBe(true);
    expect(isContentLengthHeader("Content-Length")).toBe(true);
    expect(isContentLengthHeader("accept")).toBe(false);
  });

  it("identifies transfer-encoding headers", () => {
    expect(isTransferEncodingHeader("transfer-encoding")).toBe(true);
    expect(isTransferEncodingHeader("Transfer-Encoding")).toBe(true);
    expect(isTransferEncodingHeader("accept")).toBe(false);
  });

  it("identifies browser-forbidden headers", () => {
    expect(isBrowserForbiddenHeader("content-length")).toBe(true);
    expect(isBrowserForbiddenHeader("host")).toBe(true);
    expect(isBrowserForbiddenHeader("accept")).toBe(false);
  });

  it("browserHeaders filters forbidden headers", () => {
    const headers: Array<[string, string]> = [
      ["Content-Length", "100"],
      ["Accept", "application/json"],
      ["Host", "example.com"],
    ];
    const result = browserHeaders(headers, false);
    expect(result).toHaveLength(1);
    expect(result[0][0]).toBe("Accept");
  });

  it("browserHeaders removes content-type for multipart", () => {
    const headers: Array<[string, string]> = [
      ["Content-Type", "multipart/form-data"],
      ["Accept", "application/json"],
    ];
    const result = browserHeaders(headers, true);
    expect(result).toHaveLength(1);
    expect(result[0][0]).toBe("Accept");
  });
});

describe("supportsRequestBody", () => {
  it("returns true for POST, PUT, PATCH, DELETE, OPTIONS, TRACE", () => {
    expect(supportsRequestBody("post")).toBe(true);
    expect(supportsRequestBody("put")).toBe(true);
    expect(supportsRequestBody("patch")).toBe(true);
    expect(supportsRequestBody("delete")).toBe(true);
    expect(supportsRequestBody("options")).toBe(true);
    expect(supportsRequestBody("trace")).toBe(true);
  });

  it("returns false for GET, HEAD", () => {
    expect(supportsRequestBody("get")).toBe(false);
    expect(supportsRequestBody("head")).toBe(false);
  });
});

describe("requiresRequestBody", () => {
  it("returns true for POST, PUT, PATCH", () => {
    expect(requiresRequestBody("post")).toBe(true);
    expect(requiresRequestBody("put")).toBe(true);
    expect(requiresRequestBody("patch")).toBe(true);
  });

  it("returns false for GET, DELETE, HEAD, OPTIONS, TRACE", () => {
    expect(requiresRequestBody("get")).toBe(false);
    expect(requiresRequestBody("delete")).toBe(false);
    expect(requiresRequestBody("head")).toBe(false);
    expect(requiresRequestBody("options")).toBe(false);
    expect(requiresRequestBody("trace")).toBe(false);
  });
});

describe("body helpers", () => {
  const makeRequest = (body: RequestIR["body"]): RequestIR => ({
    method: "POST",
    baseUrl: "https://example.com",
    path: "/test",
    parameters: [],
    headers: [],
    body,
    security: [],
  });

  it("detects JSON body", () => {
    expect(hasJsonBody(makeRequest({ mediaType: "application/json", value: {} }))).toBe(true);
    expect(hasJsonBody(makeRequest({ mediaType: "text/plain", value: "hi" }))).toBe(false);
  });

  it("detects form body", () => {
    expect(hasFormBody(makeRequest({ mediaType: "application/x-www-form-urlencoded", value: {} }))).toBe(true);
    expect(hasFormBody(makeRequest({ mediaType: "application/json", value: {} }))).toBe(false);
  });

  it("detects multipart body", () => {
    expect(hasMultipartBody(makeRequest({ mediaType: "multipart/form-data", value: {} }))).toBe(true);
    expect(hasMultipartBody(makeRequest({ mediaType: "application/json", value: {} }))).toBe(false);
  });

  it("converts body to key-value pairs with file markers", () => {
    const pairs = toKeyValueBody({ a: "1", b: "2" });
    expect(pairs).toHaveLength(2);
    expect(pairs[0].name).toBe("a");
    expect(pairs[0].value).toBe("1");
    expect(pairs[0].file).toBe(false);
  });

  it("handles arrays in key-value body", () => {
    const pairs = toKeyValueBody({ tags: ["a", "b"] });
    expect(pairs).toHaveLength(2);
    expect(pairs[0].name).toBe("tags");
    expect(pairs[1].name).toBe("tags");
  });

  it("bodyText returns string for text bodies", () => {
    expect(bodyText(makeRequest({ mediaType: "text/plain", value: "hello" }))).toBe("hello");
  });

  it("bodyText serializes JSON bodies", () => {
    const result = bodyText(makeRequest({ mediaType: "application/json", value: { a: 1 } }));
    expect(result).toContain('"a"');
    expect(result).toContain("1");
  });

  it("bodyText returns empty string for no body", () => {
    expect(bodyText(makeRequest(undefined))).toBe("");
  });
});

describe("mediaTypeOf", () => {
  it("returns body media type when present", () => {
    const request: RequestIR = {
      method: "POST",
      baseUrl: "https://example.com",
      path: "/test",
      parameters: [],
      headers: [],
      body: { mediaType: "application/json", value: {} },
      security: [],
    };
    expect(mediaTypeOf(request, "text/plain")).toBe("application/json");
  });

  it("returns fallback when no body or content-type header", () => {
    const request: RequestIR = {
      method: "GET",
      baseUrl: "https://example.com",
      path: "/test",
      parameters: [],
      headers: [],
      body: undefined,
      security: [],
    };
    expect(mediaTypeOf(request, "text/plain")).toBe("text/plain");
  });
});

describe("toHeaderObject", () => {
  it("converts header pairs to object", () => {
    const result = toHeaderObject([
      ["Content-Type", "application/json"],
      ["Accept", "text/plain"],
    ]);
    expect(result["Content-Type"]).toBe("application/json");
    expect(result["Accept"]).toBe("text/plain");
  });

  it("last value wins for duplicate headers", () => {
    const result = toHeaderObject([
      ["X-Test", "first"],
      ["X-Test", "second"],
    ]);
    expect(result["X-Test"]).toBe("second");
  });
});

describe("stringifyLiteral", () => {
  it("pretty-prints JSON values", () => {
    const result = stringifyLiteral({ a: 1 });
    expect(result).toContain('"a"');
    expect(result).toContain("1");
    expect(result).toContain("\n");
  });

  it("handles null", () => {
    expect(stringifyLiteral(null)).toBe("null");
  });
});

describe("indent", () => {
  it("indents each line with default prefix (2 spaces)", () => {
    expect(indent("line1\nline2")).toBe("  line1\n  line2");
  });

  it("indents with custom prefix", () => {
    expect(indent("line1\nline2", "\t")).toBe("\tline1\n\tline2");
  });

  it("does not indent empty lines", () => {
    expect(indent("line1\n\nline2")).toBe("  line1\n\n  line2");
  });

  it("handles empty string", () => {
    expect(indent("")).toBe("");
  });
});

describe("sanitizeIdentifier", () => {
  it("replaces non-alphanumeric characters with underscores", () => {
    expect(sanitizeIdentifier("hello-world")).toBe("hello_world");
    expect(sanitizeIdentifier("hello world")).toBe("hello_world");
  });

  it("prefixes with underscore if starts with number", () => {
    expect(sanitizeIdentifier("123abc")).toBe("_123abc");
  });

  it("returns 'value' for empty string", () => {
    expect(sanitizeIdentifier("")).toBe("value");
  });

  it("returns underscores for only non-alphanumeric characters", () => {
    expect(sanitizeIdentifier("---")).toBe("___");
  });
});

describe("operationName", () => {
  it("generates name from method and path", () => {
    const request: RequestIR = {
      method: "GET",
      baseUrl: "https://example.com",
      path: "/users/{id}",
      parameters: [],
      headers: [],
      body: undefined,
      security: [],
    };
    const result = operationName(request);
    expect(result).toContain("get");
    expect(result).toContain("users");
    expect(result).toContain("id");
  });

  it("generates name for root path", () => {
    const request: RequestIR = {
      method: "GET",
      baseUrl: "https://example.com",
      path: "/",
      parameters: [],
      headers: [],
      body: undefined,
      security: [],
    };
    const result = operationName(request);
    expect(result).toContain("get");
  });
});

describe("collectByLocation", () => {
  it("filters parameters by location", () => {
    const request: RequestIR = {
      method: "GET",
      baseUrl: "https://example.com",
      path: "/test",
      parameters: [
        { name: "q", in: "query", value: "test" },
        { name: "id", in: "path", value: "123" },
        { name: "X-Test", in: "header", value: "value" },
      ],
      headers: [],
      body: undefined,
      security: [],
    };
    expect(collectByLocation(request, "query")).toHaveLength(1);
    expect(collectByLocation(request, "path")).toHaveLength(1);
    expect(collectByLocation(request, "header")).toHaveLength(1);
    expect(collectByLocation(request, "cookie")).toHaveLength(0);
  });

  it("returns empty array for no parameters", () => {
    const request: RequestIR = {
      method: "GET",
      baseUrl: "https://example.com",
      path: "/test",
      parameters: [],
      headers: [],
      body: undefined,
      security: [],
    };
    expect(collectByLocation(request, "query")).toEqual([]);
  });
});

describe("mergeAllOfSchemas", () => {
  it("merges allOf schemas", () => {
    const resolver = new RefResolver({});
    const schemas = [
      { type: "object", properties: { a: { type: "string" } } },
      { type: "object", properties: { b: { type: "number" } } },
    ];
    const merged = mergeAllOfSchemas(schemas, resolver);
    expect(merged).toBeDefined();
    expect((merged as Record<string, unknown>).properties).toBeDefined();
  });

  it("returns undefined for false schema", () => {
    const resolver = new RefResolver({});
    const merged = mergeAllOfSchemas([false], resolver);
    expect(merged).toBeUndefined();
  });

  it("ignores true schema", () => {
    const resolver = new RefResolver({});
    const merged = mergeAllOfSchemas([true, { type: "string" }], resolver);
    expect(merged).toBeDefined();
    expect((merged as Record<string, unknown>).type).toBe("string");
  });
});

describe("fileComment", () => {
  it("generates comment for file placeholder", () => {
    const comment = fileComment("test.bin", "//");
    expect(comment).toContain("test.bin");
    expect(comment).toContain("//");
  });
});
