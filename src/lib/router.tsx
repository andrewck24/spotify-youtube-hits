import { LoadingFallback } from "@/components/layout/loading-fallback";
import { tracksLoader } from "@/loaders/tracks-loader";
import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Outlet,
  type RouteObject,
} from "react-router-dom";

/**
 * Router Configuration for Spotify YouTube Hits
 *
 * This module defines all routes for the application using react-router-dom v7.
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
 * - Fallback UI is shown while components load
 */

// Lazy load page components
const HomePage = lazy(() => import("@/pages/home-page"));
const SearchPage = lazy(() => import("@/pages/search-page"));
const ArtistPage = lazy(() => import("@/pages/artist-page"));
const TrackPage = lazy(() => import("@/pages/track-page"));

// Route definitions
const routes: RouteObject[] = [
  {
    id: "root",
    path: "/",
    loader: tracksLoader, // Load tracks.json at root level
    element: <Outlet />, // Render child routes
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "search",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SearchPage />
          </Suspense>
        ),
      },
      {
        path: "artist/:artistId",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ArtistPage />
          </Suspense>
        ),
      },
      {
        path: "track/:trackId",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TrackPage />
          </Suspense>
        ),
      },
    ],
  },
];

// Create and export router
const router = createBrowserRouter(routes);

export { router };
