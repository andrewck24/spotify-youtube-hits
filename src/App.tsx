import { Provider } from 'react-redux';
import { store } from '@/app/store';

/**
 * Main Application Component
 *
 * Purpose: Root component with Redux Provider
 *
 * Features:
 * - Redux Toolkit state management
 * - React Router (to be added)
 * - Error Boundary (to be added)
 *
 * Usage:
 *   Imported by main.tsx and wrapped with React.StrictMode
 */

function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Spotify YouTube Hits
          </h1>
          <p className="text-muted-foreground">
            Application is initializing...
          </p>
        </div>
      </div>
    </Provider>
  );
}

export default App;
