import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SpotifyTrack } from '@/types/spotify';
import type { LocalTrackData } from '@/types/data-schema';
import { formatNumber } from '@/lib/formatters';

/**
 * PopularityChart Component
 *
 * Purpose: 顯示歌曲在各平台的人氣度對比圖表
 *
 * Features:
 * - Spotify 人氣度 (0-100)
 * - YouTube 觀看次數 (log scale)
 * - YouTube 按讚數 (log scale)
 * - YouTube 留言數 (log scale)
 * - 使用 Spotify 綠色主題配色
 *
 * Props:
 * - track: SpotifyTrack object
 * - localTrack: LocalTrackData object (包含 YouTube 數據)
 *
 * Usage:
 *   <PopularityChart track={track} localTrack={localTrack} />
 */

interface PopularityChartProps {
  track: SpotifyTrack;
  localTrack?: LocalTrackData;
}

export function PopularityChart({ track, localTrack }: PopularityChartProps) {
  const chartData = useMemo(() => {
    if (!localTrack) {
      return [];
    }

    const spotifyPopularity = track.popularity || 0;
    const youtubeViews = localTrack.popularity.youtubeViews;
    const youtubeLikes = localTrack.popularity.youtubeLikes;
    const youtubeComments = localTrack.popularity.youtubeComments;

    // 使用 log scale 來顯示數據（因為 YouTube 數據通常相對較大）
    // log10(x + 1) 以避免 log(0) 的問題
    const logViews = Math.log10(youtubeViews + 1);
    const logLikes = Math.log10(youtubeLikes + 1);
    const logComments = Math.log10(youtubeComments + 1);

    return [
      {
        platform: 'Spotify',
        popularity: spotifyPopularity,
        views: null,
      },
      {
        platform: 'YouTube Views',
        popularity: null,
        views: logViews,
      },
      {
        platform: 'YouTube Likes',
        popularity: null,
        views: logLikes,
      },
      {
        platform: 'YouTube Comments',
        popularity: null,
        views: logComments,
      },
    ];
  }, [track, localTrack]);

  if (!localTrack) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-[#B3B3B3]">
        無法獲取 YouTube 數據
      </div>
    );
  }

  return (
    <div className="w-full bg-[#282828] rounded-lg p-6">
      <h3 className="text-white font-semibold mb-4">人氣度對比</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis
            dataKey="platform"
            tick={{ fill: '#B3B3B3', fontSize: 12 }}
            axisLine={{ stroke: '#404040' }}
          />
          <YAxis
            tick={{ fill: '#B3B3B3', fontSize: 12 }}
            axisLine={{ stroke: '#404040' }}
            label={{
              value: 'Score (Spotify: 0-100, YouTube: log₁₀)',
              angle: -90,
              position: 'insideLeft',
              fill: '#B3B3B3',
              style: { fontSize: 12 },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#181818',
              border: '1px solid #404040',
              borderRadius: '4px',
            }}
            labelStyle={{ color: '#B3B3B3' }}
            formatter={(value) => {
              if (value === null) return 'N/A';
              if (typeof value === 'number') {
                return value.toFixed(2);
              }
              return value;
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              color: '#B3B3B3',
              fontSize: '12px',
            }}
            iconType="square"
          />
          {/* Spotify Popularity Bar */}
          <Bar dataKey="popularity" fill="#1DB954" name="Spotify 人氣度" />
          {/* YouTube Metrics Bars */}
          <Bar dataKey="views" fill="#FF0000" name="YouTube (log scale)" />
        </BarChart>
      </ResponsiveContainer>

      {/* 數據說明 */}
      <div className="mt-4 text-xs text-[#B3B3B3] space-y-1">
        <p>• Spotify 人氣度：0-100 刻度</p>
        <p>• YouTube 數據：使用 log₁₀ 縮放（方便比較數量級）</p>
        <p>
          • YouTube 觀看：{formatNumber(localTrack.popularity.youtubeViews)} 次
        </p>
        <p>
          • YouTube 按讚：{formatNumber(localTrack.popularity.youtubeLikes)} 次
        </p>
        <p>
          • YouTube 留言：{formatNumber(localTrack.popularity.youtubeComments)} 則
        </p>
      </div>
    </div>
  );
}
