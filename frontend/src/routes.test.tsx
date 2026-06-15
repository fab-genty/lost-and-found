import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { makeStore } from "./test/renderWithProviders";
import { appRoutes } from "./routes";

describe("routes", () => {
  it("/objets rend la page objets (filtre Pays présent)", async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/objets"] });
    render(
      <Provider store={makeStore()}>
        <RouterProvider router={router} />
      </Provider>
    );
    expect(await screen.findByPlaceholderText(/Pays/i)).toBeInTheDocument();
  });
});
