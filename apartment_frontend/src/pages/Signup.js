import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import "./Login.css";
import "./Signup.css";

const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22V12h6v10" />
    <rect x="8" y="6" width="3" height="3" rx="0.5" />
    <rect x="13" y="6" width="3" height="3" rx="0.5" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3-8.57A2 2 0 0 1 3.12 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const Field = ({ icon, label, type = "text", placeholder, value, onChange, children }) => (
  <div className="auth-field">
    <label>{label}</label>
    <div className="auth-input-wrap">
      <span className="auth-input-icon">{icon}</span>
      {children || <input type={type} className="auth-input" placeholder={placeholder} value={value} onChange={onChange} required />}
    </div>
  </div>
);

function Signup() {
  const [form, setForm] = useState({ username: "", email: "", contactNumber: "", password: "", confirmPassword: "", apartmentId: "" });
  const [apartments, setApartments] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const response = await axiosInstance.get("/apartments/public-list");
        setApartments(response.data.data);
      } catch (err) {
        console.error("Failed to fetch apartments:", err);
      }
    };
    fetchApartments();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (!form.apartmentId) { setError("Please select your apartment"); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await axiosInstance.post("/auth/signup", {
        username: form.username, 
        email: form.email,
        contactNumber: form.contactNumber, 
        password: form.password,
        apartmentId: Number(form.apartmentId)
      });
      setMessage("Registration successful! Please wait for admin approval.");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div className="brand-logo-wrap">
          <div className="brand-icon-box">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M9 22V12h6v10" />
                <circle cx="9" cy="7" r="1" />
                <circle cx="15" cy="7" r="1" />
              </svg>
          </div>
          <div>
            <div className="brand-name">AMS Portal</div>
            <div className="brand-tagline">Apartment Management System</div>
          </div>
        </div>
        <div className="auth-brand-headline">
          <h1>Join our<br /><span>community</span><br />today.</h1>
          <p>Create your resident account to access maintenance requests, clubhouse bookings, and community notices.</p>
        </div>
        <div className="auth-features">
          <div className="auth-feature-item">
            <div className="auth-feature-icon"><HomeIcon /></div>
            <span className="auth-feature-text">Manage your flat & maintenance</span>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2>Create account</h2>
            <p>Fill in the details below to register as a resident</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Field icon={<BuildingIcon />} label="Select Apartment">
              <select className="auth-input auth-select" value={form.apartmentId} onChange={set("apartmentId")} required>
                {apartments && apartments.length > 0 ? (
                  <>
                    <option value="">-- Choose Society --</option>
                    {apartments.map(apt => (
                      <option key={apt.id} value={apt.id}>{apt.name}</option>
                    ))}
                  </>
                ) : (
                  <option value="">No societies available. Contact support.</option>
                )}
              </select>
            </Field>
            <Field icon={<UserIcon />} label="Username" placeholder="Choose a username" value={form.username} onChange={set("username")} />
            <Field icon={<MailIcon />} label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
            <Field icon={<PhoneIcon />} label="Contact Number" placeholder="10-digit number" value={form.contactNumber} onChange={set("contactNumber")} />
            <Field icon={<LockIcon />} label="Password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set("password")} />
            <Field icon={<LockIcon />} label="Confirm Password" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={set("confirmPassword")} />

            {error && <div className="auth-message msg-err" style={{ marginBottom: 12 }}>{error}</div>}
            {message && <div className="auth-message msg-ok" style={{ marginBottom: 12 }}>{message}</div>}

            <button type="submit" className="auth-btn" disabled={loading || !!message}>
              {loading ? "Registering…" : <>Create Account <ArrowIcon /></>}
            </button>
          </form>

          <div className="auth-links">
            <button className="auth-link" onClick={() => navigate("/")}>Already have an account? Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
