import z from "zod";
import { QueryStrategyEnum } from "./search";

const queryTextSchema = z.string().min(1, "Query is required");

export const ragQuerySchema = z.object({
  strategy: QueryStrategyEnum.default("vector"),
  query: queryTextSchema,
  limit: z.coerce
    .number()
    .int()
    .positive()
    .default(5)
    .transform((value) => Math.min(value, 10)),
});

export type RagQueryInput = z.infer<typeof ragQuerySchema>;
