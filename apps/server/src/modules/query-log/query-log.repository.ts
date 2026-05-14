import prisma, { type Prisma, type QueryLog } from "@osint-rag/db";

export const createQueryLog = (data: Prisma.QueryLogCreateInput): Promise<QueryLog> => {
  return prisma.queryLog.create({
    data,
  });
};
