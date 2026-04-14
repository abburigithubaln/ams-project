import React, { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from "../../utils/axiosConfig";
import "../../components/Admin/AdminShared.css";

import ManageUsers from "../../components/Admin/ManageUsers";
import ManageApartments from "../../components/Admin/ManageApartments";
import ManageMaintenance from "../../components/Admin/ManageMaintenance";
import ManageComplaints from "../../components/Admin/ManageComplaints";
import ManagePolls from "../../components/Admin/Polls";
import ManageFacilities from "../../components/Admin/ManageFacilities";
import ManageClubhouse from "../../components/Admin/ManageClubhouse";
import ManageVisitors from "../../components/Admin/ManageVisitors";
import ManageMoveInOut from "../../components/Admin/ManageMoveInOut";
import ManageParking from "../../components/Admin/ManageParking";
import ManageFeedback from "../../components/Admin/ManageFeedback";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fix Cloudinary URLs: PDFs uploaded as 'image' type need /raw/upload/ path to be viewable
const getReceiptUrl = (url) => {
  if (!url) return url;
  // Ensure HTTPS
  let fixed = url.replace(/^http:\/\//, "https://");
  // PDFs stored under /image/upload/ won't render - fix to /raw/upload/
  if (fixed.toLowerCase().endsWith(".pdf") && fixed.includes("/image/upload/")) {
    fixed = fixed.replace("/image/upload/", "/raw/upload/");
  }
  return fixed;
};

// ── SVG Icons ─────────────────────────────────────────────
const I = ({ d, size = 18, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);
const UserIcon = () => <I d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />;
const GridIcon = () => <I d={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>} />;
const BellIcon = () => <I d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>} />;
const UsersIcon = () => <I d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />;
const WrenchIcon = () => <I d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />;
const BuildingIcon = () => <I d={<><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22V12h6v10" /><rect x="8" y="6" width="3" height="3" rx="0.5" /><rect x="13" y="6" width="3" height="3" rx="0.5" /></>} />;
const FileTextIcon = () => <I d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>} />;
const EyeIcon = () => <I d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>} />;
const CpuIcon = () => <I d={<><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></>} />;
// BarChart2Icon removed as it is unused
const HomeIcon = () => <I d={<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>} />;
const ClubIcon = () => <I d={<><path d="M12 2a5 5 0 0 1 5 5c0 2-1 4-3 5h4a3 3 0 0 1 3 3v1H3v-1a3 3 0 0 1 3-3h4c-2-1-3-3-3-5a5 5 0 0 1 5-5z" /></>} />;
const VoteIcon = () => <I d={<><path d="M3 6h18M3 12h18M3 18h18" /></>} />;
// LogoutIcon removed as it is unused
const CheckIcon = () => <I d="M20 6 9 17 4 12" size={16} />;
const XIcon = () => <I d="M18 6 6 18M6 6l12 12" size={16} />;
const ShieldIcon = () => <I d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const RupeeIcon = () => <I d={<><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M18 13c0-2.8-2.2-5-5-5s-5 2.2-5 5" /><path d="M8 13h10" /></>} />;
// FlashIcon removed as it is unused
const PlusIcon = () => <I d={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />;
const ClockIcon = () => <I d={<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>} />;
// PhoneIcon removed as it is unused
const DoorIcon = () => <I d={<><path d="M13 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" /><path d="M11 21H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" /><path d="M6 12h12" /></>} />;
const CheckCircleIcon = () => <I d={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>} />;

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose(toast.id); }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);
  return (
    <div className={`toast ${toast.type}`}>
      <div className="toast-icon">{toast.type === 'success' ? <CheckIcon /> : <XIcon />}</div>
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        <div className="toast-message">{toast.message}</div>
      </div>
      <button className="toast-close" onClick={() => onClose(toast.id)}>×</button>
    </div>
  );
};

// Toast container component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Queries
  const { data: adminProfile = { username: "", email: "", phone: "", role: "" }, isPending: isProfilePending } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/profile");
      return response.data.data;
    }
  });

  const { data: flats = [] } = useQuery({
    queryKey: ["flats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/flats");
      const d = res.data.data || res.data;
      return Array.isArray(d?.content) ? d.content : (Array.isArray(d) ? d : []);
    }
  });

  const { data: blocks = [] } = useQuery({
    queryKey: ["blocks"],
    queryFn: async () => {
      const res = await axiosInstance.get("/blocks");
      const d = res.data.data || res.data;
      return Array.isArray(d?.content) ? d.content : (Array.isArray(d) ? d : []);
    }
  });

  const { data: apartments = [] } = useQuery({
    queryKey: ["apartments"],
    queryFn: async () => {
      const res = await axiosInstance.get("/apartments");
      const d = res.data.data || res.data;
      return Array.isArray(d?.content) ? d.content : (Array.isArray(d) ? d : []);
    },
    enabled: adminProfile.role === "ROLE_SUPER_ADMIN"
  });

  const { data: notices = [] } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/notices");
      const data = response.data.data || response.data || [];
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: staffData = { active: [], deactivated: [] } } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const [activeRes, deactiveRes] = await Promise.all([
        axiosInstance.get("/admin/staff"),
        axiosInstance.get("/admin/staff/deactivated")
      ]);
      return {
        active: Array.isArray(activeRes.data.data || activeRes.data) ? (activeRes.data.data || activeRes.data) : [],
        deactivated: Array.isArray(deactiveRes.data.data || deactiveRes.data) ? (deactiveRes.data.data || deactiveRes.data) : []
      };
    }
  });

  const staff = staffData.active;
  const deactivatedStaff = staffData.deactivated;

  const { data: visitors = [] } = useQuery({
    queryKey: ["visitors"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/visitors");
      return Array.isArray(response.data.data) ? response.data.data : [];
    }
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/vehicles");
      return Array.isArray(response.data.data) ? response.data.data : [];
    }
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ 
    username: adminProfile.username || "", 
    email: adminProfile.email || "", 
    phone: adminProfile.contactNumber || adminProfile.phone || "" 
  });

  // Sync profile form data when adminProfile is loaded
  useEffect(() => {
    if (adminProfile.username) {
      setProfileFormData({
        username: adminProfile.username,
        email: adminProfile.email,
        phone: adminProfile.contactNumber || adminProfile.phone || ""
      });
    }
  }, [adminProfile]);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  // Old loading state removed as TanStack Query handles it
  // const [loading, setLoading] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const [staffTab, setStaffTab] = useState("active");
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [noticeFormData, setNoticeFormData] = useState({ title: "", description: "", month: "", year: new Date().getFullYear(), type: "NOTICE", eventDate: "", eventLocation: "", rsvpEnabled: false });
  const [staffFormData, setStaffFormData] = useState({ username: "", email: "", phone: "", designation: "SECURITY_GUARD", role: "SECURITY", password: "" });
  const [staffSearch, setStaffSearch] = useState("");
  const [staffSort, setStaffSort] = useState("username");
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);
  const [noticeFile, setNoticeFile] = useState(null);
  const [uploadingNoticeFile, setUploadingNoticeFile] = useState(false);
  const [viewImage, setViewImage] = useState(null);

  const [noticeResponses, setNoticeResponses] = useState({});
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);

  // Form validation errors
  const [noticeErrors, setNoticeErrors] = useState({});
  const [staffErrors, setStaffErrors] = useState({});

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Form validation functions
  const validateNoticeForm = () => {
    const errors = {};
    if (!noticeFormData.title.trim()) {
      errors.title = "Notice title is required";
    }
    if (!noticeFormData.description.trim()) {
      errors.description = "Description is required";
    }
    if (!noticeFormData.month) {
      errors.month = "Month is required";
    }
    setNoticeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStaffForm = () => {
    const errors = {};
    if (!staffFormData.username.trim()) {
      errors.username = "Username is required";
    }
    if (!staffFormData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffFormData.email)) {
      errors.email = "Invalid email format";
    }
    if (!isEditingStaff) {
      if (!staffFormData.password) {
        errors.password = "Password is required";
      } else if (staffFormData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    }
    setStaffErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loadNoticeResponses = async (noticeId) => {
    if (expandedNoticeId === noticeId) {
      setExpandedNoticeId(null);
      return;
    }

    setExpandedNoticeId(noticeId);
    if (!noticeResponses[noticeId]) {
      setLoadingResponses(true);
      try {
        const res = await axiosInstance.get(`/admin/notices/${noticeId}/responses`);
        const data = res.data.data || res.data || [];
        setNoticeResponses(prev => ({ ...prev, [noticeId]: Array.isArray(data) ? data : [] }));
      } catch (err) {
        console.error("Failed to fetch notice responses", err);
      } finally {
        setLoadingResponses(false);
      }
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
      await axiosInstance.put("/admin/update-profile", {
        ...profileFormData,
        profilePictureUrl: imageUrl
      });

      addToast("success", "Success", "Profile picture updated!");
      queryClient.invalidateQueries(["adminProfile"]);
    } catch (err) {
      addToast("error", "Error", "Failed to upload profile picture");
    } finally {
      setUploadingProfilePicture(false);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNoticeModal && noticeModalRef.current && !noticeModalRef.current.contains(event.target)) {
        setShowNoticeModal(false);
        setNoticeErrors({});
      }
      if (showStaffModal && staffModalRef.current && !staffModalRef.current.contains(event.target)) {
        setShowStaffModal(false);
        setStaffErrors({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNoticeModal, showStaffModal]);

  // Modal refs for click outside detection
  const noticeModalRef = useRef(null);
  const staffModalRef = useRef(null);

  // Mutations
  const profileMutation = useMutation({
    mutationFn: (payload) => axiosInstance.put("/admin/update-profile", payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminProfile"]);
      setIsEditingProfile(false);
      addToast("success", "Success", "Profile updated successfully!");
    },
    onError: (error) => {
      addToast("error", "Error", error.response?.data?.message || "Failed to update profile");
    }
  });

  const passwordMutation = useMutation({
    mutationFn: (payload) => axiosInstance.put("/admin/change-password", payload),
    onSuccess: () => {
      addToast("success", "Success", "Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => {
      addToast("error", "Error", error.response?.data?.message || "Failed to change password");
    }
  });

  const noticeMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post("/admin/notices", payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["notices"]);
      addToast("success", "Success", "Notice published successfully!");
      setShowNoticeModal(false);
      setNoticeFormData({
        title: "",
        description: "",
        month: "",
        year: new Date().getFullYear(),
        type: "NOTICE",
        eventDate: "",
        eventLocation: "",
        rsvpEnabled: false
      });
      setNoticeFile(null);
    },
    onError: (error) => {
      addToast("error", "Error", error.response?.data?.message || "Failed to publish notice");
    }
  });

  const deleteNoticeMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/admin/notices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["notices"]);
      addToast("success", "Success", "Notice deleted successfully!");
    },
    onError: () => addToast("error", "Error", "Failed to delete notice")
  });

  const staffMutation = useMutation({
    mutationFn: (payload) => {
      if (isEditingStaff) {
        return axiosInstance.put(`/admin/staff/${editStaffId}`, payload);
      }
      return axiosInstance.post("/admin/staff", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"]);
      addToast("success", "Success", "Staff record updated!");
      closeStaffModal();
    },
    onError: (error) => addToast("error", "Error", error.response?.data?.message || "Operation failed")
  });

  const staffStatusMutation = useMutation({
    mutationFn: ({ id, action }) => axiosInstance.put(`/admin/staff/${id}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"]);
      addToast("success", "Success", "Staff status updated!");
    },
    onError: () => addToast("error", "Error", "Failed to update staff status")
  });

  // Toast helper functions
  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleProfileUpdate = () => {
    profileMutation.mutate({
      username: profileFormData.username,
      email: profileFormData.email,
      contactNumber: profileFormData.phone
    });
  };

  const handlePasswordChange = () => {
    if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      addToast("error", "Error", "Please fill all password fields");
      return;
    }
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      addToast("error", "Error", "New passwords do not match");
      return;
    }
    passwordMutation.mutate(passwordFormData);
  };

  const handleNoticeSubmit = async () => {
    if (!validateNoticeForm()) return;

    let attachmentUrl = "";
    if (noticeFile) {
      setUploadingNoticeFile(true);
      const fileData = new FormData();
      fileData.append("file", noticeFile);
      try {
        const uploadRes = await axiosInstance.post("/files/upload", fileData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        attachmentUrl = uploadRes.data;
      } catch (uploadErr) {
        addToast("error", "Error", "File upload failed.");
      } finally {
        setUploadingNoticeFile(false);
      }
    }

    const payload = { ...noticeFormData, attachmentUrl };
    noticeMutation.mutate(payload);
  };

  const handleNoticeDelete = (id) => deleteNoticeMutation.mutate(id);

  const handleStaffSubmit = () => {
    if (!validateStaffForm()) return;
    staffMutation.mutate({
      username: staffFormData.username,
      email: staffFormData.email,
      contactNumber: staffFormData.phone,
      designation: staffFormData.designation,
      role: staffFormData.role,
      password: staffFormData.password
    });
  };

  const handleStaffDeactivate = (id) => staffStatusMutation.mutate({ id, action: "deactivate" });
  const handleStaffReactivate = (id) => staffStatusMutation.mutate({ id, action: "reactivate" });

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const closeNoticeModal = () => {
    setShowNoticeModal(false);
    setNoticeErrors({});
    setNoticeFormData({ title: "", description: "", month: "", year: new Date().getFullYear() });
  };

  const closeStaffModal = () => {
    setShowStaffModal(false);
    setIsEditingStaff(false);
    setEditStaffId(null);
    setStaffErrors({});
    setStaffFormData({ username: "", email: "", phone: "", designation: "SECURITY_GUARD", role: "SECURITY", password: "" });
    setShowPassword(false);
  };

  const handleEditStaff = (member) => {
    setStaffFormData({
      username: member.username || "",
      email: member.email || "",
      phone: member.contactNumber || "",
      designation: member.designation || "HOUSE KEEPING",
      role: member.role || "SECURITY",
      password: ""
    });
    setEditStaffId(member.id);
    setIsEditingStaff(true);
    setShowStaffModal(true);
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <GridIcon /> },
    { id: "notices", label: "Notices", icon: <BellIcon /> },
    { id: "staff", label: "Staff Management", icon: <UsersIcon /> },
    { id: "manageUsers", label: "Manage Users", icon: <UserIcon /> },
    { id: "manageMaintenance", label: "Maintenance", icon: <WrenchIcon /> },
    { id: "manageApartments", label: "Apartments", icon: <BuildingIcon /> },
    { id: "manageComplaints", label: "Complaints", icon: <FileTextIcon /> },
    { id: "manageParking", label: "Parking", icon: <ShieldIcon /> },
    { id: "manageVisitors", label: "Visitors/Vehicles", icon: <EyeIcon /> },
    { id: "manageFacilities", label: "Facilities", icon: <CpuIcon /> },
    { id: "manageClubhouse", label: "Clubhouse", icon: <ClubIcon /> },
    { id: "managePolls", label: "Polls", icon: <VoteIcon /> },
    { id: "moveInOut", label: "Movement Records", icon: <DoorIcon /> },
    { id: "manageFeedback", label: "Feedback & Support", icon: <FileTextIcon /> },
  ];

  if (isProfilePending) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="loading-spinner"></div>
        <p className="mt-4 text-slate-600 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-primary/10 selection:text-primary">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* SIDEBAR */}
      <aside className={`bg-sidebar text-white flex flex-col shadow-xl z-20 sticky top-0 hidden md:flex h-screen transition-all duration-300 relative ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/10 overflow-hidden">
          <div className="p-2 bg-gradient-to-br from-primary to-indigo-600 rounded-xl shadow-lg shadow-primary/30 shrink-0">
            <BuildingIcon />
          </div>
          {isSidebarOpen && (
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 whitespace-nowrap">Secure Gate</span>
          )}
        </div>

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-8 bg-white text-slate-800 p-1.5 rounded-full shadow-md border border-slate-200 z-50 hover:bg-slate-50 transition-colors hidden md:block"
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto overflow-x-hidden hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {sidebarItems
            .filter(item => {
              if (item.id === "manageApartments" &&
                adminProfile.role !== "ROLE_SUPER_ADMIN" &&
                adminProfile.role !== "ROLE_ADMIN") return false;
              return true;
            })
            .map(item => (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium
                    ${activeView === item.id
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"} ${!isSidebarOpen && 'justify-center'}`}
                onClick={() => setActiveView(item.id)}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <span className={activeView === item.id ? "text-primary" : ""}>{item.icon}</span>
                {isSidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            ))}
        </nav>

        <div className="p-4 border-t border-white/10 flex flex-col gap-3">
          <button className={`w-full py-2 px-4 bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 rounded-xl transition-colors duration-200 text-sm font-semibold flex items-center gap-2 justify-center`}
            onClick={handleLogout}
            title={!isSidebarOpen ? "Logout" : undefined}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            {isSidebarOpen && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-sidebar text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-primary to-indigo-600 rounded-lg">
            <BuildingIcon />
          </div>
          <span className="text-lg font-bold">Secure Gate</span>
        </div>
        {/* Mobile view dropdown / menu toggle button */}
        <button className="p-2" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isSidebarOpen && (
        <div className="md:hidden bg-sidebar/95 backdrop-blur-md fixed inset-0 z-40 p-4 pt-20 overflow-y-auto">
          <button className="absolute top-4 right-4 p-2 text-white/70 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <XIcon />
          </button>
          <div className="space-y-2">
            {sidebarItems
              .filter(item => {
                if (item.id === "manageApartments" &&
                  adminProfile.role !== "ROLE_SUPER_ADMIN" &&
                  adminProfile.role !== "ROLE_ADMIN") return false;
                return true;
              })
              .map(item => (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 text-base font-medium
                      ${activeView === item.id
                      ? "bg-primary/20 text-primary"
                      : "text-slate-300 hover:text-white hover:bg-white/5"}`}
                  onClick={() => { setActiveView(item.id); setIsSidebarOpen(false); }}
                >
                  <span className={activeView === item.id ? "text-primary" : ""}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
          </div>
          <div className="mt-8 border-t border-white/10 pt-8 flex flex-col gap-4">
            <button className="w-full py-3 px-4 bg-red-500/10 text-red-400 rounded-xl font-semibold flex items-center justify-center gap-2" onClick={handleLogout}>
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto no-scrollbar">
        {/* TOP COMPACT HEADER */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 capitalize tracking-tight">{activeView}</h2>
          
          <div
            className="flex items-center gap-3 cursor-pointer p-1.5 pr-4 rounded-full border border-slate-200 hover:border-primary/20 hover:bg-white transition-all bg-white shadow-sm"
            onClick={() => setActiveView("profile")}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm overflow-hidden shrink-0">
              {adminProfile.profilePictureUrl ? (
                <img src={adminProfile.profilePictureUrl} alt="V" className="w-full h-full object-cover" />
              ) : (
                adminProfile.username?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-sm font-bold text-slate-800 leading-none mb-1">{adminProfile.username || "Admin"}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold leading-none">
                {adminProfile.role === "ROLE_SUPER_ADMIN" ? "Super Admin" : "Society Admin"}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full">

        {/* PROFILE SECTION */}
        {activeView === "profile" && (
          <div className="fade-in-up">
            <div className="page-header page-header-container">
              <div>
              </div>
            </div>
            <div className="profile-container">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar-large" style={{ position: 'relative' }}>
                    {adminProfile.profilePictureUrl ? (
                      <img
                        src={adminProfile.profilePictureUrl}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      adminProfile.username?.charAt(0).toUpperCase()
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
                    <h2>{adminProfile.username}</h2>
                    <p className="profile-email">{adminProfile.email}</p>
                    <span className="badge badge-admin">Administrator</span>
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
                      <span>{adminProfile.username}</span>
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
                      <span>{adminProfile.email}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <label>Phone</label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        className="form-input"
                        value={profileFormData.phone}
                        onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                      />
                    ) : (
                      <span>{adminProfile.contactNumber || "Not set"}</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <label>Apartment</label>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      {adminProfile.managedApartmentName || "Not Assigned"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Role</label>
                    <span>Administrator</span>
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

        {/* DASHBOARD SECTION */}
        {activeView === "dashboard" && (
          <div className="fade-in-up">
            <div className="page-header">
            </div>

            <div className="stat-grid">
              {adminProfile.role === 'ROLE_SUPER_ADMIN' && (
                <div className="stat-card">
                  <div className="stat-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}><BuildingIcon /></div>
                  <div className="stat-content">
                    <h3>Total Apartments</h3>
                    <p className="stat-number">{apartments.length}</p>
                  </div>
                </div>
              )}
              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}><HomeIcon /></div>
                <div className="stat-content">
                  <h3>Total Blocks</h3>
                  <p className="stat-number">{blocks.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}><DoorIcon /></div>
                <div className="stat-content">
                  <h3>Total Flats</h3>
                  <p className="stat-number">{flats.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#059669' }}><CheckCircleIcon /></div>
                <div className="stat-content">
                  <h3>Available Flats</h3>
                  <p className="stat-number">{flats.filter(f => f.status === 'AVAILABLE').length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}><UsersIcon /></div>
                <div className="stat-content">
                  <h3>Staff Members</h3>
                  <p className="stat-number">{staff.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}><BellIcon /></div>
                <div className="stat-content">
                  <h3>Active Notices</h3>
                  <p className="stat-number">{notices.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}><EyeIcon /></div>
                <div className="stat-content">
                  <h3>Total Visitors</h3>
                  <p className="stat-number">{visitors.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                    <circle cx="7" cy="17" r="2" />
                    <path d="M9 17h6" />
                    <circle cx="17" cy="17" r="2" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Total Vehicles</h3>
                  <p className="stat-number">{vehicles.length}</p>
                </div>
              </div>
            </div>

            <div className="overview-section no-padding-bottom" style={{ marginBottom: '24px' }}>
              <div className="section-header-flex">
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#2c3e50' }}>⚡ Admin Quick Actions</h3>
                <span className="customize-link" onClick={() => setActiveView("manageUsers")}>Manage System</span>
              </div>
              <div className="quick-actions-mobile-grid">
                <div className="qa-item" onClick={() => setActiveView("manageUsers")}>
                  <div className="qa-icon-container shadow-sm"><UsersIcon /></div>
                  <span className="qa-label">Users</span>
                </div>
                <div className="qa-item" onClick={() => setActiveView("manageMaintenance")}>
                  <div className="qa-icon-container shadow-sm"><RupeeIcon /></div>
                  <span className="qa-label">Billing</span>
                </div>
                <div className="qa-item" onClick={() => setActiveView("manageComplaints")}>
                  <div className="qa-icon-container shadow-sm"><WrenchIcon /></div>
                  <span className="qa-label">Complaints</span>
                </div>
                <div className="qa-item" onClick={() => setActiveView("manageVisitors")}>
                  <div className="qa-icon-container shadow-sm"><ClockIcon /></div>
                  <span className="qa-label">Visitors</span>
                </div>
                <div className="qa-item" onClick={() => setActiveView("manageApartments")}>
                  <div className="qa-icon-container shadow-sm"><BuildingIcon /></div>
                  <span className="qa-label">Units</span>
                </div>
                <div className="qa-item" onClick={() => setActiveView("manageFacilities")}>
                  <div className="qa-icon-container shadow-sm"><ClubIcon /></div>
                  <span className="qa-label">Facilities</span>
                </div>
                <div className="qa-item" onClick={() => setActiveView("notices")}>
                  <div className="qa-icon-container qa-flash shadow-sm"><BellIcon /></div>
                  <span className="qa-label">Notice</span>
                </div>
                <div className="qa-item">
                  <div className="qa-icon-container qa-plus shadow-sm"><PlusIcon /></div>
                  <span className="qa-label">View More</span>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>System Status</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Active Staff:</span>
                    <span className="info-value">{staff.length} Members</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Occupancy Rate:</span>
                    <span className="info-value">{flats.length > 0 ? Math.round(((flats.length - flats.filter(f => f.status === 'AVAILABLE').length) / flats.length) * 100) : 0}%</span>
                  </div>
                </div>

                {/* Occupancy Pie Chart */}
                {flats.length > 0 ? (
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Occupied', value: flats.length - flats.filter(f => f.status === 'AVAILABLE').length },
                            { name: 'Available', value: flats.filter(f => f.status === 'AVAILABLE').length }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell key="cell-0" fill="#4ade80" /> {/* Occupied - Green */}
                          <Cell key="cell-1" fill="#f87171" /> {/* Available - Red */}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <p>No unit data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NOTICES SECTION */}
        {activeView === "notices" && (
          <div className="fade-in-up">
            <div className="page-header page-header-container">
              <div>
              </div>
              <button className="btn btn-primary" onClick={() => setShowNoticeModal(!showNoticeModal)}>
                {showNoticeModal ? '✕ Close Form' : '+ Publish Notice'}
              </button>
            </div>

            {/* Notice Inline Form */}
            {showNoticeModal && (
              <div className="inline-form-card inline-form-notice fade-in-up">
                <div className="inline-form-accent inline-form-accent-notice"></div>
                <div className="inline-form-header">
                  <div className="inline-form-icon inline-form-icon-notice">
                    <span>📢</span>
                  </div>
                  <div>
                    <h3>Publish Notice</h3>
                  </div>
                </div>
                <div className="inline-form-body">
                  <div className="inline-form-grid">
                    <div className={`inline-form-group ${noticeErrors.title ? 'has-error' : ''}`}>
                      <label>Notice Title <span className="required-star">*</span></label>
                      <input
                        type="text"
                        className={`inline-form-input ${noticeErrors.title ? 'error' : ''}`}
                        placeholder="e.g., Monthly Maintenance - January 2024"
                        value={noticeFormData.title}
                        onChange={(e) => {
                          setNoticeFormData({ ...noticeFormData, title: e.target.value });
                          if (noticeErrors.title) setNoticeErrors({ ...noticeErrors, title: '' });
                        }}
                      />
                      {noticeErrors.title && <span className="inline-form-error">{noticeErrors.title}</span>}
                    </div>
                    <div className={`inline-form-group ${noticeErrors.description ? 'has-error' : ''}`}>
                      <label>Description <span className="required-star">*</span></label>
                      <textarea
                        className={`inline-form-input ${noticeErrors.description ? 'error' : ''}`}
                        rows="3"
                        placeholder="Enter notice details, amounts, and any important information..."
                        value={noticeFormData.description}
                        onChange={(e) => {
                          setNoticeFormData({ ...noticeFormData, description: e.target.value });
                          if (noticeErrors.description) setNoticeErrors({ ...noticeErrors, description: '' });
                        }}
                      />
                      {noticeErrors.description && <span className="inline-form-error">{noticeErrors.description}</span>}
                    </div>
                  </div>
                  <div className="inline-form-row">
                    <div className={`inline-form-group ${noticeErrors.month ? 'has-error' : ''}`}>
                      <label>Month <span className="required-star">*</span></label>
                      <select
                        className={`inline-form-select ${noticeErrors.month ? 'error' : ''}`}
                        value={noticeFormData.month}
                        onChange={(e) => {
                          setNoticeFormData({ ...noticeFormData, month: e.target.value });
                          if (noticeErrors.month) setNoticeErrors({ ...noticeErrors, month: '' });
                        }}
                      >
                        <option value="">Select Month</option>
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                      </select>
                      {noticeErrors.month && <span className="inline-form-error">{noticeErrors.month}</span>}
                    </div>
                    <div className="inline-form-group">
                      <label>Year</label>
                      <select
                        className="inline-form-select"
                        value={noticeFormData.year}
                        onChange={(e) => setNoticeFormData({ ...noticeFormData, year: parseInt(e.target.value) })}
                      >
                        <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                        <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                      </select>
                    </div>
                  </div>
                  <div className="inline-form-group" style={{ marginTop: '15px' }}>
                    <label>Notice Type</label>
                    <select
                      className="inline-form-select"
                      value={noticeFormData.type}
                      onChange={(e) => setNoticeFormData({ ...noticeFormData, type: e.target.value })}
                    >
                      <option value="NOTICE">📢 Regular Notice</option>
                      <option value="EVENT">📅 Event Announcement</option>
                    </select>
                  </div>

                  {noticeFormData.type === 'EVENT' && (
                    <div className="inline-form-row" style={{ marginTop: '10px' }}>
                      <div className="inline-form-group">
                        <label>Event Date & Time</label>
                        <input
                          type="datetime-local"
                          className="inline-form-input"
                          value={noticeFormData.eventDate}
                          onChange={(e) => setNoticeFormData({ ...noticeFormData, eventDate: e.target.value })}
                        />
                      </div>
                      <div className="inline-form-group">
                        <label>Venue / Location</label>
                        <input
                          type="text"
                          className="inline-form-input"
                          placeholder="e.g., Community Hall, Rooftop"
                          value={noticeFormData.eventLocation}
                          onChange={(e) => setNoticeFormData({ ...noticeFormData, eventLocation: e.target.value })}
                        />
                      </div>
                      <div className="inline-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '28px' }}>
                        <input
                          type="checkbox"
                          id="rsvpEnabled"
                          checked={noticeFormData.rsvpEnabled}
                          onChange={(e) => setNoticeFormData({ ...noticeFormData, rsvpEnabled: e.target.checked })}
                        />
                        <label htmlFor="rsvpEnabled" style={{ fontWeight: 500, cursor: 'pointer' }}>Enable RSVP for Residents</label>
                      </div>
                    </div>
                  )}

                  <div className="inline-form-group" style={{ marginTop: '15px' }}>
                    <label>Attachment (Optional)</label>
                    <input
                      type="file"
                      className="form-input"
                      onChange={(e) => setNoticeFile(e.target.files[0])}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    {uploadingNoticeFile && <p style={{ fontSize: '12px', color: '#f39c12' }}>Uploading file...</p>}
                  </div>
                  <div className="inline-form-actions">
                    <button className="inline-btn inline-btn-cancel" onClick={closeNoticeModal} disabled={noticeMutation.isPending}>
                      Cancel
                    </button>
                    <button className={`inline-btn inline-btn-submit btn-gradient-orange ${noticeMutation.isPending ? 'btn-loading' : ''}`} onClick={handleNoticeSubmit} disabled={noticeMutation.isPending}>
                      {noticeMutation.isPending ? 'Publishing...' : '📢 Publish Notice'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notices List */}
            <div className="notices-list">
              {notices.length === 0 ? (
                <div className="empty-state">
                  <p>No notices published yet.</p>
                </div>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="notice-item" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="notice-header">
                      <h4>{notice.title}</h4>
                      <div className="notice-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {notice.attachmentUrl && (
                          notice.attachmentUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                            <button className="btn btn-primary btn-sm" onClick={() => setViewImage(notice.attachmentUrl)}>
                              🖼️ View Image
                            </button>
                          ) : (
                            <a
                              href={getReceiptUrl(notice.attachmentUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm"
                            >
                              📎 Attachment
                            </a>
                          )
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={() => loadNoticeResponses(notice.id)}>
                          {expandedNoticeId === notice.id ? "Hide Responses" : "View Responses"}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleNoticeDelete(notice.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{notice.description}</p>

                    <div className="notice-meta">
                      <span>{notice.month} {notice.year}</span>
                      {notice.type === 'EVENT' && (
                        <>
                          <span>•</span>
                          <span style={{ color: '#27ae60', fontWeight: 600 }}>👥 {notice.rsvpCount || 0} Attending</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>

                    {expandedNoticeId === notice.id && (
                      <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #3498db' }}>
                        <h5 style={{ marginBottom: '10px', fontSize: '14px', color: '#2c3e50' }}>Resident Responses:</h5>
                        {loadingResponses && !noticeResponses[notice.id] ? (
                          <div style={{ fontSize: '13px', color: '#7f8c8d' }}>Loading responses...</div>
                        ) : noticeResponses[notice.id]?.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {noticeResponses[notice.id].map(resp => (
                              <div key={resp.id} style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                  <strong style={{ fontSize: '13px', color: '#2c3e50' }}>{resp.residentName} (Flat {resp.flatNumber})</strong>
                                  <span style={{ fontSize: '11px', color: '#95a5a6' }}>{new Date(resp.createdAt).toLocaleString()}</span>
                                </div>
                                <p style={{ fontSize: '13px', margin: 0, color: '#34495e' }}>{resp.responseText}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: '13px', color: '#7f8c8d' }}>No responses from residents yet.</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STAFF MANAGEMENT SECTION */}
        {activeView === "staff" && (
          <div className="fade-in-up">
            <div className="page-header page-header-container">
              <div>
              </div>
              <button className="btn btn-gradient-blue" onClick={() => setShowStaffModal(!showStaffModal)}>
                {showStaffModal ? '✕ Close Form' : '+ Add Staff Member'}
              </button>
            </div>

            {/* Staff Inline Form */}
            {showStaffModal && (
              <div className="inline-form-card inline-form-staff fade-in-up">
                <div className="inline-form-accent inline-form-accent-staff"></div>
                <div className="inline-form-header">
                  <div className="inline-form-icon inline-form-icon-staff">
                    <span>👨‍💼</span>
                  </div>
                  <div>
                    <h3>{isEditingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</h3>
                    <p>{isEditingStaff ? 'Update staff member details' : 'Register a new team member'}</p>
                  </div>
                </div>
                <div className="inline-form-body">
                  <div className="inline-form-row">
                    <div className={`inline-form-group ${staffErrors.username ? 'has-error' : ''}`}>
                      <label>Username <span className="required-star">*</span></label>
                      <input
                        type="text"
                        className={`inline-form-input ${staffErrors.username ? 'error' : ''}`}
                        placeholder="Enter username"
                        value={staffFormData.username}
                        onChange={(e) => {
                          setStaffFormData({ ...staffFormData, username: e.target.value });
                          if (staffErrors.username) setStaffErrors({ ...staffErrors, username: '' });
                        }}
                      />
                      {staffErrors.username && <span className="inline-form-error">{staffErrors.username}</span>}
                    </div>
                    <div className={`inline-form-group ${staffErrors.email ? 'has-error' : ''}`}>
                      <label>Email <span className="required-star">*</span></label>
                      <input
                        type="email"
                        className={`inline-form-input ${staffErrors.email ? 'error' : ''}`}
                        placeholder="name@example.com"
                        value={staffFormData.email}
                        onChange={(e) => {
                          setStaffFormData({ ...staffFormData, email: e.target.value });
                          if (staffErrors.email) setStaffErrors({ ...staffErrors, email: '' });
                        }}
                      />
                      {staffErrors.email && <span className="inline-form-error">{staffErrors.email}</span>}
                    </div>
                  </div>
                  <div className="inline-form-row">
                    <div className="inline-form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        className="inline-form-input"
                        placeholder="+91 XXXXX XXXXX"
                        value={staffFormData.phone}
                        onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                      />
                    </div>
                    <div className="inline-form-group">
                      <label>Designation</label>
                      <select
                        className="inline-form-select"
                        value={staffFormData.designation}
                        onChange={(e) => setStaffFormData({ ...staffFormData, designation: e.target.value })}
                      >
                        <option value="SECURITY_GUARD">🛡️ Security Guard</option>
                        <option value="SECURITY_SUPERVISOR">🎖️ Security Supervisor</option>
                        <option value="FACILITY_MANAGER">🏢 Facility Manager</option>
                        <option value="ADMIN_STAFF">📋 Admin Staff</option>
                        <option value="ACCOUNTANT">💰 Accountant</option>
                        <option value="MAINTENANCE">🔧 Maintenance Staff</option>
                        <option value="HOUSE_KEEPING">🏠 House Keeper</option>
                        <option value="CLEANING">🧹 Cleaning Staff</option>
                        <option value="ELECTRICIAN">⚡ Electrician</option>
                        <option value="PLUMBER">🚰 Plumber</option>
                        <option value="GARDENER">🌿 Gardener</option>
                        <option value="LIFT_OPERATOR">🛗 Lift Operator</option>
                        <option value="GYM_INSTRUCTOR">🏋️ Gym Instructor</option>
                        <option value="POOL_MAINTENANCE">🏊 Pool Maintenance</option>
                        <option value="PEST_CONTROL">🦟 Pest Control Staff</option>
                        <option value="WASTE_MANAGEMENT">♻️ Waste Management</option>
                        <option value="FIRE_SAFETY">🔥 Fire Safety Officer</option>
                      </select>
                    </div>
                  </div>
                  <div className="inline-form-row">
                    {!isEditingStaff && (
                      <div className={`inline-form-group ${staffErrors.password ? 'has-error' : ''}`}>
                        <label>Password <span className="required-star">*</span></label>
                        <div className="inline-password-wrapper">
                          <input
                            type={showPassword ? "text" : "password"}
                            className={`inline-form-input ${staffErrors.password ? 'error' : ''}`}
                            placeholder="Minimum 6 characters"
                            value={staffFormData.password}
                            onChange={(e) => {
                              setStaffFormData({ ...staffFormData, password: e.target.value });
                              if (staffErrors.password) setStaffErrors({ ...staffErrors, password: '' });
                            }}
                          />
                          <button
                            type="button"
                            className="inline-password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? '🙈' : '👁️'}
                          </button>
                        </div>
                        {staffErrors.password && <span className="inline-form-error">{staffErrors.password}</span>}
                      </div>
                    )}
                    <div className="inline-form-group" style={{ alignSelf: 'flex-end' }}>
                      {/* spacer for alignment */}
                    </div>
                  </div>

                  <div className="inline-form-actions">
                    <button className="inline-btn inline-btn-cancel" onClick={closeStaffModal} disabled={staffMutation.isPending}>
                      Cancel
                    </button>
                    <button className={`inline-btn inline-btn-submit btn-gradient-blue ${staffMutation.isPending ? 'btn-loading' : ''}`} onClick={handleStaffSubmit} disabled={staffMutation.isPending}>
                      {staffMutation.isPending ? (isEditingStaff ? 'Updating...' : 'Adding...') : (isEditingStaff ? '✏️ Update Staff' : '➕ Add Staff Member')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Staff List Tabs */}
            <div className="action-group tab-container" style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className={`btn ${staffTab === "active" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setStaffTab("active")}
                >
                  Active Staff ({staff.length})
                </button>
                <button
                  className={`btn ${staffTab === "deactivated" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setStaffTab("deactivated")}
                >
                  Deactivated ({deactivatedStaff.length})
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '300px', justifyContent: 'flex-end' }}>
                <input
                  type="text"
                  className="inline-form-input"
                  style={{ maxWidth: '250px' }}
                  placeholder="Filter by name or designation..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                />
                <select
                  className="inline-form-select"
                  style={{ width: 'auto' }}
                  value={staffSort}
                  onChange={(e) => setStaffSort(e.target.value)}
                >
                  <option value="username">Sort by Name</option>
                  <option value="designation">Sort by Designation</option>
                </select>
              </div>
            </div>

            {/* Staff List */}
            <div className="staff-grid">
              {(() => {
                const currentStaff = staffTab === "active" ? staff : deactivatedStaff;
                const filtered = currentStaff
                  .filter(s =>
                  (s.username?.toLowerCase().includes(staffSearch.toLowerCase()) ||
                    s.designation?.toLowerCase().includes(staffSearch.toLowerCase()))
                  )
                  .sort((a, b) => {
                    const valA = staffSort === "username" ? (a.username || "") : (a.designation || "");
                    const valB = staffSort === "username" ? (b.username || "") : (b.designation || "");
                    return valA.localeCompare(valB);
                  });

                if (filtered.length === 0) {
                  return (
                    <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                      <p>{staffSearch ? "No matching staff found." : `No ${staffTab} staff members found.`}</p>
                    </div>
                  );
                }

                return filtered.map((member) => (
                  <div key={member.id} className={`staff-card ${staffTab === "deactivated" ? "deactivated-card" : ""}`}>
                    <div className="staff-avatar" style={{ filter: staffTab === "deactivated" ? 'grayscale(100%)' : 'none' }}>
                      {member.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="staff-info">
                      <h4>{member.username}</h4>
                      <p className="staff-email">{member.email}</p>
                      <p className="staff-designation">{member.designation || "No designation"}</p>
                      <p className="staff-phone">{member.contactNumber || "No phone"}</p>
                      {staffTab === "deactivated" ? (
                        <span className="badge badge-inactive">DEACTIVATED</span>
                      ) : (
                        member.role && !member.role.toUpperCase().includes('SECURITY') && (
                          <span className={`badge badge-${member.role.toLowerCase().replace('role_', '')}`}>
                            {member.role.replace('ROLE_', '')}
                          </span>
                        )
                      )}
                    </div>
                    <div className="staff-actions" style={{ display: 'flex', gap: '8px' }}>
                      {staffTab === "active" && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditStaff(member)}>
                          Edit
                        </button>
                      )}
                      {staffTab === "active" ? (
                        <button className="btn btn-warning btn-sm" onClick={() => handleStaffDeactivate(member.id)}>
                          Deactivate
                        </button>
                      ) : (
                        <button className="btn btn-success btn-sm" onClick={() => handleStaffReactivate(member.id)}>
                          Reactivate
                        </button>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* COMPONENT ROUTING */}
        {activeView === "manageUsers" && <ManageUsers />}
        {activeView === "manageMaintenance" && (
          <ManageMaintenance
            flats={flats}
            apartments={apartments}
            blocks={blocks}
            staff={staff}
          />
        )}
        {activeView === "manageApartments" && (
          <ManageApartments
            admin={adminProfile}
            apartments={apartments}
            blocks={blocks}
            flats={flats}
            loadApartments={() => queryClient.invalidateQueries(["apartments"])}
            loadBlocks={() => queryClient.invalidateQueries(["blocks"])}
            loadFlats={() => queryClient.invalidateQueries(["flats"])}
          />
        )}
        {activeView === "manageComplaints" && <ManageComplaints />}

        {activeView === "manageParking" && <ManageParking />}

        {activeView === "manageFacilities" && <ManageFacilities />}

        {activeView === "manageClubhouse" && <ManageClubhouse />}

        {activeView === "manageVisitors" && <ManageVisitors />}

        {activeView === "managePolls" && (
          <ManagePolls />
        )}

        {activeView === "moveInOut" && <ManageMoveInOut />}

        {activeView === "manageFeedback" && <ManageFeedback />}
        </div>
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
