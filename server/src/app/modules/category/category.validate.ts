import { z } from "zod";
const createCategory = z.object({
  body: z.object({
    name: z.string({ required_error: "name is required" }).min(1),
  }),
});
export const CategorySchema = { createCategory };
