import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MyIdeasPage } from "./pages/MyIdeasPage";
import { IdeaSubmitPage } from "./pages/IdeaSubmitPage";
import { IdeaDetailPage } from "./pages/IdeaDetailPage";
import { IdeaEditPage } from "./pages/IdeaEditPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminSettingsPage } from "./pages/AdminSettingsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Submitter routes */}
          <Route
            path="/my-ideas"
            element={
              <ProtectedRoute allowedRoles={["Submitter"]}>
                <MyIdeasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ideas/new"
            element={
              <ProtectedRoute allowedRoles={["Submitter"]}>
                <IdeaSubmitPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ideas/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["Submitter"]}>
                <IdeaEditPage />
              </ProtectedRoute>
            }
          />

          {/* Shared � both roles can view idea detail */}
          <Route
            path="/ideas/:id"
            element={
              <ProtectedRoute>
                <IdeaDetailPage />
              </ProtectedRoute>
            }
          />

          {/* AdminEvaluator routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["AdminEvaluator"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["AdminEvaluator"]}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
