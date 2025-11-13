# Tasks: Audio Features Data Migration - ReccoBeats Integration

**Input**: Design documents from `/specs/003-spotify-api-audio/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `src/` at repository root
- **Worker**: `worker/` at repository root
- **Tests**: `tests/` at repository root
- **Docs**: `specs/003-spotify-api-audio/` for feature docs

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify environment and prepare for implementation

- [x] T001 Verify development environment (Node.js 18+, npm dependencies installed)
- [x] T002 Verify Cloudflare Wrangler CLI available (`npx wrangler --version`)
- [x] T003 Create feature branch `003-spotify-api-audio` if not exists

**Checkpoint**: Environment ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Review existing Worker API structure in `worker/index.ts` (lines ~193-319 for audio-features routes)
- [x] T005 Review existing frontend service structure in `src/services/spotify-api.ts` (getAudioFeatures method)
- [x] T006 Review existing TypeScript types in `src/types/spotify.ts` (SpotifyAudioFeatures interface)

**Checkpoint**: Codebase understood - user story implementation can now begin

---

## Phase 3: User Story 1 - 查看歌曲音樂特徵分析 (Priority: P1) 🎯 MVP

**Goal**: Migrate audio features data source from Spotify API to ReccoBeats API, restore radar chart functionality

**Independent Test**:

1. Visit track details page (e.g., `/track/0V3wPSX9ygBnCm8psDIegu`)
2. Verify radar chart displays 7 audio features (acousticness, danceability, energy, instrumentalness, liveness, speechiness, valence)
3. Verify tempo (BPM) value is displayed
4. Verify data comes from ReccoBeats API (check Network requests)

### Implementation for User Story 1

#### Worker API Layer

- [x] T007 [US1] Create `fetchWithRetry` helper function in `worker/index.ts` for Exponential Backoff retry logic (handle 429, max 3 retries, 10s timeout per research.md)
- [x] T008 [US1] Update single audio-features route `GET /api/spotify/audio-features/:id` in `worker/index.ts` (~line 193-240) to call ReccoBeats API (`https://api.reccobeats.com/v1/audio-features?ids={id}`) instead of Spotify API
- [x] T009 [US1] Update error handling in audio-features route to map ReccoBeats errors (404, 429, 500, 504) to user-friendly messages per contracts/worker-audio-features-api.yaml
- [x] T010 [US1] Update Track ID validation in audio-features route to use existing `validateSpotifyId` function (should already exist in Worker)

#### Frontend Type Definitions

- [x] T011 [P] [US1] Simplify `AudioFeatures` interface in `src/types/spotify.ts` to only include 9 core fields from ReccoBeats (acousticness, danceability, energy, instrumentalness, liveness, loudness, speechiness, tempo, valence) per data-model.md
- [x] T012 [P] [US1] Add `isValidAudioFeatures` type guard function to `src/types/spotify.ts` per data-model.md (validate field types and ranges)
- [x] T013 [P] [US1] Add `isValidTrackId` validation function to `src/types/spotify.ts` per data-model.md (validate 22-character Base-62 format)

#### Frontend Service Layer

- [x] T014 [US1] Review `getAudioFeatures` method in `src/services/spotify-api.ts` to ensure compatibility with simplified AudioFeatures type (should require no changes if using same 9 fields)

#### Frontend Component Verification

- [x] T015 [US1] Review `FeatureChart` component in `src/components/track/feature-chart.tsx` to verify it only uses the 9 core AudioFeatures fields (should require no changes)

#### US1 Testing & Validation

- [x] T016 [P] [US1] Update unit tests in `tests/unit/services/spotify-api.test.ts` to mock ReccoBeats API responses instead of Spotify API
- [x] T017 [P] [US1] Verify E2E test in `tests/e2e/track-details.spec.ts` passes with radar chart displaying correctly

#### Local Development Testing

- [x] T018 [US1] Test Worker locally with `npx wrangler dev`: verify single track query returns ReccoBeats data
- [x] T019 [US1] Test Worker error scenarios locally: invalid Track ID (400), non-existent Track ID (404), verify user-friendly error messages
- [x] T020 [US1] Test frontend integration locally with `npm run dev`: verify track details page displays radar chart with ReccoBeats data
- [x] T021 [US1] Run type check `npm run type-check` to verify no TypeScript errors
- [x] T022 [US1] Run unit tests `npm run test` to verify all tests pass
- [x] T023 [US1] Run E2E tests `npm run test:e2e` to verify radar chart displays correctly

**Checkpoint**: At this point, User Story 1 should be fully functional - audio features display with ReccoBeats data

---

## Phase 4: User Story 2 - 簡化系統，移除未使用功能 (Priority: P2)

**Goal**: Remove unused batch query functionality to simplify codebase

**Independent Test**:

1. Verify system only supports single track query, not batch query
2. Verify all existing functionality works after batch removal
3. Run full test suite to confirm all tests pass

### Implementation for User Story 2

#### Code Removal

- [x] T024 [P] [US2] Remove `getAudioFeaturesBatch` method from `src/services/spotify-api.ts` (~line 169-221 per quickstart.md)
- [x] T025 [P] [US2] Remove `getAudioFeaturesBatch` interface definition from `src/types/spotify.ts` (if exists)
- [x] T026 [P] [US2] Remove batch query route `GET /api/spotify/audio-features` (with query parameter ?ids=) from `worker/index.ts` (~line 241-319 per quickstart.md)

#### Verification & Cleanup

- [x] T027 [US2] Search codebase for any remaining references to `getAudioFeaturesBatch` using `grep -r "getAudioFeaturesBatch" src/ tests/`
- [x] T028 [US2] Search codebase for any remaining batch query patterns using `grep -r "?ids=" worker/`
- [x] T029 [US2] Remove batch-related test code from `tests/unit/services/spotify-api.test.ts` (remove commented-out batch tests)

#### US2 Testing & Validation

- [x] T030 [US2] Run type check `npm run type-check` to verify no TypeScript errors after removal
- [x] T031 [US2] Run unit tests `npm run test` to verify all tests pass after batch removal
- [x] T032 [US2] Run E2E tests `npm run test:e2e` to verify existing functionality unaffected
- [x] T033 [US2] Test Worker locally with `npx wrangler dev`: verify batch route no longer exists (should return 404)
- [x] T034 [US2] Test frontend locally with `npm run dev`: verify all track details pages work correctly

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - audio features display with ReccoBeats, batch code removed

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [x] T035 [P] Run complete quickstart.md validation workflow from Step 1-6
- [x] T036 [P] Verify all error scenarios work correctly (404, 429, 500, invalid Track ID)
- [x] T037 Build project `npm run build` to verify production build succeeds
- [x] T038 Review and update feature documentation in `specs/003-spotify-api-audio/` if needed (spec.md, plan.md status)
- [x] T039 Final code review: check for any hardcoded values, console.logs, or debug code
- [x] T040 Run linting `npm run lint` to ensure code quality

**Checkpoint**: Feature complete and ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) must complete before User Story 2 (P2) starts
  - Reason: US2 removes batch code that might interfere with US1 testing
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Should start after User Story 1 complete - Depends on US1 for stable codebase

### Within Each User Story

**User Story 1**:

1. Worker implementation (T007-T010) must complete first
2. Frontend types (T011-T013) can run in parallel with Worker
3. Service/Component verification (T014-T015) after types complete
4. Testing (T016-T017) can run in parallel after implementation complete
5. Local validation (T018-T023) runs sequentially after all implementation

**User Story 2**:

1. Code removal (T024-T026) can all run in parallel (different files)
2. Verification (T027-T029) runs sequentially after removal
3. Testing (T030-T034) runs sequentially after verification

### Parallel Opportunities

- **Setup Phase**: T001, T002, T003 can run in parallel
- **US1 Types**: T011, T012, T013 can run in parallel (adding functions to same file)
- **US1 Testing**: T016, T017 can run in parallel (different test files)
- **US2 Removal**: T024, T025, T026 can run in parallel (different files)
- **Polish Phase**: T035, T036, T038 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch type definition tasks together:
Task T011: "Simplify AudioFeatures interface in src/types/spotify.ts"
Task T012: "Add isValidAudioFeatures type guard to src/types/spotify.ts"
Task T013: "Add isValidTrackId validation to src/types/spotify.ts"

# Launch testing tasks together:
Task T016: "Update unit tests in tests/unit/services/spotify-api.test.ts"
Task T017: "Verify E2E test in tests/e2e/track-details.spec.ts"
```

---

## Parallel Example: User Story 2

```bash
# Launch removal tasks together:
Task T024: "Remove getAudioFeaturesBatch from src/services/spotify-api.ts"
Task T025: "Remove getAudioFeaturesBatch interface from src/types/spotify.ts"
Task T026: "Remove batch route from worker/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006)
3. Complete Phase 3: User Story 1 (T007-T023)
4. **STOP and VALIDATE**: Test User Story 1 independently using test criteria
5. Deploy if ready (audio features work with ReccoBeats)

### Incremental Delivery

1. Complete Setup + Foundational (T001-T006) → Foundation ready
2. Add User Story 1 (T007-T023) → Test independently → Deploy/Demo (MVP! Audio features restored)
3. Add User Story 2 (T024-T034) → Test independently → Deploy/Demo (Codebase simplified)
4. Final Polish (T035-T040) → Production ready
5. Each story adds value without breaking previous stories

### Sequential Strategy (Recommended)

Since this is a migration feature with cleanup, sequential execution is recommended:

1. **Week 1**: Complete US1 (restore audio features functionality)

   - Validate: Audio features display correctly with ReccoBeats
   - Deploy: Users can see audio features again

2. **Week 2**: Complete US2 (remove batch code)
   - Validate: Batch code removed, all features still work
   - Deploy: Cleaner codebase, easier to maintain

---

## Notes

- [P] tasks = different files or independent operations, can run in parallel
- [Story] label maps task to specific user story for traceability
- US1 is critical path (MVP) - focus here first
- US2 is cleanup - can be done separately after US1 is stable
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- ReccoBeats API requires no authentication - simpler than Spotify
- Avoid: vague tasks, same file conflicts, breaking US1 while working on US2

---

## Task Summary

- **Total Tasks**: 40
- **Setup**: 3 tasks (T001-T003)
- **Foundational**: 3 tasks (T004-T006)
- **User Story 1 (P1)**: 17 tasks (T007-T023) - 7 implementation, 10 testing/validation
- **User Story 2 (P2)**: 11 tasks (T024-T034) - 6 removal, 5 testing/validation
- **Polish**: 6 tasks (T035-T040)

**Parallel Opportunities**: 12 tasks can run in parallel (marked with [P])

**MVP Scope**: Phase 1-3 (T001-T023) = 23 tasks
**Full Feature**: All phases (T001-T040) = 40 tasks

**Suggested MVP**: Complete US1 first (T001-T023), validate, then decide whether to continue with US2 or deploy US1 immediately.
