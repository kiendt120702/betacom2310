
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback";
import { MainLayout } from "@/components/layouts/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TrainingProcessPage from "@/pages/TrainingProcessPage";
import TrainingContentPage from "@/pages/TrainingContentPage";
import AssignmentSubmissionPage from "@/pages/AssignmentSubmissionPage";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <AuthProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Index />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
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
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
