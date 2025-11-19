import { LoadingFallback } from "@/components/layout/loading-fallback";
import { SearchBar } from "@/components/layout/search-bar";
import { ArtistSearchResults } from "@/components/search/artist-results";
import { SearchCategoryTabs } from "@/components/search/category-tabs";
import { TrackSearchResults } from "@/components/search/track-results";
import { Card } from "@/components/ui/card";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useSearch } from "@/hooks/use-search";
import type { tracksLoader } from "@/loaders/tracks-loader";
import { Suspense, useState } from "react";
import { useRouteLoaderData, useSearchParams } from "react-router-dom";

/**
 * SearchPage Component
 *
 * Purpose: 搜尋結果頁（藝人 + 歌曲）
 *
 * Features:
 * - 從 URL 讀取搜尋查詢 (?q=keyword)
 * - 使用 useSearch hook（一次搜尋，過濾顯示）
 * - 分類篩選（全部 / 藝人 / 歌曲）
 * - 使用 ArtistCard 和 TrackItem 元件渲染結果
 * - 動態頁面 title
 *
 * Route: /search?q=keyword
 */

type Category = "all" | "artists" | "tracks";

export function SearchPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [category, setCategory] = useState<Category>("all");

  // Set document title
  useDocumentTitle("搜尋 | Music Hits");

  // Get tracks from loader (loaded before page render)
  const { tracks: tracksDatabase } = useRouteLoaderData("root") as Awaited<
    ReturnType<typeof tracksLoader>
  >;

  // Use search hook (single search, filter display)
  const results = useSearch(tracksDatabase.tracks, query);

  // Helper to switch category
  const handleViewAllArtists = () => setCategory("artists");
  const handleViewAllTracks = () => setCategory("tracks");

  const showArtists = category === "all" || category === "artists";
  const showTracks = category === "all" || category === "tracks";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pt-20 pb-4">
      {/* SearchBar (visible on mobile devices) */}
      <div className="fixed top-18 right-0 left-0 z-40 px-6 py-2 sm:hidden">
        <SearchBar />
      </div>

      {/* Category Filters */}
      {query.trim() && (
        <SearchCategoryTabs
          category={category}
          setCategory={setCategory}
          artistCount={results.artists.length}
          trackCount={results.tracks.length}
        />
      )}

      {/* Search Results */}
      {!query.trim() ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-lg">
            在上方搜尋框輸入藝人或歌曲名稱以開始搜尋
          </p>
        </Card>
      ) : results.artists.length === 0 && results.tracks.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-lg">
            未找到 &quot;{query}&quot; 相關結果
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Artists Section */}
          {showArtists && (
            <ArtistSearchResults
              artists={results.artists}
              viewMode={category === "artists" ? "full" : "preview"}
              onViewAll={handleViewAllArtists}
              query={query}
            />
          )}

          {/* Tracks Section */}
          {showTracks && (
            <TrackSearchResults
              tracks={results.tracks}
              viewMode={category === "tracks" ? "full" : "preview"}
              onViewAll={handleViewAllTracks}
              query={query}
            />
          )}
        </div>
      )}
    </div>
  );
}
