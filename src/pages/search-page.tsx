import { Card } from "@/components/ui/card";
import {
  createSearchIndex,
  searchArtists,
} from "@/features/search/search-service";
import type { tracksLoader } from "@/loaders/tracks-loader";
import { useMemo, useState } from "react";
import { Link, useRouteLoaderData, useSearchParams } from "react-router-dom";

/**
 * SearchPage Component
 *
 * Purpose: Search results page with artist listing
 *
 * Features:
 * - Read search query from URL (?q=keyword)
 * - Display search input with URL synchronization
 * - Show search results as unique artists
 * - Link to artist detail pages
 *
 * Route: /search?q=keyword
 */

interface UniqueArtist {
  artistName: string;
  artistId: string;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);

  // Get tracks from loader (loaded before page render)
  const { tracks: tracksDatabase } = useRouteLoaderData("root") as Awaited<
    ReturnType<typeof tracksLoader>
  >;

  // Create search index from tracks
  const fuseInstance = useMemo(() => {
    return createSearchIndex(tracksDatabase.tracks);
  }, [tracksDatabase]);

  // Perform search and get unique artists
  const searchResults = useMemo(() => {
    if (!query.trim() || !fuseInstance) {
      return [];
    }

    const results = searchArtists(fuseInstance, query);

    // Extract unique artists
    const uniqueArtists = new Map<string, UniqueArtist>();

    results.forEach((result) => {
      const key = result.item.artistId;
      if (!uniqueArtists.has(key)) {
        uniqueArtists.set(key, {
          artistName: result.item.artistName,
          artistId: result.item.artistId,
        });
      }
    });

    return Array.from(uniqueArtists.values());
  }, [query, fuseInstance]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchInput(newValue);
    setSearchParams({ q: newValue }, { replace: true });
  };

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground mb-4 text-4xl font-bold">搜尋</h1>
          <p className="text-muted-foreground">搜尋資料庫中的藝人</p>
        </div>

        {/* Search Input */}
        <div className="bg-secondary text-foreground placeholder-muted-foreground focus-within:ring-foreground flex w-full items-center gap-2 rounded-lg px-4 py-3 focus-within:ring-2">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="輸入藝人名稱..."
            className="bg-secondary text-foreground placeholder-muted-foreground flex-1 focus:outline-none"
          />
        </div>

        {/* Search Results */}
        {!query.trim() ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-lg">輸入藝人名稱以搜尋</p>
          </Card>
        ) : searchResults.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-lg">
              未找到 &quot;{query}&quot; 相關結果
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((artist) => (
              <Link
                key={artist.artistId}
                to={`/artist/${artist.artistId}`}
                className="group"
              >
                <Card className="hover:bg-secondary h-full cursor-pointer p-4 transition-colors">
                  <div className="space-y-2">
                    <h3 className="text-foreground group-hover:text-primary truncate text-lg font-semibold transition-colors">
                      {artist.artistName}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      點擊查看詳細資訊
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
