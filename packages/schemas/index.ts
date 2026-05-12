import z from "zod";

const queryStrategies = ["naive", "fts"] as const;
export const QueryStrategyEnum = z.enum(queryStrategies);

export const searchQuerySchema = z.object({
  q: z.string().min(1, "Query parameter q is required"),
  strategy: QueryStrategyEnum.default("fts"),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .default(10)
    .transform((value) => Math.min(value, 30)),
});
