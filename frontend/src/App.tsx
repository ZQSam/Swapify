import "./App.css";
import "./styles/auth.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import RegisterWizard from "./pages/RegisterWizard";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteHeader />

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterWizard />} />
          <Route path="/" element={<HomePage />} />

          <Route
            path="/my-books"
            element={
              <ProtectedRoute>
                <div style={{ paddingTop: 'var(--topbar-h)', padding: '32px 24px' }}>
                  My Books page coming soon...
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <div style={{ paddingTop: 'var(--topbar-h)', padding: '32px 24px' }}>
                  Messages page coming soon...
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div style={{ paddingTop: 'var(--topbar-h)', padding: '32px 24px' }}>
                  Profile page coming soon...
                </div>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <SiteFooter />
      </AuthProvider>
    </BrowserRouter>
  );
}
