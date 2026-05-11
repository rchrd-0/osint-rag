import prisma, { type Prisma } from "@osint-rag/db";
import { chunkText } from "@/scripts/chunk-text";

type ChunkableDocument = Prisma.DocumentGetPayload<{
  select: {
    id: true;
    rawText: true;
  };
}>;

export const chunkDocument = async (document: ChunkableDocument): Promise<number> => {
  console.log(`${document.id}: chunking`);

  const { rawText } = document;
  if (!rawText.trim()) {
    console.log(`${document.id}: skipped - raw text is empty`);
    return 0;
  }

  const rawChunks = chunkText(rawText);
  if (!rawChunks.length) {
    console.log(`${document.id}: skipped - no valid chunks found`);
    return 0;
  }

  const chunkRows = rawChunks.map((chunk) => {
    return {
      documentId: document.id,
      text: chunk.text,
      chunkIndex: chunk.chunkIndex,
    };
  });

  const newChunks = await prisma.chunk.createMany({
    data: chunkRows,
    skipDuplicates: true,
  });

  return newChunks.count;
};

export const runBatchChunkDocuments = async (): Promise<void> => {
  const unchunkedDocuments = await prisma.document.findMany({
    where: {
      chunks: {
        none: {},
      },
    },
    select: {
      id: true,
      rawText: true,
    },
  });

  const documentsFound = unchunkedDocuments.length;
  let documentsChunked = 0;
  let documentsSkipped = 0;
  let documentsFailed = 0;
  let totalChunksCreated = 0;

  console.log(`Found ${documentsFound} unchunked documents`);

  for (const doc of unchunkedDocuments) {
    try {
      const chunksCreated = await chunkDocument(doc);
      totalChunksCreated += chunksCreated;

      if (!chunksCreated) {
        documentsSkipped += 1;
      } else {
        documentsChunked += 1;

        console.log(`${doc.id}: ${chunksCreated} created`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`${doc.id}: failed - `, errorMessage);

      documentsFailed += 1;
    }
  }

  console.log(`
Documents found:      ${documentsFound}
Documents chunked:    ${documentsChunked}
Documents skipped:    ${documentsSkipped}
Documents failed:     ${documentsFailed}
Total chunks created: ${totalChunksCreated}
`);
};

await runBatchChunkDocuments();
