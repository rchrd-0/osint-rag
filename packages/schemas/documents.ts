import z from "zod";

export const documentsListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .default(25)
    .transform((value) => Math.min(value, 100)),
});

export type DocumentsListQuery = z.infer<typeof documentsListQuerySchema>;
