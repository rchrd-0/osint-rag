import { env } from "@osint-rag/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { ZodError } from "zod";

import documentsRoutes from "@/modules/documents/documents.routes";
import healthRoutes from "@/modules/health/health.routes";
import ragRoutes from "@/modules/rag/rag.routes";
import searchRoutes from "@/modules/search/search.routes";

const app = new Hono();

app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        message: "Validation failed",
        errors: err.issues.map((issue) => ({
          field: issue.path.join(".") || "unknown",
          message: issue.message,
        })),
      },
      400,
    );
  }

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.status,
    );
  }

  console.error("Unhandled error:", err);
  return c.json(
    {
      success: false,
      message: "Internal server error",
    },
    500,
  );
});

app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: "Not found",
    },
    404,
  );
});

app.route("/", healthRoutes);

app.route("/documents", documentsRoutes);

app.route("/search", searchRoutes);

app.route("/rag", ragRoutes);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
