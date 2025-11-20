# Music Hits 設計與品牌指南

## 1. Attribution（內容來源標示）

![attribution](https://developer-assets.spotifycdn.com/images/guidelines/design/attribution.svg)

### 1.1 什麼時候需要標示？

在 `music-hits` 中，如果你使用 Spotify 的任何內容或中繼資料（例如：藝人名稱、專輯名稱、曲名、專輯封面、播放能力…），你必須 **明確標示 Spotify 品牌**。

### 1.2 使用 Spotify Logo 標示

依據 Spotify 授權要求：
只要使用到 Spotify 的內容，在 `music-hits` 中都必須附上 Spotify logo。
若在整合視圖或夥伴畫面中，也請優先使用「完整 logo（icon + wordmark）」；只有在空間有限或作為 app icon 時，才可使用純 icon。

### 1.3 Spotify Full Logo 與 Icon

- Full Logo = Wordmark + Icon
- Icon 是較短版，只能在空間不足時使用

![full-logo-framed](https://developer-assets.spotifycdn.com/images/guidelines/design/full-logo-framed.svg)
Full logo

![icon-framed](https://developer-assets.spotifycdn.com/images/guidelines/design/icon-framed.svg)
Icon

所有 logo 使用方式須符合 Spotify 的：[Logo & Color Guidelines](https://developer.spotify.com/documentation/design#using-our-logo)

---

## 2. 使用 Spotify 內容

![using-our-content](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content.svg)

![using-our-content-example1](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content-example1.svg)

YES
封面圖需保持原始樣式，角落需做圓角處理（見下方規範）

![using-our-content-example2](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content-example2.svg)

NO
禁止裁剪封面

![using-our-content-example3](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content-example3.svg)

NO
禁止在封面上覆蓋圖層、文字、控制元件等

![using-our-content-example4](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content-example4.svg)

NO
禁止將你的品牌或 logo 放在 Spotify 專輯封面上

### 2.1 適用情境

當你在 `music-hits` 中顯示任何由 Spotify 提供的封面或 metadata。

### 2.2 必須遵循

#### 專輯與 Podcast 封面

- 只能使用 Spotify 提供的 artwork
- 禁止任何形式的變型、濾鏡、模糊、animation
- 圓角要求：
  - 小/中型裝置：4px
  - 大型裝置：8px

- 空間不足時，封面可省略
- Track / Artist / Playlist / Album metadata 必須採用 Spotify 提供的原始資料
- Metadata 必須清晰可讀
- 可截斷，但使用者必須能看到完整文字（例如 hover 展開）
- 禁止修改內容或 metadata

#### Podcasts

支援以下兩組 metadata：

- Episode Title（建議兩行）
- Podcast Name（第三行顯示）

#### Audiobooks

必須支援三組資訊：

- 書名
- 作者
- 章節（若為分享來源）

#### Metadata 字元容量建議

- Playlist / Album：25
- Artist：18
- Track：23

---

## 3. 在 `music-hits` 中瀏覽 Spotify 內容

![browsing-spotify-content](https://developer-assets.spotifycdn.com/images/guidelines/design/browsing-spotify-content.svg)

### 3.1 適用情境

當 `music-hits` 連接使用者的 Spotify 帳號並在 UI 中展示 Spotify 內容時。

如果平台是多內容供應商的聚合頁，Spotify 內容須接受公平展示，例如：
其他平台有的展示區，Spotify 也必須有。

### 3.2 規範

- Spotify 會提供「內容列（shelves）」
- Spotify 決定 metadata 顯示方式（例如分類命名、群組標題）
- 內容分類由 Spotify 決定與填充

### 3.3 如何展示 Spotify 內容

- 禁止修改 Spotify 內容或 metadata
- Spotify 內容不可放在與其他類似服務內容相鄰的位置
- 必須給整列 row 給 Spotify
- 每組內容最多顯示 20 個 item
- 每組尾端需提供「前往 Spotify app」的連結
- 需標示 Spotify logo 或 icon

![browsing-spotify-content-examples](https://developer-assets.spotifycdn.com/images/guidelines/design/browsing-spotify-content-examples.svg)
YES

![browsing-spotify-content-examples-2](https://developer-assets.spotifycdn.com/images/guidelines/design/browsing-spotify-content-examples-2.svg)
NO

---

## 4. 對 Spotify 的連結

![linking-to-spotify](https://developer-assets.spotifycdn.com/images/guidelines/design/linking-to-spotify.svg)

### 4.1 適用情境

在使用者安裝或可安裝 Spotify 的平台上運作時。

只要使用 Spotify metadata，就必須提供返回 Spotify 服務的連結。

### 4.2 如何連結

- 若 Spotify 未安裝 → 按鈕文字：**GET SPOTIFY FREE**
- 若 Spotify 已安裝 → 可使用：OPEN SPOTIFY / PLAY ON SPOTIFY / LISTEN ON SPOTIFY

連結需符合 Spotify attribution 要求。

---

## 5. Playing Views（播放畫面）

![playing-views](https://developer-assets.spotifycdn.com/images/guidelines/design/playing-views.svg)

### 5.1 適用情境

在 `music-hits` 中顯示任何 Spotify 播放畫面的時候。

### 5.2 要求

- 必須標示 Spotify（logo 或 icon）
- 必須遵守 metadata 與 artwork 規範
- Spotify app 存在時，必須提供跳轉連結
- 建議只提供 Play / Pause，不建議提供其他播放控制

### 5.3 勿提供過多播放控制的原因

因 Spotify Free 有操作限制，其他控制可能造成混亂。例如：skip 會被限制，使用者可能不懂為何按鈕失效。

如仍要提供播放控制，請遵循：

### 5.4 Spotify Free 限制處理

- 使用 PlaybackRestrictions 顯示 disabled 狀態
- 禁止提供 seek bar 的可拖動體驗（僅顯示資訊）

### 5.5 Podcast 播放

需提供 15 秒前/後跳功能。
Audiobook sample 也需要。

### 5.6 Playback 視圖規範

![playback-views-dont](https://developer-assets.spotifycdn.com/images/guidelines/design/playback-views-dont.svg)
DON'T

![playback-views-do](https://developer-assets.spotifycdn.com/images/guidelines/design/playback-views-do.svg)
DO

---

## 6. Like 功能

Like 功能需要回報 Spotify，不能儲存在 `music-hits` 端。

### 6.1 Icon 行為

- 按一次 + → Added to Liked Songs / Added to New Episodes
- 再按一次 → Removed from Liked Songs / Removed from New Episodes

Like Icon 可下載：
[.svg](https://developer.spotify.com/images/guidelines/design/like-icon-svg.zip)
[.png](https://developer.spotify.com/images/guidelines/design/like-icon-png.zip)

![States for the Like icon](https://developer-assets.spotifycdn.com/images/guidelines/design/liking.svg)

---

## 7. Showing Entities（顯示播放實體）

![Graphic of Spotify tracks being displayed on a mobile phone](https://developer-assets.spotifycdn.com/images/guidelines/design/showing-entities.svg)

### 7.1 適用情境

Spotify Free 的 on-demand 與 shuffle 模式。

### 7.2 錯落模式

- On-demand → 可看見完整 tracklist
- Shuffle → 只能看簡要摘要，不能點選單曲播放

### 7.3 顯示 Explicit Content

透過 Web API 判斷 explicit = true 時，顯示 badge。

南韓使用者必須遵守當地規範。

---

## 8. 使用 Spotify Logo

![using-our-logo](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-logo.svg)

Follow these rules to keep the Spotify logo consistent and clear in your UI.

[Download Full Logo](https://developer.spotify.com/images/guidelines/design/2024-spotify-full-logo.zip)
[Download Icon](https://developer.spotify.com/images/guidelines/design/2024-spotify-logo-icon.zip)

![logo](https://developer-assets.spotifycdn.com/images/guidelines/design/logo.svg)

### 8.1 Using the icon

Use icon-only when the brand is already established or space is limited.
Never display the wordmark _without_ the icon.

### 8.2 Using the logo

Spotify’s green logo works only on black, white, or non-duotoned photography.

### 8.3 Which color to use

- Green logo → black or white background
- Black logo → light backgrounds
- White logo → dark backgrounds

### 8.4 Legibility

Maintain sufficient contrast and respect the exclusion zone:
Half the height of the icon on all sides.

![legibility](https://developer-assets.spotifycdn.com/images/guidelines/design/legibility.svg)

### 8.5 Minimum size

- Logo ≥ **70px digital**, **20mm print**
- Icon ≥ **21px digital**, **6mm print**

### 8.6 Logo misuse

Do not modify, distort, recolor, rotate, or integrate the logo into other shapes or sentences.

(Images preserved)

---

## 9. 使用 Spotify Colors

Spotify Green is the anchor color.

- Green #1ED760, oklch(0.7697 0.2124 148.67) -> primary
- White #FFFFFF, oklch(1 0 0) -> foreground
- Black #121212, oklch(0.1822 0 0) -> background

![colors](https://developer-assets.spotifycdn.com/images/guidelines/design/colors.svg)

![using-colors1](https://developer-assets.spotifycdn.com/images/guidelines/design/using-colors1.svg)

YES — Creative combinations allowed
![using-colors2](https://developer-assets.spotifycdn.com/images/guidelines/design/using-colors2.svg)

YES — High-contrast palettes
![using-colors3](https://developer-assets.spotifycdn.com/images/guidelines/design/using-colors3.svg)

NO — Do not invent new brand colors
![using-colors4](https://developer-assets.spotifycdn.com/images/guidelines/design/using-colors4.svg)

NO — Avoid oversaturated CMYK colors

---

## 10. Logo 與命名限制（對 `music-hits` 貢獻者）

### Application 命名

- 禁止將你的功能或模組命名成與 Spotify 類似
- 禁止讓使用者誤以為是 Spotify 官方

### 請勿品牌並列

`music-hits` 不允許任何形式的 Spotify × 其他品牌並列展示。

---

## 11. Fonts

建議使用平台預設 sans-serif，依序 fallback：

- 系統 Sans-serif
- Helvetica Neue
- Helvetica
- Arial
