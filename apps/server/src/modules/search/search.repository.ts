import prisma from "@osint-rag/db";

type ChunkSearchResult = {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  document: {
    url: string | null;
    title: string;
    publishedAt: Date | null;
  };
  rank?: number;
};

type FullTextResultRaw = {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  title: string;
  url: string | null;
  publishedAt: Date | null;
  rank: number;
};

export const searchChunksContains = async (
  query: string,
  limit: number,
): Promise<ChunkSearchResult[]> => {
  return prisma.chunk.findMany({
    select: {
      id: true,
      documentId: true,
      chunkIndex: true,
      text: true,
      document: {
        select: {
          title: true,
          url: true,
          publishedAt: true,
        },
      },
    },
    where: {
      text: {
        contains: query,
        mode: "insensitive",
      },
    },
    take: limit,
  });
};

export const searchChunksFullText = async (
  query: string,
  limit: number,
): Promise<ChunkSearchResult[]> => {
  const results = await prisma.$queryRaw<FullTextResultRaw[]>`
    SELECT
      c.id,
      c.document_id AS "documentId",
      c.chunk_index AS "chunkIndex",
      c.text,
      d.title,
      d.url,
      d.published_at AS "publishedAt",
      ts_rank(
        to_tsvector('english', c.text),
        plainto_tsquery('english', ${query})
      ) AS rank
    FROM chunks c
    JOIN documents d ON d.id = c.document_id
    WHERE to_tsvector('english', c.text) @@ plainto_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT ${limit}
  `;

  return results.map((result) => ({
    id: result.id,
    documentId: result.documentId,
    chunkIndex: result.chunkIndex,
    text: result.text,
    document: {
      title: result.title,
      url: result.url,
      publishedAt: result.publishedAt,
    },
    rank: result.rank,
  }));
};
