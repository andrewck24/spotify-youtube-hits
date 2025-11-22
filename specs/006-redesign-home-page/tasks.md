# Tasks: Redesign Home Page

## Phase 1: Setup & Configuration

- [ ] T001 Define `RECOMMENDED_TRACK_IDS` in `src/lib/constants.ts`
- [ ] T002 Rename `scrollable-row.tsx` to `carousel.tsx` in `src/components/ui/` and update imports

## Phase 2: Foundational Components

- [ ] T003 Update `Carousel` component to support generic children in `src/components/ui/carousel.tsx`
- [ ] T004 Update `TrackSkeleton` to export `TrackCardSkeleton` in `src/components/track/skeleton.tsx`
- [ ] T005 Create `TrackCard` component in `src/components/track/card.tsx`

## Phase 3: User Story 1 - View Home Page Layout (Hero)

- [ ] T006 [US1] Create `Hero` component with background and CTA in `src/components/home/hero.tsx`
- [ ] T007 [US1] Scaffold `HomePage` layout with Hero section in `src/pages/home-page.tsx`

## Phase 4: User Story 2 - Explore Popular Artists

- [ ] T008 [US2] Create `PopularArtists` component with batch fetching in `src/components/home/popular-artists.tsx`
- [ ] T009 [US2] Integrate `PopularArtists` into `HomePage` in `src/pages/home-page.tsx`

## Phase 5: User Story 3 - Explore Popular Tracks

- [ ] T010 [US3] Create `PopularTracks` component with batch fetching in `src/components/home/popular-tracks.tsx`
- [ ] T011 [US3] Integrate `PopularTracks` into `HomePage` in `src/pages/home-page.tsx`

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T012 Verify and adjust responsive layout (stacking) in `src/pages/home-page.tsx`
- [ ] T013 Verify error handling for batch fetches in `src/components/home/popular-artists.tsx` and `src/components/home/popular-tracks.tsx`
- [ ] T014 Ensure design compliance (rounded corners, attribution) across all new components

## Dependencies

- US1 (Hero) depends on T006
- US2 (Artists) depends on T002, T008
- US3 (Tracks) depends on T001, T002, T004, T005, T010

## Implementation Strategy

- Implement foundational components first to unblock parallel work on sections.
- Build sections independently (Hero, Artists, Tracks).
- Assemble in Home Page.
- Verify responsiveness and error handling at the end.
