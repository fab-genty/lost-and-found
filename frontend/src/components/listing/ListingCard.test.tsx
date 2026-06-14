import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ListingCard } from "./ListingCard";
import { Listing } from "../../domain/listing.types";

const base: Listing = {
  id: "1", type: "OBJECT", direction: "LOST", title: "Sac noir",
  description: "perdu au marché", country: "Sénégal", region: "Dakar",
  city: "Dakar", date: "2026-06-01", photoUrl: "", contactPhone: "+221770000000",
  userId: "u1", status: "PENDING", isResolved: false,
  createdAt: "", updatedAt: "",
};

describe("ListingCard", () => {
  it("affiche titre, lieu et lien vers le détail", () => {
    renderWithProviders(<ListingCard listing={base} />);
    expect(screen.getByText("Sac noir")).toBeInTheDocument();
    expect(screen.getByText(/Dakar/)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/objets/1");
  });
});
