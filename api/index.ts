import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import infraRoute from "./routes/infra.route";

const app = new OpenAPIHono();

// CORS Settings
app.use("/*", cors());

// Error Handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({
    error: err.message || "Unknown error",
  }, 500);
});

const api = new OpenAPIHono();

// Mount Routes
api.route("/infra", infraRoute);

// Mount with /api and / for SWA compatibility
app.route("/api", api);
app.route("/", api);

// Health check
app.get("/health", (c) => c.text("OK"));

// OpenAPI docs
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Cost2arch API",
    version: "1.0.0",
  },
});

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

export default app;
