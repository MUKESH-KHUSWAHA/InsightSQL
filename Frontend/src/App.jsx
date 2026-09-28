import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AskAI from './pages/AskAI';
import ImportData from './pages/ImportData';

/**
 * App — root router.
 * All pages are wrapped in Layout (sidebar + main area).
 * ErrorBoundary catches rendering errors and displays fallback UI.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ask" element={<AskAI />} />
            <Route path="/import" element={<ImportData />} />
            {/* Catch-all → redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
