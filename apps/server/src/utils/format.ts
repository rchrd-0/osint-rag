export const dateToIsoString = (value: Date | null): string | null =>
  value === null ? null : value.toISOString();
