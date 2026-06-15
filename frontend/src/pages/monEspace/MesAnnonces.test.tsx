import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { MesAnnoncesView } from "./MesAnnonces";

describe("MesAnnoncesView", () => {
  it("liste vide => message", () => {
    renderWithProviders(<MesAnnoncesView items={[]} isLoading={false} />);
    expect(screen.getByText(/aucune annonce/i)).toBeInTheDocument();
  });
});
