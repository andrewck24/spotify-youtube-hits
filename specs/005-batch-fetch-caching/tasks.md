# 任務清單：Batch Fetch & Caching

**輸入**：設計文件來自 `/specs/005-batch-fetch-caching/`
**前置文件**：plan.md、spec.md、research.md、data-model.md、contracts/

**測試**：規格文件未明確要求測試，依範本指引略過。

**組織方式**：任務依使用者故事分組，以便獨立實作與測試各個故事。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可平行執行（不同檔案、無相依性）
- **[Story]**：此任務所屬的使用者故事（如 US1、US2、US3、US4）
- 描述中包含確切檔案路徑

---

## 第一階段：設定（共用基礎設施）

**目的**：專案初始化與工具函式

- [ ] T001 [P] 在 src/lib/utils.ts 建立 chunking 工具函式
- [ ] T002 [P] 在 src/components/ui/placeholder-image.tsx 新增 placeholder 圖片元件（ArtistPlaceholder、TrackPlaceholder）

---

## 第二階段：基礎建設（阻塞前置條件）

**目的**：後端批次 API 端點，所有使用者故事都依賴這些端點

**注意**：批次 API 端點是基礎——所有前端功能都依賴於此。

- [ ] T003 在 worker/src/routes/spotify.ts 實作 GET /api/spotify/artists 批次端點（含 ID 數量驗證，>20 回傳 400）
- [ ] T004 在 worker/src/routes/spotify.ts 實作 GET /api/spotify/tracks 批次端點（含 ID 數量驗證，>20 回傳 400）

**檢查點**：後端就緒——現在可以實作 RTK Query 端點

---

## 第三階段：使用者故事 1 - 批次資料獲取（優先級：P1）MVP

**目標**：透過單一 API 請求獲取多個藝人或歌曲的詳細資料，並自動填充快取

**獨立測試**：

- 觸發一個項目列表的資料獲取
- 驗證僅發送一次網路請求至後端
- 驗證後續對該列表中個別項目的請求直接從快取取得，無新的網路請求

### 使用者故事 1 實作

- [ ] T005 [US1] 在 src/services/spotify-api.ts 新增 getSeveralArtists 端點，含 onQueryStarted 快取填充
- [ ] T006 [US1] 在 src/services/spotify-api.ts 新增 getSeveralTracks 端點，含 onQueryStarted 快取填充
- [ ] T007 [US1] 在 src/services/index.ts 匯出新 hooks（useGetSeveralArtistsQuery、useGetSeveralTracksQuery）
- [ ] T008 [US1] 在 src/services/spotify-api.ts 配置 Artist/Track 實體的永久 TTL 快取設定

**檢查點**：批次獲取基礎完成——快取命中率 >90% 可達成

---

## 第四階段：使用者故事 2 - 搜尋頁面優化（優先級：P2）

**目標**：以高效的批次資料載入方式在搜尋結果中顯示藝人和歌曲圖片

**獨立測試**：

- 執行一次搜尋，回傳多個結果
- 觀察網路流量
- 確認詳細資料是透過單一批次請求獲取，而非多個個別請求

### 使用者故事 2 實作

- [ ] T009 [P] [US2] 在 src/components/artist/skeleton.tsx 建立 ArtistSkeleton 元件（含 aria-busy、aria-label 無障礙屬性）
- [ ] T010 [P] [US2] 在 src/components/track/skeleton.tsx 建立 TrackSkeleton 元件（含 aria-busy、aria-label 無障礙屬性）
- [ ] T011 [US2] 在 src/components/search/artist-results.tsx 整合批次獲取至 ArtistSearchResults 元件
- [ ] T012 [US2] 在 src/components/search/track-results.tsx 整合批次獲取至 TrackSearchResults 元件

**檢查點**：搜尋頁面透過批次獲取顯示圖片（2 次請求取代 21+ 次）

---

## 第五階段：使用者故事 3 - 完整結果檢視的無限捲動（優先級：P2）

**目標**：透過持續捲動瀏覽所有搜尋結果，無需分頁按鈕

**獨立測試**：

- 在搜尋頁面切換到「藝人」分類（完整結果檢視）
- 捲動至底部
- 驗證下一批結果自動載入並附加到列表

### 使用者故事 3 實作

- [ ] T013 [US3] 在 src/hooks/use-infinite-scroll.ts 建立使用 IntersectionObserver 的 useInfiniteScroll hook（含防重複觸發機制）
- [ ] T014 [US3] 在 src/components/search/artist-results.tsx 為 category="artists" 檢視實作無限捲動
- [ ] T015 [US3] 在 src/components/search/track-results.tsx 為 category="tracks" 檢視實作無限捲動
- [ ] T016 [US3] 在 src/components/search/artist-results.tsx 新增「已顯示全部結果」訊息與重試按鈕 UI
- [ ] T017 [US3] 在 src/components/search/track-results.tsx 新增「已顯示全部結果」訊息與重試按鈕 UI

**檢查點**：完整結果檢視支援 100+ 項目並自動載入

---

## 第六階段：使用者故事 4 - Skeleton 載入狀態（優先級：P3）

**目標**：在資料載入時顯示平滑的佔位動畫，防止版面位移

**獨立測試**：

- 限速網路速度
- 載入搜尋頁面（任何分類檢視）
- 驗證 skeleton 區塊與最終內容的尺寸和版面相符

### 使用者故事 4 實作

- [ ] T018 [P] [US4] 在 src/components/search/artist-results.tsx 整合無限捲動的 skeleton 載入（底部載入器）
- [ ] T019 [P] [US4] 在 src/components/search/track-results.tsx 整合無限捲動的 skeleton 載入（底部載入器）

**檢查點**：載入時顯示 skeleton 載入器，CLS < 0.1

---

## 第七階段：潤飾與跨功能關注點

**目的**：UX 增強與錯誤處理改善

- [ ] T020 [P] 在 src/pages/search-page.tsx 增強空狀態 UI，加入插圖和副標題
- [ ] T021 [P] 在 src/components/search/artist-results.tsx 實作批次獲取失敗的靜默降級（placeholder 圖片）
- [ ] T022 [P] 在 src/components/search/track-results.tsx 實作批次獲取失敗的靜默降級（placeholder 圖片）
- [ ] T023 在 src/services/spotify-api.ts 新增批次 API 400 錯誤處理與日誌記錄
- [ ] T024 執行 quickstart.md 驗證並確認所有驗收情境

---

## 相依性與執行順序

### 階段相依性

- **設定（第一階段）**：無相依性——可立即開始
- **基礎建設（第二階段）**：依賴設定——阻塞所有使用者故事
- **使用者故事 1（第三階段）**：依賴基礎建設（第二階段）
- **使用者故事 2（第四階段）**：依賴使用者故事 1（需要批次端點）
- **使用者故事 3（第五階段）**：依賴使用者故事 2（擴展搜尋結果元件）
- **使用者故事 4（第六階段）**：依賴使用者故事 2（增強 skeleton 元件）
- **潤飾（第七階段）**：依賴所有使用者故事完成

### 使用者故事相依性

- **US1（批次資料獲取）**：基礎——所有其他故事都依賴此故事
- **US2（搜尋頁面優化）**：依賴 US1（使用批次端點）
- **US3（無限捲動）**：依賴 US2（擴展搜尋結果元件）
- **US4（Skeleton 載入）**：依賴 US2（增強現有 skeleton）

### 各使用者故事內部順序

- 後端路由先於前端端點
- RTK Query 端點先於元件整合
- Skeleton 元件先於載入狀態整合
- 核心實作先於潤飾功能

### 平行執行機會

- T001、T002：設定任務可平行執行
- T009、T010：Skeleton 元件可平行執行
- T018、T019：US4 Skeleton 載入任務可平行執行
- T020、T021、T022：不同檔案的潤飾任務可平行執行

---

## 平行執行範例：第一階段設定

```bash
# 同時啟動設定任務：
Task: "在 src/lib/utils.ts 建立 chunking 工具函式"
Task: "在 src/components/ui/placeholder-image.tsx 新增 placeholder 圖片元件"
```

## 平行執行範例：使用者故事 2 Skeleton 元件

```bash
# 同時啟動 skeleton 元件：
Task: "在 src/components/artist/skeleton.tsx 建立 ArtistSkeleton 元件"
Task: "在 src/components/track/skeleton.tsx 建立 TrackSkeleton 元件"
```

---

## 實作策略

### MVP 優先（使用者故事 1-2）

1. 完成第一階段：設定
2. 完成第二階段：基礎建設（後端批次端點）
3. 完成第三階段：使用者故事 1（RTK Query 批次端點）
4. 完成第四階段：使用者故事 2（搜尋頁面優化）
5. **停下來驗證**：搜尋頁面透過批次獲取顯示圖片
6. 準備好即可部署/演示

### 漸進式交付

1. 設定 + 基礎建設 + US1 -> 批次獲取基礎設施就緒
2. 新增 US2 -> 搜尋頁面已優化 -> 部署/演示（MVP！）
3. 新增 US3 -> 無限捲動 -> 部署/演示
4. 新增 US4 -> Skeleton 潤飾 -> 部署/演示
5. 潤飾階段 -> 最終增強

### 成功指標

| 指標                   | 目標             | 使用者故事 |
| ---------------------- | ---------------- | ---------- |
| 20 筆結果的 API 請求數 | 2（搜尋 + 批次） | US1、US2   |
| 快取命中率             | >90%             | US1        |
| 無限捲動項目數         | 100+             | US3        |
| CLS                    | <0.1             | US4        |

---

## 備註

- [P] 任務 = 不同檔案、無相依性
- [Story] 標籤將任務對應到特定使用者故事以便追蹤
- 批次大小限制：每次請求最多 20 個 ID（Spotify API 限制）
- 快取策略：永久 TTL（基於 session，頁面重整時清除）
- 靜默降級：失敗項目顯示 placeholder 圖片，不顯示錯誤提示
- 每個任務或邏輯群組完成後提交
