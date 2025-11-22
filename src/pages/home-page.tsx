import { Hero } from "@/components/home/hero";
import { PopularArtists } from "@/components/home/popular-artists";
import { PopularTracks } from "@/components/home/popular-tracks";
import { LoadingFallback } from "@/components/layout/loading-fallback";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Suspense } from "react";

/**
 * HomePage Component
 *
 * Purpose: Home page with artist recommendations (P1 implementation: placeholder, P2: actual recommendations)
 *
 * Features:
 * - Link to search page
 * - Placeholder for artist recommendations (to be implemented in P2)
 * - Dynamic page title
 *
 * Route: /
 */

export function HomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  // Set document title
  useDocumentTitle("Music Hits");

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 pb-20">
      <Hero />
      <PopularArtists className="mb-12" />
      <PopularTracks className="mb-12" />
    </div>
  );
}
