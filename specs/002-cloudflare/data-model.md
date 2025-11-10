# Data Model: 全球內容分發優化

**Feature**: 002-cloudflare
**Date**: 2025-11-09
**Phase**: 1 (Design & Contracts)

## Overview

本文件定義 Cloudflare Workers API 端點的資料模型、請求/回應格式、錯誤處理機制。由於本次遷移專注於基礎架構，不新增業務實體，此文件主要描述 API 代理層的資料結構。

---

## Core Entities

### 1. Spotify Access Token

**Description**: Spotify API 存取憑證，由 Worker 代理取得並快取。

**Schema**:

```typescript
interface SpotifyAccessToken {
  access_token: string; // Spotify API bearer token
  token_type: "Bearer"; // 固定值
  expires_in: number; // 過期時間（秒），通常為 3600
  issued_at: number; // 發行時間戳（毫秒）
}
```

**Lifecycle**:

1. Client 請求 `/api/spotify/token`
2. Worker 檢查快取（若存在且未過期則返回）
3. 若快取失效，Worker 使用 Client ID/Secret 向 Spotify 請求新 token
4. Worker 快取 token（in-memory, 55 分鐘）並返回給 Client

**Storage**:

- **Runtime**: Worker in-memory cache（每個 Worker isolate 獨立）
- **Persistence**: None（token 不需持久化，過期後重新取得）

**Security**:

- ✅ Client Secret 永不暴露於前端
- ✅ Token 透過 HTTPS 傳輸
- ✅ Token 有效期短（1 小時），降低安全風險

---

### 2. Spotify Track

**Description**: Spotify 歌曲詳細資訊，由 Worker 代理從 Spotify API 取得。

**Schema** (符合 Spotify Web API):

```typescript
interface SpotifyTrack {
  id: string; // Spotify track ID
  name: string; // 歌曲名稱
  artists: Array<{
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    release_date: string; // YYYY-MM-DD
  };
  duration_ms: number; // 歌曲長度（毫秒）
  external_urls: {
    spotify: string; // Spotify 歌曲連結
  };
  preview_url: string | null; // 試聽 URL（30 秒片段）
  popularity: number; // 0-100
}
```

**Source**: Spotify Web API `/v1/tracks/{id}` endpoint

**Validation Rules**:

- `id`: 必須符合 Spotify Track ID 格式（22 字元 base62）
- `duration_ms`: 必須 > 0
- `popularity`: 範圍 0-100

---

### 3. Error Response

**Description**: API 錯誤回應的標準格式。

**Schema**:

```typescript
interface APIError {
  error: {
    code: string; // 錯誤代碼（INTERNAL_ERROR, SPOTIFY_API_ERROR, etc.）
    message: string; // 使用者可讀的錯誤訊息
    details?: unknown; // 可選的額外錯誤細節（僅 development 環境）
  };
  timestamp: number; // 錯誤發生時間戳（毫秒）
  request_id?: string; // 可選的請求追蹤 ID
}
```

**Error Codes**:

| Code                  | HTTP Status | Description          | Example                   |
| --------------------- | ----------- | -------------------- | ------------------------- |
| `MISSING_ENV_VARS`    | 500         | 缺少必要的環境變數   | Client ID/Secret 未設定   |
| `SPOTIFY_AUTH_FAILED` | 502         | Spotify 認證失敗     | Client ID/Secret 錯誤     |
| `SPOTIFY_API_ERROR`   | 502         | Spotify API 請求失敗 | Spotify 服務異常          |
| `RATE_LIMITED`        | 429         | 請求速率超過限制     | Spotify API rate limit    |
| `INVALID_TRACK_ID`    | 400         | Track ID 格式錯誤    | ID 長度不符或包含非法字元 |
| `TRACK_NOT_FOUND`     | 404         | 找不到指定歌曲       | Spotify API 返回 404      |
| `INTERNAL_ERROR`      | 500         | Worker 內部錯誤      | 未預期的例外              |

---

## API Endpoints Data Flow

### Endpoint 1: Token Exchange

**Route**: `POST /api/spotify/token`

**Request**:

```typescript
// No request body required
```

**Response** (Success - 200):

```typescript
{
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
}
```

**Response** (Error - 502):

```typescript
{
  error: {
    code: "SPOTIFY_AUTH_FAILED",
    message: "Failed to authenticate with Spotify API"
  },
  timestamp: 1699876543210
}
```

**Data Flow**:

```plaintext
Client → Worker → Spotify
  ↓        ↓        ↓
POST    Check    POST /api/token
/api/   Cache    (with Client Secret)
token     ↓        ↓
          ↓     access_token
          ↓        ↓
       Return   (cached)
      to Client
```

**Caching Strategy**:

- **Cache Key**: `spotify_access_token`
- **TTL**: 55 minutes（token 有效期 60 分鐘，提前 5 分鐘更新）
- **Storage**: Worker in-memory (global variable)

---

### Endpoint 2: Get Track Details

**Route**: `GET /api/spotify/tracks/:id`

**Request**:

```typescript
// Path parameter
id: string; // Spotify track ID (e.g., "0d28khcov6AiegSCpG5TuT")
```

**Response** (Success - 200):

```typescript
SpotifyTrack; // 見上方 Spotify Track schema
```

**Response** (Error - 404):

```typescript
{
  error: {
    code: "TRACK_NOT_FOUND",
    message: "Track not found on Spotify"
  },
  timestamp: 1699876543210
}
```

**Data Flow**:

```plaintext
Client → Worker → Spotify
  ↓        ↓        ↓
GET     Get      GET /v1/tracks/:id
/api/   Token    (with Bearer token)
tracks/   ↓        ↓
:id       ↓     Track Data
          ↓        ↓
       Transform
       Response
          ↓
      Return
    to Client
```

**Validation**:

1. Check `:id` format（22 字元 base62）
2. 若格式錯誤 → 返回 400 `INVALID_TRACK_ID`
3. 若格式正確 → 轉發請求至 Spotify

---

## State Transitions

### Token Lifecycle

```plaintext
[No Token]
    ↓
   Request Token from Spotify
    ↓
[Cached Token] ← (expires in 55 min)
    ↓
   (55 min elapsed)
    ↓
[Expired] → Re-request Token
    ↓
[Cached Token]
```

**States**:

1. **No Token**: 初始狀態，或 Worker 重啟後
2. **Cached Token**: Token 有效且未過期
3. **Expired**: Token 過期，需重新取得

**Trigger Events**:

- Client 請求 → 檢查 cache
- 55 分鐘過期 → 自動重新取得

---

## Data Validation Rules

### Input Validation

| Field    | Rule                       | Error Code         |
| -------- | -------------------------- | ------------------ |
| Track ID | 必須為 22 字元 base62 字串 | `INVALID_TRACK_ID` |
| Track ID | 不可包含空白或特殊字元     | `INVALID_TRACK_ID` |

**Validation Implementation**:

```typescript
function isValidSpotifyTrackId(id: string): boolean {
  return /^[a-zA-Z0-9]{22}$/.test(id);
}
```

### Output Sanitization

- ✅ 所有 Spotify API 回應直接轉發，不修改
- ✅ 錯誤訊息不暴露敏感資訊（Client Secret, internal stack traces）
- ✅ Development 環境可選擇性包含 `details` 欄位用於除錯

---

## Performance Considerations

### Caching Strategy

| Resource             | Cache Location   | TTL    | Rationale                                               |
| -------------------- | ---------------- | ------ | ------------------------------------------------------- |
| Spotify Access Token | Worker in-memory | 55 min | Token 有效期 60 分鐘，提前更新避免過期                  |
| Track Data           | None             | -      | Track 資料可能更新（popularity 等），不快取避免過期資料 |
| Static Assets        | Cloudflare CDN   | Auto   | 由 Workers Assets 自動處理                              |

### Optimization

1. **Token Reuse**: Worker 內所有請求共享同一 access token，降低 Spotify API 呼叫次數
2. **Parallel Requests**: 若前端同時請求多個 tracks，Worker 可平行處理（無相依性）
3. **Error Handling**: 快速失敗（fail-fast），避免長時間等待 Spotify API 超時

---

## Security & Privacy

### Data Protection

1. **Secrets Management**:
   - ✅ Client ID/Secret 僅存於 Cloudflare Workers Secrets
   - ✅ 永不記錄 (log) 或暴露於錯誤訊息中

2. **Token Handling**:
   - ✅ Access token 僅在 Worker runtime 記憶體中
   - ✅ 不寫入 logs 或持久化儲存

3. **Error Messages**:
   - ✅ Production 環境不暴露內部錯誤細節
   - ✅ Development 環境可啟用 `details` 欄位用於除錯

### CORS Configuration

```typescript
// Worker 回應 headers
headers: {
  'Access-Control-Allow-Origin': '*',  // 允許所有 origin（SPA 部署於同網域）
  'Access-Control-Allow-Methods': 'GET, POST',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

**Rationale**: SPA 與 Worker 部署於相同 Cloudflare Workers 網域，實際上無 CORS 問題。設定為預防未來 custom domain 情境。

---

## Migration Impact

### Frontend Changes Required

**Before** (直接呼叫 Spotify):

```typescript
// src/services/spotify-api.ts
const response = await fetch("https://api.spotify.com/v1/tracks/:id", {
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`, // ❌
  },
});
```

**After** (呼叫 Worker API):

```typescript
// src/services/spotify-api.ts
const response = await fetch("/api/spotify/tracks/:id"); // ✅ Worker 代理
```

**Changes**:

1. ✅ 移除 `VITE_SPOTIFY_CLIENT_SECRET` 環境變數
2. ✅ 更新 API endpoint 從 `https://api.spotify.com` 改為 `/api/spotify`
3. ✅ 移除手動 token 管理邏輯（Worker 處理）

---

## Future Enhancements (Out of Scope for Phase 1)

1. **Response Caching**: 快取 track 資料（需考量資料新鮮度）
2. **Batch API**: 支援一次請求多個 tracks（`/api/spotify/tracks?ids=id1,id2`）
3. **Rate Limiting**: 實作 Client 端 rate limiting 保護 Worker
4. **Analytics**: 記錄 API 呼叫次數與錯誤率（使用 Cloudflare Analytics Engine）

---

**Last Updated**: 2025-11-09
**Phase**: 1 (Design)
**Status**: ✅ Approved for Implementation
