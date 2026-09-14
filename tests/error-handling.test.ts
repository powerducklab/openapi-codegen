import { describe, expect, it } from "vitest";
import { generate } from "../src/index";

describe("error handling", () => {
  const validDoc = {
    openapi: "3.1.0",
    info: { title: "Test", version: "1.0.0" },
    paths: {
      "/test": {
        get: { responses: { "200": { description: "OK" } } },
      },
    },
  };

  describe("generate() input validation", () => {
    it("throws TypeError when options is null", () => {
      expect(() => generate(null as never)).toThrow(TypeError);
    });

    it("throws TypeError when options is undefined", () => {
      expect(() => generate(undefined as never)).toThrow(TypeError);
    });

    it("throws TypeError when options is not an object", () => {
      expect(() => generate("string" as never)).toThrow(TypeError);
      expect(() => generate(123 as never)).toThrow(TypeError);
    });

    it("throws when language is missing", () => {
      expect(() =>
        generate({
          document: validDoc,
          path: "/test",
          method: "get",
          client: "fetch",
        } as never),
      ).toThrow();
    });

    it("throws when client is missing", () => {
      expect(() =>
        generate({
          document: validDoc,
          path: "/test",
          method: "get",
          language: "javascript",
        } as never),
      ).toThrow();
    });

    it("throws when document is missing and request is missing", () => {
      expect(() =>
        generate({
          path: "/test",
          method: "get",
          language: "javascript",
          client: "fetch",
        } as never),
      ).toThrow("requires either");
    });

    it("throws when path is missing and document is provided", () => {
      expect(() =>
        generate({
          document: validDoc,
          method: "get",
          language: "javascript",
          client: "fetch",
        } as never),
      ).toThrow("requires a 'path'");
    });

    it("throws when method is missing and document is provided", () => {
      expect(() =>
        generate({
          document: validDoc,
          path: "/test",
          language: "javascript",
          client: "fetch",
        } as never),
      ).toThrow("requires a 'method'");
    });
  });

  describe("unknown generator", () => {
    it("throws descriptive error for unknown language", () => {
      expect(() =>
        generate({
          document: validDoc,
          path: "/test",
          method: "get",
          language: "unknown-lang",
          client: "fetch",
        }),
      ).toThrow("Unsupported generator: unknown-lang/fetch");
    });

    it("throws descriptive error for unknown client", () => {
      expect(() =>
        generate({
          document: validDoc,
          path: "/test",
          method: "get",
          language: "javascript",
          client: "unknown-client",
        }),
      ).toThrow("Unsupported generator: javascript/unknown-client");
    });
  });

  describe("invalid document", () => {
    it("throws when document is null", () => {
      expect(() =>
        generate({
          document: null,
          path: "/test",
          method: "get",
          language: "javascript",
          client: "fetch",
        }),
      ).toThrow();
    });

    it("throws when document is a string", () => {
      expect(() =>
        generate({
          document: "not-an-object",
          path: "/test",
          method: "get",
          language: "javascript",
          client: "fetch",
        }),
      ).toThrow();
    });

    it("throws when document has no paths", () => {
      expect(() =>
        generate({
          document: { openapi: "3.1.0", info: { title: "Test" } },
          path: "/test",
          method: "get",
          language: "javascript",
          client: "fetch",
        }),
      ).toThrow();
    });

    it("throws for non-existent path", () => {
      expect(() =>
        generate({
          document: validDoc,
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
          document: validDoc,
          path: "/test",
          method: "post",
          language: "javascript",
          client: "fetch",
        }),
      ).toThrow();
    });
  });

  describe("error message quality", () => {
    it("error messages are human-readable", () => {
      try {
        generate({
          document: validDoc,
          path: "/test",
          method: "get",
          language: "unknown",
          client: "unknown",
        });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message.length).toBeGreaterThan(0);
      }
    });

    it("errors include context about what went wrong", () => {
      try {
        generate({
          document: validDoc,
          path: "/missing",
          method: "get",
          language: "javascript",
          client: "fetch",
        });
        expect.fail("Should have thrown");
      } catch (error) {
        const message = (error as Error).message.toLowerCase();
        const hasContext =
          message.includes("path") ||
          message.includes("missing") ||
          message.includes("not") ||
          message.includes("found");
        expect(hasContext).toBe(true);
      }
    });
  });

  describe("graceful degradation", () => {
    it("does not crash on empty parameters array", () => {
      const doc = {
        openapi: "3.1.0",
        info: { title: "Test" },
        paths: {
          "/test": {
            get: {
              parameters: [],
              responses: { "200": { description: "OK" } },
            },
          },
        },
      };
      expect(() =>
        generate({
          document: doc,
          path: "/test",
          method: "get",
          language: "javascript",
          client: "fetch",
        }),
      ).not.toThrow();
    });

    it("does not crash on empty requestBody content", () => {
      const doc = {
        openapi: "3.1.0",
        info: { title: "Test" },
        paths: {
          "/test": {
            post: {
              requestBody: { content: {} },
              responses: { "200": { description: "OK" } },
            },
          },
        },
      };
      expect(() =>
        generate({
          document: doc,
          path: "/test",
          method: "post",
          language: "javascript",
          client: "fetch",
        }),
      ).not.toThrow();
    });

    it("does not crash on schema without type", () => {
      const doc = {
        openapi: "3.1.0",
        info: { title: "Test" },
        paths: {
          "/test": {
            get: {
              parameters: [{ name: "x", in: "query", schema: {} }],
              responses: { "200": { description: "OK" } },
            },
          },
        },
      };
      expect(() =>
        generate({
          document: doc,
          path: "/test",
          method: "get",
          language: "javascript",
          client: "fetch",
        }),
      ).not.toThrow();
    });
  });
});
