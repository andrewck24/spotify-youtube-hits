/**
 * Recommended Artists for Home Page
 *
 * Predefined list of 8 high-popularity Spotify artists displayed on the home page.
 * These artists are selected for their popularity and diversity across genres.
 *
 * No dynamic calculation is performed - this is a static list.
 * Artists are sourced from Spotify's popularity charts.
 *
 * Artist Details:
 * 1. Gorillaz - British virtual band, alternative hip-hop
 * 2. Billie Eilish - American singer-songwriter, alternative/pop
 * 3. The Weeknd - Canadian singer, R&B/hip-hop/pop
 * 4. Bruno Mars - American singer, pop/R&B/funk
 * 5. Ariana Grande - American singer, pop
 * 6. Taylor Swift - American singer-songwriter, pop/country
 * 7. Drake - Canadian rapper, hip-hop/R&B
 * 8. Adele - British singer, pop/soul
 */

export const RECOMMENDED_ARTIST_IDS = [
  "GoRaSezJFAp6lzaMsPGIVg", // Gorillaz
  "6qqNVTkY8uBg9cP3Jd7DAH", // Billie Eilish
  "1Xyo4u8uTS0DIA3agS92P6", // The Weeknd
  "0LyfQg6IBa4sz7G0xyKPHc", // Bruno Mars
  "66CXWjxzNUsdJxJ2JdwvnR", // Ariana Grande
  "06HL4z0CvFAxyc27GXpf94", // Taylor Swift
  "39NQY1jJ60uRRM16CiYZNu", // Drake
  "4dpARuHxo51G1sFcJgDP0C", // Adele
] as const;

export type RecommendedArtistId = (typeof RECOMMENDED_ARTIST_IDS)[number];
