import { describe, expect, it } from "vitest";
import { example } from "../src/core/example";
import { RefResolver } from "../src/core/refs";

describe("example generation", () => {
  const resolver = new RefResolver({});

  it("generates example for string type", () => {
    const result = example({ type: "string" }, resolver);
    expect(typeof result).toBe("string");
    expect((result as string).length).toBeGreaterThan(0);
  });

  it("generates example for integer type", () => {
    const result = example({ type: "integer" }, resolver);
    expect(typeof result).toBe("number");
    expect(Number.isInteger(result)).toBe(true);
  });

  it("generates example for number type", () => {
    const result = example({ type: "number" }, resolver);
    expect(typeof result).toBe("number");
  });

  it("generates example for boolean type", () => {
    const result = example({ type: "boolean" }, resolver);
    expect(typeof result).toBe("boolean");
  });

  it("generates example for null type", () => {
    const result = example({ type: "null" }, resolver);
    expect(result).toBeNull();
  });

  it("generates example for array type", () => {
    const result = example({ type: "array", items: { type: "string" } }, resolver);
    expect(Array.isArray(result)).toBe(true);
    expect((result as unknown[]).length).toBeGreaterThan(0);
  });

  it("generates example for object type", () => {
    const result = example(
      {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
      },
      resolver,
    );
    expect(typeof result).toBe("object");
    expect(result).not.toBeNull();
    expect((result as Record<string, unknown>).name).toBeDefined();
    expect((result as Record<string, unknown>).age).toBeDefined();
  });

  it("returns const value directly", () => {
    const result = example({ const: "fixed-value" }, resolver);
    expect(result).toBe("fixed-value");
  });

  it("returns default value directly", () => {
    const result = example({ type: "string", default: "default-value" }, resolver);
    expect(result).toBe("default-value");
  });

  it("returns first enum value", () => {
    const result = example({ type: "string", enum: ["a", "b", "c"] }, resolver);
    expect(result).toBe("a");
  });

  it("returns example value directly", () => {
    const result = example({ type: "string", example: "custom-example" }, resolver);
    expect(result).toBe("custom-example");
  });

  it("returns first examples array entry", () => {
    const result = example({ type: "string", examples: ["first", "second"] }, resolver);
    expect(result).toBe("first");
  });

  it("handles boolean schema true", () => {
    const result = example(true, resolver);
    expect(result).toEqual({});
  });

  it("handles boolean schema false", () => {
    const result = example(false, resolver);
    expect(result).toBeNull();
  });

  it("handles oneOf by taking first", () => {
    const result = example(
      {
        oneOf: [{ type: "string" }, { type: "integer" }],
      },
      resolver,
    );
    expect(typeof result).toBe("string");
  });

  it("handles anyOf by taking first", () => {
    const result = example(
      {
        anyOf: [{ type: "string" }, { type: "integer" }],
      },
      resolver,
    );
    expect(typeof result).toBe("string");
  });

  it("handles allOf by merging", () => {
    const result = example(
      {
        allOf: [
          { type: "object", properties: { a: { type: "string" } } },
          { type: "object", properties: { b: { type: "integer" } } },
        ],
      },
      resolver,
    );
    expect(typeof result).toBe("object");
    expect((result as Record<string, unknown>).a).toBeDefined();
    expect((result as Record<string, unknown>).b).toBeDefined();
  });

  it("respects minLength for strings", () => {
    const result = example({ type: "string", minLength: 10 }, resolver) as string;
    expect(result.length).toBeGreaterThanOrEqual(10);
  });

  it("respects maxLength for strings", () => {
    const result = example({ type: "string", maxLength: 5 }, resolver) as string;
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("respects minimum for integers", () => {
    const result = example({ type: "integer", minimum: 100 }, resolver) as number;
    expect(result).toBeGreaterThanOrEqual(100);
  });

  it("respects maximum for integers", () => {
    const result = example({ type: "integer", maximum: 5 }, resolver) as number;
    expect(result).toBeLessThanOrEqual(5);
  });

  it("respects minItems for arrays", () => {
    const result = example(
      { type: "array", items: { type: "string" }, minItems: 3 },
      resolver,
    ) as unknown[];
    expect(result.length).toBeGreaterThanOrEqual(3);
  });

  it("generates date-time format", () => {
    const result = example({ type: "string", format: "date-time" }, resolver);
    expect(result).toBe("2025-01-01T00:00:00Z");
  });

  it("generates date format", () => {
    const result = example({ type: "string", format: "date" }, resolver);
    expect(result).toBe("2025-01-01");
  });

  it("generates binary format as file object", () => {
    const result = example({ type: "string", format: "binary" }, resolver) as Record<string, unknown>;
    expect(result.__file).toBe(true);
  });

  it("skips readOnly properties in request body context", () => {
    const result = example(
      {
        type: "object",
        properties: {
          id: { type: "string", readOnly: true },
          name: { type: "string" },
        },
      },
      resolver,
      undefined,
      0,
      { isRequestBody: true, isResponse: false },
    ) as Record<string, unknown>;
    expect(result.id).toBeUndefined();
    expect(result.name).toBeDefined();
  });

  it("skips writeOnly properties in response context", () => {
    const result = example(
      {
        type: "object",
        properties: {
          password: { type: "string", writeOnly: true },
          name: { type: "string" },
        },
      },
      resolver,
      undefined,
      0,
      { isRequestBody: false, isResponse: true },
    ) as Record<string, unknown>;
    expect(result.password).toBeUndefined();
    expect(result.name).toBeDefined();
  });

  it("handles type array (non-null first)", () => {
    const result = example({ type: ["null", "string"] }, resolver);
    expect(typeof result).toBe("string");
  });

  it("handles prefixItems for tuples", () => {
    const result = example(
      {
        type: "array",
        prefixItems: [{ type: "string" }, { type: "integer" }],
      },
      resolver,
    ) as unknown[];
    expect(result).toHaveLength(2);
    expect(typeof result[0]).toBe("string");
    expect(typeof result[1]).toBe("number");
  });

  it("handles patternProperties", () => {
    const result = example(
      {
        type: "object",
        patternProperties: {
          "^x-": { type: "string" },
        },
      },
      resolver,
    ) as Record<string, unknown>;
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });

  it("handles additionalProperties when no properties", () => {
    const result = example(
      {
        type: "object",
        additionalProperties: { type: "string" },
      },
      resolver,
    ) as Record<string, unknown>;
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });

  it("returns undefined for non-record non-boolean", () => {
    const result = example("not-a-schema", resolver);
    expect(result).toBeUndefined();
  });

  it("handles circular references gracefully", () => {
    const doc = {
      components: {
        schemas: {
          Node: {
            type: "object",
            properties: {
              child: { $ref: "#/components/schemas/Node" },
            },
          },
        },
      },
    };
    const resolver = new RefResolver(doc, true);
    const result = example({ $ref: "#/components/schemas/Node" }, resolver);
    expect(result).toBeDefined();
  });

  it("respects multipleOf for integers", () => {
    const result = example({ type: "integer", multipleOf: 5, minimum: 1 }, resolver) as number;
    expect(result % 5).toBe(0);
  });

  it("handles pattern by trying candidates", () => {
    const result = example({ type: "string", pattern: "^[a-z]+$" }, resolver) as string;
    expect(/^[a-z]+$/.test(result)).toBe(true);
  });
});
