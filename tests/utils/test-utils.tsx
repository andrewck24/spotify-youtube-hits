import dataReducer from "@/features/data/data-slice";
import { spotifyApi } from "@/services";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { Provider } from "react-redux";

// Create root reducer for testing
const rootReducer = combineReducers({
  data: dataReducer,
  [spotifyApi.reducerPath]: spotifyApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/**
 * Creates a Redux store for testing with optional preloaded state
 * Each test gets its own store instance to ensure isolation
 *
 * @param preloadedState - Optional initial state for the store
 * @returns Configured Redux store for testing
 */
export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(spotifyApi.middleware),
  });
}

export type AppStore = ReturnType<typeof setupStore>;

interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

/**
 * Custom render function that wraps components with Redux Provider
 * Follows RTK testing best practices for component testing
 *
 * @example
 * // Render with default empty state
 * render(<MyComponent />)
 *
 * @example
 * // Render with custom initial state
 * render(<MyComponent />, {
 *   preloadedState: {
 *     artist: { currentArtist: mockArtist, loading: false, error: null },
 *   },
 * })
 *
 * @example
 * // Access store in tests
 * const { store } = render(<MyComponent />)
 * expect(store.getState().artist.currentArtist).toBe(null)
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
}

// Export custom render as default
export { renderWithProviders as render };
