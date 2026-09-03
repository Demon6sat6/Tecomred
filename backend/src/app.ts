import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { env } from "./config/env.js";
import { authRouter }       from "./routes/auth.js";
import { healthRouter }     from "./routes/health.js";
import { ordersRouter }     from "./routes/orders.js";
import { productsRouter }   from "./routes/products.js";
import { mediaRouter }      from "./routes/media.js";
import { contactRouter }    from "./routes/contact.js";
import { newsletterRouter } from "./routes/newsletter.js";
import { administratorsRouter } from "./routes/administrators.js";

export const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes, intenta de nuevo en 15 minutos" },
});

app.use("/api", limiter);

// Security headers (allow img-src for uploaded files)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: env.CORS_ORIGIN.split(",").map(o => o.trim()),
  credentials: true,
}));

app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.resolve("uploads")));

// Routes
app.get("/api", (_req, res) => res.json({ message: "TecomRed API ready" }));
app.use("/api/health",      healthRouter);
app.use("/api/auth",        authRouter);
app.use("/api/orders",      ordersRouter);
app.use("/api/products",    productsRouter);
app.use("/api/media",       mediaRouter);
app.use("/api/contact",     contactRouter);
app.use("/api/newsletter",  newsletterRouter);
app.use("/api/administrators", administratorsRouter);

// 404
app.use((_req, res, next) => {
  const error = Object.assign(new Error("Route not found"), { status: 404 });
  next(error);
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    ...(env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});
