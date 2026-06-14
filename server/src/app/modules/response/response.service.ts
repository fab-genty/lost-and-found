import prisma from "../../config/prisma";
import { responseKindForDirection } from "../../utils/listingDomain";

const createResponse = async (
  listingId: string,
  authorId: string,
  data: Record<string, any>
) => {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, isDeleted: false },
  });
  if (!listing) throw new Error("Annonce introuvable");
  const kind = responseKindForDirection(listing.direction as any);
  return prisma.response.create({
    data: {
      listingId,
      authorId,
      kind,
      message: data.message,
      distinguishingFeatures: data.distinguishingFeatures ?? null,
      sightingLocation: data.sightingLocation ?? null,
      sightingDate: data.sightingDate ? new Date(data.sightingDate) : null,
    },
  });
};

const getMyResponses = async (authorId: string) => {
  return prisma.response.findMany({
    where: { authorId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { id: true, title: true, type: true, direction: true } } },
  });
};

const getAllResponses = async () => {
  return prisma.response.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, type: true, direction: true, userId: true } },
      author: { select: { id: true, username: true, email: true } },
    },
  });
};

const getResponseWithListing = async (id: string) => {
  return prisma.response.findFirst({
    where: { id, isDeleted: false },
    include: { listing: { select: { userId: true } } },
  });
};

const updateStatus = async (id: string, status: string) => {
  return prisma.response.update({
    where: { id },
    data: { status: status as any },
  });
};

export const responseService = {
  createResponse,
  getMyResponses,
  getAllResponses,
  getResponseWithListing,
  updateStatus,
};
