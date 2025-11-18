import { LoadingFallback } from "@/components/layout/loading-fallback";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArtistCard } from "@/components/artist/card";
import { TrackItem } from "@/components/track/item";
import { useSearch } from "@/hooks/use-search";
import { useDocumentTitle } from "@/hooks/use-document-title";
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

  // Filter results by category
  const displayResults =
    category === "artists"
      ? { artists: results.artists, tracks: [] }
      : category === "tracks"
        ? { artists: [], tracks: results.tracks }
        : results;

  return (
    <div className="bg-background p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-foreground mb-2 text-4xl font-bold">搜尋</h1>
          <p className="text-muted-foreground">在資料庫中搜尋藝人和歌曲</p>
        </div>

        {/* Category Filters */}
        {query.trim() && (results.artists.length > 0 || results.tracks.length > 0) && (
          <div className="flex gap-2">
            <Button
              variant={category === "all" ? "default" : "outline"}
              onClick={() => setCategory("all")}
            >
              全部
            </Button>
            <Button
              variant={category === "artists" ? "default" : "outline"}
              onClick={() => setCategory("artists")}
            >
              藝人 ({results.artists.length})
            </Button>
            <Button
              variant={category === "tracks" ? "default" : "outline"}
              onClick={() => setCategory("tracks")}
            >
              歌曲 ({results.tracks.length})
            </Button>
          </div>
        )}

        {/* Search Results */}
        {!query.trim() ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-lg">
              在上方搜尋框輸入藝人或歌曲名稱以開始搜尋
            </p>
          </Card>
        ) : displayResults.artists.length === 0 &&
          displayResults.tracks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-lg">
              未找到 &quot;{query}&quot; 相關結果
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Artists Section */}
            {displayResults.artists.length > 0 && (
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  藝人
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {displayResults.artists.map((artist) => (
                    <ArtistCard
                      key={artist.artistId}
                      artistId={artist.artistId}
                      artistName={artist.artistName}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tracks Section */}
            {displayResults.tracks.length > 0 && (
              <div>
                <h2 className="text-foreground mb-4 text-2xl font-semibold">
                  歌曲
                </h2>
                <div className="space-y-2">
                  {displayResults.tracks.map((track) => (
                    <TrackItem
                      key={track.trackId}
                      trackId={track.trackId}
                      trackName={track.trackName}
                      artistName={track.artistName}
                      artistId={track.artistId}
                      releaseYear={track.releaseYear}
                      showArtistLink={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
