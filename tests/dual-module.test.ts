import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

describe("dual module support (ESM + CJS)", () => {
  const distDir = resolve(process.cwd(), "dist");

  it("ESM build exists", () => {
    expect(existsSync(resolve(distDir, "index.js"))).toBe(true);
  });

  it("CJS build exists", () => {
    expect(existsSync(resolve(distDir, "index.cjs"))).toBe(true);
  });

  it("TypeScript declarations exist", () => {
    expect(existsSync(resolve(distDir, "index.d.ts"))).toBe(true);
  });

  it("CJS declarations exist", () => {
    expect(existsSync(resolve(distDir, "index.d.cts"))).toBe(true);
  });

  it("package.json has correct exports field", () => {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));
    expect(pkg.exports["."].import).toBeDefined();
    expect(pkg.exports["."].require).toBeDefined();
    expect(pkg.exports["."].types).toBeDefined();
  });

  it("package.json has main field for CJS", () => {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));
    expect(pkg.main).toContain(".cjs");
  });

  it("package.json has module field for ESM", () => {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));
    expect(pkg.module).toContain(".js");
  });

  it("ESM build contains generate function", () => {
    const content = readFileSync(resolve(distDir, "index.js"), "utf8");
    expect(content).toContain("generate");
  });

  it("CJS build contains generate function", () => {
    const content = readFileSync(resolve(distDir, "index.cjs"), "utf8");
    expect(content).toContain("generate");
  });

  it("CJS build has module.exports", () => {
    const content = readFileSync(resolve(distDir, "index.cjs"), "utf8");
    expect(content).toContain("module.exports");
  });

  it("ESM build uses export syntax", () => {
    const content = readFileSync(resolve(distDir, "index.js"), "utf8");
    expect(content).toContain("export");
  });

  it("no .DS_Store files in dist", () => {
    const checkDsStore = (dir: string): boolean => {
      try {
        const files = require("node:fs").readdirSync(dir);
        for (const file of files) {
          if (file === ".DS_Store") return true;
          const fullPath = require("node:path").join(dir, file);
          if (require("node:fs").statSync(fullPath).isDirectory()) {
            if (checkDsStore(fullPath)) return true;
          }
        }
      } catch {
        // ignore
      }
      return false;
    };
    expect(checkDsStore(distDir)).toBe(false);
  });

  it("no Chinese characters in source files", () => {
    const { readdirSync, statSync } = require("node:fs");
    const { join } = require("node:path");
    const srcDir = resolve(process.cwd(), "src");

    const findTsFiles = (dir: string): string[] => {
      const results: string[] = [];
      try {
        const files = readdirSync(dir);
        for (const file of files) {
          const fullPath = join(dir, file);
          if (statSync(fullPath).isDirectory()) {
            results.push(...findTsFiles(fullPath));
          } else if (file.endsWith(".ts")) {
            results.push(fullPath);
          }
        }
      } catch {
        // ignore
      }
      return results;
    };

    const files = findTsFiles(srcDir);
    const chineseRegex = /[\u4e00-\u9fff]/;

    for (const file of files) {
      const content = readFileSync(file, "utf8");
      expect(chineseRegex.test(content), `Chinese characters found in ${file}`).toBe(false);
    }
  });
});
