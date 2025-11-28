import "./App.css";
import "./styles/auth.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import RegisterWizard from "./pages/RegisterWizard";
import LoginPage from "./pages/LoginPage";
import BooksPage from "./pages/BooksPage";
import BookDetailPage from "./pages/BookDetailPage";
import MyBooksPage from "./pages/MyBooksPage";
import BookFormPage from "./pages/BookFormPage";
import ComponentsDemo from "./pages/ComponentsDemo";
import { MessagesPage } from "./pages/MessagesPage";
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
          <Route path="/" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/components-demo" element={<ComponentsDemo />} />

          <Route
            path="/my-books"
            element={
              <ProtectedRoute>
                <MyBooksPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-books/create"
            element={
              <ProtectedRoute>
                <BookFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-books/:id/edit"
            element={
              <ProtectedRoute>
                <BookFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
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
