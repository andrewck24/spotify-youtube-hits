import { LoadingFallback } from "@/components/layout/loading-fallback";
import { Card } from "@/components/ui/card";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Suspense } from "react";
import { Link } from "react-router-dom";

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
    <div className="bg-background p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-foreground mb-4 text-4xl font-bold">首頁</h1>
          <p className="text-muted-foreground text-lg">
            探索 Spotify 上的熱門歌手
          </p>
        </div>

        {/* Navigation Link to Search */}
        <div className="mb-8">
          <Link
            to="/search"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block rounded-full px-6 py-3 font-semibold transition-colors"
          >
            前往搜尋
          </Link>
        </div>

        {/* Placeholder Content */}
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-lg">
            熱門歌手推薦清單將在此顯示 (P2 實作)
          </p>
          <p className="text-muted-foreground mt-4 text-sm">
            在 P2 階段，將顯示 8 位預定義的熱門歌手卡片
          </p>
        </Card>
      </div>
    </div>
  );
}
