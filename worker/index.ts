import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { callSpotifyApi } from "./spotify/base";
import { getSpotifyToken } from "./spotify/token";
import type { Env } from "./types/env";
import type { ErrorResponse } from "./types/error";
import type { ReccoBeatsAudioFeaturesResponse } from "./types/reccobeats-api";

/**
 * Spotify ID validation regex (22 alphanumeric characters)
 */
const SPOTIFY_ID_REGEX = /^[A-Za-z0-9]{22}$/;

/**
 * Validate Spotify ID format and throw HTTPException if invalid
 */
function validateSpotifyId(id: string, type: "track" | "artist"): void {
  if (!SPOTIFY_ID_REGEX.test(id)) {
    throw new HTTPException(400, {
      message: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } ID must be 22 alphanumeric characters, got: "${id}"`,
    });
  }
}

/**
 * Fetch with exponential backoff retry logic for handling rate limiting (429)
 * Used for ReccoBeats API calls which may have rate limits
 *
 * @param url - URL to fetch
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param initialDelayMs - Initial delay in milliseconds (default: 1000)
 * @returns Response from fetch
 */
async function fetchWithRetry(
  url: string,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      // Return successful responses (including 404, 500, etc.)
      // Only retry on 429 (rate limit)
      if (response.status !== 429) {
        return response;
      }

      // Handle 429: Extract retry-after header if available
      const retryAfter = response.headers.get("Retry-After");
      const delayMs = retryAfter
        ? parseInt(retryAfter) * 1000
        : Math.pow(2, attempt) * initialDelayMs;

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        return response;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Wait before retrying
      const delay = Math.pow(2, attempt) * initialDelayMs;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Unknown error in fetchWithRetry");
}

/**
 * Main Hono application
 */
const app = new Hono<{ Bindings: Env }>();

// Global CORS middleware
app.use("/*", cors());

// Global error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    // Handle HTTPException with custom response
    return c.json(
      {
        error: err.message || "HTTP_ERROR",
        message: err.message,
        status: err.status,
      } satisfies ErrorResponse,
      err.status
    );
  }

  // Handle unexpected errors
  return c.json(
    {
      error: "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred",
      status: 500,
    } satisfies ErrorResponse,
    500
  );
});

/**
 * Route: POST /api/spotify/token
 * Returns a fresh Spotify access token
 */
app.post("/api/spotify/token", async (c) => {
  try {
    const accessToken = await getSpotifyToken(c.env);
    return c.json({ access_token: accessToken, token_type: "Bearer" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("MISSING_ENV_VARS")) {
      return c.json(
        {
          error: "MISSING_ENV_VARS",
          message,
          status: 500,
        } satisfies ErrorResponse,
        500
      );
    }

    if (message.includes("SPOTIFY_AUTH_FAILED")) {
      return c.json(
        {
          error: "SPOTIFY_AUTH_FAILED",
          message,
          status: 502,
        } satisfies ErrorResponse,
        502
      );
    }

    throw new HTTPException(500, { message });
  }
});

/**
 * Route: GET /api/spotify/tracks/:id
 * Returns track information from Spotify API
 */
app.get("/api/spotify/tracks/:id", async (c) => {
  const trackId = c.req.param("id");
  validateSpotifyId(trackId, "track");

  try {
    const trackData = await callSpotifyApi(
      `/v1/tracks/${trackId}`,
      c.env,
      "track"
    );
    return c.json(trackData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("TRACK_NOT_FOUND")) {
      return c.json(
        {
          error: "TRACK_NOT_FOUND",
          message,
          status: 404,
        } satisfies ErrorResponse,
        404
      );
    }

    if (message.includes("SPOTIFY_API_ERROR")) {
      return c.json(
        {
          error: "SPOTIFY_API_ERROR",
          message,
          status: 502,
        } satisfies ErrorResponse,
        502
      );
    }

    throw new HTTPException(500, { message });
  }
});

/**
 * Route: GET /api/spotify/artists/:id
 * Returns artist information from Spotify API
 */
app.get("/api/spotify/artists/:id", async (c) => {
  const artistId = c.req.param("id");
  validateSpotifyId(artistId, "artist");

  try {
    const artistData = await callSpotifyApi(
      `/v1/artists/${artistId}`,
      c.env,
      "artist"
    );
    return c.json(artistData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("ARTIST_NOT_FOUND")) {
      return c.json(
        {
          error: "ARTIST_NOT_FOUND",
          message,
          status: 404,
        } satisfies ErrorResponse,
        404
      );
    }

    if (message.includes("SPOTIFY_API_ERROR")) {
      return c.json(
        {
          error: "SPOTIFY_API_ERROR",
          message,
          status: 502,
        } satisfies ErrorResponse,
        502
      );
    }

    throw new HTTPException(500, { message });
  }
});

/**
 * Route: GET /api/spotify/audio-features/:id
 * Returns audio features for a single track from ReccoBeats API
 *
 * Migration Note: Changed from Spotify API (/v1/audio-features/{id})
 * to ReccoBeats API (/v1/audio-features?ids={id}) to restore functionality
 * after Spotify API deprecated this endpoint.
 */
app.get("/api/spotify/audio-features/:id", async (c) => {
  const trackId = c.req.param("id");
  validateSpotifyId(trackId, "track");

  try {
    // Call ReccoBeats API instead of Spotify API
    // ReccoBeats uses query parameter ?ids= instead of path parameter
    const response = await fetchWithRetry(
      `https://api.reccobeats.com/v1/audio-features?ids=${encodeURIComponent(
        trackId
      )}`,
      3, // max retries
      1000 // initial delay (ms)
    );

    // Handle 404: Audio features not found
    if (response.status === 404) {
      return c.json(
        {
          error: "AUDIO_FEATURES_NOT_FOUND",
          message: "Audio features not found for this track",
          status: 404,
        } satisfies ErrorResponse,
        404
      );
    }

    // Handle 429: Rate limit exceeded (after retries exhausted)
    if (response.status === 429) {
      return c.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message:
            "ReccoBeats API rate limit exceeded. Please try again later.",
          status: 429,
        } satisfies ErrorResponse,
        429
      );
    }

    // Handle 500: ReccoBeats server error
    if (response.status === 500) {
      return c.json(
        {
          error: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while fetching audio features",
          status: 500,
        } satisfies ErrorResponse,
        500
      );
    }

    // Handle timeout (504 from our side)
    if (response.status === 408) {
      return c.json(
        {
          error: "GATEWAY_TIMEOUT",
          message: "ReccoBeats API request timed out",
          status: 504,
        } satisfies ErrorResponse,
        504
      );
    }

    // Success: 200 OK
    if (response.ok) {
      const data: ReccoBeatsAudioFeaturesResponse = await response.json();
      const audioFeatures = data?.content[0] || null;
      return c.json(audioFeatures);
    }

    // Unexpected status - default to 500
    return c.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: `Unexpected response status: ${response.status}`,
        status: response.status,
      } satisfies ErrorResponse,
      500
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Handle timeout error
    if (
      message.includes("timeout") ||
      message.includes("TimeoutError") ||
      message.includes("AbortError")
    ) {
      return c.json(
        {
          error: "GATEWAY_TIMEOUT",
          message: "ReccoBeats API request timed out",
          status: 504,
        } satisfies ErrorResponse,
        504
      );
    }

    // Network error or other unexpected error
    throw new HTTPException(500, {
      message: `Failed to fetch audio features: ${message}`,
    });
  }
});

/**
 * Fallback: Serve static assets for all other routes
 * This handles SPA routing by serving index.html for non-API routes
 */
app.get("/*", (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
