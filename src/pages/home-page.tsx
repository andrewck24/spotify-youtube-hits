import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

/**
 * HomePage Component
 *
 * Purpose: Home page with artist recommendations (P1 implementation: placeholder, P2: actual recommendations)
 *
 * Features:
 * - Link to search page
 * - Placeholder for artist recommendations (to be implemented in P2)
 *
 * Route: /
 */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">首頁</h1>
          <p className="text-muted-foreground text-lg">
            探索 Spotify 上的熱門歌手
          </p>
        </div>

        {/* Navigation Link to Search */}
        <div className="mb-8">
          <Link
            to="/search"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
          >
            前往搜尋
          </Link>
        </div>

        {/* Placeholder Content */}
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-lg">
            熱門歌手推薦清單將在此顯示 (P2 實作)
          </p>
          <p className="text-muted-foreground text-sm mt-4">
            在 P2 階段，將顯示 8 位預定義的熱門歌手卡片
          </p>
        </Card>
      </div>
    </div>
  );
}
