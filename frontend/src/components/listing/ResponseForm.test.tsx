import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ResponseForm } from "./ResponseForm";

describe("ResponseForm", () => {
  it("CLAIM: champ signes distinctifs", () => {
    renderWithProviders(<ResponseForm kind="CLAIM" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/signes distinctifs/i)).toBeInTheDocument();
  });
  it("SIGHTING: champ lieu d'observation", () => {
    renderWithProviders(<ResponseForm kind="SIGHTING" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/lieu/i)).toBeInTheDocument();
  });
  it("soumet le message", async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ResponseForm kind="SIGHTING" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/message/i), "Vu hier");
    await userEvent.click(screen.getByRole("button", { name: /envoyer/i }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
