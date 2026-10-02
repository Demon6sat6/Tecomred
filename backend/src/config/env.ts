import { config } from "dotenv";
import { z } from "zod";

config();

process.env.MYSQL_HOST ??= process.env.MYSQLHOST;
process.env.MYSQL_USER ??= process.env.MYSQLUSER;
process.env.MYSQL_PASSWORD ??= process.env.MYSQLPASSWORD;
process.env.MYSQL_DATABASE ??= process.env.MYSQLDATABASE;

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  ADMIN_USER: z.string().min(1).default("admin"),
  ADMIN_PASSWORD: z.string().min(8).default("change-this-password"),
  ADMIN_API_KEY: z.string().min(16).default("change-this-api-key"),
  MYSQL_HOST: z.string().default("localhost"),
  MYSQL_USER: z.string().default("root"),
  MYSQL_PASSWORD: z.string().default(""),
  MYSQL_DATABASE: z.string().default("tecomred"),
}).superRefine((value, context) => {
  if (value.NODE_ENV !== "production") return;
  if (!process.env.ADMIN_PASSWORD || value.ADMIN_PASSWORD === "change-this-password") {
    context.addIssue({ code: "custom", path: ["ADMIN_PASSWORD"], message: "Set a unique administrator bootstrap password" });
  }
  if (!process.env.ADMIN_API_KEY || value.ADMIN_API_KEY === "change-this-api-key" || value.ADMIN_API_KEY.length < 32) {
    context.addIssue({ code: "custom", path: ["ADMIN_API_KEY"], message: "Set a random JWT secret of at least 32 characters" });
  }
  if (!process.env.MYSQL_PASSWORD) {
    context.addIssue({ code: "custom", path: ["MYSQL_PASSWORD"], message: "Set the production database password" });
  }
  if (!value.CORS_ORIGIN.split(",").every(origin => origin.trim().startsWith("https://"))) {
    context.addIssue({ code: "custom", path: ["CORS_ORIGIN"], message: "Use HTTPS origins in production" });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid backend environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid backend environment variables");
}

export const env = parsed.data;
