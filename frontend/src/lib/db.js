import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

/**
 * Global Prisma Client instance with connection pooling.
 * Reuses client in Next.js development hot-reloading to prevent connection exhaustion.
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Health check helper to verify database connectivity.
 * @returns {Promise<{ ok: boolean, latencyMs?: number, error?: string }>}
 */
export async function checkDatabaseHealth() {
  const start = Date.now();
  try {
    if (!process.env.DATABASE_URL) {
      return { ok: false, error: "DATABASE_URL environment variable is missing" };
    }
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    return { ok: true, latencyMs };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export default prisma;
