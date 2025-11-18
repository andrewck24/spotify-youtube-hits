import { tracksLoader } from "@/loaders/tracks-loader";
import type { RouteObject } from "react-router-dom";

/**
 * Router Configuration for Spotify YouTube Hits
 *
 * This module defines all routes for the application using react-router v7.
 * Routes are organized to support deep linking and browser history navigation.
 *
 * Route Structure:
 * - Root loader: Loads tracks.json before any page renders (shared across all routes)
 * - `/` - Home page with artist recommendations
 * - `/search` - Search results page (with query parameter: ?q=keyword)
 * - `/artist/:artistId` - Artist information page
 * - `/track/:trackId` - Track information page (flat structure, no artistId in URL)
 *
 * Data Loading:
 * - tracks.json is loaded at root level via tracksLoader
 * - All child routes can access loader data via useRouteLoaderData("root")
 * - sessionStorage caching ensures single load per session
 *
 * Notes:
 * - Track URL uses flat structure (/track/:trackId) because Spotify track API
 *   responses already contain complete artist information
 * - All routes are lazy-loaded for optimal code splitting
 * - Each page component can define its own Suspense fallback for customization
 */

// Route definitions
export const routes: RouteObject[] = [
  {
    id: "root",
    path: "/",
    loader: tracksLoader, // Load tracks.json at root level
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import("@/pages/home-page");
          return { Component: HomePage };
        },
      },
      {
        path: "search",
        lazy: async () => {
          const { SearchPage } = await import("@/pages/search-page");
          return { Component: SearchPage };
        },
      },
      {
        path: "artist/:artistId",
        lazy: async () => {
          const { ArtistPage } = await import("@/pages/artist-page");
          return { Component: ArtistPage };
        },
      },
      {
        path: "track/:trackId",
        lazy: async () => {
          const { TrackPage } = await import("@/pages/track-page");
          return { Component: TrackPage };
        },
      },
    ],
  },
];
