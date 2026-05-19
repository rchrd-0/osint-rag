export const dateToIsoString = (value: Date | null): string | null =>
  value === null ? null : value.toISOString();

export const formatUsdAmount = (amount: number): string => {
  if (amount === 0) {
    return "$0.00";
  }

  if (amount < 0.01) {
    return `$${amount.toFixed(6)}`;
  }

  return `$${amount.toFixed(4)}`;
};

export const formatUsdAmountOrUnknown = (amount: number | null): string =>
  amount === null ? "unknown" : formatUsdAmount(amount);

export const formatTokenCount = (count: number): string =>
  `${count} token${count === 1 ? "" : "s"}`;

export const formatTokensAndCost = (params: { tokens: number; cost: number | null }): string => {
  const tokenLabel = formatTokenCount(params.tokens);

  if (params.cost === null) {
    return `${tokenLabel}, cost unknown`;
  }

  return `${tokenLabel}, ${formatUsdAmount(params.cost)}`;
};
