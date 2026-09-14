import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: "terser",
  terserOptions: {
    compress: {
      drop_console: false,
      drop_debugger: true,
    },
    mangle: true,
  },
  cjsInterop: true,
  banner: {
    js: `/**
 * @powerduck/openapi-codegen
 * Generate runnable HTTP request examples from OpenAPI documents.
 * 21 languages, 41 clients, browser-compatible.
 *
 * Copyright (c) 2026 Powerduck limited
 * Licensed under the MIT License.
 */`,
  },
});
