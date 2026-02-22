// Prisma client singleton for Next.js (Prisma 7 requires a driver adapter)
// Load PrismaClient via createRequire so the generated client (with Call model) is always used
import type { PrismaClient as PrismaClientType } from ".prisma/client";
import { createRequire } from "node:module";
import { PrismaPg } from "@prisma/adapter-pg";

const requireModule = createRequire(import.meta.url);
const GeneratedClient = requireModule(".prisma/client").PrismaClient;

// Re-export JsonNull from generated client
const PrismaNamespace = requireModule(".prisma/client").Prisma;
export const PrismaJsonNull = PrismaNamespace?.JsonNull;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientType };

function getConnectionString(): string {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  }
  if (process.env.NODE_ENV === "development") {
    try {
      const url = new URL(connectionString);
      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", "5");
        connectionString = url.toString();
      }
    } catch {
      // no-op
    }
  }
  return connectionString;
}

function createPrisma(): PrismaClientType {
  const connectionString = getConnectionString();
  const adapterOptions: { connectionString: string; max?: number } = { connectionString };
  if (process.env.NODE_ENV === "development") {
    adapterOptions.max = 5;
  }
  const adapter = new PrismaPg(adapterOptions);
  return new GeneratedClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  }) as PrismaClientType;
}

let prismaInstance = globalForPrisma.prisma;
if (!prismaInstance || typeof (prismaInstance as { call?: unknown }).call === "undefined") {
  prismaInstance = createPrisma();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;
}
export const prisma = prismaInstance;
