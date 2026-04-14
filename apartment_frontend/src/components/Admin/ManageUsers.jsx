import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import "./AdminShared.css";

const getDocUrl = (url) => {
  if (!url) return url;
  let fixed = url.replace(/^http:\/\//, "https://");
  if (fixed.toLowerCase().endsWith(".pdf") && fixed.includes("/image/upload/")) {
    fixed = fixed.replace("/image/upload/", "/raw/upload/");
  }
  return fixed;
};

export default function ManageUsers() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reactivateUserId, setReactivateUserId] = useState(null);
  const [flatIdToAllocate, setFlatIdToAllocate] = useState("");
  const [deactivateConfirmId, setDeactivateConfirmId] = useState(null);
  const [flatIdError, setFlatIdError] = useState("");
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ROLE_SECURITY",
    phoneNumber: "",
    apartmentId: ""
  });
  const [activeTab, setActiveTab] = useState("all"); // "all", "residents", "requests"
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: profile } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/profile");
      return res.data?.data;
    }
  });

  const currentUserRole = profile?.role || "";

  const { data: apartments = [] } = useQuery({
    queryKey: ["apartments"],
    queryFn: async () => {
      const res = await axiosInstance.get("/apartments");
      const d = res.data.data || res.data;
      return Array.isArray(d?.content) ? d.content : (Array.isArray(d) ? d : []);
    },
    enabled: currentUserRole === "ROLE_SUPER_ADMIN"
  });

  const { data: flats = [] } = useQuery({
    queryKey: ["flats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/flats");
      const d = res.data.data || res.data;
      return Array.isArray(d?.content) ? d.content : (Array.isArray(d) ? d : []);
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/users");
      return Array.isArray(res.data.data) ? res.data.data : [];
    }
  });

  const availableFlats = flats.filter(f => f.status === "AVAILABLE");

  // Mutations
  const userMutation = useMutation({
    mutationFn: async ({ isEditing, id, payload }) => {
      if (isEditing) {
        return axiosInstance.put(`/admin/users/${id}`, payload);
      }
      return axiosInstance.post("/admin/users", payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["users"]);
      if (variables.isEditing) {
        toast.success("User updated successfully!");
      } else if (variables.payload.role === "ROLE_RESIDENT") {
        toast.success("Resident created! Check 'Approve Requests' to allocate a flat.");
      } else {
        toast.success("User created successfully!");
      }
      resetForm();
      if (selectedUser && selectedUser.id === editUserId) setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId) => axiosInstance.put(`/admin/users/${userId}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setDeactivateConfirmId(null);
      toast.success("User deactivated successfully!");
    }
  });

  const reactivateMutation = useMutation({
    mutationFn: async ({ userId, flatId, type }) => {
      if (type === "approve") {
        return axiosInstance.put(`/admin/users/${userId}/approve`, null, { params: { flatId } });
      } else if (type === "allocate") {
        return axiosInstance.put(`/admin/users/${userId}/allocate/${flatId}`);
      } else {
        return axiosInstance.put(`/admin/users/${userId}/reactivate`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setReactivateUserId(null);
      setFlatIdToAllocate("");
      setActiveTab("all");
      toast.success("User reactivated/approved successfully!");
    },
    onError: (error) => {
      setFlatIdError(error.response?.data?.message || "Failed to approve/allocate.");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (userId) => axiosInstance.put(`/admin/users/${userId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast.info("User request rejected.");
    },
    onError: () => {
      toast.error("Failed to reject user.");
    }
  });

  const validateForm = () => {
    const newErrors = {};
    if (!userData.username.trim()) newErrors.username = "Username is required";
    if (!userData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!isEditing) {
      if (!userData.password) {
        newErrors.password = "Password is required";
      } else if (userData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }
    if (!isEditing && userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!userData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setUserData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "ROLE_SECURITY",
      phoneNumber: "",
      apartmentId: ""
    });
    setErrors({});
    setIsEditing(false);
    setEditUserId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { 
      ...userData, 
      contactNumber: userData.phoneNumber,
      apartmentId: userData.apartmentId || null 
    };
    delete payload.confirmPassword;
    delete payload.phoneNumber;

    if (isEditing) delete payload.password;

    userMutation.mutate({ isEditing, id: editUserId, payload });
  };

  const handleDeactivate = (userId) => {
    setDeactivateConfirmId(userId);
  };

  const confirmDeactivate = (userId) => {
    deactivateMutation.mutate(userId);
  };

  const cancelDeactivate = () => {
    setDeactivateConfirmId(null);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setDeactivateConfirmId(null);
    setReactivateUserId(null);
  };

  const reactivateNonResident = (user) => {
    reactivateMutation.mutate({ userId: user.id, type: "reactivate" });
  };

  const submitReactivate = (user) => {
    if (!flatIdToAllocate) {
      setFlatIdError("Please select a Flat.");
      return;
    }
    setFlatIdError("");
    const type = user.status === "PENDING" ? "approve" : "allocate";
    reactivateMutation.mutate({ userId: user.id, flatId: flatIdToAllocate, type });
  };

  const handleReject = (userId) => {
    rejectMutation.mutate(userId);
  };

  const handleEdit = (user) => {
    setUserData({
      username: user.username || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
      role: user.role || (user.roles && user.roles[0]?.name) || "ROLE_SECURITY",
      phoneNumber: user.contactNumber || "",
      apartmentId: user.managedApartmentId || ""
    });
    setIsEditing(true);
    setEditUserId(user.id);
    setShowForm(true);

  };

  const getRole = (u) => u.role || (u.roles && u.roles[0]?.name);

  const allActiveUsers = users.filter(u => u.status !== "DEACTIVATED" && u.status !== "PENDING");
  const residentUsers = users.filter(u => getRole(u) === "ROLE_RESIDENT" && u.status !== "DEACTIVATED" && u.status !== "PENDING");
  const pendingUsers = users.filter(u => u.status === "PENDING");
  const deactivatedUsers = users.filter(u => u.status === "DEACTIVATED");

  const matchSearch = (u) => {
    const q = searchQuery.toLowerCase();
    const matchName = (u.username && u.username.toLowerCase().includes(q));

    if (activeTab === "residents") {
      return matchName || (u.flatNumber && u.flatNumber.toString().includes(q));
    }
    return matchName;
  };

  const displayedUsers = (
    activeTab === "all" ? allActiveUsers :
      activeTab === "residents" ? residentUsers :
        activeTab === "requests" ? pendingUsers :
          deactivatedUsers
  ).filter(u => matchSearch(u));

  return (
    <div className="fade-in-up">
      <div className="page-header page-header-container">
        <div></div>
        <button className="btn btn-gradient-blue" onClick={() => { if (!showForm) { resetForm(); } setShowForm(!showForm); }}>
          {showForm ? '✕ Close Form' : (isEditing ? '✏️ Editing User' : '+ Create User')}
        </button>
      </div>

      {showForm && (
        <div className="inline-form-card inline-form-users fade-in-up mb-24">
          <div className="inline-form-accent accent-blue"></div>
          <div className="inline-form-header">
            <div className="inline-form-icon icon-blue">
              <span>👥</span>
            </div>
            <div>
              <h3>{isEditing ? 'Edit User' : 'Create Admin / Security'}</h3>
              <p>{isEditing ? 'Update existing user details' : 'Register a new admin or security user'}</p>
            </div>
          </div>
          <div className="inline-form-body">
            <form onSubmit={handleSubmit}>
              <div className="inline-form-row">
                <div className={`inline-form-group ${errors.username ? 'has-error' : ''}`}>
                  <label>Username <span className="required-star">*</span></label>
                  <input
                    type="text"
                    className={`inline-form-input ${errors.username ? 'error' : ''}`}
                    placeholder="Enter username"
                    value={userData.username}
                    onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  />
                  {errors.username && <span className="inline-form-error">{errors.username}</span>}
                </div>
                <div className="inline-form-group"></div>
              </div>

              <div className="inline-form-row">
                <div className={`inline-form-group ${errors.email ? 'has-error' : ''}`}>
                  <label>Email <span className="required-star">*</span></label>
                  <input
                    type="email"
                    className={`inline-form-input ${errors.email ? 'error' : ''}`}
                    placeholder="name@example.com"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  />
                  {errors.email && <span className="inline-form-error">{errors.email}</span>}
                </div>
                <div className={`inline-form-group ${errors.phoneNumber ? 'has-error' : ''}`}>
                  <label>Phone <span className="required-star">*</span></label>
                  <input
                    type="tel"
                    className={`inline-form-input ${errors.phoneNumber ? 'error' : ''}`}
                    placeholder="+91 XXXXX XXXXX"
                    value={userData.phoneNumber}
                    onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                  />
                  {errors.phoneNumber && <span className="inline-form-error">{errors.phoneNumber}</span>}
                </div>
              </div>

              <div className="inline-form-row">
                <div className="inline-form-group">
                  <label>Role <span className="required-star">*</span></label>
                    <select
                      className="inline-form-select"
                      value={userData.role}
                      onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                    >
                      {currentUserRole === "ROLE_SUPER_ADMIN" && (
                        <option value="ROLE_SUPER_ADMIN">👑 Super Admin</option>
                      )}
                      <option value="ROLE_ADMIN">🔑 Society Admin</option>
                      <option value="ROLE_SECURITY">👤 Staff Member</option>
                      <option value="ROLE_RESIDENT">🏠 Resident</option>
                    </select>
                  </div>
                  {(userData.role === "ROLE_ADMIN" || userData.role === "ROLE_SECURITY") && apartments.length > 0 && (
                    <div className="inline-form-group">
                      <label>Assign to Apartment <span className="required-star">*</span></label>
                      <select
                        className="inline-form-select"
                        value={userData.apartmentId}
                        onChange={(e) => setUserData({ ...userData, apartmentId: e.target.value })}
                        required
                      >
                        <option value="">Select an apartment...</option>
                        {apartments.map(apt => (
                          <option key={apt.id} value={apt.id}>{apt.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {userData.role !== "ROLE_ADMIN" && userData.role !== "ROLE_SECURITY" && (
                    <div className="inline-form-group"></div>
                  )}
                {!isEditing && (
                  <div className={`inline-form-group ${errors.password ? 'has-error' : ''}`}>
                    <label>Password <span className="required-star">*</span></label>
                    <input
                      type="password"
                      className={`inline-form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Minimum 6 characters"
                      value={userData.password}
                      onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    />
                    {errors.password && <span className="inline-form-error">{errors.password}</span>}
                  </div>
                )}
                {isEditing && <div className="inline-form-group"></div>}
              </div>

              {!isEditing && (
                <div className="inline-form-row">
                  <div className={`inline-form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
                    <label>Confirm Password <span className="required-star">*</span></label>
                    <input
                      type="password"
                      className={`inline-form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Re-enter password"
                      value={userData.confirmPassword}
                      onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                    />
                    {errors.confirmPassword && <span className="inline-form-error">{errors.confirmPassword}</span>}
                  </div>
                  <div className="inline-form-group"></div>
                </div>
              )}

              <div className="inline-form-actions">
                <button type="button" className="inline-btn inline-btn-cancel" onClick={() => { resetForm(); setShowForm(false); }}>
                  Cancel
                </button>
                <button type="submit" className="inline-btn inline-btn-submit btn-gradient-blue" disabled={userMutation.isPending}>
                  {userMutation.isPending ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? '✏️ Update User' : '➕ Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <div className="admin-card mt-0">
        <div className="action-group tab-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className={`btn ${activeTab === "all" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("all")}>
              All Users ({allActiveUsers.length})
            </button>
            <button className={`btn ${activeTab === "residents" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("residents")}>
              Residents ({residentUsers.length})
            </button>
            <button className={`btn ${activeTab === "requests" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("requests")}>
              Approve Requests ({pendingUsers.length})
            </button>
            <button className={`btn ${activeTab === "deactivated" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("deactivated")}>
              Deactivated ({deactivatedUsers.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', flex: '1', minWidth: '300px', justifyContent: 'flex-end' }}>
            <input
              type="text"
              placeholder={activeTab === "residents" ? "Search by name, username or flat..." : "Search by name or username..."}
              className="inline-form-input"
              style={{ maxWidth: '300px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Split Layout Container */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '24px', alignItems: 'flex-start' }}>

          {/* Left Side - User List Box */}
          <div style={{ flex: '1', minWidth: '300px', background: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-2)', background: 'var(--surface-2)' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--txt)' }}>User Directory</h3>
            </div>
            <div style={{ flex: '1', overflowY: 'auto', padding: '12px' }}>
              {displayedUsers.length === 0 ? (
                <p className="empty-text" style={{ padding: '20px', textAlign: 'center' }}>No users found in this category.</p>
              ) : (
                displayedUsers.map((user) => {
                  const isDeactivated = user.status === "DEACTIVATED" || user.status === "PENDING";
                  const userRole = getRole(user);
                  const isSelected = selectedUser && selectedUser.id === user.id;

                  const getAvatarGradient = () => {
                    if (userRole === "ROLE_ADMIN") return "linear-gradient(135deg, #9b59b6, #8e44ad)";
                    if (userRole === "ROLE_SECURITY") return "linear-gradient(135deg, #3498db, #2980b9)";
                    return "linear-gradient(135deg, #27ae60, #229954)";
                  };

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        borderRadius: 'var(--r-md)',
                        transition: 'all 0.2s',
                        background: isSelected ? 'var(--p-light)' : 'transparent',
                        border: isSelected ? '1px solid var(--p-muted)' : '1px solid transparent',
                        marginBottom: '4px'
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-2)'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: getAvatarGradient(), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', overflow: 'hidden' }}>
                        {user.profilePictureUrl ? (
                          <img src={user.profilePictureUrl} alt="U" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          user.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div style={{ flex: '1', minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', color: 'var(--txt)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <p style={{ margin: 0, fontSize: '11px', color: 'var(--txt-3)' }}>{user.email}</p>
                          {(user.managedApartmentName || user.apartmentName) && (
                            <p style={{ margin: 0, fontSize: '10px', fontWeight: '600', color: 'var(--p)', opacity: '0.8' }}>
                              🏢 {user.managedApartmentName || user.apartmentName}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`badge ${isDeactivated ? "badge-inactive" : "badge-active"}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {user.status || "ACTIVE"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Side - Detailed Card Container */}
          <div style={{ flex: '2', background: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            {selectedUser ? (() => {
              const u = displayedUsers.find(du => du.id === selectedUser.id) || selectedUser;
              const isDeactivated = u.status === "DEACTIVATED" || u.status === "PENDING";
              const userRole = getRole(u);

              const getAvatarGradient = () => {
                if (userRole === "ROLE_ADMIN") return "linear-gradient(135deg, #9b59b6, #8e44ad)";
                if (userRole === "ROLE_SECURITY") return "linear-gradient(135deg, #3498db, #2980b9)";
                return "linear-gradient(135deg, #27ae60, #229954)";
              };

              return (
                <div style={{ width: '100%' }}>
                  {/* Card Header with Banner */}
                  <div style={{ position: 'relative', height: '100px', background: 'linear-gradient(90deg, var(--p-dark), var(--p))', borderRadius: 'var(--r-lg) var(--r-lg) 0 0' }}></div>
                  <div style={{ padding: '0 32px 32px', position: 'relative' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ width: '84px', height: '84px', borderRadius: '16px', background: getAvatarGradient(), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', marginTop: '-42px', border: '5px solid var(--surface)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        {u.profilePictureUrl ? (
                          <img src={u.profilePictureUrl} alt="U" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          u.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(u)}>✏️ Edit</button>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', letterSpacing: '-0.3px', color: 'var(--txt)' }}>
                        {u.username}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--txt-3)', fontSize: '14px' }}>@{u.username}</span>
                        <span className={`badge ${isDeactivated ? "badge-inactive" : "badge-active"}`}>
                          {u.status || "ACTIVE"}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr)', gap: '24px', background: 'var(--surface-2)', padding: '24px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-2)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--txt-3)', letterSpacing: '0.5px' }}>Role Type</strong>
                        <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--txt)' }}>
                          {userRole === "ROLE_ADMIN" ? "Administator" : userRole === "ROLE_SECURITY" ? "Staff Member" : "Resident"}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--txt-3)', letterSpacing: '0.5px' }}>Email Address</strong>
                        <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--txt)' }}>{u.email}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--txt-3)', letterSpacing: '0.5px' }}>Phone Number</strong>
                        <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--txt)' }}>{u.contactNumber || "N/A"}</span>
                      </div>
                      {userRole === "ROLE_RESIDENT" && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--txt-3)', letterSpacing: '0.5px' }}>Flat Assignment</strong>
                          <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--txt)' }}>
                            {u.flatNumber ? `Flat ${u.flatNumber} (${u.blockName || 'unknown Block'})` : "Not Assigned"}
                          </span>
                        </div>
                      )}
                      {(u.managedApartmentName || u.apartmentName) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--txt-3)', letterSpacing: '0.5px' }}>Apartment</strong>
                          <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--txt)' }}>{u.managedApartmentName || u.apartmentName}</span>
                        </div>
                      )}
                      {userRole === "ROLE_RESIDENT" && (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--txt-3)', letterSpacing: '0.5px' }}>Aadhar Card</strong>
                            {u.aadharUrl ? (
                              <a href={getDocUrl(u.aadharUrl)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: 'var(--p)', fontWeight: '600', textDecoration: 'none' }}>
                                📄 View Aadhar
                              </a>
                            ) : (
                              <span style={{ fontSize: '14px', color: 'var(--txt-3)' }}>Not Uploaded</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--txt-3)', letterSpacing: '0.5px' }}>PAN Card</strong>
                            {u.panCardUrl ? (
                              <a href={getDocUrl(u.panCardUrl)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: 'var(--p)', fontWeight: '600', textDecoration: 'none' }}>
                                💳 View PAN Card
                              </a>
                            ) : (
                              <span style={{ fontSize: '14px', color: 'var(--txt-3)' }}>Not Uploaded</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Management Actions */}
                    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-2)' }}>
                      <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--txt)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Actions</h4>

                      {!isDeactivated ? (
                        <>
                          {deactivateConfirmId === u.id ? (
                            <div className="action-group" style={{ background: 'var(--danger-bg)', padding: '16px', borderRadius: 'var(--r-md)', border: '1px solid #FECACA' }}>
                              <span style={{ marginRight: '12px', color: '#991B1B', fontWeight: '500', fontSize: '14px' }}>Are you sure you want to deactivate?</span>
                              <button className="btn btn-danger" onClick={() => confirmDeactivate(u.id)} disabled={deactivateMutation.isPending}>
                                {deactivateMutation.isPending ? "Deactivating..." : "Confirm Deactivation"}
                              </button>
                              <button className="btn btn-secondary" onClick={cancelDeactivate}>Cancel</button>
                            </div>
                          ) : (
                            <button className="btn btn-danger" onClick={() => handleDeactivate(u.id)}>Deactivate Account</button>
                          )}
                        </>
                      ) : (
                        <>
                          {reactivateUserId === u.id ? (
                            <div className="action-group" style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-2)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>

                              {userRole === "ROLE_RESIDENT" && (
                                <div style={{ width: '100%', maxWidth: '350px' }}>
                                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Assign a Flat before Reactivation <span className="required-star">*</span></label>
                                  <select
                                    className="inline-form-select"
                                    value={flatIdToAllocate}
                                    onChange={(e) => setFlatIdToAllocate(e.target.value)}
                                  >
                                    <option value="">Select an available flat...</option>
                                    {availableFlats.map(flat => (
                                      <option key={flat.id} value={flat.id}>
                                        Flat {flat.flatNumber}
                                      </option>
                                    ))}
                                  </select>
                                  {flatIdError && <span className="inline-form-error" style={{ display: 'block', marginTop: '6px' }}>{flatIdError}</span>}
                                </div>
                              )}

                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-primary" onClick={() => submitReactivate(u)}>
                                  {u.status === "PENDING" ? "✅ Approve Account" : "🔄 Reactivate Account"}
                                </button>
                                <button className="btn btn-secondary" onClick={() => { setReactivateUserId(null); setFlatIdToAllocate(""); setFlatIdError(""); }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '12px' }}>
                              {u.status === "PENDING" ? (
                                <>
                                  <button className="btn btn-success" onClick={() => setReactivateUserId(u.id)}>Approve Request</button>
                                  <button className="btn btn-danger" onClick={() => handleReject(u.id)} disabled={rejectMutation.isPending}>
                                    {rejectMutation.isPending ? "Rejecting..." : "Reject Request"}
                                  </button>
                                </>
                              ) : (
                                userRole === "ROLE_RESIDENT" ? (
                                  <button className="btn btn-primary" onClick={() => setReactivateUserId(u.id)}>Reactivate Account</button>
                                ) : (
                                  <button className="btn btn-success" onClick={() => reactivateNonResident(u)}>Reactivate Environment</button>
                                )
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-3)', textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: '0.4' }}>👤</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--txt-2)' }}>No User Selected</h3>
                <p style={{ margin: 0, fontSize: '14px', maxWidth: '280px' }}>Click on any user from the directory list to perfectly view and manage their detailed card.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
