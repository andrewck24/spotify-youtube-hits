<!--
Sync Impact Report:
Version: 1.1.0 → 1.2.0
Rationale: Documentation structure refactoring and agent script updates

Modified principles: None

Added sections: 
- Git Commit & PR Message

Removed sections: None

Templates status:
✅ agent-file-template.md - Formatting and syntax highlighting updates
✅ plan-template.md - Formatting updates
✅ tasks-template.md - Formatting updates

Renamed files:
- CLAUDE.md → docs/web-interface-guidelines.md
- docs/design-guideline*.md → docs/design-guidelines*.md

Tooling updates:
- update-agent-files.sh: Added support for multiple new agents (codebuddy, amp, shai) and fixed cursor naming
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
- **所有 import 必須使用 path alias（絕對路徑）**，例如 `@/types/spotify` 而非 `../../types/spotify`

**理由**：TypeScript 提供型別安全，減少執行時錯誤；現代化工具提升開發效率與使用者體驗；path alias 提升程式碼可讀性與重構安全性。

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

### IV. 標準化前端元件開發

- 應遵循 [Design Guidelines](../../docs/design-guidelines.md), [Web Interface Guidelines](../../docs/web-interface-guidelines.md) 的指引進行開發
- 優先使用共用 UI (以 shadcn/ui 為主) 進行元件開發
- 若功能元件內部邏輯過於複雜，應拆分元件
- 應避免自定義 UI，除非有特殊需求

**理由**：遵循設計指引確保一致的使用者體驗；使用共用 UI 提高開發效率；拆分元件有助於重構與維護。

### V. 命名與文件撰寫規則

所有檔案、文件、註解、commit message、變數命名規則：

- 所有檔案命名使用英文 (kebab-case)
- 變數與函數命名：英文（遵循程式碼慣例）
- 文件（README、spec、計畫）：必須使用繁體中文（zh-tw）
  1. 用語需注意使用台灣繁體中文用法 (e.g., "程式" 非 "程序", "元件" 非 "組件")
- 程式碼註解：盡量避免使用，極為複雜的函式可以先以具有敘述性名稱之函式進行拆解，真的需要註解時必須使用繁體中文（zh-tw）

**理由**：提升團隊溝通效率，降低理解成本；符合在地化需求。

## 開發工作流程

### 程式碼品質

- 所有 PR 必須通過 ESLint 檢查
- 執行 `npm run build` 確保無編譯錯誤
- 遵循現有程式碼風格（Emotion CSS-in-JS、函數式元件）

### 功能開發流程

1. 建立功能規格（spec.md）使用 `/speckit.specify`
2. (可選) 使用 `/speckit.clarify` 進行規格澄清
3. 產生實作計畫（plan.md）使用 `/speckit.plan`
4. (可選) 產生品質驗證清單使用 `/speckit.checklist`
5. 產生任務清單（tasks.md）使用 `/speckit.tasks`
6. (可選) 產生 Cross-artifact consistency & alignment report 使用 `/speckit.analyze`
7. 依優先順序（e.g. P1 → P2 → P3）手動實作或使用 `/speckit.implement`
8. 每個 User Story 獨立可測試與交付

### 重構原則

- 重構前必須確保現有功能正常運作
- 小步快跑：每次重構範圍有限，頻繁提交
- 重構不與新功能開發混合
- 記錄重構原因與影響範圍

### Git Commit & PR Message

- Pull request 內文：英文標題與內文 + 中文概要說明
- Git commit message：使用英文，遵循 Angular Commit Convention

```text
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: animations|bazel|benchpress|common|compiler|compiler-cli|core|
  │                          elements|forms|http|language-service|localize|platform-browser|
  │                          platform-browser-dynamic|platform-server|router|service-worker|
  │                          upgrade|zone.js|packaging|changelog|docs-infra|migrations|
  │                          components|hooks|utils|services|workers|styles|
  │                          home|search|artist|track
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

The `<type>`,`(<scope>)` and `<summary>` fields are mandatory.

Must be one of the following:

| Type         | Description                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------- |
| **build**    | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm) |
| **ci**       | Changes to our CI configuration files and scripts (examples: Github Actions, SauceLabs)             |
| **docs**     | Documentation only changes                                                                          |
| **feat**     | A new feature                                                                                       |
| **fix**      | A bug fix                                                                                           |
| **perf**     | A code change that improves performance                                                             |
| **refactor** | A code change that neither fixes a bug nor adds a feature                                           |
| **test**     | Adding missing tests or correcting existing tests                                                   |

範例：`feat(auth): add user login functionality`

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

**Version**: 1.2.0 | **Ratified**: 2025-11-20 | **Last Amended**: 2025-11-20
