import { TrackItem } from "@/components/track/item";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { LocalTrackData } from "@/types/data-schema";

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
  const displayTracks = viewMode === "preview" ? tracks.slice(0, 5) : tracks;

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
      <div className="space-y-2">
        {displayTracks.map((track) => (
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
  );
}
