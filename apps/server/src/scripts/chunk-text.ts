export type RawChunk = {
  text: string;
  chunkIndex: number;
};

const splitOnSentence = (text: string): string[] => {
  return (text.match(/[^.!?]+[.!?]?/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
};

export const chunkText = (rawText: string, maxChars = 1500) => {
  const paragraphs = rawText
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  let input: string[];

  if (paragraphs.length === 1) {
    // biome-ignore lint/style/noNonNullAssertion: safe
    input = splitOnSentence(paragraphs[0]!);
  } else {
    input = paragraphs;
  }

  const separator = paragraphs.length > 1 ? "\n\n" : " ";

  const chunks: RawChunk[] = [];
  let current = "";

  const pushChunk = (text: string) => chunks.push({ text, chunkIndex: chunks.length });

  for (const item of input) {
    // @TODO: v2: if a single paragraph exceeds maxChars, split it more granularly before packing. or semantic aware sentence boundaries
    const candidate = current ? `${current}${separator}${item}` : item;

    if (candidate.length > maxChars && current) {
      pushChunk(current);

      current = item;
    } else {
      current = candidate;
    }
  }

  if (current) {
    pushChunk(current);
  }

  return chunks;
};
