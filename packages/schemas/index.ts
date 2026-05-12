import z from "zod";

export const searchQuerySchema = z.object({
  q: z.string().min(1, "Query parameter q is required"),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .default(10)
    .transform((value) => Math.min(value, 30)),
});
