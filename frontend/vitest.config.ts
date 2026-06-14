/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        // flowbite-react imports tailwindcss/version.js which doesn't exist in v3
        find: /^tailwindcss\/version\.js$/,
        replacement: resolve(
          __dirname,
          "src/test/__mocks__/tailwindcss-version.ts"
        ),
      },
    ],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
