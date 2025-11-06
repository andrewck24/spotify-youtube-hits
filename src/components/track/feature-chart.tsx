import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { SpotifyAudioFeatures } from '@/types/spotify';

/**
 * FeatureChart Component
 *
 * Purpose: 使用雷達圖顯示歌曲的音樂特徵
 *
 * Features:
 * - 7 個音樂特徵指標 (0-1 標準化)
 *   - Acousticness (聲學程度)
 *   - Danceability (適合跳舞)
 *   - Energy (能量)
 *   - Instrumentalness (器樂程度)
 *   - Liveness (現場感)
 *   - Speechiness (語音內容)
 *   - Valence (正向度)
 * - 使用 Spotify 綠色填充
 * - 中文標籤
 *
 * Props:
 * - features: SpotifyAudioFeatures object
 *
 * Usage:
 *   <FeatureChart features={features} />
 */

interface FeatureChartProps {
  features: SpotifyAudioFeatures | null;
}

export function FeatureChart({ features }: FeatureChartProps) {
  const chartData = useMemo(() => {
    if (!features) {
      return [];
    }

    return [
      {
        name: '聲學',
        value: features.acousticness,
        fullMark: 1,
      },
      {
        name: '舞蹈',
        value: features.danceability,
        fullMark: 1,
      },
      {
        name: '能量',
        value: features.energy,
        fullMark: 1,
      },
      {
        name: '器樂',
        value: features.instrumentalness,
        fullMark: 1,
      },
      {
        name: '現場',
        value: features.liveness,
        fullMark: 1,
      },
      {
        name: '語音',
        value: features.speechiness,
        fullMark: 1,
      },
      {
        name: '正向',
        value: features.valence,
        fullMark: 1,
      },
    ];
  }, [features]);

  if (!features) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-[#B3B3B3]">
        無法獲取音樂特徵數據
      </div>
    );
  }

  return (
    <div className="w-full bg-[#282828] rounded-lg p-6">
      <h3 className="text-white font-semibold mb-4">音樂特徵雷達圖</h3>

      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid stroke="#404040" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: '#B3B3B3', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 1]}
            tick={{ fill: '#B3B3B3', fontSize: 10 }}
          />
          <Radar
            name="特徵值"
            dataKey="value"
            stroke="#1DB954"
            fill="#1DB954"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#181818',
              border: '1px solid #404040',
              borderRadius: '4px',
            }}
            labelStyle={{ color: '#B3B3B3' }}
            formatter={(value) => {
              if (typeof value === 'number') {
                return (value * 100).toFixed(1) + '%';
              }
              return value;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* 詳細數據 */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#B3B3B3]">
        <div>
          <p>聲學程度：{(features.acousticness * 100).toFixed(1)}%</p>
          <p>適合跳舞：{(features.danceability * 100).toFixed(1)}%</p>
          <p>能量：{(features.energy * 100).toFixed(1)}%</p>
          <p>器樂程度：{(features.instrumentalness * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p>現場感：{(features.liveness * 100).toFixed(1)}%</p>
          <p>語音內容：{(features.speechiness * 100).toFixed(1)}%</p>
          <p>正向度：{(features.valence * 100).toFixed(1)}%</p>
          <p>速度：{Math.round(features.tempo)} BPM</p>
        </div>
      </div>
    </div>
  );
}
