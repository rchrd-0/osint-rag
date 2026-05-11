import { env } from "@osint-rag/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/client";

export type { Chunk, Document } from "../prisma/generated/client";

export { Prisma } from "../prisma/generated/client";

export function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
  });
}

const prisma = createPrismaClient();

export default prisma;
