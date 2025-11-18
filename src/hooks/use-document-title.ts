import { useEffect } from "react";

/**
 * useDocumentTitle Hook
 *
 * Purpose: 動態設定頁面 <title>，提升使用者體驗與 SEO
 *
 * Features:
 * - 進入頁面時設定 title
 * - 離開頁面時還原 title
 * - 響應式更新（title 變更時重新設定）
 *
 * @param title - 頁面 title 字串
 *
 * Usage:
 *   useDocumentTitle('Music Hits');
 *   useDocumentTitle(`${artist.name} | Music Hits`);
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    return () => {
      document.title = prevTitle; // 清理函數：還原先前的 title
    };
  }, [title]);
}
