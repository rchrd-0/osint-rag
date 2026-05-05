export interface RawChunk {
  text: string;
  chunkIndex: number;
}

export const chunkText = (rawText: string, maxChars = 2000) => {
  const paragraphs = rawText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks: RawChunk[] = [];

  let current = "";

  const pushChunk = (text: string) => chunks.push({ text, chunkIndex: chunks.length });

  for (const paragraph of paragraphs) {
    // @TODO: v2: if a single paragraph exceeds maxChars, split it more granularly before packing.
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length > maxChars && current) {
      pushChunk(current);

      current = paragraph;
    } else {
      current = candidate;
    }
  }

  if (current) {
    pushChunk(current);
  }

  return chunks;
};
