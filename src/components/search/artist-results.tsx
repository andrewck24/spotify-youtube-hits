import { useCallback, useState } from "react";
import { ArtistCard } from "@/components/artist/card";
import { ArtistSkeleton } from "@/components/artist/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollableRow } from "@/components/ui/scrollable-row";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type { UniqueArtist } from "@/hooks/use-search";
import { chunk } from "@/lib/utils";
import { useGetSeveralArtistsQuery } from "@/services";

const BATCH_SIZE = 20;
const PREVIEW_COUNT = 8;

interface ArtistSearchResultsProps {
  artists: UniqueArtist[];
  viewMode: "preview" | "full";
  onViewAll?: () => void;
  query: string;
}

export function ArtistSearchResults({
  artists,
  viewMode,
  onViewAll,
  query,
}: ArtistSearchResultsProps) {
  // Pagination state for infinite scroll (full mode only)
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);

  // Get artist IDs for batch fetch
  const displayArtists =
    viewMode === "preview"
      ? artists.slice(0, PREVIEW_COUNT)
      : artists.slice(0, displayCount);
  const artistIds = displayArtists.map((a) => a.artistId);

  // Split into batches for API calls (max 20 per request)
  const batches = chunk(artistIds, BATCH_SIZE);
  const currentBatchIds = batches[batches.length - 1] ?? [];

  // Batch fetch artist data for current batch (skip if no artists)
  const { data: batchedArtists, isLoading, isFetching } = useGetSeveralArtistsQuery(
    currentBatchIds,
    { skip: currentBatchIds.length === 0 },
  );

  // Create a map for quick lookup of batched artist data
  const artistDataMap = new Map(
    batchedArtists?.map((artist) => [artist.id, artist]) ?? [],
  );

  // Infinite scroll
  const hasMore = viewMode === "full" && displayCount < artists.length;
  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setDisplayCount((prev) => Math.min(prev + BATCH_SIZE, artists.length));
    }
  }, [isFetching, hasMore, artists.length]);

  const sentinelRef = useInfiniteScroll(loadMore);

  if (artists.length === 0) {
    if (viewMode === "full") {
      return (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-lg">
            未找到 &quot;{query}&quot; 相關藝人
          </p>
        </Card>
      );
    }
    return null;
  }

  const showViewAll = viewMode === "preview" && artists.length > 4;

  // Render skeleton loading state
  const renderSkeletons = (count: number, className?: string) =>
    Array.from({ length: count }).map((_, index) => (
      <ArtistSkeleton key={`skeleton-${index}`} className={className} />
    ));

  // Render artist cards with batched data
  const renderArtistCards = (artistList: UniqueArtist[], className?: string) =>
    artistList.map((artist) => {
      const batchedData = artistDataMap.get(artist.artistId);
      return (
        <ArtistCard
          key={artist.artistId}
          artistId={artist.artistId}
          artistName={batchedData?.name ?? artist.artistName}
          imageUrl={batchedData?.images[0]?.url}
          className={className}
        />
      );
    });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-2xl font-semibold">藝人</h2>
        {showViewAll && onViewAll && (
          <Button variant="ghost" onClick={onViewAll}>
            查看全部藝人
          </Button>
        )}
      </div>

      {viewMode === "preview" ? (
        <ScrollableRow>
          {isLoading
            ? renderSkeletons(
                displayArtists.length,
                "shrink-0 basis-[12rem] snap-start",
              )
            : renderArtistCards(displayArtists, "shrink-0 basis-[12rem] snap-start")}
        </ScrollableRow>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {renderArtistCards(displayArtists)}
            {isFetching && renderSkeletons(BATCH_SIZE)}
          </div>

          {/* Infinite scroll sentinel */}
          {hasMore && <div ref={sentinelRef} className="h-4" />}

          {/* All results shown message */}
          {!hasMore && displayArtists.length > 0 && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              已顯示全部 {artists.length} 位藝人
            </p>
          )}
        </>
      )}
    </div>
  );
}
