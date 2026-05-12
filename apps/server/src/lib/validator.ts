import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type z from "zod";

export const validator = <T extends keyof ValidationTargets, S extends z.ZodType>(
  target: T,
  schema: S,
) => {
  return zValidator(target, schema, (result, _c) => {
    if (!result.success) {
      throw result.error;
    }
  });
};
