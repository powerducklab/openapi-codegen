import { describe, expect, it } from "vitest";
import { parameter, query, cookie, headerValue } from "../src/core/serialize";
import type { Pair } from "../src/core/serialize";

describe("parameter serialization", () => {
  describe("query parameters", () => {
    it("serializes simple string query parameter", () => {
      const result = parameter({
        name: "q",
        in: "query",
        value: "hello",
      });
      expect(result).toEqual([["q", "hello"]]);
    });

    it("serializes number query parameter", () => {
      const result = parameter({
        name: "limit",
        in: "query",
        value: 42,
      });
      expect(result).toEqual([["limit", "42"]]);
    });

    it("serializes boolean query parameter", () => {
      const result = parameter({
        name: "active",
        in: "query",
        value: true,
      });
      expect(result).toEqual([["active", "true"]]);
    });

    it("returns empty array for null", () => {
      const result = parameter({
        name: "q",
        in: "query",
        value: null,
      });
      expect(result).toEqual([]);
    });

    it("returns empty array for undefined", () => {
      const result = parameter({
        name: "q",
        in: "query",
        value: undefined,
      });
      expect(result).toEqual([]);
    });

    it("serializes array with form style (default, explode=false)", () => {
      const result = parameter({
        name: "tags",
        in: "query",
        style: "form",
        explode: false,
        value: ["a", "b", "c"],
      });
      expect(result).toEqual([["tags", "a,b,c"]]);
    });

    it("serializes array with form style and explode=true", () => {
      const result = parameter({
        name: "tags",
        in: "query",
        style: "form",
        explode: true,
        value: ["a", "b", "c"],
      });
      expect(result).toEqual([
        ["tags", "a"],
        ["tags", "b"],
        ["tags", "c"],
      ]);
    });

    it("serializes array with spaceDelimited style", () => {
      const result = parameter({
        name: "tags",
        in: "query",
        style: "spaceDelimited",
        value: ["a", "b", "c"],
      });
      expect(result).toEqual([["tags", "a%20b%20c"]]);
    });

    it("serializes array with pipeDelimited style", () => {
      const result = parameter({
        name: "tags",
        in: "query",
        style: "pipeDelimited",
        value: ["a", "b", "c"],
      });
      expect(result).toEqual([["tags", "a|b|c"]]);
    });

    it("serializes object with form style (explode=false)", () => {
      const result = parameter({
        name: "filter",
        in: "query",
        style: "form",
        explode: false,
        value: { status: "active", type: "user" },
      });
      expect(result).toEqual([["filter", "status,active,type,user"]]);
    });

    it("serializes object with form style and explode=true", () => {
      const result = parameter({
        name: "filter",
        in: "query",
        style: "form",
        explode: true,
        value: { status: "active", type: "user" },
      });
      expect(result).toEqual([
        ["status", "active"],
        ["type", "user"],
      ]);
    });

    it("serializes object with deepObject style", () => {
      const result = parameter({
        name: "filter",
        in: "query",
        style: "deepObject",
        value: { status: "active", type: "user" },
      });
      expect(result).toEqual([
        ["filter%5Bstatus%5D", "active"],
        ["filter%5Btype%5D", "user"],
      ]);
    });

    it("serializes nested object with deepObject style", () => {
      const result = parameter({
        name: "filter",
        in: "query",
        style: "deepObject",
        value: { user: { name: "john", age: 30 } },
      });
      expect(result).toEqual([
        ["filter%5Buser%5D%5Bname%5D", "john"],
        ["filter%5Buser%5D%5Bage%5D", "30"],
      ]);
    });

    it("handles empty array", () => {
      const result = parameter({
        name: "tags",
        in: "query",
        value: [],
      });
      expect(result).toEqual([]);
    });

    it("handles empty object with deepObject", () => {
      const result = parameter({
        name: "filter",
        in: "query",
        style: "deepObject",
        value: {},
      });
      expect(result).toEqual([]);
    });
  });

  describe("path parameters", () => {
    it("serializes simple path parameter", () => {
      const result = parameter({
        name: "id",
        in: "path",
        value: "123",
      });
      expect(result).toEqual([["id", "123"]]);
    });

    it("serializes path parameter with simple style", () => {
      const result = parameter({
        name: "id",
        in: "path",
        style: "simple",
        value: "123",
      });
      expect(result).toEqual([["id", "123"]]);
    });

    it("serializes array path parameter with simple style", () => {
      const result = parameter({
        name: "ids",
        in: "path",
        style: "simple",
        value: ["1", "2", "3"],
      });
      expect(result).toEqual([["ids", "1,2,3"]]);
    });

    it("serializes path parameter with label style", () => {
      const result = parameter({
        name: "id",
        in: "path",
        style: "label",
        value: "123",
      });
      expect(result).toEqual([["id", ".123"]]);
    });

    it("serializes path parameter with matrix style", () => {
      const result = parameter({
        name: "id",
        in: "path",
        style: "matrix",
        value: "123",
      });
      expect(result).toEqual([["id", ";id=123"]]);
    });
  });

  describe("header parameters", () => {
    it("serializes simple header parameter", () => {
      const result = parameter({
        name: "X-Request-ID",
        in: "header",
        value: "abc-123",
      });
      expect(result).toEqual([["X-Request-ID", "abc-123"]]);
    });

    it("serializes array header with simple style", () => {
      const result = parameter({
        name: "X-Tags",
        in: "header",
        style: "simple",
        value: ["a", "b", "c"],
      });
      expect(result).toEqual([["X-Tags", "a,b,c"]]);
    });
  });

  describe("cookie parameters", () => {
    it("serializes simple cookie parameter", () => {
      const result = parameter({
        name: "session",
        in: "cookie",
        value: "abc123",
      });
      expect(result).toEqual([["session", "abc123"]]);
    });

    it("serializes array cookie with form style (explode=true by default)", () => {
      const result = parameter({
        name: "tags",
        in: "cookie",
        style: "form",
        value: ["a", "b"],
      });
      expect(result).toEqual([
        ["tags", "a"],
        ["tags", "b"],
      ]);
    });

    it("serializes array cookie with form style and explode=false", () => {
      const result = parameter({
        name: "tags",
        in: "cookie",
        style: "form",
        explode: false,
        value: ["a", "b"],
      });
      expect(result).toEqual([["tags", "a,b"]]);
    });
  });

  describe("query helper", () => {
    it("serializes multiple query pairs", () => {
      const pairs: Pair[] = [
        ["q", "hello"],
        ["limit", "10"],
      ];
      expect(query(pairs)).toBe("q=hello&limit=10");
    });

    it("returns empty string for no pairs", () => {
      expect(query([])).toBe("");
    });
  });

  describe("cookie helper", () => {
    it("serializes multiple cookie pairs", () => {
      const pairs: Pair[] = [
        ["session", "abc123"],
        ["theme", "dark"],
      ];
      const result = cookie(pairs);
      expect(result).toContain("session=abc123");
      expect(result).toContain("theme=dark");
      expect(result).toContain("; ");
    });

    it("returns empty string for no pairs", () => {
      expect(cookie([])).toBe("");
    });
  });

  describe("headerValue helper", () => {
    it("returns sanitized header value", () => {
      expect(headerValue("application/json")).toBe("application/json");
    });

    it("removes newlines from header values", () => {
      const result = headerValue("value\nwith\nnewlines");
      expect(result).not.toContain("\n");
    });
  });

  describe("edge cases", () => {
    it("handles special characters in values", () => {
      const result = parameter({
        name: "q",
        in: "query",
        value: "hello world&foo=bar",
      });
      expect(result[0][1]).toBe("hello%20world%26foo%3Dbar");
    });

    it("handles allowReserved for query parameters", () => {
      const result = parameter({
        name: "q",
        in: "query",
        allowReserved: true,
        value: "hello world&foo=bar",
      });
      expect(result[0][1]).toBe("hello world&foo=bar");
    });

    it("handles nested arrays in deepObject", () => {
      const result = parameter({
        name: "filter",
        in: "query",
        style: "deepObject",
        value: { tags: ["a", "b"] },
      });
      expect(result).toEqual([
        ["filter%5Btags%5D%5B0%5D", "a"],
        ["filter%5Btags%5D%5B1%5D", "b"],
      ]);
    });

    it("handles bigint values", () => {
      const result = parameter({
        name: "id",
        in: "query",
        value: BigInt(1234567890),
      });
      expect(result[0][1]).toBe("1234567890");
    });

    it("handles object with null values", () => {
      const result = parameter({
        name: "filter",
        in: "query",
        style: "form",
        explode: true,
        value: { status: null, type: "user" },
      });
      expect(result).toContainEqual(["status", "null"]);
      expect(result).toContainEqual(["type", "user"]);
    });
  });
});
