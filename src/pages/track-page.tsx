import { LoadingFallback } from "@/components/layout/loading-fallback";
import { TrackDetail } from "@/components/track/track-detail";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useGetAudioFeaturesQuery, useGetTrackQuery } from "@/services";
import { Suspense } from "react";
import { Link, useParams } from "react-router-dom";

/**
 * TrackPage Component
 *
 * Purpose: Display track information and audio features
 *
 * Features:
 * - Load track data and audio features from RTK Query
 * - Display track details with TrackDetail component
 * - Show artist link
 * - Dynamic page title
 * - Support browser back/forward navigation
 *
 * Route: /track/:trackId (flat structure, no artistId in URL)
 */

export function TrackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TrackPageContent />
    </Suspense>
  );
}
function TrackPageContent() {
  const { trackId } = useParams<{ trackId: string }>();

  // Get track data from Spotify API
  const {
    data: track,
    isLoading: trackLoading,
    error: trackError,
  } = useGetTrackQuery(trackId || "", { skip: !trackId });

  // Get audio features
  const { data: audioFeatures } = useGetAudioFeaturesQuery(trackId || "", {
    skip: !trackId,
  });

  // Set document title
  useDocumentTitle(track ? `${track.name} | Music Hits` : "Music Hits");

  if (!trackId) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-lg">找不到歌曲ID</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20">
      {/* Track Info Section */}
      <div className="mb-8">
        {trackLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : trackError ? (
          <Card className="p-8 text-center">
            <p className="text-destructive mb-4 text-lg">無法載入歌曲資訊</p>
            <p className="text-muted-foreground text-sm">
              {trackError &&
              typeof trackError === "object" &&
              "message" in trackError
                ? (trackError.message as string)
                : String(trackError)}
            </p>
          </Card>
        ) : (
          <TrackDetail track={track} audioFeatures={audioFeatures} />
        )}
      </div>

      {/* Artist Info Section */}
      {track && track.artists && track.artists.length > 0 && (
        <div className="border-border mt-8 border-t pt-8">
          <h2 className="text-foreground mb-4 text-2xl font-bold">藝人資訊</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {track.artists.map((artist) => (
              <Link
                key={artist.id}
                to={`/artist/${artist.id}`}
                className="group"
              >
                <Card className="hover:bg-secondary h-full cursor-pointer p-6 transition-colors">
                  <h3 className="text-foreground group-hover:text-primary text-lg font-semibold transition-colors">
                    {artist.name}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    點擊查看藝人詳細資訊
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
