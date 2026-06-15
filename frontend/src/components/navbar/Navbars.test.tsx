import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/renderWithProviders";
import { Navbars } from "./Navbars";

describe("Navbars", () => {
  it("affiche la marque Retrouver et les 3 menus de type", () => {
    renderWithProviders(<Navbars />);
    expect(screen.getByText("Retrouver")).toBeInTheDocument();
    expect(screen.getByText("Objets")).toBeInTheDocument();
    expect(screen.getByText("Animaux")).toBeInTheDocument();
    expect(screen.getByText("Personnes")).toBeInTheDocument();
  });
  it("ne contient plus de lien AI Search", () => {
    renderWithProviders(<Navbars />);
    expect(screen.queryByText(/AI Search/i)).toBeNull();
  });
  it("le menu Objets pointe vers /objets et /objets/signaler", async () => {
    renderWithProviders(<Navbars />);
    await userEvent.click(screen.getByText("Objets"));
    const parcourir = await screen.findByRole("link", { name: /parcourir/i });
    expect(parcourir).toHaveAttribute("href", "/objets");
    expect(
      screen.getByRole("link", { name: /objet perdu/i })
    ).toHaveAttribute("href", "/objets/signaler?direction=LOST");
  });
});
