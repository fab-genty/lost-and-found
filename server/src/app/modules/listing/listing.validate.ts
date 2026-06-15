import { z } from "zod";
import {
  isDirectionValidForType,
  ListingType,
} from "../../utils/listingDomain";

const create = z
  .object({
    body: z.object({
      type: z.enum(["OBJECT", "ANIMAL", "PERSON"]),
      direction: z.enum(["LOST", "FOUND", "MISSING"]),
      title: z.string({ required_error: "title is required" }).min(1),
      description: z.string().optional(),
      country: z.string({ required_error: "country is required" }).min(1),
      region: z.string().optional(),
      city: z.string().optional(),
      date: z.string().optional(),
      photoUrl: z.string().optional(),
      contactPhone: z.string({ required_error: "contactPhone is required" }).min(1),
      contactWhatsapp: z.string().optional(),
      categoryId: z.string().optional(),
      species: z.string().optional(),
      breed: z.string().optional(),
      color: z.string().optional(),
      age: z.number().optional(),
      gender: z.string().optional(),
      lastSeenDetails: z.string().optional(),
    }),
  })
  .superRefine((val, ctx) => {
    const b = val.body;
    if (!isDirectionValidForType(b.type as ListingType, b.direction)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "direction"],
        message: `direction ${b.direction} invalide pour le type ${b.type}`,
      });
    }
    if (b.type === "OBJECT" && !b.categoryId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["body", "categoryId"], message: "categoryId requis pour un objet" });
    }
    if (b.type === "ANIMAL" && !b.species) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["body", "species"], message: "species requis pour un animal" });
    }
    if (b.type === "PERSON") {
      if (b.age === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["body", "age"], message: "age requis pour une personne" });
      }
      if (!b.gender) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["body", "gender"], message: "gender requis pour une personne" });
      }
    }
  });

const update = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    date: z.string().optional(),
    photoUrl: z.string().optional(),
    contactPhone: z.string().optional(),
    contactWhatsapp: z.string().optional(),
    species: z.string().optional(),
    breed: z.string().optional(),
    color: z.string().optional(),
    age: z.number().optional(),
    gender: z.string().optional(),
    lastSeenDetails: z.string().optional(),
  }),
});

export const ListingSchema = { create, update };
