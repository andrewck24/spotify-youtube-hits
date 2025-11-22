# Implementation Plan - Redesign Home Page

This plan outlines the redesign of the Home Page to include a Hero section, Popular Artists, and Popular Tracks, improving user engagement and aesthetics.

## Technical Context

- **Existing Components**:
  - `src/components/ui/scrollable-row.tsx`: Implements horizontal scrolling. **Action**: Rename to `Carousel` and refactor if needed.
  - `src/components/artist/card.tsx`: Artist card component. **Action**: Use as reference for `TrackCard`.
  - `src/pages/home-page.tsx`: Current home page. **Action**: Complete rewrite.
- **New Components**:
  - `src/components/track/card.tsx`: New component for displaying track info.
  - `src/components/home/hero.tsx`: New component for the hero section.
  - `src/components/home/popular-artists.tsx`: New component (optional, or inline in Home).
  - `src/components/home/popular-tracks.tsx`: New component (optional, or inline in Home).
- **Data Sources**:
  - `src/lib/constants.ts`: Add `RECOMMENDED_TRACK_IDS`.
  - `src/services/spotify-api.ts`: Use `useGetSeveralArtistsQuery` and `useGetSeveralTracksQuery` for batch fetching.
- **Design Guidelines**:
  - Follow `docs/design-guidelines.md` for Spotify attribution and UI rules.
  - Hero: Rounded corners, no border.
  - Track Card: No cropping of artwork.

## Constitution Check

- [x] **TypeScript Usage**: All new files will be `.tsx` or `.ts`.
- [x] **MVP Priority**: Focus on the 3 core sections. No extra features.
- [x] **Testability**: Components will be separated for easier testing.
- [x] **Standardization**: Use `shadcn/ui` where applicable. Follow Design Guidelines.
- [x] **Naming**: `kebab-case` for files.

## Project Structure

### Documentation (this feature)

```text
specs/006-redesign-home-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── home/            # New directory for home-specific components
│   │   ├── hero.tsx
│   │   ├── popular-artists.tsx
│   │   └── popular-tracks.tsx
│   ├── track/
│   │   ├── card.tsx     # New TrackCard component
│   │   └── skeleton.tsx # Updated with TrackCardSkeleton
│   └── ui/
│       └── carousel.tsx # Renamed from scrollable-row.tsx
├── lib/
│   └── constants.ts     # Updated with track IDs
└── pages/
    └── home-page.tsx    # Updated home page
```

## Proposed Changes

### Phase 1: Foundation & Components

#### [MODIFY] [constants.ts](file:///Users/andrew/projects/music-hits/src/lib/constants.ts)

- Add `RECOMMENDED_TRACK_IDS` constant with 8 popular track IDs.

#### [RENAME] [scrollable-row.tsx](file:///Users/andrew/projects/music-hits/src/components/ui/scrollable-row.tsx) -> [carousel.tsx](file:///Users/andrew/projects/music-hits/src/components/ui/carousel.tsx)

- Rename file and component to `Carousel`.
- Ensure it supports children as a scrollable list.

#### [MODIFY] [track/skeleton.tsx](file:///Users/andrew/projects/music-hits/src/components/track/skeleton.tsx)

- Export `TrackCardSkeleton` component.
- Design: Vertical card layout (square artwork on top, text below) to match `TrackCard`.

#### [NEW] [track/card.tsx](file:///Users/andrew/projects/music-hits/src/components/track/card.tsx)

- Create `TrackCard` component.
- Props: `trackId`.
- Use `useGetTrackQuery` to fetch data (will hit cache).
- Display artwork (square, rounded), title, artist name.
- Link to `/track/:id`.

#### [NEW] [home/hero.tsx](file:///Users/andrew/projects/music-hits/src/components/home/hero.tsx)

- Create `Hero` component.
- Background image (album/vinyl).
- Title: "Music Hits".
- Subtitle: "Explore...".
- CTA: "Go to Search".
- Style: Rounded corners, no border.

### Phase 2: Page Assembly

#### [NEW] [home/popular-artists.tsx](file:///Users/andrew/projects/music-hits/src/components/home/popular-artists.tsx)

- Create `PopularArtists` component.
- Use `useGetSeveralArtistsQuery` with `RECOMMENDED_ARTIST_IDS` to batch fetch data.
- Render `Carousel`.
- While loading: Render `ArtistSkeleton`s in the carousel.
- When loaded: Render `ArtistCard`s (passing IDs).

#### [NEW] [home/popular-tracks.tsx](file:///Users/andrew/projects/music-hits/src/components/home/popular-tracks.tsx)

- Create `PopularTracks` component.
- Use `useGetSeveralTracksQuery` with `RECOMMENDED_TRACK_IDS` to batch fetch data.
- Render `Carousel`.
- While loading: Render `TrackCardSkeleton`s in the carousel.
- When loaded: Render `TrackCard`s (passing IDs).

#### [MODIFY] [home-page.tsx](file:///Users/andrew/projects/music-hits/src/pages/home-page.tsx)

- Implement the 3-section layout.
- **Hero Section**: Use `Hero` component.
- **Popular Artists**: Use `PopularArtists` component.
- **Popular Tracks**: Use `PopularTracks` component.
- Ensure responsive design (stacking on mobile).

## Verification Plan

### Automated Tests

- **Lint Check**: `npm run lint` to ensure no errors.
- **Build Check**: `npm run build` to ensure no build failures.

### Manual Verification

1. **Hero Section**:
   - Check visual style (rounded, no border).
   - Click "Go to Search" -> navigates to `/search`.
2. **Popular Artists**:
   - Verify horizontal scrolling.
   - Verify 8 artists are shown.
   - Click artist card -> navigates to `/artist/:id`.
3. **Popular Tracks**:
   - Verify horizontal scrolling.
   - Verify 8 tracks are shown.
   - Click track card -> navigates to `/track/:id`.
4. **Responsiveness**:
   - Check Mobile (iPhone SE/12): Sections stack, carousels work.
   - Check Desktop: Layout looks balanced.
