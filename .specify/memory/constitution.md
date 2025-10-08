<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
Rationale: Initial constitution creation with 5 core principles

Added sections:
- Core Principles (5 principles defined)
- 開發工作流程
- Governance

Modified principles: N/A (initial version)

Templates status:
✅ plan-template.md - Constitution Check section present
✅ spec-template.md - Requirements alignment verified
✅ tasks-template.md - Task categorization verified

Follow-up TODOs: None
-->

# Spotify YouTube Hits Constitution

## Core Principles

### I. TypeScript 生態系最佳實踐

本專案必須遵循 TypeScript 與 React 生態系的最佳實踐：

- 使用 TypeScript 進行型別安全開發（當前為 JavaScript，需遷移）
- 遵循 ESLint 規則，保持程式碼品質
- 採用函數式元件與 Hooks 模式
- 使用現代化工具鏈（Vite、React 19）
- 依賴項版本保持更新，避免安全漏洞

**理由**：TypeScript 提供型別安全，減少執行時錯誤；現代化工具提升開發效率與使用者體驗。

### II. MVP 優先原則（不可妥協）

所有功能開發必須遵循 MVP（最小可行產品）思維：

- 先實作核心功能，後續再擴展
- 每個功能必須可獨立交付與測試
- 避免過度設計（over-engineering）
- 拒絕 YAGNI（You Aren't Gonna Need It）的功能
- 優先解決使用者痛點，而非技術炫技

**理由**：快速驗證想法、降低開發成本、縮短上線時間。

### III. 可測試性

程式碼必須具備可測試性：

- 函數保持純粹（pure functions），避免副作用
- 關注點分離：資料獲取（hooks）、狀態管理（Recoil）、UI 展示（components）分離
- API 呼叫與商業邏輯分離，便於 mock 測試
- 元件設計遵循單一職責原則
- 測試非強制要求，但程式碼架構必須支援測試

**理由**：可測試性確保程式碼品質、重構安全性，以及長期維護性。

### IV. 靜態部署優先

在技術選型時優先考慮靜態部署方案：

- 優先使用靜態資料方案（JSON 檔案、CDN）
- 若需後端，優先考慮 BaaS（Backend as a Service）或 Serverless Functions
- 避免過早引入完整後端架構
- 保持部署簡單化（GitHub Pages、Vercel、Netlify）

**理由**：靜態部署成本低、維護簡單、效能優異；符合專案當前規模與資源限制。

### V. 命名與文件撰寫規則

所有檔案、文件、註解、commit message、變數命名規則：

- 所有檔案命名使用英文 (kebab-case)
- 變數與函數命名：英文（遵循程式碼慣例）
- 文件（README、spec、計畫）：必須使用繁體中文（zh-tw）
  1. 用語需注意使用台灣繁體中文用法 (e.g., "程式" 非 "程序", "元件" 非 "組件")
- 程式碼註解：盡量避免使用，極為複雜的函式可以先以具有敘述性名稱之函式進行拆解，真的需要註解時必須使用繁體中文（zh-tw）
- Git commit message：使用英文（遵循 Angular Commit Convention），應包含 scope 元素
  1. 範例：`feat(auth): add user login functionality`
- Pull request 內文：英文標題與內文 + 中文概要說明

**理由**：提升團隊溝通效率，降低理解成本；符合在地化需求。

## 開發工作流程

### 程式碼品質

- 所有 PR 必須通過 ESLint 檢查
- 執行 `npm run build` 確保無編譯錯誤
- 遵循現有程式碼風格（Emotion CSS-in-JS、函數式元件）

### 功能開發流程

1. 建立功能規格（spec.md）使用 `/speckit.specify`
2. 產生實作計畫（plan.md）使用 `/speckit.plan`
3. 產生任務清單（tasks.md）使用 `/speckit.tasks`
4. 依優先順序實作（P1 → P2 → P3）
5. 每個 User Story 獨立可測試與交付

### 重構原則

- 重構前必須確保現有功能正常運作
- 小步快跑：每次重構範圍有限，頻繁提交
- 重構不與新功能開發混合
- 記錄重構原因與影響範圍

## Governance

本憲章優先於所有其他開發慣例與決策。

### 修訂流程

- 憲章修訂需記錄原因與影響範圍
- 更新版本號遵循語義化版本規則：
  - **MAJOR**：移除或重新定義核心原則
  - **MINOR**：新增原則或擴展指引
  - **PATCH**：文字修正、釐清說明
- 修訂後必須同步更新相關模板檔案

### 合規檢查

- 所有 PR 必須符合憲章原則
- 功能開發前必須通過 Constitution Check（plan.md 中的檢查點）
- 複雜度例外必須記錄理由與替代方案評估

### 衝突處理

當憲章原則相互衝突時：

1. **MVP 優先原則**優先於技術完美
2. **可測試性**優先於開發速度
3. **靜態部署**在成本/規模允許下優先
4. 記錄衝突決策與權衡理由

**Version**: 1.0.0 | **Ratified**: 2025-10-08 | **Last Amended**: 2025-10-08
