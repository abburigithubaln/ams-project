import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import "./Login.css"; // Reuse shared auth styles

const BuildingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22V12h6v10" />
    <rect x="8" y="6" width="3" height="3" rx="0.5" />
    <rect x="13" y="6" width="3" height="3" rx="0.5" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!email) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setMessage("Reset link sent to your email! Check your inbox.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div className="brand-logo-wrap">
          <div className="brand-icon-box"><BuildingIcon /></div>
          <div>
            <div className="brand-name">AMS Portal</div>
            <div className="brand-tagline">Apartment Management System</div>
          </div>
        </div>
        <div className="auth-brand-headline">
          <h1>Recover your<br /><span>account</span></h1>
          <p>Don't worry, we'll help you get back into your account securely.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2>Forgot Password</h2>
            <p>Enter your email address to receive a reset link</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><MailIcon /></span>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {error && <div className="auth-message msg-err" style={{ marginBottom: 12 }}>{error}</div>}
            {message && <div className="auth-message msg-ok" style={{ marginBottom: 12 }}>{message}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Sending..." : <>Send Reset Link <ArrowIcon /></>}
            </button>
          </form>

          <div className="auth-links">
            <button className="auth-link" onClick={() => navigate("/")}>← Back to Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
