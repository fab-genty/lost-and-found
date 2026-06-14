import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";

const listingInclude = {
  user: { select: { id: true, username: true, email: true, role: true } },
  category: true,
};

type CreateInput = Record<string, any>;

const createListing = async (data: CreateInput, userId: string) => {
  return prisma.listing.create({
    data: {
      type: data.type,
      direction: data.direction,
      title: data.title,
      description: data.description ?? "",
      country: data.country,
      region: data.region ?? "",
      city: data.city ?? "",
      date: data.date ? new Date(data.date) : new Date(),
      photoUrl: data.photoUrl ?? "",
      contactPhone: data.contactPhone,
      contactWhatsapp: data.contactWhatsapp ?? "",
      categoryId: data.categoryId ?? null,
      species: data.species ?? null,
      breed: data.breed ?? null,
      color: data.color ?? null,
      age: data.age ?? null,
      gender: data.gender ?? null,
      lastSeenDetails: data.lastSeenDetails ?? null,
      userId,
    },
    include: listingInclude,
  });
};

const getListings = async (q: Record<string, any>) => {
  const where: Prisma.ListingWhereInput = { isDeleted: false };
  if (q.type) where.type = q.type;
  if (q.direction) where.direction = q.direction;
  if (q.country) where.country = { contains: q.country, mode: "insensitive" };
  if (q.region) where.region = { contains: q.region, mode: "insensitive" };
  if (q.city) where.city = { contains: q.city, mode: "insensitive" };
  if (q.category) where.categoryId = q.category;
  return prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: listingInclude,
  });
};

const getListing = async (id: string) => {
  return prisma.listing.findFirst({
    where: { id, isDeleted: false },
    include: listingInclude,
  });
};

const getMyListings = async (userId: string) => {
  return prisma.listing.findMany({
    where: { userId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: listingInclude,
  });
};

const updateListing = async (id: string, data: Record<string, any>) => {
  const allowed = [
    "title", "description", "country", "region", "city", "date", "photoUrl",
    "contactPhone", "contactWhatsapp", "species", "breed", "color", "age",
    "gender", "lastSeenDetails",
  ];
  const updateData: Record<string, any> = {};
  for (const k of allowed) {
    if (data[k] !== undefined) {
      updateData[k] = k === "date" ? new Date(data[k]) : data[k];
    }
  }
  return prisma.listing.update({ where: { id }, data: updateData, include: listingInclude });
};

const resolveListing = async (id: string) => {
  return prisma.listing.update({ where: { id }, data: { isResolved: true } });
};

const softDeleteListing = async (id: string) => {
  return prisma.listing.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

export const listingService = {
  createListing,
  getListings,
  getListing,
  getMyListings,
  updateListing,
  resolveListing,
  softDeleteListing,
};
