import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import "./Login.css";

const BuildingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22V12h6v10" />
    <rect x="8" y="6" width="3" height="3" rx="0.5" />
    <rect x="13" y="6" width="3" height="3" rx="0.5" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const response = await axiosInstance.post("/auth/login", { username, password });
      const token = response.data.data;
      localStorage.setItem("token", token);
      setStatus("success");
      setMessage("Login successful! Redirecting…");
      setTimeout(() => {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role = payload.role;
        if (role === "ROLE_SUPER_ADMIN") navigate("/SuperAdmin/Dashboard");
        else if (role === "ROLE_ADMIN") navigate("/Admin/AdminDashboard");
        else if (role === "ROLE_SECURITY") navigate("/Security/SecurityDashboard");
        else navigate("/Resident/ResidentDashboard");
      }, 1200);
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.message || "Invalid credentials. Please try again.");
      setTimeout(() => { setStatus("idle"); setMessage(""); }, 3500);
    }
  };

  const inputClass = `auth-input ${status === "error" ? "is-error" : ""} ${status === "success" ? "is-success" : ""}`;
  const btnClass = `auth-btn ${status === "loading" ? "btn-loading" : ""} ${status === "error" ? "btn-err" : ""} ${status === "success" ? "btn-ok" : ""}`;

  return (
    <div className="auth-page">
      {/* Left brand panel */}
      <div className="auth-brand-panel">
        <div className="brand-logo-wrap">
          <div className="brand-icon-box"><BuildingIcon /></div>
          <div>
            <div className="brand-name">AMS Portal</div>
            <div className="brand-tagline">Apartment Management System</div>
          </div>
        </div>

        <div className="auth-brand-headline">
          <h1>Manage your<br /><span>community</span><br />smarter.</h1>
          <p>A unified platform for residents, security and administrators to manage everything seamlessly.</p>
        </div>

        <div className="auth-features">
          <div className="auth-feature-item">
            <div className="auth-feature-icon"><ShieldIcon /></div>
            <span className="auth-feature-text">Bank-level security &amp; role access</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon"><BellIcon /></div>
            <span className="auth-feature-text">Real-time notices &amp; alerts</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon"><CheckIcon /></div>
            <span className="auth-feature-text">Complaints, bookings &amp; maintenance</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your AMS account to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label>Username</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><UserIcon /></span>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><LockIcon /></span>
                <input
                  type="password"
                  className={inputClass}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className={btnClass} disabled={status === "loading" || status === "success"}>
              {status === "loading" ? "Signing in…" : status === "success" ? "Success!" : <>Sign In <ArrowIcon /></>}
            </button>
          </form>

          {message && (
            <div className={`auth-message ${status === "error" ? "msg-err" : "msg-ok"}`}>
              {message}
            </div>
          )}

          <div className="auth-links">
            <button className="auth-link" onClick={() => navigate("/forgot-password")}>Forgot Password?</button>
            <button className="auth-link" onClick={() => navigate("/signup")}>New Resident? Register</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;