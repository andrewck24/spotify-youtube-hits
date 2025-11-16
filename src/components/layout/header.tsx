import Spotify from "@/components/icons/spotify.svg?react";
import { Link } from "react-router-dom";

/**
 * Header Component
 *
 * Purpose: 應用頂部欄（Logo + Navigation）
 *
 * Features:
 * - Application branding
 * - Navigation links
 * - Spotify 主題
 *
 * Usage:
 *   <Header />
 */

export function Header() {
  return (
    <header className="border-border bg-background w-full border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Home Link */}
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Spotify className="size-8" />
            <h1 className="text-foreground text-xl font-bold max-lg:hidden">
              Spotify YouTube Hits
            </h1>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="text-foreground hover:text-primary text-sm font-medium transition-colors"
            >
              首頁
            </Link>
            <Link
              to="/search"
              className="text-foreground hover:text-primary text-sm font-medium transition-colors"
            >
              搜尋
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
