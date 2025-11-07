import App from "@/app";
import { ErrorBoundary } from "@/components/error-boundary";
import "@/globals.css";
import { store } from "@/lib/store";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
);
