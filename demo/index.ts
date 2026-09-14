/**
 * Demo script for @powerduck/openapi-codegen.
 *
 * Usage: npm run demo
 *
 * This script demonstrates how to use the library to generate HTTP request
 * examples in multiple languages from an OpenAPI document.
 */

import { generate, list } from "../dist/index";
import { petstoreDocument } from "./petstore";

function printSection(title: string): void {
  const rule = "=".repeat(72);

  console.log(`\n${rule}`);
  console.log(title);
  console.log(rule);
}

function printGenerators(): void {
  const generators = list();

  printSection(`Available generators (${generators.length})`);

  const grouped = new Map<string, string[]>();

  for (const { language, client } of generators) {
    const clients = grouped.get(language) ?? [];
    clients.push(client);
    grouped.set(language, clients);
  }

  for (const [language, clients] of grouped.entries()) {
    console.log(`  ${language.padEnd(12)}: ${clients.join(", ")}`);
  }
}

function generateExample(
  title: string,
  options: {
    path: string;
    method: string;
    language: string;
    client: string;
    securityValues?: Record<string, string>;
  },
): void {
  printSection(title);

  try {
    const code = generate({
      document: petstoreDocument,
      ...options,
    });

    console.log(code);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Generation failed: ${message}`);
  }
}

function main(): void {
  console.log("@powerduck/openapi-codegen Demo");
  console.log("==================================");

  // 1. List all available generators
  printGenerators();

  // 2. Generate examples for popular languages
  generateExample("Shell / curl — Get a pet by ID", {
    path: "/pets/{id}",
    method: "get",
    language: "shell",
    client: "curl",
  });

  generateExample("JavaScript / fetch — List pets", {
    path: "/pets",
    method: "get",
    language: "javascript",
    client: "fetch",
  });

  generateExample("Python / requests — Create a pet", {
    path: "/pets",
    method: "post",
    language: "python",
    client: "requests",
  });

  generateExample("Go / net/http — Update a pet", {
    path: "/pets/{id}",
    method: "put",
    language: "go",
    client: "new-request",
  });

  generateExample("Java / OkHttp — Delete a pet", {
    path: "/pets/{id}",
    method: "delete",
    language: "java",
    client: "okhttp",
  });

  generateExample("Rust / reqwest — Get a pet with auth", {
    path: "/pets/{id}",
    method: "get",
    language: "rust",
    client: "reqwest",
    securityValues: {
      bearerAuth: "my-access-token",
    },
  });

  // 3. Demonstrate error handling
  printSection("Error Handling Example");

  try {
    generate({
      document: petstoreDocument,
      path: "/nonexistent",
      method: "get",
      language: "javascript",
      client: "fetch",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`Expected error for nonexistent path: ${message}`);
  }

  try {
    generate({
      document: petstoreDocument,
      path: "/pets",
      method: "get",
      language: "unknown-language",
      client: "unknown-client",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`Expected error for unknown generator: ${message}`);
  }

  printSection("Demo Complete");
  console.log("All examples generated successfully!");
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`\nDemo failed: ${message}`);
}
