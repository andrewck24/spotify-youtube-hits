# UX Requirements Quality Checklist: Batch Fetch & Caching

**Purpose**: 驗證 UX 相關需求（Infinite Scroll、Skeleton Loading、Silent Degradation）的完整性、清晰度與一致性
**Created**: 2025-11-21
**Feature**: [spec.md](../spec.md)
**Audience**: Author 自我驗證（實作前）

---

## Infinite Scroll 需求完整性

- [x] CHK001 - FR-005 是否定義 infinite scroll 觸發時的視覺反饋？ ✅ 已補充 [Spec §UX-004]
- [ ] CHK002 - 是否定義當使用者快速連續滾動時的行為（debounce/throttle）？[Gap] → 由 UX-003 防重複機制涵蓋
- [x] CHK003 - 是否定義已載入所有資料時的「結尾狀態」UI？ ✅ 已補充 [Spec §UX-001]
- [x] CHK004 - 是否定義載入新批次失敗時的 UX（重試按鈕？自動重試？）？ ✅ 已補充 [Spec §UX-002]
- [x] CHK005 - 「300px from bottom」的觸發距離是否在不同螢幕尺寸下皆適用？ ✅ 已於 Clarifications 確認
- [x] CHK006 - 是否定義 infinite scroll 載入中時禁止重複觸發的機制？ ✅ 已補充 [Spec §UX-003]
- [ ] CHK007 - 是否定義使用者快速滾動回頂部時，是否取消進行中的請求？[Gap, Edge Case] → 暫不納入 MVP

## Skeleton Loading 需求清晰度

- [x] CHK008 - FR-007「content-specific skeleton loaders」是否定義各類型的具體尺寸規格？ ✅ 已補充 [Spec §UX-006, UX-007]（與元件尺寸一致）
- [x] CHK009 - Artist skeleton 與 Track skeleton 的佈局差異是否明確定義？ ✅ 已補充 [Spec §UX-006, UX-007]
- [x] CHK010 - Skeleton 動畫效果（pulse/shimmer/none）是否指定？ ✅ 已補充 [Spec §UX-005]
- [x] CHK011 - SC-004「visible for at least 200ms」是否定義當資料提前返回時的處理方式？ ✅ 原 SC-004 已定義「or until load」
- [x] CHK012 - Skeleton 數量是否與預期載入的項目數量一致（20 個）？ ✅ 已補充 [Spec §UX-004]
- [x] CHK013 - 是否定義 skeleton 的無障礙屬性（aria-busy, aria-label）？ ✅ 已補充 [Spec §UX-008]

## Silent Degradation 需求完整性

- [x] CHK014 - FR-009「default placeholder images」是否定義 Artist 與 Track 各自的預設圖片規格？ ✅ 已補充 [Spec §UX-010, UX-011]
- [x] CHK015 - 是否定義 placeholder image 的視覺樣式（顏色、圖示、尺寸）？ ✅ 已補充 [Spec §UX-009~UX-012]
- [x] CHK016 - 部分項目失敗時，是否定義成功項目與失敗項目的視覺區分方式？ ✅ FR-009 定義不區分（靜默使用 placeholder）
- [ ] CHK017 - FR-011「logging the error」是否定義 log 格式與監控機制？[Clarity] → MVP 可接受僅 console.error
- [x] CHK018 - 是否定義當整個 batch request 完全失敗時的 fallback UI？ ✅ 與 UX-002 (重試機制) 結合處理
- [x] CHK019 - 是否定義使用者如何得知部分資料載入失敗？ ✅ FR-009 明確定義「without showing error toasts」=靜默

## Search Page UX 需求一致性

- [x] CHK020 - US2「images are displayed」是否與 FR-009 的 silent degradation 策略一致？ ✅ 策略一致（失敗顯示 placeholder）
- [x] CHK021 - 搜尋結果為空時的 empty state UI 是否定義？ ✅ 已補充 [Spec §UX-013]
- [x] CHK022 - 搜尋進行中的 loading state 與 infinite scroll loading state 是否使用一致的視覺語言？ ✅ 均使用 skeleton（UX-004~UX-007）
- [x] CHK023 - 是否定義「Preview mode」與「Full results」的視覺差異？ ✅ 現有實作已區分（preview=橫向滾動, full=grid）
- [x] CHK024 - 「View All」按鈕的位置、樣式是否定義？ ✅ 現有實作已完成（ghost button, 標題右側）

## 互動狀態需求覆蓋度

- [x] CHK025 - 是否定義所有可點擊元素的 hover/focus/active 狀態？ ✅ 繼承 shadcn/ui 設計系統
- [x] CHK026 - 是否定義 keyboard navigation 支援？ ✅ shadcn/ui 內建支援，無需額外定義
- [x] CHK027 - 是否定義 mobile touch 互動的行為？ ✅ 標準 web 行為，無特殊需求
- [x] CHK028 - 是否定義 reduced-motion 偏好設定下的動畫處理？ ✅ shadcn/ui/Tailwind 內建 prefers-reduced-motion 支援

## 可量測性驗證

- [x] CHK029 - SC-004「CLS < 0.1」是否定義測量方法與工具？ ✅ Plan T046 指定 Lighthouse/Web Vitals
- [x] CHK030 - SC-004「at least 200ms」是否可被自動化測試驗證？ ✅ Plan T047 有驗證任務
- [x] CHK031 - 「smooth placeholder animations」是否有可量化的定義？ ✅ 已補充 [Spec §UX-005] 指定 pulse 效果
- [x] CHK032 - 「layout shift」是否定義可接受的 shift 範圍？ ✅ CLS < 0.1 已足夠明確

---

## 檢查結果摘要

**完成日期**: 2025-11-21

| 類別 | 通過 | 待處理 | 通過率 |
|------|------|--------|--------|
| Infinite Scroll | 6 | 1 | 86% |
| Skeleton Loading | 6 | 0 | 100% |
| Silent Degradation | 5 | 1 | 83% |
| Search Page UX | 5 | 0 | 100% |
| 互動狀態 | 4 | 0 | 100% |
| 可量測性 | 4 | 0 | 100% |
| **總計** | **30** | **2** | **94%** |

**待處理項目**:

- CHK007: 滾動回頂時取消請求 → 暫不納入 MVP
- CHK017: Log 格式定義 → MVP 可接受 console.error

**新增需求**: spec.md §UX-001 ~ UX-013

---

## Notes

- 此 checklist 檢驗**需求文件的品質**，而非實作是否正確
- [Gap] 標記表示需求中缺少該定義
- [Ambiguity] 標記表示需求用語模糊，需進一步釐清
- [Consistency] 標記表示跨需求的一致性問題
- ✅ 已於 2025-11-21 完成檢查並更新 spec.md
