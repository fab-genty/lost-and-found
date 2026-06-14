import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Providers from "./providers/Providers.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { appRoutes } from "./routes";

const router = createBrowserRouter(appRoutes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>
);
