export type ListingType = "OBJECT" | "ANIMAL" | "PERSON";
export type ListingDirection = "LOST" | "FOUND" | "MISSING";
export type ResponseKind = "CLAIM" | "SIGHTING";

export function isDirectionValidForType(
  type: ListingType,
  direction: ListingDirection
): boolean {
  if (type === "PERSON") return direction === "MISSING";
  return direction === "LOST" || direction === "FOUND";
}

export function responseKindForDirection(
  direction: ListingDirection
): ResponseKind {
  return direction === "MISSING" ? "SIGHTING" : "CLAIM";
}

export function requiredFieldsForType(type: ListingType): string[] {
  switch (type) {
    case "OBJECT":
      return ["categoryId"];
    case "ANIMAL":
      return ["species"];
    case "PERSON":
      return ["age", "gender"];
  }
}
