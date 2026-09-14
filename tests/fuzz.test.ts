import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { parameter } from "../src/core/serialize";
import { RefResolver } from "../src/core/refs";
import { example } from "../src/core/example";

describe("fuzz tests", () => {
  it("does not throw for arbitrary JSON-compatible deepObject values", () => {
    fc.assert(
      fc.property(fc.jsonValue({ maxDepth: 5 }), (value) => {
        expect(() =>
          parameter({
            name: "x",
            in: "query",
            style: "deepObject",
            value,
          }),
        ).not.toThrow();
      }),
      {
        numRuns: 500,
        endOnFailure: true,
      },
    );
  });

  it("does not throw for arbitrary query parameter values", () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 50 }),
        fc.constantFrom("form", "spaceDelimited", "pipeDelimited", "deepObject"),
        fc.boolean(),
        (name, style, explode) => {
          expect(() =>
            parameter({
              name: name || "default",
              in: "query",
              style,
              explode,
              value: { key: "value", nested: { a: 1 } },
            }),
          ).not.toThrow();
        },
      ),
      { numRuns: 200 },
    );
  });

  it("does not throw for arbitrary array values in form style", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ maxLength: 20 }), { maxLength: 10 }),
        fc.boolean(),
        (values, explode) => {
          expect(() =>
            parameter({
              name: "items",
              in: "query",
              style: "form",
              explode,
              value: values,
            }),
          ).not.toThrow();
        },
      ),
      { numRuns: 200 },
    );
  });

  it("RefResolver handles arbitrary JSON Pointer paths gracefully", () => {
    const doc = {
      components: {
        schemas: {
          User: { type: "object" },
          nested: { a: { b: { c: { d: "deep" } } } },
        },
      },
    };
    const resolver = new RefResolver(doc, true);

    fc.assert(
      fc.property(fc.string({ maxLength: 100 }), (path) => {
        const ref = `#/${path.replace(/[^a-zA-Z0-9/]/g, "_")}`;
        expect(() => resolver.deref({ $ref: ref })).not.toThrow();
      }),
      { numRuns: 300 },
    );
  });

  it("example generation does not throw for arbitrary schema-like objects", () => {
    const resolver = new RefResolver({});

    fc.assert(
      fc.property(
        fc.record({
          type: fc.constantFrom("string", "integer", "number", "boolean", "array", "object", undefined),
          format: fc.constantFrom("date-time", "date", "email", undefined),
          minLength: fc.integer({ min: 0, max: 100 }),
          maxLength: fc.integer({ min: 0, max: 100 }),
        }, { requiredKeys: [] }),
        (schema) => {
          expect(() => example(schema, resolver)).not.toThrow();
        },
      ),
      { numRuns: 200 },
    );
  });

  it("parameter serialization handles null and undefined values", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(null, undefined, "", 0, false),
        (value) => {
          expect(() =>
            parameter({
              name: "x",
              in: "query",
              value,
            }),
          ).not.toThrow();
        },
      ),
      { numRuns: 100 },
    );
  });
});
