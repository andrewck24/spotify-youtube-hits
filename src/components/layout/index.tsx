import { Header } from "@/components/layout/header";
import { Outlet, ScrollRestoration } from "react-router-dom";

/**
 * Layout Component
 *
 * Purpose: Main application layout (Header + Main)
 *
 * Features:
 * - Responsive layout
 * - Mobile-first design
 * - Fixed Header
 * - Scroll Restoration
 */

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollRestoration />
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
