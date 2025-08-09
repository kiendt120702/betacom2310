import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback";
import MainLayout from "@/components/layouts/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import TrainingProcessPage from "@/pages/TrainingProcessPage";
import TrainingContentPage from "@/pages/TrainingContentPage";
import AssignmentSubmissionPage from "@/pages/AssignmentSubmissionPage";

function App() {
  return (
    <Router>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <MainLayout>
                    <AdminDashboardPage />
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
        </ThemeProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
