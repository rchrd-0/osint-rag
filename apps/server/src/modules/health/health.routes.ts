import { Hono } from "hono";

const healthRoutes = new Hono();

healthRoutes.get("/", (c) => {
  return c.json({
    success: true,
    message: "OK",
  });
});

healthRoutes.get("/health", (c) => {
  return c.json({
    success: true,
    data: {
      uptime: process.uptime(),
    },
  });
});

export default healthRoutes;
