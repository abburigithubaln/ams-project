import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {

  const token = localStorage.getItem("token");

  // 1️⃣ No token → redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    // 2️⃣ Decode JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;
    const expiry = payload.exp; // JWT expiry time

    // 3️⃣ Check Token Expiry
    if (expiry * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to="/" replace />;
    }

    // 4️⃣ Role Check (Supports multiple roles)
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }

    return children;

  } catch (error) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;