import { describe, expect, it } from "vitest";
import { normalize } from "../src/core/normalize";
import { minimalOpenApi, openApiWithRefs, openApiWithSecurity, openApiWithServers } from "./fixtures";

describe("normalize()", () => {
  it("normalizes a simple GET request", () => {
    const result = normalize({
      document: minimalOpenApi,
      path: "/users",
      method: "get",
    });
    expect(result.method).toBe("GET");
    expect(result.path).toBe("/users");
    expect(result.baseUrl).toBeDefined();
  });

  it("normalizes a POST request with body", () => {
    const result = normalize({
      document: minimalOpenApi,
      path: "/users",
      method: "post",
    });
    expect(result.method).toBe("POST");
    expect(result.body).toBeDefined();
    expect(result.body?.mediaType).toContain("json");
  });

  it("normalizes path parameters", () => {
    const result = normalize({
      document: minimalOpenApi,
      path: "/users/{id}",
      method: "get",
    });
    const pathParams = result.parameters.filter((p) => p.in === "path");
    expect(pathParams).toHaveLength(1);
    expect(pathParams[0].name).toBe("id");
  });

  it("normalizes query parameters", () => {
    const result = normalize({
      document: minimalOpenApi,
      path: "/users",
      method: "get",
    });
    const queryParams = result.parameters.filter((p) => p.in === "query");
    expect(queryParams.length).toBeGreaterThan(0);
  });

  it("resolves $ref in parameters", () => {
    const result = normalize({
      document: openApiWithRefs,
      path: "/users",
      method: "get",
    });
    const queryParams = result.parameters.filter((p) => p.in === "query");
    expect(queryParams.some((p) => p.name === "page")).toBe(true);
  });

  it("includes security schemes", () => {
    const result = normalize({
      document: openApiWithSecurity,
      path: "/secure",
      method: "get",
      securityValues: {
        bearerAuth: "token",
        apiKey: "key",
      },
    });
    expect(result.security.length).toBeGreaterThan(0);
  });

  it("uses first server URL by default", () => {
    const result = normalize({
      document: openApiWithServers,
      path: "/items",
      method: "get",
    });
    expect(result.baseUrl).toContain("api.example.com");
  });

  it("uses custom serverUrl when provided", () => {
    const result = normalize({
      document: openApiWithServers,
      path: "/items",
      method: "get",
      serverUrl: "https://custom.example.com",
    });
    expect(result.baseUrl).toContain("custom.example.com");
  });

  it("throws for non-existent path", () => {
    expect(() =>
      normalize({
        document: minimalOpenApi,
        path: "/nonexistent",
        method: "get",
      }),
    ).toThrow();
  });

  it("throws for non-existent method", () => {
    expect(() =>
      normalize({
        document: minimalOpenApi,
        path: "/users",
        method: "patch",
      }),
    ).toThrow();
  });

  it("throws for unsupported HTTP method", () => {
    expect(() =>
      normalize({
        document: minimalOpenApi,
        path: "/users",
        method: "INVALID",
      }),
    ).toThrow("Unsupported HTTP method");
  });

  it("throws for invalid document (not an object)", () => {
    expect(() =>
      normalize({
        document: "not-an-object",
        path: "/users",
        method: "get",
      }),
    ).toThrow();
  });

  it("throws for document without paths", () => {
    expect(() =>
      normalize({
        document: { openapi: "3.1.0", info: { title: "Test" } },
        path: "/users",
        method: "get",
      }),
    ).toThrow();
  });

  it("handles uppercase method", () => {
    const result = normalize({
      document: minimalOpenApi,
      path: "/users",
      method: "GET",
    });
    expect(result.method).toBe("GET");
  });

  it("generates example values for parameters", () => {
    const result = normalize({
      document: minimalOpenApi,
      path: "/users",
      method: "get",
    });
    for (const param of result.parameters) {
      expect(param.value).toBeDefined();
    }
  });

  it("generates example value for JSON body", () => {
    const result = normalize({
      document: minimalOpenApi,
      path: "/users",
      method: "post",
    });
    expect(result.body?.value).toBeDefined();
    expect(typeof result.body?.value).toBe("object");
  });

  it("includes preWarnings for potential issues", () => {
    const result = normalize({
      document: minimalOpenApi,
      path: "/users",
      method: "get",
    });
    expect(Array.isArray(result.preWarnings)).toBe(true);
  });

  it("handles document with no servers (empty baseUrl)", () => {
    const result = normalize({
      document: {
        openapi: "3.1.0",
        info: { title: "Test" },
        paths: {
          "/test": {
            get: { responses: { "200": { description: "OK" } } },
          },
        },
      },
      path: "/test",
      method: "get",
    });
    expect(result.baseUrl).toBeDefined();
  });

  it("handles operation-level parameters", () => {
    const doc = {
      openapi: "3.1.0",
      info: { title: "Test" },
      paths: {
        "/test": {
          get: {
            parameters: [{ name: "opParam", in: "query", schema: { type: "string" } }],
            responses: { "200": { description: "OK" } },
          },
        },
      },
    };
    const result = normalize({ document: doc, path: "/test", method: "get" });
    expect(result.parameters.some((p) => p.name === "opParam")).toBe(true);
  });

  it("handles path-level parameters", () => {
    const doc = {
      openapi: "3.1.0",
      info: { title: "Test" },
      paths: {
        "/test": {
          parameters: [{ name: "pathParam", in: "query", schema: { type: "string" } }],
          get: { responses: { "200": { description: "OK" } } },
        },
      },
    };
    const result = normalize({ document: doc, path: "/test", method: "get" });
    expect(result.parameters.some((p) => p.name === "pathParam")).toBe(true);
  });

  it("merges path-level and operation-level parameters", () => {
    const doc = {
      openapi: "3.1.0",
      info: { title: "Test" },
      paths: {
        "/test": {
          parameters: [{ name: "pathParam", in: "query", schema: { type: "string" } }],
          get: {
            parameters: [{ name: "opParam", in: "query", schema: { type: "string" } }],
            responses: { "200": { description: "OK" } },
          },
        },
      },
    };
    const result = normalize({ document: doc, path: "/test", method: "get" });
    expect(result.parameters.length).toBe(2);
  });
});
