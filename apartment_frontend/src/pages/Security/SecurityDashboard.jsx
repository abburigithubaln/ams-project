import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";
import "../../components/Admin/AdminShared.css";

// ── SVG Icons ─────────────────────────────────────────────
const I = ({ d, size = 18, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);
const UserIconS = () => <I d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />;
const GridIconS = () => <I d={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>} />;
const PersonWalk = () => <I d={<><circle cx="12" cy="4" r="2" /><path d="m9 11 3-4 3 4" /><path d="m7 21 5-10 5 10" /></>} />;
const BoxIconS = () => <I d={<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></>} />;
const CarIconS = () => <I d={<><rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>} />;
const ShieldIconS = () => <I d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const LogoutIconS = () => <I d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={16} />;
const MenuIconS = () => <I d={<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>} />;
const FlashIconS = () => <I d={<><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></>} />;
const PhoneIconS = () => <I d={<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></>} />;
const ClockIconS = () => <I d={<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>} />;
const UserCheckIconS = () => <I d={<><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></>} />;
const CheckCircleIconS = () => <I d={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>} />;
const BellIconS = () => <I d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>} />;

// Fix old Cloudinary PDF URLs uploaded under /image/upload/ — must be served from /raw/upload/
const getReceiptUrl = (url) => {
  if (!url) return url;
  let fixed = url.replace(/^http:\/\//, "https://");
  if (fixed.toLowerCase().endsWith(".pdf") && fixed.includes("/image/upload/")) {
    fixed = fixed.replace("/image/upload/", "/raw/upload/");
  }
  return fixed;
};

function SecurityDashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [notices, setNotices] = useState([]);
  const [viewImage, setViewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ username: "", email: "", contactNumber: "" });
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showParcelModal, setShowParcelModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [visitorData, setVisitorData] = useState({ name: "", phone: "", flatNumber: "", purpose: "VISIT" });
  const [parcelData, setParcelData] = useState({ recipientName: "", flatNumber: "", courier: "", trackingNumber: "" });
  const [vehicleData, setVehicleData] = useState({ ownerName: "", flatNumber: "", vehicleNumber: "", vehicleType: "CAR" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [otpValue, setOtpValue] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  useEffect(() => {
    fetchProfile();
    fetchVisitors();
    fetchParcels();
    fetchVehicles();
    fetchNotices();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get("/security/profile");
      const profileData = response.data.data;
      setUser(profileData);
      setProfileFormData({
        username: profileData.username || "",
        email: profileData.email || "",
        contactNumber: profileData.contactNumber || ""
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProfilePicture(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await axiosInstance.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const imageUrl = uploadRes.data;
      
      // Update profile with new image URL
      await axiosInstance.put("/security/profile", {
        ...profileFormData,
        profilePictureUrl: imageUrl
      });
      
      showToast("Profile picture updated!");
      fetchProfile();
    } catch (err) {
      showToast("Failed to upload profile picture", "error");
    } finally {
      setUploadingProfilePicture(false);
    }
  };

  const fetchVisitors = async () => {
    try {
      const response = await axiosInstance.get("/security/visitors");
      const data = response.data.data;
      setVisitors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching visitors:", error);
    }
  };

  const fetchParcels = async () => {
    try {
      const response = await axiosInstance.get("/security/parcels");
      const data = response.data.data;
      setParcels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching parcels:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axiosInstance.get("/security/vehicles");
      const data = response.data.data;
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await axiosInstance.get("/security/notices"); // Apartment-scoped notices for security staff
      const data = response.data.data;
      setNotices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await axiosInstance.put("/security/profile", {
        username: profileFormData.username,
        email: profileFormData.email,
        contactNumber: profileFormData.contactNumber
      });
      setUser({ ...user, ...profileFormData });
      setIsEditingProfile(false);
      showToast("Profile updated successfully!");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update profile", "error");
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      showToast("Please fill all password fields", "error");
      return;
    }
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    try {
      await axiosInstance.put("/security/change-password", passwordFormData);
      showToast("Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to change password", "error");
    }
  };

  const handleVisitorCheckIn = async () => {
    if (!visitorData.name.trim()) {
      showToast("Please enter visitor name", "error");
      return;
    }
    try {
      await axiosInstance.post("/security/visitors", visitorData);
      showToast("Visitor checked in successfully!");
      setShowVisitorModal(false);
      setVisitorData({ name: "", phone: "", flatNumber: "", purpose: "VISIT" });
      fetchVisitors();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to check in visitor", "error");
    }
  };

  const handleVisitorCheckOut = async (visitorId) => {
    try {
      await axiosInstance.put(`/security/visitors/${visitorId}/checkout`);
      fetchVisitors();
    } catch (error) {
      showToast("Failed to check out visitor", "error");
    }
  };

  const handleOtpCheckIn = async () => {
    if (!otpValue.trim()) {
      showToast("Please enter OTP", "error");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      await axiosInstance.post(`/security/visitors/check-in-otp?otp=${otpValue}`);
      showToast("Visitor checked in successfully with OTP!");
      setShowOtpModal(false);
      setOtpValue("");
      fetchVisitors();
    } catch (error) {
      showToast(error.response?.data?.message || "Invalid OTP or check-in failed", "error");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleParcelSubmit = async () => {
    if (!parcelData.recipientName.trim()) {
      showToast("Please enter recipient name", "error");
      return;
    }
    try {
      await axiosInstance.post("/security/parcels", parcelData);
      showToast("Parcel registered successfully!");
      setShowParcelModal(false);
      setParcelData({ recipientName: "", flatNumber: "", courier: "", trackingNumber: "" });
      fetchParcels();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to register parcel", "error");
    }
  };

  const handleParcelCollect = async (parcelId) => {
    try {
      await axiosInstance.put(`/security/parcels/${parcelId}/collect`);
      fetchParcels();
    } catch (error) {
      showToast("Failed to mark parcel as collected", "error");
    }
  };

  const handleVehicleEntry = async () => {
    if (!vehicleData.vehicleNumber.trim()) {
      showToast("Please enter vehicle number", "error");
      return;
    }
    try {
      await axiosInstance.post("/security/vehicles", vehicleData);
      showToast("Vehicle entry recorded successfully!");
      setShowVehicleModal(false);
      setVehicleData({ ownerName: "", flatNumber: "", vehicleNumber: "", vehicleType: "CAR" });
      fetchVehicles();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to record vehicle entry", "error");
    }
  };

  const handleVehicleExit = async (vehicleId) => {
    try {
      await axiosInstance.put(`/security/vehicles/${vehicleId}/exit`);
      fetchVehicles();
    } catch (error) {
      showToast("Failed to record vehicle exit", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const sidebarItems = [
    { id: "profile", label: "My Profile", icon: <UserIconS /> },
    { id: "overview", label: "Overview", icon: <GridIconS /> },
    { id: "visitors", label: "Visitors", icon: <PersonWalk /> },
    { id: "parcels", label: "Parcels", icon: <BoxIconS /> },
    { id: "vehicles", label: "Vehicles", icon: <CarIconS /> },
    { id: "notices", label: "Notices", icon: <BellIconS /> },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      CHECKED_IN: { class: "badge-checked-in", label: "Checked In" },
      CHECKED_OUT: { class: "badge-checked-out", label: "Checked Out" },
      PENDING: { class: "badge-pending", label: "Pending" },
      COLLECTED: { class: "badge-collected", label: "Collected" },
      PARKED: { class: "badge-parked", label: "Parked" },
      EXITED: { class: "badge-exited", label: "Exited" }
    };
    const statusInfo = statusMap[status] || { class: "badge-neutral", label: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="loading-spinner"></div>
        <p className="mt-4 text-slate-600 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`toast-notification ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.message}
        </div>
      )}
      {/* SIDEBAR */}
      <aside className={`security-sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-icon"><ShieldIconS /></div>
          {isSidebarOpen && (
            <div className="sidebar-brand-text">
              <div className="brand-title">AMS Portal</div>
              <div className="brand-sub">Security Panel</div>
            </div>
          )}
          <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MenuIconS />
          </button>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeView === item.id ? "active" : ""}`}
              onClick={() => setActiveView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            {isSidebarOpen && (
              <div className="user-info">
                <div className="user-name">{user?.username}</div>
                <div className="user-role">Security</div>
              </div>
            )}
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogoutIconS /> {isSidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`main-wrapper ${isSidebarOpen ? '' : 'expanded'}`}>
        {/* NOTICES SECTION */}
        {activeView === "notices" && (
          <div className="fade-in-up">
            <div className="page-header">
              <h1>Notices & Announcements</h1>
              <p className="page-subtitle">View apartment notices and monthly updates</p>
            </div>

            <div className="notices-list">
              {notices.length === 0 ? (
                <div className="empty-state">
                  <p>No notices available.</p>
                </div>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="notice-item" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="notice-header">
                      <h4>{notice.title}</h4>
                      <span className="notice-date" style={{ fontSize: '12px', color: '#7f8c8d' }}>
                        {notice.month} {notice.year}
                      </span>
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{notice.description}</p>
                    
                    {notice.attachmentUrl && (
                      <div className="notice-attachment" style={{ margin: '15px 0' }}>
                        {notice.attachmentUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? (
                          <button 
                            className="btn btn-primary btn-sm" 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => setViewImage(notice.attachmentUrl)}
                          >
                            🖼️ View Image
                          </button>
                        ) : (
                          <a 
                            href={getReceiptUrl(notice.attachmentUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                          >
                            📎 View Attachment ({notice.attachmentUrl.split('.').pop().toUpperCase()})
                          </a>
                        )}
                      </div>
                    )}

                    <div className="notice-meta" style={{ marginTop: '10px', fontSize: '11px', color: '#95a5a6', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Published: {new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PROFILE SECTION - Shown immediately on login */}
        {activeView === "profile" && (
          <div className="fade-in-up">
            <div className="page-header">
              <div>
                <h1>My Profile</h1>
                <p className="page-subtitle">Manage your personal information</p>
              </div>
            </div>

            <div className="profile-container">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar-large" style={{ position: 'relative' }}>
                    {user?.profilePictureUrl ? (
                      <img 
                        src={user.profilePictureUrl} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : (
                      user?.username?.charAt(0).toUpperCase()
                    )}
                    <label className="avatar-upload-label" style={{ 
                      position: 'absolute', 
                      bottom: '0', 
                      right: '0', 
                      background: 'var(--primary)', 
                      color: 'white', 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {uploadingProfilePicture ? '⌛' : '📷'}
                      <input type="file" hidden accept="image/*" onChange={handleProfilePictureUpload} disabled={uploadingProfilePicture} />
                    </label>
                  </div>
                  <div className="profile-basic-info">
                    <h2>{user?.username}</h2>
                    <p className="profile-email">{user?.email}</p>
                    <span className="badge badge-security">Security</span>
                  </div>
                  <div className="profile-header-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsChangingPassword(!isChangingPassword);
                        setIsEditingProfile(false);
                      }}
                    >
                      {isChangingPassword ? "Cancel" : "Change Password"}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setIsEditingProfile(!isEditingProfile);
                        setIsChangingPassword(false);
                      }}
                    >
                      {isEditingProfile ? "Cancel" : "Edit Profile"}
                    </button>
                  </div>
                </div>

                {isChangingPassword && (
                  <div className="password-change-section fade-in-up" style={{ padding: '30px 40px', borderBottom: '1px solid #ecf0f1', backgroundColor: '#fcfcfc' }}>
                    <h3 style={{ marginBottom: '20px', color: '#2c3e50', fontSize: '18px' }}>Update Password</h3>
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="Enter current password"
                          value={passwordFormData.currentPassword}
                          onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}></div>
                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="Min 6 characters"
                          value={passwordFormData.newPassword}
                          onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="Repeat new password"
                          value={passwordFormData.confirmPassword}
                          onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="profile-actions" style={{ marginTop: '20px' }}>
                      <button className="btn btn-success" onClick={handlePasswordChange}>
                        Update Password
                      </button>
                    </div>
                  </div>
                )}

                <div className="profile-details">
                  <div className="detail-row">
                    <label>Username</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        className="form-input"
                        value={profileFormData.username}
                        onChange={(e) => setProfileFormData({ ...profileFormData, username: e.target.value })}
                      />
                    ) : (
                      <span>{user?.username}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <label>Email</label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        className="form-input"
                        value={profileFormData.email}
                        onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                      />
                    ) : (
                      <span>{user?.email}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <label>Phone</label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        className="form-input"
                        value={profileFormData.contactNumber}
                        onChange={(e) => setProfileFormData({ ...profileFormData, contactNumber: e.target.value })}
                      />
                    ) : (
                      <span>{user?.contactNumber || "Not set"}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <label>Role</label>
                    <span>Security Staff</span>
                  </div>
                  <div className="detail-row">
                    <label>Assigned Apartment</label>
                    <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                      {user?.managedApartmentName || "Not Assigned"}
                    </span>
                  </div>

                  {isEditingProfile && (
                    <div className="profile-actions">
                      <button className="btn btn-success" onClick={handleProfileUpdate}>
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* OVERVIEW SECTION */}
        {activeView === "overview" && (
          <div className="fade-in-up">
            <div className="page-header">
              <div>
                <h1>Security Overview</h1>
                <p className="page-subtitle">Summary of security operations</p>
              </div>
            </div>

            <div className="security-stats-grid stat-grid">
              <div className="security-stat-card stat-card">
                <div className="stat-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}><PersonWalk /></div>
                <div className="stat-content">
                  <h3>Visitors Today</h3>
                  <p className="stat-number">{visitors.length}</p>
                </div>
              </div>
              <div className="security-stat-card stat-card">
                <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}><CheckCircleIconS /></div>
                <div className="stat-content">
                  <h3>Currently In</h3>
                  <p className="stat-number">{visitors.filter(v => v.status === 'CHECKED_IN').length}</p>
                </div>
              </div>
              <div className="security-stat-card stat-card">
                <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}><BoxIconS /></div>
                <div className="stat-content">
                  <h3>Pending Parcels</h3>
                  <p className="stat-number">{parcels.filter(p => p.status === 'PENDING').length}</p>
                </div>
              </div>
              <div className="security-stat-card stat-card">
                <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}><CarIconS /></div>
                <div className="stat-content">
                  <h3>Vehicles Parked</h3>
                  <p className="stat-number">{vehicles.filter(v => v.status === 'PARKED').length}</p>
                </div>
              </div>
            </div>

            <div className="overview-section no-padding-bottom" style={{ marginBottom: '24px' }}>
              <div className="section-header-flex">
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#2c3e50' }}>⚡ Gate Quick Actions</h3>
                <span className="customize-link">Dashboard</span>
              </div>
              <div className="quick-actions-mobile-grid">
                <div className="qa-item" onClick={() => setShowOtpModal(true)}>
                  <div className="qa-icon-container shadow-sm" style={{ background: '#3498db', color: 'white' }}><ShieldIconS /></div>
                  <span className="qa-label">OTP Entry</span>
                </div>
                <div className="qa-item" onClick={() => setShowVisitorModal(true)}>
                  <div className="qa-icon-container shadow-sm"><PersonWalk /></div>
                  <span className="qa-label">Check-in</span>
                </div>
                <div className="qa-item" onClick={() => setShowParcelModal(true)}>
                  <div className="qa-icon-container shadow-sm"><BoxIconS /></div>
                  <span className="qa-label">Parcel</span>
                </div>
                <div className="qa-item" onClick={() => setShowVehicleModal(true)}>
                  <div className="qa-icon-container shadow-sm"><CarIconS /></div>
                  <span className="qa-label">Vehicle</span>
                </div>
                <div className="qa-item" onClick={() => setActiveView("visitors")}>
                  <div className="qa-icon-container shadow-sm"><ClockIconS /></div>
                  <span className="qa-label">Logs</span>
                </div>
                <div className="qa-item">
                  <div className="qa-icon-container shadow-sm"><UserCheckIconS /></div>
                  <span className="qa-label">Staff</span>
                </div>
                <div className="qa-item">
                  <div className="qa-icon-container shadow-sm"><PhoneIconS /></div>
                  <span className="qa-label">Contact</span>
                </div>
                <div className="qa-item">
                  <div className="qa-icon-container qa-flash shadow-sm"><FlashIconS /></div>
                  <span className="qa-label">SOS</span>
                </div>
                <div className="qa-item">
                  <div className="qa-icon-container qa-plus shadow-sm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <span className="qa-label">More</span>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {visitors.slice(-3).reverse().map(v => (
                    <div key={v.id} className="activity-item">
                      <span className="activity-icon">🚶</span>
                      <span className="activity-text">{v.name} - {v.flatNumber}</span>
                    </div>
                  ))}
                  {parcels.slice(-2).reverse().map(p => (
                    <div key={p.id} className="activity-item">
                      <span className="activity-icon">📦</span>
                      <span className="activity-text">Parcel for {p.recipientName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISITORS SECTION */}
        {activeView === "visitors" && (
          <div className="fade-in-up">
            <div className="page-header">
              <div>
                <h1>Visitor Management</h1>
                <p className="page-subtitle">Manage visitor check-ins and check-outs</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => setShowOtpModal(true)}>
                  🎫 OTP Check-In
                </button>
                <button className="btn btn-primary" onClick={() => setShowVisitorModal(true)}>
                  + Check In Visitor
                </button>
              </div>
            </div>

            {/* Visitor Stats */}
            <div className="visitor-stats">
              <div className="visitor-stat">
                <span className="stat-number">{visitors.filter(v => v.status === 'CHECKED_IN').length}</span>
                <span className="stat-label">Currently In</span>
              </div>
              <div className="visitor-stat">
                <span className="stat-number">{visitors.length}</span>
                <span className="stat-label">Total Today</span>
              </div>
            </div>

            {/* Check In Modal */}
            {showVisitorModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Check In Visitor</h3>
                  <div className="form-group">
                    <label>Visitor Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter visitor name"
                      value={visitorData.name}
                      onChange={(e) => setVisitorData({ ...visitorData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Enter phone number"
                      value={visitorData.phone}
                      onChange={(e) => setVisitorData({ ...visitorData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Flat Number to Visit</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter flat number"
                      value={visitorData.flatNumber}
                      onChange={(e) => setVisitorData({ ...visitorData, flatNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Purpose</label>
                    <select
                      className="form-select"
                      value={visitorData.purpose}
                      onChange={(e) => setVisitorData({ ...visitorData, purpose: e.target.value })}
                    >
                      <option value="VISIT">Family Visit</option>
                      <option value="DELIVERY">Delivery</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="OFFICIAL">Official</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowVisitorModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleVisitorCheckIn}>Check In</button>
                  </div>
                </div>
              </div>
            )}

            {/* OTP Modal */}
            {showOtpModal && (
              <div className="modal-overlay">
                <div className="modal-content text-center" style={{ maxWidth: '400px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔐</div>
                  <h3>Verify Visitor OTP</h3>
                  <p className="page-subtitle">Enter the 6-digit OTP shared by the visitor</p>
                  
                  <div className="form-group mt-20">
                    <input
                      type="text"
                      className="form-input text-center"
                      style={{ fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold' }}
                      maxLength="6"
                      placeholder="000000"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div className="modal-actions mt-30">
                    <button className="btn btn-secondary w-full" onClick={() => setShowOtpModal(false)}>Cancel</button>
                    <button 
                      className="btn btn-primary w-full" 
                      onClick={handleOtpCheckIn}
                      disabled={isVerifyingOtp || otpValue.length !== 6}
                    >
                      {isVerifyingOtp ? "Verifying..." : "Verify & Check-In"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Visitors Table */}
            <div className="visitors-table-container">
              <table className="visitor-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Flat Number</th>
                    <th>Purpose</th>
                    <th>Entry Time</th>
                    <th>Exit Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.length > 0 ? (
                    visitors.map((visitor) => (
                      <tr key={visitor.id}>
                        <td>{visitor.name}</td>
                        <td>{visitor.phone}</td>
                        <td>{visitor.flatNumber}</td>
                        <td>{visitor.purpose}</td>
                        <td>{visitor.entryTime ? new Date(visitor.entryTime).toLocaleTimeString() : '-'}</td>
                        <td>{visitor.exitTime ? new Date(visitor.exitTime).toLocaleTimeString() : '-'}</td>
                        <td>{getStatusBadge(visitor.status)}</td>
                        <td>
                          {visitor.status === 'CHECKED_IN' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleVisitorCheckOut(visitor.id)}
                            >
                              Check Out
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">No visitors recorded today</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PARCELS SECTION */}
        {activeView === "parcels" && (
          <div className="fade-in-up">
            <div className="page-header">
              <div>
                <h1>Parcel Management</h1>
                <p className="page-subtitle">Manage package deliveries</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowParcelModal(true)}>
                + Register Parcel
              </button>
            </div>

            {/* Parcel Stats */}
            <div className="visitor-stats">
              <div className="visitor-stat">
                <span className="stat-number">{parcels.filter(p => p.status === 'PENDING').length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="visitor-stat">
                <span className="stat-number">{parcels.filter(p => p.status === 'COLLECTED').length}</span>
                <span className="stat-label">Collected</span>
              </div>
              <div className="visitor-stat">
                <span className="stat-number">{parcels.length}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>

            {/* Register Parcel Modal */}
            {showParcelModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Register Parcel</h3>
                  <div className="form-group">
                    <label>Recipient Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter recipient name"
                      value={parcelData.recipientName}
                      onChange={(e) => setParcelData({ ...parcelData, recipientName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Flat Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter flat number"
                      value={parcelData.flatNumber}
                      onChange={(e) => setParcelData({ ...parcelData, flatNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Courier Service</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., FedEx, DHL, Amazon"
                      value={parcelData.courier}
                      onChange={(e) => setParcelData({ ...parcelData, courier: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tracking Number (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter tracking number"
                      value={parcelData.trackingNumber}
                      onChange={(e) => setParcelData({ ...parcelData, trackingNumber: e.target.value })}
                    />
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowParcelModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleParcelSubmit}>Register</button>
                  </div>
                </div>
              </div>
            )}

            {/* Parcels Table */}
            <div className="visitors-table-container">
              <table className="visitor-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Flat Number</th>
                    <th>Courier</th>
                    <th>Tracking #</th>
                    <th>Received Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.length > 0 ? (
                    parcels.map((parcel) => (
                      <tr key={parcel.id}>
                        <td>{parcel.recipientName}</td>
                        <td>{parcel.flatNumber}</td>
                        <td>{parcel.courier}</td>
                        <td>{parcel.trackingNumber || '-'}</td>
                        <td>{parcel.receivedTime ? new Date(parcel.receivedTime).toLocaleString() : '-'}</td>
                        <td>{getStatusBadge(parcel.status)}</td>
                        <td>
                          {parcel.status === 'PENDING' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleParcelCollect(parcel.id)}
                            >
                              Mark Collected
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">No parcels registered</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VEHICLES SECTION */}
        {activeView === "vehicles" && (
          <div className="fade-in-up">
            <div className="page-header">
              <div>
                <h1>Vehicle Records</h1>
                <p className="page-subtitle">Track vehicle entry and exit</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowVehicleModal(true)}>
                + Record Entry
              </button>
            </div>

            {/* Vehicle Stats */}
            <div className="visitor-stats">
              <div className="visitor-stat">
                <span className="stat-number">{vehicles.filter(v => v.status === 'PARKED').length}</span>
                <span className="stat-label">Currently Parked</span>
              </div>
              <div className="visitor-stat">
                <span className="stat-number">{vehicles.filter(v => v.status === 'EXITED').length}</span>
                <span className="stat-label">Exited Today</span>
              </div>
              <div className="visitor-stat">
                <span className="stat-number">{vehicles.length}</span>
                <span className="stat-label">Total Records</span>
              </div>
            </div>

            {/* Vehicle Entry Modal */}
            {showVehicleModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Record Vehicle Entry</h3>
                  <div className="form-group">
                    <label>Owner/Driver Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter owner name"
                      value={vehicleData.ownerName}
                      onChange={(e) => setVehicleData({ ...vehicleData, ownerName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Flat Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter flat number"
                      value={vehicleData.flatNumber}
                      onChange={(e) => setVehicleData({ ...vehicleData, flatNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., ABC-1234"
                      value={vehicleData.vehicleNumber}
                      onChange={(e) => setVehicleData({ ...vehicleData, vehicleNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Type</label>
                    <select
                      className="form-select"
                      value={vehicleData.vehicleType}
                      onChange={(e) => setVehicleData({ ...vehicleData, vehicleType: e.target.value })}
                    >
                      <option value="CAR">Car</option>
                      <option value="BIKE">Bike</option>
                      <option value="SCOOTER">Scooter</option>
                      <option value="TRUCK">Truck</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowVehicleModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleVehicleEntry}>Record Entry</button>
                  </div>
                </div>
              </div>
            )}

            {/* Vehicles Table */}
            <div className="visitors-table-container">
              <table className="visitor-table">
                <thead>
                  <tr>
                    <th>Vehicle #</th>
                    <th>Type</th>
                    <th>Owner</th>
                    <th>Flat Number</th>
                    <th>Entry Time</th>
                    <th>Exit Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td>{vehicle.vehicleNumber}</td>
                        <td>{vehicle.vehicleType}</td>
                        <td>{vehicle.ownerName}</td>
                        <td>{vehicle.flatNumber}</td>
                        <td>{vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleTimeString() : '-'}</td>
                        <td>{vehicle.exitTime ? new Date(vehicle.exitTime).toLocaleTimeString() : '-'}</td>
                        <td>{getStatusBadge(vehicle.status)}</td>
                        <td>
                          {vehicle.status === 'PARKED' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleVehicleExit(vehicle.id)}
                            >
                              Record Exit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">No vehicle records</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Image Viewer Modal */}
      {viewImage && (
        <div className="modal-overlay" onClick={() => setViewImage(null)} style={{ zIndex: 2000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', padding: '10px', position: 'relative' }}>
            <button 
              onClick={() => setViewImage(null)}
              style={{ position: 'absolute', top: '-15px', right: '-15px', borderRadius: '50%', width: '30px', height: '30px', border: 'none', background: '#e74c3c', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
            <img src={viewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', borderRadius: '4px' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SecurityDashboard;
