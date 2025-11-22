# Feature Specification: Redesign Home Page

**Feature Branch**: `006-redesign-home-page`
**Created**: 2025-11-22
**Status**: Draft
**Input**: User description: "重新設計 home-page"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Home Page Layout (Priority: P1)

As a user, I want to see a visually appealing home page with three distinct sections so that I can easily discover popular content.

**Why this priority**: This is the core requirement of the redesign to improve user engagement and aesthetics.

**Independent Test**: Can be fully tested by loading the home page and verifying the presence and order of the three sections.

**Acceptance Scenarios**:

1. **Given** I am on the home page, **When** the page loads, **Then** I see a Hero/Banner section at the top with album/vinyl imagery.
2. **Given** I scroll down, **When** I pass the Hero section, **Then** I see a "Popular Artists" section.
3. **Given** I scroll further, **When** I pass the Artists section, **Then** I see a "Popular Tracks" section.

---

### User Story 2 - Explore Popular Artists (Priority: P1)

As a user, I want to see a list of recommended popular artists so that I can quickly access their profiles.

**Why this priority**: Provides immediate access to top content, a key feature of the home page.

**Independent Test**: Verify that the artist list matches the predefined constants and links work.

**Acceptance Scenarios**:

1. **Given** the "Popular Artists" section is visible, **When** I view the list, **Then** I see cards/items for the 8 predefined recommended artists.
2. **Given** I see an artist card, **When** I click on it, **Then** I am navigated to the Artist Details page (`/artist/:id`).

---

### User Story 3 - Explore Popular Tracks (Priority: P1)

As a user, I want to see a list of recommended popular tracks so that I can discover new music.

**Why this priority**: Completes the content discovery experience requested.

**Independent Test**: Verify that the track list displays correctly and links work.

**Acceptance Scenarios**:

1. **Given** the "Popular Tracks" section is visible, **When** I view the list, **Then** I see cards/items for the 8 predefined recommended tracks.
2. **Given** I see a track card, **When** I click on it, **Then** I am navigated to the Track Details page (`/track/:id`).

### Edge Cases

- What happens when an artist or track ID is invalid? (System should handle gracefully, e.g., filter out or show placeholder, though with static constants this is low risk).
- How does the layout handle mobile screens? (Sections should stack vertically, grids should adjust columns).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Home Page MUST display three main sections vertically ordered: Hero/Banner, Popular Artists, Popular Tracks.
- **FR-002**: The Hero/Banner section MUST use album art or vinyl record imagery as a background visual.
- **FR-002a**: The Hero section MUST include the main title ("Music Hits"), subtitle ("Explore..."), and a "Go to Search" CTA button overlaying the background.
- **FR-002b**: The Hero section MUST have rounded corners and no border.
- **FR-003**: The "Popular Artists" section MUST display artists defined in `RECOMMENDED_ARTIST_IDS` from `src/lib/constants.ts`.
- **FR-003a**: The "Popular Artists" section MUST use a horizontal scrolling (carousel) layout to display the artist cards.
- **FR-004**: The system MUST define a new constant `RECOMMENDED_TRACK_IDS` in `src/lib/constants.ts` containing a list of popular track IDs.
- **FR-005**: The "Popular Tracks" section MUST display tracks defined in the new `RECOMMENDED_TRACK_IDS` list.
- **FR-005a**: The "Popular Tracks" section MUST use a horizontal scrolling (carousel) layout to display the track cards.
- **FR-006**: Clicking an artist card MUST navigate to the corresponding Artist Page.
- **FR-007**: Clicking a track card MUST navigate to the corresponding Track Page.
- **FR-008**: The layout MUST be responsive, adjusting the grid/list density for mobile, tablet, and desktop views.
- **FR-009**: The UI MUST comply with Spotify Design Guidelines (attribution, logo usage, artwork rounding).
- **FR-010**: The system MUST handle data fetching errors gracefully (e.g., hide section or show fallback) without breaking the page.

### Key Entities _(include if feature involves data)_

- **RecommendedArtist**: ID mapped to Spotify Artist data (sourced from `RECOMMENDED_ARTIST_IDS`).
- **RecommendedTrack**: ID mapped to Spotify Track data (sourced from new `RECOMMENDED_TRACK_IDS`).

## Clarifications

### Session 2025-11-22

- Q: What content should be in the Hero section? → A: Title, Subtitle, and "Go to Search" CTA (Option A).
- Q: How should Popular Tracks be displayed? → A: Horizontal Scroll (Carousel) (Option C).
- Q: How should Popular Artists be displayed? → A: Horizontal Scroll (Carousel) (Option B).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Home page loads with all 3 sections visible/accessible via scroll.
- **SC-002**: 8 artists are displayed in the Popular Artists section.
- **SC-003**: At least 8 tracks are displayed in the Popular Tracks section.
- **SC-004**: Navigation to Artist and Track pages functions correctly for all displayed items.
- **SC-005**: Mobile view displays all content in a readable, stacked format without horizontal overflow issues.
