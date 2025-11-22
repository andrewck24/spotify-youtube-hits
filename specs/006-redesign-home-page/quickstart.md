# Quickstart: Home Page Redesign

## Prerequisites

- Node.js 18+
- Spotify API Credentials (configured in `.env`)

## Running the Project

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm run dev
   ```

3. **Access Home Page**:
   Open `http://localhost:5173` (or the port shown in terminal).

## Modifying Recommendations

### Updating Popular Artists

Edit `src/lib/constants.ts`:

```typescript
export const RECOMMENDED_ARTIST_IDS = [
  "NEW_ARTIST_ID",
  // ...
] as const;
```

### Updating Popular Tracks

Edit `src/lib/constants.ts`:

```typescript
export const RECOMMENDED_TRACK_IDS = [
  "NEW_TRACK_ID",
  // ...
] as const;
```

## Component Structure

- **Home Page**: `src/pages/home-page.tsx`
- **Hero**: `src/components/home/hero.tsx`
- **Carousel**: `src/components/ui/carousel.tsx`
- **Track Card**: `src/components/track/card.tsx`
