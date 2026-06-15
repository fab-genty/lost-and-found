import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ListingDetailView } from "./ListingDetail";
import type { Listing } from "../../domain/listing.types";

const listing: Listing = {
  id: "9", type: "PERSON", direction: "MISSING", title: "Awa Diop",
  description: "disparue", country: "Sénégal", region: "Thiès", city: "Thiès",
  date: "2026-05-01", photoUrl: "", contactPhone: "+221770000000",
  age: 12, gender: "F", userId: "u", status: "PENDING", isResolved: false,
  createdAt: "", updatedAt: "",
};

describe("ListingDetailView", () => {
  it("personne => bouton 'Je l'ai vu' et contact masqué hors connexion", () => {
    renderWithProviders(
      <ListingDetailView listing={listing} isAuthenticated={false} />
    );
    expect(screen.getByText("Awa Diop")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /je l'ai vu/i })).toBeInTheDocument();
    expect(screen.queryByText("+221770000000")).toBeNull();
  });
});
