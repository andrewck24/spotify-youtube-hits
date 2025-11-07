import { ArtistProfile } from "@/components/artist/artist-profile";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Header } from "@/components/layout/header";
import { LoadingFallback } from "@/components/layout/loading-fallback";
import { Sidebar } from "@/components/layout/sidebar";
import { SearchResults } from "@/components/search/search-results";
import { FeatureChart } from "@/components/track/feature-chart";
import { PopularityChart } from "@/components/track/popularity-chart";
import { TrackDetail } from "@/components/track/track-detail";
import { TrackList } from "@/components/track/track-list";
import { selectCurrentArtist } from "@/features/artist/artist-selectors";
import { selectTracks } from "@/features/data/data-selectors";
import { getTracksByArtist } from "@/features/search/search-service";
import { useArtist } from "@/hooks/use-artist";
import { useDataLoader } from "@/hooks/use-data-loader";
import { useSearch } from "@/hooks/use-search";
import { useTrack } from "@/hooks/use-track";
import { useAppSelector } from "@/lib/store";
import { useMemo } from "react";

/**
 * App Component
 *
 * Purpose: Main application component
 *
 * Features:
 * - Data loading with useDataLoader
 * - Artist selection with useArtist
 * - Track selection with useTrack
 * - Responsive layout
 * - Error boundaries
 *
 * T052: Integrate all components
 * T053: Implement state management logic
 * T054: Handle error scenarios
 */

function App() {
  // T031: Load data and initialize search engine
  const { dataLoading, error: dataError } = useDataLoader();

  // Redux state
  const currentArtist = useAppSelector(selectCurrentArtist);
  const allTracks = useAppSelector(selectTracks);

  // Search state
  const { query: searchQuery } = useSearch();

  // T050: Fetch artist details if selected
  const { artist } = useArtist(currentArtist?.id);

  // T051: Fetch track details if selected
  const artistTracks = useMemo(() => {
    if (!currentArtist || !allTracks) return [];
    return getTracksByArtist(allTracks, currentArtist.name);
  }, [currentArtist, allTracks]);

  // T053: Determine current track ID for useTrack
  const currentTrackId = useAppSelector(
    (state) => state.track.currentTrack?.id,
  );
  const { track, features, loading: trackLoading } = useTrack(currentTrackId);

  // Find the corresponding local track for YouTube data
  const localTrack = useMemo(() => {
    if (!track || !allTracks) return undefined;
    return allTracks.find((t) => t.trackId === track.id);
  }, [track, allTracks]);

  // T032: Show loading screen
  if (dataLoading) {
    return <LoadingFallback />;
  }

  // T054: Handle errors
  if (dataError) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">錯誤</h1>
          <p className="text-[#B3B3B3]">{dataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#1DB954] text-white rounded-full font-semibold hover:bg-[#1ed760]"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  // T053: Main app layout
  // 當有搜尋查詢且沒有選擇藝人時，顯示搜尋結果
  const showSearchResults = searchQuery.length > 0 && !currentArtist;

  return (
    <DashboardLayout
      header={<Header />}
      sidebar={
        <Sidebar
          artist={<ArtistProfile artist={artist || currentArtist} />}
          tracks={<TrackList tracks={artistTracks} />}
        />
      }
    >
      {/* Main Content Area */}
      <div className="space-y-6">
        {/* T054: Show search results if query is active */}
        {showSearchResults && (
          <div>
            <SearchResults />
          </div>
        )}

        {/* Track Detail Section */}
        {track && <TrackDetail track={track} loading={trackLoading} />}

        {/* Charts Section (T048-T049) */}
        {track && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popularity Chart - T048 */}
            <PopularityChart track={track} localTrack={localTrack} />

            {/* Feature Chart - T049 */}
            <FeatureChart features={features} />
          </div>
        )}

        {/* Placeholder for no track selected */}
        {!track && (
          <div className="bg-[#282828] rounded-lg p-8 text-center text-[#B3B3B3]">
            選擇一首歌曲以查看詳細資訊與圖表
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default App;
