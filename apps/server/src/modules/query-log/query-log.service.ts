import type { Prisma } from "@osint-rag/db";
import { createQueryLog } from "@/modules/query-log/query-log.repository";

export const persistQueryLogSafe = async (data: Prisma.QueryLogCreateInput): Promise<void> => {
  try {
    await createQueryLog(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to persist query log", error.message);
    } else {
      console.error("Failed to persist query log", String(error));
    }
  }
};
