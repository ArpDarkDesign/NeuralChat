import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Chat from "../pages/Chat";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Profile from "../pages/Profile";
import ReportBug from "../pages/support/ReportBug";
import FeatureRequest from "../pages/support/FeatureRequest";
import ContactSupport from "../pages/support/ContactSupport";
import Privacy from "../pages/Privacy";
import Terms from "../pages/Terms";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            localStorage.getItem("isLoggedIn") === "true" ? (
              <Navigate to="/chat" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support/bug"
          element={
            <ProtectedRoute>
              <ReportBug />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support/feature"
          element={
            <ProtectedRoute>
              <FeatureRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support/contact"
          element={
            <ProtectedRoute>
              <ContactSupport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/privacy"
          element={
            <ProtectedRoute>
              <Privacy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/terms"
          element={
            <ProtectedRoute>
              <Terms />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
