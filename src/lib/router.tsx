import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";

/**
 * Router Configuration for Spotify YouTube Hits
 *
 * This module defines all routes for the application using react-router-dom v7.
 * Routes are organized to support deep linking and browser history navigation.
 *
 * Route Structure:
 * - `/` - Home page with artist recommendations
 * - `/search` - Search results page (with query parameter: ?q=keyword)
 * - `/artist/:artistId` - Artist information page
 * - `/track/:trackId` - Track information page (flat structure, no artistId in URL)
 *
 * Notes:
 * - Track URL uses flat structure (/track/:trackId) because Spotify track API
 *   responses already contain complete artist information
 * - All routes are lazy-loaded for optimal code splitting
 * - Fallback UI is shown while components load (empty div for now)
 */

// Lazy load page components
const HomePage = lazy(() => import("@/pages/home-page"));
const SearchPage = lazy(() => import("@/pages/search-page"));
const ArtistPage = lazy(() => import("@/pages/artist-page"));
const TrackPage = lazy(() => import("@/pages/track-page"));

// Loading fallback component
const LoadingFallback = () => <div>Loading...</div>;

// Route definitions
const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: "/search",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SearchPage />
      </Suspense>
    ),
  },
  {
    path: "/artist/:artistId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ArtistPage />
      </Suspense>
    ),
  },
  {
    path: "/track/:trackId",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TrackPage />
      </Suspense>
    ),
  },
];

// Create and export router
export const router = createBrowserRouter(routes);

export default router;
