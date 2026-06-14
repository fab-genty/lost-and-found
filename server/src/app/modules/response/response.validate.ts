import { z } from "zod";

const create = z.object({
  body: z.object({
    message: z.string({ required_error: "message is required" }).min(1),
    distinguishingFeatures: z.string().optional(),
    sightingLocation: z.string().optional(),
    sightingDate: z.string().optional(),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  }),
});

export const ResponseSchema = { create, updateStatus };
