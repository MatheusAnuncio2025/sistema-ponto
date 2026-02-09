// Arquivo: frontend/src/App.tsx

import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  Outlet,
} from "react-router-dom";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TimeRecordProvider } from "./contexts/TimeRecordContext";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import HistoryPage from "./pages/history/HistoryPage";
import ReportsPage from "./pages/reports/ReportsPage";
import WorkLocationsPage from "./pages/admin/WorkLocationsPage";
import WorkSchedulesPage from "./pages/admin/WorkSchedulesPage";
import UsersPage from "./pages/admin/UsersPage";
import SettingsPage from "./pages/admin/SettingsPage";

function App() {
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) return <Navigate to="/" replace />;
    return <>{children}</>;
  };

  const ProtectedShell = () => (
    <ProtectedRoute>
      <TimeRecordProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </TimeRecordProvider>
    </ProtectedRoute>
  );

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route element={<ProtectedShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/historico" element={<HistoryPage />} />
            <Route path="/relatorios" element={<ReportsPage />} />
            <Route
              path="/admin/work-locations"
              element={
                <ProtectedRoute requiredRole={["admin", "hr", "supervisor", "coordinator"]}>
                  <WorkLocationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/work-schedules"
              element={
                <ProtectedRoute requiredRole={["admin", "hr", "supervisor", "coordinator"]}>
                  <WorkSchedulesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole={["admin", "hr", "supervisor", "coordinator"]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRole={["admin", "hr", "supervisor", "coordinator"]}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/time-records" element={<Navigate to="/" replace />} />
          </Route>

          <Route
            path="*"
            element={
              <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
                <Container maxWidth="sm">
                  <Paper sx={{ p: 6, textAlign: "center" }}>
                    <Typography variant="h2" fontWeight={600}>
                      404
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                      Página não encontrada
                    </Typography>
                    <Button
                      variant="contained"
                      href="/dashboard"
                      sx={{ mt: 3 }}
                    >
                      Voltar ao Dashboard
                    </Button>
                  </Paper>
                </Container>
              </Box>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
