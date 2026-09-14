import { describe, expect, it } from "vitest";
import { list, get, register, registerBuiltins } from "../src/index";
import type { Generator } from "../src/types";

describe("generator registry", () => {
  it("registers all built-in generators", () => {
    const generators = list();
    expect(generators.length).toBe(41);
  });

  it("registers generators for 21 languages", () => {
    const languages = new Set(list().map((g) => g.language));
    expect(languages.size).toBe(21);
  });

  it("includes expected language identifiers", () => {
    const languages = new Set(list().map((g) => g.language));
    const expected = [
      "c", "csharp", "clojure", "dart", "fsharp", "go", "http",
      "java", "javascript", "kotlin", "node", "objc", "ocaml",
      "php", "powershell", "python", "r", "ruby", "rust",
      "shell", "swift",
    ];
    for (const lang of expected) {
      expect(languages.has(lang)).toBe(true);
    }
  });

  it("gets a generator by language and client", () => {
    const generator = get("javascript", "fetch");
    expect(generator).toBeDefined();
    expect(generator?.language).toBe("javascript");
    expect(generator?.client).toBe("fetch");
  });

  it("returns undefined for unknown generator", () => {
    expect(get("unknown", "client")).toBeUndefined();
  });

  it("returns undefined for unknown client", () => {
    expect(get("javascript", "unknown-client")).toBeUndefined();
  });

  it("can register a custom generator", () => {
    const custom: Generator = {
      language: "custom",
      client: "test",
      generate: () => "custom output",
    };
    register(custom);
    expect(get("custom", "test")).toBeDefined();
    expect(get("custom", "test")?.generate({} as never)).toBe("custom output");
  });

  it("registerBuiltins is idempotent", () => {
    const before = list().length;
    registerBuiltins();
    registerBuiltins();
    expect(list().length).toBe(before);
  });

  it("lists generators with language and client properties", () => {
    for (const generator of list()) {
      expect(typeof generator.language).toBe("string");
      expect(typeof generator.client).toBe("string");
      expect(generator.language.length).toBeGreaterThan(0);
      expect(generator.client.length).toBeGreaterThan(0);
    }
  });

  it("has unique language/client combinations", () => {
    const keys = list().map((g) => `${g.language}/${g.client}`);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });
});
