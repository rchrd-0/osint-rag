import prisma, { type Prisma } from "@osint-rag/db";

export const documentListSelect = {
  id: true,
  title: true,
  sourceType: true,
  sourceName: true,
  author: true,
  url: true,
  publishedAt: true,
} as const;

export type DocumentListRow = Prisma.DocumentGetPayload<{
  select: typeof documentListSelect;
}>;

export const countDocuments = (): Promise<number> => {
  return prisma.document.count();
};

export const findDocumentsPage = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<DocumentListRow[]> => {
  return prisma.document.findMany({
    select: documentListSelect,
    skip: (page - 1) * limit,
    take: limit + 1,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { id: "desc" }],
  });
};

export const findDocumentById = (id: string) => {
  return prisma.document.findFirst({
    where: { id },
  });
};
