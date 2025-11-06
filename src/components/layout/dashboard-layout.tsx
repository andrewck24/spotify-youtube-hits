import React from 'react';

/**
 * DashboardLayout Component
 *
 * Purpose: 主應用布局（Header + Sidebar + Main）
 *
 * Features:
 * - Responsive grid layout
 * - Mobile-first design
 * - Spotify 主題
 *
 * Props:
 * - header: Header element
 * - sidebar: Sidebar element
 * - children: Main content
 *
 * Usage:
 *   <DashboardLayout header={<Header />} sidebar={<Sidebar />}>
 *     <MainContent />
 *   </DashboardLayout>
 */

interface DashboardLayoutProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardLayout({
  header,
  sidebar,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <div>{header}</div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 md:grid-cols-[400px_1fr] lg:grid-cols-[480px_1fr] gap-6 p-6 max-w-7xl">
          {/* Sidebar */}
          <div className="overflow-y-auto">{sidebar}</div>

          {/* Main Area */}
          <div className="overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
