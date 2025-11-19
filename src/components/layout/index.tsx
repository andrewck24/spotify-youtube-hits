import { Header } from "@/components/layout/header";
import { SearchBar } from "@/components/layout/search-bar";
import { Outlet } from "react-router-dom";

/**
 * Layout Component
 *
 * Purpose: Main application layout (Header + Main + Mobile Bottom Search)
 *
 * Features:
 * - Responsive layout
 * - Mobile-first design
 * - Sticky Header
 * - Bottom Search Bar on Mobile
 */

export function Layout() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header />

      {/* Main Content */}
      <main className="flex-[1_1_auto] overflow-y-auto pt-16 pb-24 sm:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Search Bar */}
      <div className="fixed right-0 bottom-0 left-0 z-50 p-4 sm:hidden">
        <SearchBar className="w-full" isBottomBar />
      </div>
    </div>
  );
}
