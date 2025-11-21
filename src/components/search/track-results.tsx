import { useCallback, useState } from "react";
import { TrackItem } from "@/components/track/item";
import { TrackSkeleton } from "@/components/track/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { chunk } from "@/lib/utils";
import { useGetSeveralTracksQuery } from "@/services";
import type { LocalTrackData } from "@/types/data-schema";

const BATCH_SIZE = 20;
const PREVIEW_COUNT = 5;

interface TrackSearchResultsProps {
  tracks: LocalTrackData[];
  viewMode: "preview" | "full";
  onViewAll?: () => void;
  query: string;
}

export function TrackSearchResults({
  tracks,
  viewMode,
  onViewAll,
  query,
}: TrackSearchResultsProps) {
  // Pagination state for infinite scroll (full mode only)
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);

  // Get track IDs for batch fetch
  const displayTracks =
    viewMode === "preview"
      ? tracks.slice(0, PREVIEW_COUNT)
      : tracks.slice(0, displayCount);
  const trackIds = displayTracks.map((t) => t.trackId);

  // Split into batches for API calls (max 20 per request)
  const batches = chunk(trackIds, BATCH_SIZE);
  const currentBatchIds = batches[batches.length - 1] ?? [];

  // Batch fetch track data for current batch (skip if no tracks)
  const { data: batchedTracks, isLoading, isFetching } = useGetSeveralTracksQuery(
    currentBatchIds,
    { skip: currentBatchIds.length === 0 },
  );

  // Create a map for quick lookup of batched track data
  const trackDataMap = new Map(
    batchedTracks?.map((track) => [track.id, track]) ?? [],
  );

  // Infinite scroll
  const hasMore = viewMode === "full" && displayCount < tracks.length;
  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setDisplayCount((prev) => Math.min(prev + BATCH_SIZE, tracks.length));
    }
  }, [isFetching, hasMore, tracks.length]);

  const sentinelRef = useInfiniteScroll(loadMore);

  if (tracks.length === 0) {
    if (viewMode === "full") {
      return (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-lg">
            未找到 &quot;{query}&quot; 相關歌曲
          </p>
        </Card>
      );
    }
    return null;
  }

  const showViewAll = viewMode === "preview" && tracks.length > 5;

  // Render skeleton loading state
  const renderSkeletons = (count: number) =>
    Array.from({ length: count }).map((_, index) => (
      <TrackSkeleton key={`skeleton-${index}`} />
    ));

  // Render track items with batched data
  const renderTrackItems = (trackList: LocalTrackData[]) =>
    trackList.map((track) => {
      const batchedData = trackDataMap.get(track.trackId);
      return (
        <TrackItem
          key={track.trackId}
          trackId={track.trackId}
          trackName={batchedData?.name ?? track.trackName}
          artistName={batchedData?.artists[0]?.name ?? track.artistName}
          artistId={batchedData?.artists[0]?.id ?? track.artistId}
          releaseYear={track.releaseYear}
          imageUrl={batchedData?.album?.images[0]?.url}
          showArtistLink={true}
        />
      );
    });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-2xl font-semibold">歌曲</h2>
        {showViewAll && onViewAll && (
          <Button variant="ghost" onClick={onViewAll}>
            查看全部歌曲
          </Button>
        )}
      </div>

      {viewMode === "preview" ? (
        <div className="space-y-2">
          {isLoading
            ? renderSkeletons(displayTracks.length)
            : renderTrackItems(displayTracks)}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {renderTrackItems(displayTracks)}
            {isFetching && renderSkeletons(BATCH_SIZE)}
          </div>

          {/* Infinite scroll sentinel */}
          {hasMore && <div ref={sentinelRef} className="h-4" />}

          {/* All results shown message */}
          {!hasMore && displayTracks.length > 0 && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              已顯示全部 {tracks.length} 首歌曲
            </p>
          )}
        </>
      )}
    </div>
  );
}
