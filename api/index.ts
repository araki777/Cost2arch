import { promises as fs } from "fs";
import { join } from "path";
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

// Mount with /api and / for SWA compatibility, including /api/api for resilience
app.route("/api", api);
app.get("/api/icons/*", async (c) => {
  try {
    const iconPath = c.req.path.replace("/api/icons/", "");
    const decodedPath = decodeURIComponent(iconPath);
    const filePath = join(process.cwd(), "icons", decodedPath);
    const file = await fs.readFile(filePath);
    return c.body(file, 200, {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    });
  } catch (e) {
    console.error("Icon fetch error:", e);
    return c.notFound();
  }
});
app.route("/", api);
app.route("/api/api", api);

// Root endpoint for connectivity check
app.get("/", (c) => c.text("Cost2arch API is running - Resilient Routing Enabled"));


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
