/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

/**
 * Vite Environment Variables Type Definitions
 *
 * Define all VITE_* environment variables used in the application
 * See: https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
 */
interface ImportMetaEnv {
  /**
   * API Base URL for Worker endpoints
   *
   * @default
   * - Development: "http://localhost:8787/api/spotify"
   * - Production: "/api/spotify"
   *
   * @example
   * // Override in .env.local:
   * VITE_API_BASE_URL=http://localhost:9000/api/spotify
   */
  readonly VITE_API_BASE_URL?: string;

  // Add more environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
