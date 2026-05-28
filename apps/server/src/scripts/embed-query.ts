import { parseArgs } from "node:util";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL_ID, embedText } from "@/lib/ai/embeddings";
import { toPgVectorLiteral } from "@/lib/pgvector";

const usage = () => {
  console.log(
    [
      "Usage:",
      '  bun run embed:query -- "your query text"',
      '  bun run src/scripts/embed-query.ts -- "your query text"',
    ].join("\n"),
  );
};

const main = async () => {
  const { positionals } = parseArgs({
    args: Bun.argv.slice(2),
    allowPositionals: true,
    strict: false,
  });

  const query = positionals.join(" ").trim();
  if (!query) {
    usage();
    process.exitCode = 1;
    return;
  }

  const startedAt = performance.now();
  const embedding = await embedText(query);
  const elapsedMs = Math.round(performance.now() - startedAt);
  const vectorLiteral = toPgVectorLiteral(embedding);

  console.log(`Model: ${EMBEDDING_MODEL_ID}`);
  console.log(`Dimensions: ${EMBEDDING_DIMENSIONS}`);
  console.log(`Elapsed: ${elapsedMs}ms`);
  console.log("");
  console.log("Query:");
  console.log(query);
  console.log("");
  console.log("Vector literal (for SQL):");
  console.log(vectorLiteral);
  console.log("");
  console.log("JSON embedding:");
  console.log(JSON.stringify(embedding));
};

void main();
