import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ResidentDashboard from "./pages/Resident/ResidentDashboard";
import SecurityDashboard from "./pages/Security/SecurityDashboard";
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable theme="colored" />
      <Routes>

        {/* Public Route */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />

        {/* SuperAdmin Route */}
        <Route
          path="/SuperAdmin/Dashboard"
          element={
            <ProtectedRoute allowedRoles={["ROLE_SUPER_ADMIN"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/Admin/AdminDashboard"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Resident Route */}
        <Route
          path="/Resident/ResidentDashboard"
          element={
            <ProtectedRoute allowedRoles={["ROLE_RESIDENT"]}>
              <ResidentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Security Route */}
        <Route
          path="/Security/SecurityDashboard"
          element={
            <ProtectedRoute allowedRoles={["ROLE_SECURITY"]}>
              <SecurityDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;