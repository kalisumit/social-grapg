import Dashboard from "./pages/Dashboard.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Dashboard />
      </div>
    </ErrorBoundary>
  );
}

export default App;