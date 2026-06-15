export type ListingType = "OBJECT" | "ANIMAL" | "PERSON";
export type ListingDirection = "LOST" | "FOUND" | "MISSING";
export type ResponseKind = "CLAIM" | "SIGHTING";
export type ResponseStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Listing = {
  id: string;
  type: ListingType;
  direction: ListingDirection;
  title: string;
  description: string;
  country: string;
  region: string;
  city: string;
  date: string;
  photoUrl: string;
  contactPhone: string;
  contactWhatsapp?: string;
  category?: { id: string; name: string } | null;
  species?: string | null;
  breed?: string | null;
  color?: string | null;
  age?: number | null;
  gender?: string | null;
  lastSeenDetails?: string | null;
  userId: string;
  status: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListingResponse = {
  id: string;
  listingId: string;
  kind: ResponseKind;
  authorId: string;
  message: string;
  distinguishingFeatures?: string | null;
  sightingLocation?: string | null;
  sightingDate?: string | null;
  status: ResponseStatus;
  createdAt: string;
  updatedAt: string;
};

export function directionsForType(type: ListingType): ListingDirection[] {
  return type === "PERSON" ? ["MISSING"] : ["LOST", "FOUND"];
}

export function isPerson(type: ListingType): boolean {
  return type === "PERSON";
}

export function responseKindForDirection(d: ListingDirection): ResponseKind {
  return d === "MISSING" ? "SIGHTING" : "CLAIM";
}
