// Prisma client singleton for Next.js (Prisma 7 requires a driver adapter)
import * as PrismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Get PrismaClient from package (avoids named import type resolution issues with bundler / Prisma 7)
const PrismaClient = (PrismaPkg as unknown as { PrismaClient: new (args?: object) => object }).PrismaClient;

// Re-export JsonNull for setting JSON fields to DB null (avoids importing Prisma namespace in routes; TS may not resolve it with bundler)
export const PrismaJsonNull = (PrismaPkg as unknown as { Prisma?: { JsonNull: unknown } }).Prisma?.JsonNull;

const globalForPrisma = globalThis as unknown as { prisma: InstanceType<typeof PrismaClient> };

function getConnectionString(): string {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  }
  // In development, limit pool size to avoid "too many clients" (PostgreSQL default max_connections is often 100)
  if (process.env.NODE_ENV === "development") {
    try {
      const url = new URL(connectionString);
      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", "5");
        connectionString = url.toString();
      }
    } catch {
      // If URL parsing fails, use as-is
    }
  }
  return connectionString;
}

function createPrisma() {
  const connectionString = getConnectionString();
  const adapterOptions: { connectionString: string; max?: number } = { connectionString };
  if (process.env.NODE_ENV === "development") {
    adapterOptions.max = 5;
  }
  const adapter = new PrismaPg(adapterOptions);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
