import { describe, expect, it } from "vitest";
import { RefResolver } from "../src/core/refs";

describe("RefResolver", () => {
  it("resolves simple $ref", () => {
    const doc = {
      components: {
        schemas: {
          User: { type: "object", properties: { id: { type: "string" } } },
        },
      },
    };
    const resolver = new RefResolver(doc);
    const resolved = resolver.deref({ $ref: "#/components/schemas/User" });
    expect(resolved).toEqual({ type: "object", properties: { id: { type: "string" } } });
  });

  it("resolves nested $ref", () => {
    const doc = {
      components: {
        schemas: {
          User: { $ref: "#/components/schemas/Base" },
          Base: { type: "object", properties: { id: { type: "string" } } },
        },
      },
    };
    const resolver = new RefResolver(doc);
    const resolved = resolver.deref({ $ref: "#/components/schemas/User" });
    expect(resolved).toEqual({ type: "object", properties: { id: { type: "string" } } });
  });

  it("returns original value when not a $ref", () => {
    const resolver = new RefResolver({});
    const value = { type: "string" };
    expect(resolver.deref(value)).toBe(value);
  });

  it("returns undefined for null/undefined", () => {
    const resolver = new RefResolver({});
    expect(resolver.deref(null)).toBeNull();
    expect(resolver.deref(undefined)).toBeUndefined();
  });

  it("throws for circular references by default", () => {
    const doc = {
      components: {
        schemas: {
          A: { $ref: "#/components/schemas/B" },
          B: { $ref: "#/components/schemas/A" },
        },
      },
    };
    const resolver = new RefResolver(doc);
    expect(() => resolver.deref({ $ref: "#/components/schemas/A" })).toThrow();
  });

  it("soft mode returns original ref for circular references", () => {
    const doc = {
      components: {
        schemas: {
          A: { $ref: "#/components/schemas/B" },
          B: { $ref: "#/components/schemas/A" },
        },
      },
    };
    const resolver = new RefResolver(doc, true);
    const result = resolver.deref({ $ref: "#/components/schemas/A" });
    expect(result).toBeDefined();
  });

  it("throws for non-existent ref", () => {
    const resolver = new RefResolver({});
    expect(() => resolver.deref({ $ref: "#/components/schemas/NonExistent" })).toThrow();
  });

  it("soft mode handles non-existent ref gracefully", () => {
    const resolver = new RefResolver({}, true);
    const result = resolver.deref({ $ref: "#/components/schemas/NonExistent" });
    // Soft mode should not throw; result may be undefined or the original ref
    expect(() => resolver.deref({ $ref: "#/components/schemas/NonExistent" })).not.toThrow();
  });

  it("throws for external refs (non-# refs)", () => {
    const resolver = new RefResolver({});
    const ref = { $ref: "https://example.com/schema.json" };
    expect(() => resolver.deref(ref)).toThrow("Only in-document references are supported");
  });

  it("resolves ref with array index", () => {
    const doc = {
      servers: [{ url: "https://example.com" }],
    };
    const resolver = new RefResolver(doc);
    const resolved = resolver.deref({ $ref: "#/servers/0" });
    expect(resolved).toEqual({ url: "https://example.com" });
  });

  it("resolves deeply nested ref", () => {
    const doc = {
      a: { b: { c: { d: { value: "deep" } } } },
    };
    const resolver = new RefResolver(doc);
    const resolved = resolver.deref({ $ref: "#/a/b/c/d" });
    expect(resolved).toEqual({ value: "deep" });
  });

  it("caches resolved refs", () => {
    const doc = {
      components: { schemas: { User: { type: "string" } } },
    };
    const resolver = new RefResolver(doc);
    const first = resolver.deref({ $ref: "#/components/schemas/User" });
    const second = resolver.deref({ $ref: "#/components/schemas/User" });
    expect(first).toBe(second);
  });

  it("handles ref with special characters in path", () => {
    const doc = {
      components: {
        schemas: {
          "my-schema": { type: "string" },
        },
      },
    };
    const resolver = new RefResolver(doc);
    const resolved = resolver.deref({ $ref: "#/components/schemas/my-schema" });
    expect(resolved).toEqual({ type: "string" });
  });
});
