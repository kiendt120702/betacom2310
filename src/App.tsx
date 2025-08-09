
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorBoundary";
import { MainLayout } from "@/components/layouts/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import TrainingProcessPage from "@/pages/TrainingProcessPage";
import TrainingContentPage from "@/pages/TrainingContentPage";
import AssignmentSubmissionPage from "@/pages/AssignmentSubmissionPage";

function App() {
  return (
    <Router>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Routes>
            <Route
              path="/training-process"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TrainingProcessPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/training-content"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TrainingContentPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignment-submission"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AssignmentSubmissionPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </ThemeProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
