/**
 * Prisma client singleton.
 *
 * In dev (Next.js fast refresh), a fresh module copy is loaded on every
 * file change; without the global cache below we'd open dozens of pool
 * connections and exhaust Postgres `max_connections` after a few saves.
 *
 * In prod (standalone Next), `globalThis` is per-process so the singleton
 * collapses to a single instance naturally.
 *
 * Only import from this file when the Stats / Auth modules are active —
 * importing it without DATABASE_URL set will throw at construction time.
 */
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __srs_prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__srs_prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["warn", "error"] : ["query", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__srs_prisma = prisma;
}
