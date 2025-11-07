import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

/**
 * Loading Fallback Component
 *
 * Purpose: 在資料載入中顯示 loading 狀態
 *
 * Features:
 * - Spinner 動畫
 * - 載入訊息
 * - Dashboard 骨架預覽（skeleten）
 *
 * Usage:
 *   import { LoadingFallback } from '@/components/layout/loading-fallback'
 *   if (dataLoading) return <LoadingFallback />
 */

export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-[#282828] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">Spotify YouTube Hits</div>
          <Skeleton className="w-64 h-10 rounded" />
        </div>
      </div>

      {/* Main content with loading state */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-6 max-w-7xl">
          {/* Sidebar skeleton */}
          <div className="space-y-6">
            {/* Artist card skeleton */}
            <div className="bg-[#282828] rounded-lg p-4 space-y-4">
              <Skeleton className="w-full h-48 rounded" />
              <div className="space-y-2">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
              </div>
            </div>

            {/* Track list skeleton */}
            <div className="bg-[#282828] rounded-lg p-4 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="w-full h-12 rounded" />
              ))}
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="space-y-6">
            {/* Track detail skeleton */}
            <div className="bg-[#282828] rounded-lg p-6 space-y-4">
              <div className="flex gap-4">
                <Skeleton className="w-32 h-32 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-full h-6" />
                  <Skeleton className="w-3/4 h-4" />
                  <Skeleton className="w-1/2 h-4" />
                </div>
              </div>
            </div>

            {/* Charts skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-64 rounded" />
              <Skeleton className="h-64 rounded" />
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center justify-center mt-12 gap-4">
          <Spinner />
          <p className="text-[#B3B3B3] animate-pulse">載入音樂資料庫...</p>
        </div>
      </div>
    </div>
  );
}
