import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ContactBlock } from "./ContactBlock";

describe("ContactBlock", () => {
  it("non connecté: masque le numéro et invite à se connecter", () => {
    renderWithProviders(
      <ContactBlock phone="+221770000000" isAuthenticated={false} />
    );
    expect(screen.queryByText("+221770000000")).toBeNull();
    expect(screen.getByText(/connect/i)).toBeInTheDocument();
  });
  it("connecté: affiche le numéro et un lien WhatsApp", () => {
    renderWithProviders(
      <ContactBlock phone="+221770000000" whatsapp="221770000000" isAuthenticated />
    );
    expect(screen.getByText("+221770000000")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /whatsapp/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("wa.me/221770000000"));
  });
});
