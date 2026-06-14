import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ListingForm } from "./ListingForm";

describe("ListingForm", () => {
  it("personne: affiche âge et genre, pas catégorie", () => {
    renderWithProviders(
      <ListingForm type="PERSON" direction="MISSING" onSubmit={vi.fn()} />
    );
    expect(screen.getByLabelText(/âge/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/genre/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/catégorie/i)).toBeNull();
  });
  it("animal: affiche espèce", () => {
    renderWithProviders(
      <ListingForm type="ANIMAL" direction="LOST" onSubmit={vi.fn()} />
    );
    expect(screen.getByLabelText(/espèce/i)).toBeInTheDocument();
  });
  it("soumet les champs communs", async () => {
    const onSubmit = vi.fn();
    renderWithProviders(
      <ListingForm type="OBJECT" direction="LOST" onSubmit={onSubmit} />
    );
    await userEvent.type(screen.getByLabelText(/titre/i), "Sac");
    await userEvent.type(screen.getByLabelText(/téléphone/i), "+221770000000");
    await userEvent.click(screen.getByRole("button", { name: /publier/i }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
