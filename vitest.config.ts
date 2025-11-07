import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Global describe, it, expect (no import needed)
    environment: "jsdom", // Simulate browser environment
    setupFiles: "./tests/setup.ts", // Global test setup
    coverage: {
      provider: "v8", // v8 is faster than istanbul
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "**/*.config.ts", "src/main.tsx"],
      thresholds: {
        lines: 80, // Minimum 80% line coverage
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
