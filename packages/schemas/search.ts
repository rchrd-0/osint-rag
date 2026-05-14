import z from "zod";

const queryTextSchema = z.string().min(1, "Query is required");

const queryStrategies = ["naive", "fts", "vector"] as const;
export const QueryStrategyEnum = z.enum(queryStrategies);
export type QueryStrategy = z.infer<typeof QueryStrategyEnum>;

export const searchQuerySchema = z.object({
  q: queryTextSchema,
  strategy: QueryStrategyEnum.default("fts"),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .default(15)
    .transform((value) => Math.min(value, 30)),
});
