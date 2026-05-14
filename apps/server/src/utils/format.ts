export const publishedAtToIso = (value: Date | null): string | null =>
  value === null ? null : value.toISOString();
