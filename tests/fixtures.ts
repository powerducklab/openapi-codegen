/**
 * Shared test fixtures for OpenAPI codegen tests.
 */

export const minimalOpenApi = {
  openapi: "3.1.0",
  info: { title: "Test API", version: "1.0.0" },
  paths: {
    "/users": {
      get: {
        operationId: "listUsers",
        summary: "List users",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "offset", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        operationId: "createUser",
        summary: "Create a user",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/users/{id}": {
      get: {
        operationId: "getUser",
        summary: "Get a user by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      delete: {
        operationId: "deleteUser",
        summary: "Delete a user",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "204": { description: "No Content" } },
      },
    },
  },
};

export const openApiWithRefs = {
  openapi: "3.1.0",
  info: { title: "Ref API", version: "1.0.0" },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
        },
      },
      Error: {
        type: "object",
        properties: {
          code: { type: "integer" },
          message: { type: "string" },
        },
      },
    },
    parameters: {
      PageParam: {
        name: "page",
        in: "query",
        schema: { type: "integer", default: 1 },
      },
    },
  },
  paths: {
    "/users": {
      get: {
        parameters: [{ $ref: "#/components/parameters/PageParam" }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const openApiWithSecurity = {
  openapi: "3.1.0",
  info: { title: "Secure API", version: "1.0.0" },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer" },
      apiKey: { type: "apiKey", in: "header", name: "X-API-Key" },
    },
  },
  paths: {
    "/secure": {
      get: {
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        responses: { "200": { description: "OK" } },
      },
    },
  },
};

export const openApiWithServers = {
  openapi: "3.1.0",
  info: { title: "Server API", version: "1.0.0" },
  servers: [
    { url: "https://api.example.com/v1" },
    { url: "https://staging.example.com/v1" },
  ],
  paths: {
    "/items": {
      get: { responses: { "200": { description: "OK" } } },
    },
  },
};

export const openApi32 = {
  openapi: "3.2.0",
  info: { title: "OAS 3.2 API", version: "1.0.0" },
  paths: {
    "/v32": {
      get: { responses: { "200": { description: "OK" } } },
    },
  },
};

export const openApiWithMultipart = {
  openapi: "3.1.0",
  info: { title: "Upload API", version: "1.0.0" },
  paths: {
    "/upload": {
      post: {
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
  },
};

export const openApiWithFormUrlEncoded = {
  openapi: "3.1.0",
  info: { title: "Form API", version: "1.0.0" },
  paths: {
    "/submit": {
      post: {
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
  },
};

export const openApiWithHeaders = {
  openapi: "3.1.0",
  info: { title: "Header API", version: "1.0.0" },
  paths: {
    "/headers": {
      get: {
        parameters: [
          { name: "X-Request-ID", in: "header", schema: { type: "string" } },
          { name: "session", in: "cookie", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
  },
};
