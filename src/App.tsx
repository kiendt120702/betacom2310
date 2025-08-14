import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Home } from "@/pages/Home";
import { BannersPage } from "@/pages/banners/BannersPage";
import { StrategiesPage } from "@/pages/strategies/StrategiesPage";
import { KnowledgePage } from "@/pages/knowledge/KnowledgePage";
import { ChatPage } from "@/pages/chat/ChatPage";
import { TrainingCoursesPage } from "@/pages/training/TrainingCoursesPage";
import { ShopsPage } from "@/pages/shops/ShopsPage";
import { UsersPage } from "@/pages/users/UsersPage";
import { TeamsPage } from "@/pages/teams/TeamsPage";
import { RolesPage } from "@/pages/roles/RolesPage";
import DoanhSoPage from "@/pages/DoanhSoPage";

function App() {
  return (
    <QueryClient>
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <Toaster />
            <Routes>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
              </Route>
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Home />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/banners"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <BannersPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/strategies"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <StrategiesPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/knowledge"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <KnowledgePage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ChatPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/training"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TrainingCoursesPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shops"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ShopsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <UsersPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TeamsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roles"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <RolesPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doanh-so"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DoanhSoPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClient>
  );
}

export default App;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
