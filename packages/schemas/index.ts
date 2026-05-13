import z from "zod";

const queryStrategies = ["naive", "fts"] as const;
const queryTextSchema = z.string().min(1, "Query is required");

export const QueryStrategyEnum = z.enum(queryStrategies);

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

export const ragQuerySchema = z.object({
  query: queryTextSchema,
  limit: z.coerce
    .number()
    .int()
    .positive()
    .default(5)
    .transform((value) => Math.min(value, 10)),
});
