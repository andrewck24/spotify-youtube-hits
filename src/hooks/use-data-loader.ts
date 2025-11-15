import {
  selectDataError,
  selectDataLoaded,
  selectDataLoading,
} from "@/features/data/data-selectors";
import { loadLocalData } from "@/features/data/data-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { useEffect } from "react";

/**
 * Custom Hook: useDataLoader
 *
 * Purpose: 管理本地資料載入
 *
 * Features:
 * - 在 component mount 時載入資料
 * - 回傳載入狀態與錯誤訊息
 *
 * Usage:
 *   const { dataLoaded, dataLoading, error } = useDataLoader()
 *   if (dataLoading) return <LoadingFallback />
 *   if (error) return <ErrorFallback message={error} />
 *   return <Dashboard />
 */

interface UseDataLoaderReturn {
  /** 資料是否已載入 */
  dataLoaded: boolean;
  /** 正在載入中 */
  dataLoading: boolean;
  /** 載入錯誤訊息（若有） */
  error: string | null;
}

export function useDataLoader(): UseDataLoaderReturn {
  const dispatch = useAppDispatch();
  const dataLoaded = useAppSelector(selectDataLoaded);
  const dataLoading = useAppSelector(selectDataLoading);
  const error = useAppSelector(selectDataError);

  useEffect(() => {
    // 若已載入，不重複載入
    if (dataLoaded) {
      return;
    }

    // 開始載入資料
    dispatch(loadLocalData());
  }, [dataLoaded, dispatch]);

  return {
    dataLoaded,
    dataLoading,
    error,
  };
}
