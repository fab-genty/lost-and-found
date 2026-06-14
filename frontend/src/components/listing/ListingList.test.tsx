import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ListingListView } from "./ListingList";
import { Listing } from "../../domain/listing.types";

const items: Listing[] = [
  { id: "1", type: "ANIMAL", direction: "LOST", title: "Chien Rex", description: "",
    country: "Mali", region: "Bamako", city: "Bamako", date: "2026-06-01",
    photoUrl: "", contactPhone: "x", userId: "u", status: "PENDING",
    isResolved: false, createdAt: "", updatedAt: "" },
];

describe("ListingListView", () => {
  it("affiche les cartes et un état vide", () => {
    const { rerender } = renderWithProviders(
      <ListingListView items={items} isLoading={false} />
    );
    expect(screen.getByText("Chien Rex")).toBeInTheDocument();
    rerender(<ListingListView items={[]} isLoading={false} />);
    expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument();
  });
});
