import z from "zod";

const queryTextSchema = z.string().min(1, "Query is required");

const queryStrategies = ["naive", "fts", "vector"] as const;
export const QueryStrategyEnum = z.enum(queryStrategies);
export type QueryStrategy = z.infer<typeof QueryStrategyEnum>;

const searchModes = ["raw", "diversified"] as const;
export const SearchModeEnum = z.enum(searchModes);
export type SearchMode = z.infer<typeof SearchModeEnum>;

export const searchQuerySchema = z.object({
  q: queryTextSchema,
  strategy: QueryStrategyEnum.default("vector"),
  mode: SearchModeEnum.default("raw"),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .default(15)
    .transform((value) => Math.min(value, 30)),
  chunksPerDocument: z.coerce
    .number()
    .int()
    .positive()
    .default(2)
    .transform((value) => Math.min(value, 5)),
});
