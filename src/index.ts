/**
 * @powerduck/openapi-codegen
 *
 * Generate runnable HTTP request examples from OpenAPI documents.
 * Supports 21 languages and 41 language/client combinations.
 *
 * Browser-compatible, zero runtime dependencies.
 */

export * from "./types";
export * from "./core/refs";
export * from "./core/example";
export * from "./core/serialize";
export * from "./core/generator";
export * from "./core/registry";
export * from "./core/plugin";
export * from "./core/request";
export { normalize } from "./core/normalize";
export { builtinGenerators } from "./emitters/index";

import { registerGenerator, getGenerator, listGenerators } from "./core/registry";
import { normalize } from "./core/normalize";
import { builtinGenerators } from "./emitters/index";
import type { GenerateOptions, Generator, Plugin, RequestIR } from "./types";

let initialized = false;

/**
 * Register all built-in generators.
 * Called automatically on first use, but can be called explicitly.
 */
export function registerBuiltins(): void {
  if (initialized) return;
  initialized = true;
  for (const generator of builtinGenerators) {
    registerGenerator(generator);
  }
}

// Auto-register builtins on module load
registerBuiltins();

/**
 * Register a custom generator.
 */
export function register(generator: Generator): void {
  registerGenerator(generator);
}

/**
 * Get a generator by language and client.
 */
export function get(language: string, client: string): Generator | undefined {
  return getGenerator(language, client);
}

/**
 * List all available generators.
 */
export function list(): Array<{ language: string; client: string }> {
  return listGenerators();
}

/**
 * Apply a plugin that can register custom generators.
 */
export function use(plugin: Plugin): void {
  plugin.register({ register });
}

/**
 * Generate an HTTP request example for an OpenAPI operation.
 *
 * @param options - Generation options
 * @returns Generated source code as a string
 * @throws Error when the path/method is not found, the generator is unknown,
 *         or the document is invalid.
 *
 * @example
 * ```typescript
 * import { generate } from "@powerduck/openapi-codegen";
 *
 * const code = generate({
 *   document: openApiDocument,
 *   path: "/users/{id}",
 *   method: "get",
 *   language: "javascript",
 *   client: "fetch",
 * });
 *
 * console.log(code);
 * ```
 */
export function generate(options: GenerateOptions): string {
  if (!options || typeof options !== "object") {
    throw new TypeError("generate() requires an options object");
  }

  const generator = get(options.language, options.client);
  if (!generator) {
    throw new Error(`Unsupported generator: ${options.language}/${options.client}`);
  }

  let request: RequestIR;
  if (options.request) {
    request = options.request;
  } else {
    if (!options.document) {
      throw new TypeError("generate() requires either a 'request' or a 'document' option");
    }
    if (!options.path) {
      throw new TypeError("generate() requires a 'path' option when using 'document'");
    }
    if (!options.method) {
      throw new TypeError("generate() requires a 'method' option when using 'document'");
    }
    request = normalize({
      document: options.document,
      path: options.path,
      method: options.method,
      serverUrl: options.serverUrl,
      securityValues: options.securityValues,
      softRefMode: options.softRefMode,
    }) as unknown as RequestIR;
  }

  return generator.generate(request);
}
