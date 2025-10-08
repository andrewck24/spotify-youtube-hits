import { ReactElement } from "react"
import { render, RenderOptions } from "@testing-library/react"
// import { Provider } from "react-redux"
// import { configureStore } from "@reduxjs/toolkit"

/**
 * Custom render function with Redux Provider wrapper
 * TODO: Implement once Redux store is created (T013)
 */

interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  // preloadedState?: Partial<RootState>
  // store?: AppStore
}

export function renderWithProviders(
  ui: ReactElement,
  options?: ExtendedRenderOptions,
) {
  // TODO: Wrap with Redux Provider
  // const store = options?.store || mockStore(options?.preloadedState)
  // function Wrapper({ children }: { children: React.ReactNode }) {
  //   return <Provider store={store}>{children}</Provider>
  // }

  // return { ...render(ui, { wrapper: Wrapper, ...options }), store }

  // Temporary: render without providers until Redux store is ready
  return render(ui, options)
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react"

// Export custom render as default
export { renderWithProviders as render }
