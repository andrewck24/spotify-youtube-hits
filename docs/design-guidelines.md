# Design & Branding Guidelines for `music-hits`

## 1. Attribution

![attribution](https://developer-assets.spotifycdn.com/images/guidelines/design/attribution.svg)

### 1.1 When does this apply?

In the `music-hits` project, any usage of Spotify-provided data—such as artist, album, track names, metadata, album artwork, or playback-related assets—must follow proper attribution requirements. Whenever contributors or AI agents surface Spotify-sourced metadata or artwork, the display must be accompanied by appropriate Spotify branding.

### 1.2 Attribute with the Spotify logo

To respect Spotify’s licensing expectations, always include the Spotify logo when showing content sourced from Spotify.

- In components or views that present Spotify metadata, use the **full logo (icon + wordmark)** whenever possible.
- The **icon-only** version should only be used when space is very limited (e.g., device app icon or extremely compact UI elements).

### 1.3 Spotify full logo and icon

- The full logo includes both the wordmark and the icon.
- The icon-only version is a compact alternative and should be used only when the full logo cannot fit.

![full-logo-framed](https://developer-assets.spotifycdn.com/images/guidelines/design/full-logo-framed.svg)
Full logo

![icon-framed](https://developer-assets.spotifycdn.com/images/guidelines/design/icon-framed.svg)
Icon

Full logo and icon usage must comply with the official [Logo & Color Guidelines](https://developer.spotify.com/documentation/design#using-our-logo).

---

## 2. Using our content

![using-our-content](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content.svg)

![using-our-content-example1](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content-example1.svg)

YES
Artwork must be displayed in its original form, with corners rounded based on the rules below.

![using-our-content-example2](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content-example2.svg)

NO
Do not crop artwork.

![using-our-content-example3](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content-example3.svg)

NO
Do not overlay text, images, controls, or UI elements on top of artwork.

![using-our-content-example4](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-content-example4.svg)

NO
Do not place your own branding or logo on top of album artwork.

### 2.1 When does this apply?

Whenever contributors or agents use artwork or metadata provided by Spotify.

### 2.2 Follow these guidelines

#### For album and podcast artwork

- Only use artwork supplied by Spotify.
- Artwork must be unmodified—no animations, distortions, overlays, filters, or blurs.
- Artwork must use rounded corners:
  - 4px for small & medium devices
  - 8px for large devices

- If screen space is limited, artwork may be omitted.
- Titles for tracks, artists, playlists, and albums must use Spotify-provided metadata.
- Metadata must remain legible.
- Truncation is allowed but full metadata must remain accessible.
- Never alter metadata.

#### For podcasts

Support two required metadata fields:

- Episode title
- Podcast name

Podcast episodes often have long titles; use a two-line layout for episode title and a third for the podcast name.

#### For audiobooks

Support:

- Book title
- Author name
- Chapter (optional, shown when relevant)

#### Considerations

Layouts should accommodate:

- Playlist/album name: **25 characters**
- Artist name: **18 characters**
- Track name: **23 characters**

---

## 3. Browsing Spotify content

![browsing-spotify-content](https://developer-assets.spotifycdn.com/images/guidelines/design/browsing-spotify-content.svg)

### 3.1 When does this apply?

Whenever `music-hits` integrates Spotify browsing features or displays rows of Spotify-provided recommendations. If the UI aggregates content from multiple providers, Spotify must receive equal treatment.

### 3.2 Follow these guidelines

#### Content provided by Spotify

- Spotify supplies rows (“shelves”) of recommended content.
- Spotify decides which metadata should be shown on all relevant surfaces.
- Spotify defines and populates categories using optimized API endpoints.

#### How to display provided content

- Never alter provided metadata.
- Do not place Spotify content adjacent to similar-service content.
- Dedicate an entire row exclusively to Spotify content.
- Do not show more than **20 items** in a set; provide a link to open Spotify for more.
- Use Spotify’s logo or icon for attribution.

![browsing-spotify-content-examples](https://developer-assets.spotifycdn.com/images/guidelines/design/browsing-spotify-content-examples.svg)

YES
A full dedicated row for Spotify content.

![browsing-spotify-content-examples-2](https://developer-assets.spotifycdn.com/images/guidelines/design/browsing-spotify-content-examples-2.svg)

NO
Do not mix adjacent Spotify and similar-service items.

---

## 4. Linking to Spotify

![linking-to-spotify](https://developer-assets.spotifycdn.com/images/guidelines/design/linking-to-spotify.svg)

### 4.1 When does this apply?

When `music-hits` is used on platforms where the Spotify app already exists.
Playback must default to the Spotify client. If the user has not installed Spotify, link them to the app store.

Any Spotify metadata (names, artwork, playback) must link back to Spotify.

### 4.2 How to link to Spotify

- If Spotify is **not installed**, use: **GET SPOTIFY FREE**
- If Spotify **is installed**, use one of:
  - **OPEN SPOTIFY**
  - **PLAY ON SPOTIFY**
  - **LISTEN ON SPOTIFY**

Links must follow Spotify's official attribution requirements.

---

## 5. Playing views

![playing-views](https://developer-assets.spotifycdn.com/images/guidelines/design/playing-views.svg)

### 5.1 When does this apply?

Any time `music-hits` displays a playing or now-playing view.

### 5.2 Follow these guidelines

- Always attribute Spotify content using the Spotify logo or icon.
- Follow artwork & metadata rules.
- Always link to the Spotify app if available.

It is recommended to provide **only Play/Pause** controls.

### 5.3 Why?

Spotify Free has action restrictions that could confuse users if controls are enabled/disabled unpredictably. To avoid poor UX, limit controls or avoid showing restricted ones.

### 5.4 If you choose to show controls

#### Handling Spotify Free restricted actions

- Use `PlaybackRestrictions` to determine what actions are allowed.
- Restricted controls must either appear disabled or be hidden.
- Progress bar must be informational only (no seeking).

### 5.5 Upgrade information for Spotify Free

When a user triggers a restricted action:

> Spotify Premium lets you play any track, podcast episode or audiobook, ad-free and with better audio quality. Go to spotify.com/premium to try it for free.

### 5.6 Podcasts and audiobooks

- Podcasts must support ±15-second seeking.
- Audiobook samples must also support ±15-second seeking.
- Use track URI to distinguish podcasts from music.

### 5.7 Playback view DOs and DON'Ts

![playback-views-dont](https://developer-assets.spotifycdn.com/images/guidelines/design/playback-views-dont.svg)

DON'T

- Crop artwork
- Overlay text/images on artwork
- Place logos on artwork

![playback-views-do](https://developer-assets.spotifycdn.com/images/guidelines/design/playback-views-do.svg)

DO

- Extract artwork colors for background (e.g., Android Palette)
- If extraction fails, use Spotify #191414

### 5.8 Liking a song

The Like action must signal back to Spotify.

- Tap `+` → “Added to Liked Songs / New Episodes”
- Tap again → “Removed from …”
- Always use the official `+` icon

Download Like icon:
[.svg](https://developer.spotify.com/images/guidelines/design/like-icon-svg.zip)
[.png](https://developer.spotify.com/images/guidelines/design/like-icon-png.zip)

![States for the Like icon](https://developer-assets.spotifycdn.com/images/guidelines/design/liking.svg)

---

## 6. Showing entities

![Graphic of Spotify tracks being displayed on a mobile phone](https://developer-assets.spotifycdn.com/images/guidelines/design/showing-entities.svg)

### 6.1 When does this apply?

When displaying playlist/album entities for Spotify Free users.

### 6.2 Follow these guidelines

Two display modes must be supported:

- **On-demand playback:**
  User can see and play all tracks.

- **Shuffle-only playback:**
  User sees a content summary and playback starts in shuffle mode.
  They cannot choose individual tracks.

### 6.3 Displaying explicit content

Use the Web API `explicit` field.

- If user is in South Korea, explicit badge must be displayed.

| ![19badge-light](https://developer.spotify.com/images/guidelines/design/19badge-light.png) | Light background explicit badge |
| ------------------------------------------------------------------------------------------ | ------------------------------- |
| ![19badge-dark](https://developer.spotify.com/images/guidelines/design/19badge-dark.png)   | Dark background explicit badge  |

---

## 7. Using Spotify logo

![using-our-logo](https://developer-assets.spotifycdn.com/images/guidelines/design/using-our-logo.svg)

Follow these rules to keep the Spotify logo consistent and clear in your UI.

[Download Full Logo](https://developer.spotify.com/images/guidelines/design/2024-spotify-full-logo.zip)
[Download Icon](https://developer.spotify.com/images/guidelines/design/2024-spotify-logo-icon.zip)

![logo](https://developer-assets.spotifycdn.com/images/guidelines/design/logo.svg)

### 7.1 Using the icon

Use icon-only when the brand is already established or space is limited.
Never display the wordmark _without_ the icon.

### 7.2 Using the logo

Spotify’s green logo works only on black, white, or non-duotoned photography.

### 7.3 Which color to use

- Green logo → black or white background
- Black logo → light backgrounds
- White logo → dark backgrounds

### 7.4 Legibility

Maintain sufficient contrast and respect the exclusion zone:
Half the height of the icon on all sides.

![legibility](https://developer-assets.spotifycdn.com/images/guidelines/design/legibility.svg)

### 7.5 Minimum size

- Logo ≥ **70px digital**, **20mm print**
- Icon ≥ **21px digital**, **6mm print**

### 7.6 Logo misuse

Do not modify, distort, recolor, rotate, or integrate the logo into other shapes or sentences.

(Images preserved)

---

## 8. Using Spotify colors

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

## 9. Logo and naming restrictions

### 9.1 Naming your application

If registering an app within the `music-hits` ecosystem:

- Do **not** include “Spotify” or anything confusingly similar.
- You **may** indicate “for Spotify,” but not imply endorsement.

### 9.2 Your application's logo

Your logo must not resemble Spotify’s (no waves, green, circular iconography).

### 9.3 Don’t pair brands

No co-branding involving Spotify and other brands.

---

## 10. Fonts

![fonts](https://developer-assets.spotifycdn.com/images/guidelines/design/fonts.svg)

### 10.1 What font to use?

Use the platform’s default sans-serif font when possible.
Fallback order:

1. Platform default sans-serif
2. Helvetica Neue
3. Helvetica
4. Arial
