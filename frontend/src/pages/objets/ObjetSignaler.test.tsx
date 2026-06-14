import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ObjetSignaler } from "./ObjetSignaler";

describe("ObjetSignaler", () => {
  it("direction=found via l'URL => libellé objet trouvé", () => {
    renderWithProviders(<ObjetSignaler />, {
      route: "/objets/signaler?direction=FOUND",
    });
    expect(screen.getByRole("heading", { name: /objet trouvé/i })).toBeInTheDocument();
  });
});
