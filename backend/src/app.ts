import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { ordersRouter } from "./routes/orders.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api", (_req, res) => {
  res.json({ message: "TecomRed API ready" });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);


// Middleware para rutas no encontradas
app.use((_req, res, next) => {
  const error = new Error("Route not found");
  // @ts-ignore
  error.status = 404;
  next(error);
});

// Middleware global de manejo de errores
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });
});
