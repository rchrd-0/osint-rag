import prisma, { type Document } from "@osint-rag/db";

export const findDocuments = (): Promise<Document[]> => {
  return prisma.document.findMany();
};

export const findDocumentById = (id: string): Promise<Document | null> => {
  return prisma.document.findFirst({
    where: { id },
  });
};
