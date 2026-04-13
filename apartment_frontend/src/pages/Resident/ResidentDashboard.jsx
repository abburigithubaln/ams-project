import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";
import { jsPDF } from "jspdf";
import "../../components/Admin/AdminShared.css";

import ResidentPolls from "../../components/Resident/Polls";
import Facilities from "../../components/Resident/Facilities";
import ClubhouseBookings from "../../components/Resident/ClubhouseBookings";
import ResidentParking from "../../components/Resident/ResidentParking";
import ResidentVisitors from "../../components/Resident/ResidentVisitors";

// Fix old Cloudinary PDF URLs uploaded under /image/upload/ — must be served from /raw/upload/
const getReceiptUrl = (url) => {
  if (!url) return url;
  let fixed = url.replace(/^http:\/\//, "https://");
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
const UserIconSVG = () => <I d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />;
const GridIconSVG = () => <I d={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>} />;
const HomeIconSVG = () => <I d={<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>} />;
const BellIconSVG = () => <I d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>} />;
const VoteIconSVG = () => <I d={<><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><polyline points="9 21 9 9" /></>} />;
const PoolIconSVG = () => <I d={<><path d="M2 12h20M2 17h20M7 12V7a5 5 0 0 1 10 0v5" /></>} />;
const ClubIconSVG = () => <I d={<><path d="M8 3a4 4 0 0 1 8 0" /><path d="M4 14h16" /><path d="M12 3v11" /><path d="M4 21h16a1 1 0 0 0 0-7H4a1 1 0 0 0 0 7z" /></>} />;
const BriefIconSVG = () => <I d={<><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>} />;
const WrenchIconSVG = () => <I d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />;
const FileIconSVG = () => <I d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>} />;
const RupeeIconSVG = () => <I d={<><path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M18 13c0-2.8-2.2-5-5-5s-5 2.2-5 5" /><path d="M8 13h10" /></>} />;
const ShieldCheckIconSVG = () => <I d={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></>} />;
const PhoneCallIconSVG = () => <I d={<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></>} />;
const FlashIconSVG = () => <I d={<><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></>} />;
const CarIconSVG = () => <I d={<><rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>} />;
const PlusIconSVG = () => <I d={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />;
const BookIconSVG = () => <I d={<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>} />;
const HelpCircleIconSVG = () => <I d={<><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>} />;
const MessageSquareIconSVG = () => <I d={<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>} />;

export default function ResidentDashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [flat, setFlat] = useState(null);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [noticeResponses, setNoticeResponses] = useState({});
  const [rsvpedNotices, setRsvpedNotices] = useState(new Set());
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);
  const [responseInputs, setResponseInputs] = useState({});
  const [submittingResponseFor, setSubmittingResponseFor] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentRef, setPaymentRef] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [aadharFile, setAadharFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [viewImage, setViewImage] = useState(null);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showExtendedSOS, setShowExtendedSOS] = useState(false);
  const [maintenanceTab, setMaintenanceTab] = useState("invoices");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ title: "", description: "", type: "FEEDBACK" });
  const [feedbacks, setFeedbacks] = useState([]);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    username: "",
    email: "",
    contactNumber: "",
    aadharUrl: "",
    panCardUrl: ""
  });
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintData, setComplaintData] = useState({ title: "", description: "", category: "GENERAL", priority: "MEDIUM" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [complaintFile, setComplaintFile] = useState(null);
  const [uploadingComplaintFile, setUploadingComplaintFile] = useState(false);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const navigate = useNavigate();

  // Toast notifications state (matching AdminDashboard)
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  // Convenience wrapper used throughout this component
  const showToast = (message, type = 'success') => {
    addToast(type, type === 'error' ? 'Error' : 'Success', message);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const [serviceRequests, setServiceRequests] = useState([]);
  const [serviceCharges, setServiceCharges] = useState({});
  const [showServiceRequestModal, setShowServiceRequestModal] = useState(false);
  const [serviceRequestFormData, setServiceRequestFormData] = useState({
    serviceType: "PLUMBER",
    description: "",
    preferredSlot: ""
  });
  const [raisingServiceRequest, setRaisingServiceRequest] = useState(false);

  // Form validation errors empty




  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get("/user/profile");
      const profileData = response.data.data;
      setUser(profileData);
      setProfileFormData({
        username: profileData.username || "",
        email: profileData.email || "",
        contactNumber: profileData.contactNumber || "",
        aadharUrl: profileData.aadharUrl || "",
        panCardUrl: profileData.panCardUrl || "",
        profilePictureUrl: profileData.profilePictureUrl || ""
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
      await axiosInstance.put("/user/profile", {
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

  const fetchMyFlat = async () => {
    try {
      const response = await axiosInstance.get("/user/flat");
      setFlat(response.data.data);
    } catch (error) {
      console.error("Error fetching flat:", error);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const response = await axiosInstance.get("/user/maintenance");
      const data = response.data.data;
      setMaintenanceList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching maintenance:", error);
    }
  };


  const fetchComplaints = async () => {
    try {
      const response = await axiosInstance.get("/user/complaints");
      const data = response.data.data;
      // Filter out old feedback/support items that might be in the complaints table
      const filteredComplaints = (Array.isArray(data) ? data : []).filter(
        c => c.category !== 'FEEDBACK' && c.category !== 'SUPPORT'
      );
      setComplaints(filteredComplaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await axiosInstance.get("/user/feedback");
      setFeedbacks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };


  const fetchNotices = async () => {
    try {
      const response = await axiosInstance.get("/user/notices");
      const data = response.data.data || [];
      setNotices(Array.isArray(data) ? data : []);

      // Synchronize RSVP status from backend
      const rsvped = new Set();
      data.forEach(n => {
        if (n.userHasRsvped) rsvped.add(n.id);
      });
      setRsvpedNotices(rsvped);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };


  const fetchStaff = async () => {
    try {
      const response = await axiosInstance.get("/user/staff");
      const data = response.data.data;
      setStaffList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const res = await axiosInstance.get("/user/maintenance-requests");
      setServiceRequests(res.data.data || []);

      const chargesRes = await axiosInstance.get("/maintenance-requests/charges");
      setServiceCharges(chargesRes.data.data || {});
    } catch (err) {
      console.error("Error fetching service requests:", err);
    }
  };

  // ── Bootstrap: load all data on mount ─────────────────────
  useEffect(() => {
    fetchProfile();
    fetchMyFlat();
    fetchMaintenance();
    fetchComplaints();
    fetchNotices();
    fetchStaff();
    fetchServiceRequests();
    fetchFeedbacks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRaiseServiceRequest = async (e) => {
    e.preventDefault();
    if (!serviceRequestFormData.description.trim()) {
      showToast("Please enter a description", "error");
      return;
    }
    setRaisingServiceRequest(true);
    try {
      await axiosInstance.post("/user/maintenance-requests", {
        ...serviceRequestFormData,
        flatId: flat?.id
      });
      showToast("Service request raised successfully!");
      setShowServiceRequestModal(false);
      setServiceRequestFormData({ serviceType: "PLUMBER", description: "", preferredSlot: "" });
      fetchServiceRequests();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to raise request", "error");
    } finally {
      setRaisingServiceRequest(false);
    }
  };

  const cancelServiceRequest = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await axiosInstance.put(`/user/maintenance-requests/${id}/cancel`);
      showToast("Request cancelled successfully!");
      fetchServiceRequests();
    } catch (err) {
      showToast("Failed to cancel request", "error");
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setUploadingDocs(true);
      let aadharUrl = profileFormData.aadharUrl;
      let panCardUrl = profileFormData.panCardUrl;

      if (aadharFile) {
        const formData = new FormData();
        formData.append("file", aadharFile);
        const res = await axiosInstance.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        aadharUrl = res.data;
      }

      if (panFile) {
        const formData = new FormData();
        formData.append("file", panFile);
        const res = await axiosInstance.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        panCardUrl = res.data;
      }

      const updatedData = { ...profileFormData, aadharUrl, panCardUrl };
      await axiosInstance.put("/user/profile", updatedData);
      setUser({ ...user, ...updatedData });
      setProfileFormData(updatedData);
      setIsEditingProfile(false);
      setAadharFile(null);
      setPanFile(null);
      showToast("Profile updated successfully!");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setUploadingDocs(false);
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
      await axiosInstance.put("/user/change-password", passwordFormData);
      showToast("Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to change password", "error");
    }
  };

  const handleComplaintSubmit = async () => {
    if (!complaintData.title.trim()) {
      showToast("Please enter a complaint title", "error");
      return;
    }

    setUploadingComplaintFile(true);
    try {
      let imageUrl = "";
      if (complaintFile) {
        const formData = new FormData();
        formData.append("file", complaintFile);
        const uploadRes = await axiosInstance.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        imageUrl = uploadRes.data;
      }

      await axiosInstance.post("/user/complaints", { ...complaintData, imageUrl });
      showToast("Complaint submitted successfully!");
      setShowComplaintModal(false);
      setComplaintData({ title: "", description: "", category: "GENERAL", priority: "MEDIUM" });
      setComplaintFile(null);
      fetchComplaints();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to submit complaint", "error");
    } finally {
      setUploadingComplaintFile(false);
    }
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
        const res = await axiosInstance.get(`/user/notices/${noticeId}/responses`);
        const data = res.data.data || res.data || [];
        setNoticeResponses(prev => ({ ...prev, [noticeId]: Array.isArray(data) ? data : [] }));
      } catch (err) {
        console.error("Failed to fetch notice responses", err);
      } finally {
        setLoadingResponses(false);
      }
    }
  };

  const submitNoticeResponse = async (noticeId) => {
    const text = responseInputs[noticeId];
    if (!text || !text.trim()) {
      showToast("Response cannot be empty", "error");
      return;
    }

    setSubmittingResponseFor(noticeId);
    try {
      await axiosInstance.post(`/user/notices/${noticeId}/responses`, { responseText: text });
      showToast("Response submitted successfully!");
      setResponseInputs(prev => ({ ...prev, [noticeId]: "" }));

      // Reload responses
      const res = await axiosInstance.get(`/user/notices/${noticeId}/responses`);
      const data = res.data.data || res.data || [];
      setNoticeResponses(prev => ({ ...prev, [noticeId]: Array.isArray(data) ? data : [] }));
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to submit response", "error");
    } finally {
      setSubmittingResponseFor(null);
    }
  };

  const downloadInvitationPDF = (notice) => {
    const doc = new jsPDF();

    // Header background
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 50, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.text("EVENT INVITATION", 105, 32, { align: "center" });

    doc.setTextColor(44, 62, 80);
    doc.setFontSize(22);
    doc.text(notice.title, 105, 75, { align: "center" });

    doc.setFontSize(14);
    doc.text(`Dear ${user?.username || "Resident"},`, 20, 100);
    doc.setFontSize(13);
    doc.text("You are cordially invited to our upcoming community event.", 20, 112);

    // Details Box
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(1);
    doc.roundedRect(15, 125, 180, 45, 3, 3);

    doc.setTextColor(41, 128, 185);
    doc.setFontSize(15);
    doc.text(`📅 Date & Time: ${new Date(notice.eventDate).toLocaleString()}`, 25, 142);
    doc.text(`📍 Venue: ${notice.eventLocation}`, 25, 158);

    doc.setTextColor(44, 62, 80);
    doc.setFontSize(12);
    doc.text("Description:", 20, 188);
    const splitDesc = doc.splitTextToSize(notice.description, 170);
    doc.text(splitDesc, 20, 198);

    // Footer
    doc.setLineWidth(0.3);
    doc.line(20, 260, 190, 260);
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generated by AMS Resident Portal on ${new Date().toLocaleDateString()}`, 105, 272, { align: "center" });
    doc.text("Please carry a digital or printed copy of this invitation.", 105, 278, { align: "center" });

    doc.save(`${notice.title.replace(/\s+/g, '_')}_Invitation.pdf`);
    showToast("Downloaded invitation PDF!");
  };

  const generateReceiptPDF = (record) => {
    const doc = new jsPDF();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    // Header gradient block
    doc.setFillColor(39, 174, 96);
    doc.rect(0, 0, 210, 55, 'F');
    doc.setFillColor(46, 204, 113);
    doc.rect(0, 40, 210, 15, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text('PAYMENT RECEIPT', 105, 28, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Apartment Management System', 105, 42, { align: 'center' });

    // Receipt number badge
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 65, 182, 40, 4, 4, 'F');
    doc.setTextColor(39, 174, 96);
    doc.setFontSize(11);
    doc.text('RECEIPT NO.', 20, 78);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${record.id}`, 20, 95);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(127, 140, 141);
    doc.text('STATUS', 130, 78);
    doc.setFontSize(16);
    doc.setTextColor(39, 174, 96);
    doc.text('✓ PAID', 130, 95);

    // Resident and flat info
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Resident Details', 20, 122);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Name: ${user?.username || 'Resident'}`, 20, 132);
    doc.text(`Email: ${user?.email || 'N/A'}`, 20, 141);
    doc.text(`Flat: ${flat?.flatNumber || 'N/A'}  |  Block: ${flat?.blockName || 'N/A'}`, 20, 150);

    // Divider
    doc.setDrawColor(236, 240, 241);
    doc.setLineWidth(0.5);
    doc.line(20, 158, 190, 158);

    // Payment details table
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details', 20, 170);
    doc.setFont('helvetica', 'normal');

    const rows = [
      ['Billing Period', `${monthNames[record.month - 1]} ${record.year}`],
      ['Due Date', record.dueDate || 'N/A'],
      ['Paid On', record.paidDate || new Date().toLocaleDateString()],
      ['Payment Method', (record.paymentMethod || 'N/A').replace('_', ' ')],
      ['Base Amount', `Rs. ${record.amount?.toFixed(2)}`],
      ...(record.interest > 0 ? [['Late Interest', `Rs. ${record.interest?.toFixed(2)}`]] : []),
    ];

    let y = 182;
    rows.forEach(([label, value], i) => {
      doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 249 : 255, i % 2 === 0 ? 250 : 255);
      doc.rect(14, y - 7, 182, 12, 'F');
      doc.setTextColor(127, 140, 141);
      doc.setFontSize(10);
      doc.text(label, 20, y);
      doc.setTextColor(44, 62, 80);
      doc.text(value, 140, y);
      y += 13;
    });

    // Total box
    doc.setFillColor(39, 174, 96);
    doc.roundedRect(14, y + 4, 182, 22, 4, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL PAID', 20, y + 18);
    doc.text(`Rs. ${(record.totalAmount || record.amount)?.toFixed(2)}`, 140, y + 18);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(149, 165, 166);
    doc.line(20, 270, 190, 270);
    doc.text('This is a system-generated receipt. No signature required.', 105, 278, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 284, { align: 'center' });

    doc.save(`Receipt_${monthNames[record.month-1]}_${record.year}_Flat${flat?.flatNumber || ''}.pdf`);
    showToast('Receipt downloaded!');
  };

  const handleMarkAsPaid = async () => {
    if (!selectedMaintenance) return;
    try {
      let receiptUrl = "";

      if (receiptFile) {
        setUploadingReceipt(true);
        const formData = new FormData();
        formData.append("file", receiptFile);

        const uploadRes = await axiosInstance.post("/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        receiptUrl = uploadRes.data;
        setUploadingReceipt(false);
      }

      await axiosInstance.put(`/user/maintenance/${selectedMaintenance.id}/mark-paid?paymentMethod=${paymentMethod}${receiptUrl ? `&receiptUrl=${encodeURIComponent(receiptUrl)}` : ''}`);
      showToast("Payment confirmed successfully! 🎉");
      setShowPaymentModal(false);
      setReceiptFile(null);
      setPaymentStep(1);
      setPaymentRef("");
      fetchMaintenance();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to mark as paid", "error");
      setUploadingReceipt(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: <GridIconSVG /> },
    { id: "myFlat", label: "My Flat", icon: <HomeIconSVG /> },
    { id: "notices", label: "Notices & Events", icon: <BellIconSVG /> },
    { id: "polls", label: "Polls", icon: <VoteIconSVG /> },
    { id: "facilities", label: "Facilities", icon: <PoolIconSVG /> },
    { id: "clubhouse", label: "Clubhouse", icon: <ClubIconSVG /> },
    { id: "parking", label: "My Parking", icon: <CarIconSVG /> },
    { id: "visitors", label: "Visitors & Passes", icon: <UserIconSVG /> },
    { id: "staff", label: "Contact Staff", icon: <BriefIconSVG /> },
    { id: "maintenance", label: "Maintenance Fees", icon: <RupeeIconSVG /> },
    { id: "serviceRequests", label: "Service Requests", icon: <WrenchIconSVG /> },
    { id: "complaints", label: "Complaints", icon: <FileIconSVG /> },
    { id: "societyRules", label: "Society Rules", icon: <BookIconSVG /> },
    { id: "faq", label: "Help & FAQ", icon: <HelpCircleIconSVG /> },
    { id: "feedback", label: "Feedback & Support", icon: <MessageSquareIconSVG /> },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { class: "badge-pending", label: "Pending" },
      RESOLVED: { class: "badge-resolved", label: "Resolved" },
      IN_PROGRESS: { class: "badge-progress", label: "In Progress" },
      PAID: { class: "badge-paid", label: "Paid" },
      OVERDUE: { class: "badge-overdue", label: "Overdue" },
      ACCEPTED: { class: "badge-resolved", label: "Accepted" },
      COMPLETED: { class: "badge-paid", label: "Completed" },
      CANCELLED: { class: "badge-cancelled", label: "Cancelled" }
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
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-primary/10 selection:text-primary no-scrollbar">
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      {/* Toast Container (matching Admin) */}
      <div className="toast-container fixed top-4 right-4 z-[9999] flex flex-col gap-3">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type} shadow-2xl p-4 rounded-2xl flex items-center gap-3 min-w-[320px] max-w-[420px] animate-slideInRight border-l-4`}>
            <div className={`toast-icon w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold`}>
              {toast.type === 'success' ? '✅' : '❌'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight mb-1">{toast.title || (toast.type === 'success' ? 'Success' : 'Error')}</div>
              <div className="text-xs leading-relaxed text-slate-700">{toast.message}</div>
            </div>
            <button 
              className="text-slate-500 hover:text-slate-900 p-1 rounded-full hover:bg-slate-200 transition-all ml-2 text-xl leading-none"
              onClick={() => removeToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* SIDEBAR */}
      <aside className={`bg-sidebar text-white flex flex-col shadow-xl z-20 sticky top-0 hidden md:flex h-screen transition-all duration-300 relative ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/10 overflow-hidden">
          <div className="p-2.5 bg-gradient-to-br from-primary to-indigo-600 rounded-xl shadow-lg shadow-primary/30 shrink-0">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.243 4.257a.75.75 0 00-1.06 1.06L5.439 9H2.75a.75.75 0 000 1.5h3.189l-2.256 3.683a.75.75 0 001.06 1.06l3.683-2.256V15.5a.75.75 0 001.5 0v-3.189l3.683 2.256a.75.75 0 001.06-1.06L13.311 11h3.189a.75.75 0 000-1.5h-3.189l2.256-3.683a.75.75 0 00-1.06-1.06L13.311 6H10.56l-2.317-3.683a.75.75 0 00-1 0z" clipRule="evenodd" />
            </svg>
          </div>
          {isSidebarOpen && (
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 whitespace-nowrap">Resident Portal</span>
              <span className="text-xs block tracking-wide opacity-75 mt-0.5">SecureGate AMS</span>
            </div>
          )}
        </div>

        {/* Desktop Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-8 bg-white text-slate-800 p-1.5 rounded-full shadow-md border border-slate-200 z-50 hover:bg-slate-50 transition-colors hidden md:block"
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto overflow-x-hidden no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium
                  ${activeView === item.id
                  ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"} ${!isSidebarOpen && 'justify-center'}`}
              onClick={() => setActiveView(item.id)}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <span>{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 border border-red-500/20 hover:border-red-500/30"
            onClick={handleLogout}
            title={!isSidebarOpen ? "Logout" : undefined}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"></path>
            </svg>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto no-scrollbar">
        {/* Compact TOP HEADER (matching Admin exactly) */}
        <header className="bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 capitalize tracking-tight">
            {activeView.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </h2>
          
          <div
            className="flex items-center gap-3 p-2 pr-4 rounded-full border border-slate-200 hover:border-primary hover:bg-slate-50 transition-all cursor-pointer bg-white shadow-sm"
            onClick={() => setActiveView("profile")}
          >
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md overflow-hidden relative">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.username?.charAt(0)?.toUpperCase() || 'R'
              )}
            </div>
            {isSidebarOpen && (
              <div className="text-right hidden lg:block">
                <div className="text-sm font-bold text-slate-900 leading-tight">{user?.username || "Resident"}</div>
                <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">Flat Resident</div>
              </div>
            )}
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full">
          {/* All view content sections */}
          {activeView === "polls" && (
            <div className="fade-in-up">
              <ResidentPolls />
            </div>
          )}

          {activeView === "facilities" && <Facilities />}

          {activeView === "clubhouse" && <ClubhouseBookings />}

          {activeView === "parking" && <ResidentParking />}

          {activeView === "visitors" && <ResidentVisitors />}

        {/* PROFILE SECTION - Shown immediately on login */}
        {activeView === "profile" && (
          <div className="fade-in-up">
            <div className="page-header">
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
                    <span className="badge badge-resident">Resident</span>
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
                    <label>Status</label>
                    <span className="badge badge-active">{user?.status || "Active"}</span>
                  </div>
                  <div className="detail-row">
                    <label>Apartment</label>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      {user?.managedApartmentName || "Not Assigned"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Unit Details</label>
                    <span>
                      {user?.flatNumber ? `Flat ${user.flatNumber} (${user.blockName} Block)` : "Not Allotted"}
                    </span>
                  </div>

                  {/* Aadhar & PAN Card Details */}
                  <div className="detail-row">
                    <label>Aadhar Card</label>
                    {isEditingProfile ? (
                      <div className="file-input-wrapper">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => setAadharFile(e.target.files[0])}
                          className="file-input"
                        />
                        {profileFormData.aadharUrl && <span className="current-file">Current: [Available]</span>}
                      </div>
                    ) : (
                      user?.aadharUrl ? (
                        <a href={getReceiptUrl(user.aadharUrl)} target="_blank" rel="noopener noreferrer" className="doc-link">
                          📄 View Aadhar
                        </a>
                      ) : <span className="no-doc">Not Uploaded</span>
                    )}
                  </div>

                  <div className="detail-row">
                    <label>PAN Card</label>
                    {isEditingProfile ? (
                      <div className="file-input-wrapper">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => setPanFile(e.target.files[0])}
                          className="file-input"
                        />
                        {profileFormData.panCardUrl && <span className="current-file">Current: [Available]</span>}
                      </div>
                    ) : (
                      user?.panCardUrl ? (
                        <a href={getReceiptUrl(user.panCardUrl)} target="_blank" rel="noopener noreferrer" className="doc-link">
                          💳 View PAN Card
                        </a>
                      ) : <span className="no-doc">Not Uploaded</span>
                    )}
                  </div>

                  {isEditingProfile && (
                    <div className="profile-actions">
                      <button className="btn btn-success" onClick={handleProfileUpdate} disabled={uploadingDocs}>
                        {uploadingDocs ? "Uploading..." : "Save Changes"}
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
            </div>

            {/* Quick Actions Mobile Grid */}
            <div className="overview-section no-padding-bottom">
              <div className="section-header-flex">
                <h3>⚡ Quick Actions</h3>
                <span className="customize-link">Customize</span>
              </div>
              <div className="quick-actions-mobile-grid">
                <div className="qa-item" onClick={() => setActiveView("maintenance")}>
                  <div className="qa-icon-container shadow-sm"><RupeeIconSVG /></div>
                  <span className="qa-label">Payments</span>
                </div>
                <div className="qa-item" onClick={() => setActiveView("complaints")}>
                  <div className="qa-icon-container shadow-sm"><WrenchIconSVG /></div>
                  <span className="qa-label">Helpdesk</span>
                </div>
                <div className="qa-item" onClick={() => setActiveView("notices")}>
                  <div className="qa-icon-container shadow-sm">
                    <BellIconSVG />
                    <div className="qa-badge-dot">9+</div>
                  </div>
                  <span className="qa-label">Posts</span>
                </div>
                <div className="qa-item" onClick={() => setActiveView("staff")}>
                  <div className="qa-icon-container shadow-sm"><ShieldCheckIconSVG /></div>
                  <span className="qa-label">Security</span>
                </div>
                <div className="qa-item" onClick={() => setActiveView("staff")}>
                  <div className="qa-icon-container shadow-sm"><PhoneCallIconSVG /></div>
                  <span className="qa-label">Directory</span>
                </div>
                <div className="qa-item" onClick={() => setActiveView("clubhouse")}>
                  <div className="qa-icon-container shadow-sm"><ClubIconSVG /></div>
                  <span className="qa-label">Clubhouse</span>
                </div>
                <div className="qa-item" onClick={() => setShowSOSModal(true)}>
                  <div className="qa-icon-container qa-flash shadow-sm"><FlashIconSVG /></div>
                  <span className="qa-label">SOS</span>
                </div>
                <div className="qa-item" onClick={() => { setShowSOSModal(true); setShowExtendedSOS(true); }}>
                  <div className="qa-icon-container qa-plus shadow-sm"><PlusIconSVG /></div>
                  <span className="qa-label">View More</span>
                </div>
              </div>
            </div>

            {/* Flat Info Summary */}
            <div className="overview-section">
              <div className="section-header-flex">
                <h3>🏠 Your Flat Details</h3>
                <span className="badge badge-active">{user?.managedApartmentName || flat?.apartmentName || "AMS Complex"}</span>
              </div>
              <div className="info-cards-grid">
                <div className="info-card">
                  <div className="info-card-icon">🚪</div>
                  <div className="info-card-content">
                    <h3>Number & Type</h3>
                    <p>{flat?.flatNumber || "N/A"} ({flat?.type || "Standard"})</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">🏢</div>
                  <div className="info-card-content">
                    <h3>Block & Floor</h3>
                    <p>{flat?.blockName || "N/A"} (Floor {flat?.floorNumber || "0"})</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">👤</div>
                  <div className="info-card-content">
                    <h3>Status</h3>
                    <p>{flat?.ownershipStatus || "Resident"}</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">📅</div>
                  <div className="info-card-content">
                    <h3>Move-In Date</h3>
                    <p>{flat?.moveInDate || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Summary */}
            <div className="overview-section">
              <h3>🔧 Maintenance Status</h3>
              {maintenanceList.length > 0 ? (() => {
                const latestMaintenance = maintenanceList[maintenanceList.length - 1];
                return (
                  <div className="maintenance-card">
                    <div className="maintenance-header">
                      <h3>Latest Record ({latestMaintenance.month}/{latestMaintenance.year})</h3>
                      {getStatusBadge(latestMaintenance.paymentStatus)}
                    </div>
                    <div className="maintenance-details">
                      <div className="detail-item">
                        <label>Base Amount</label>
                        <span>₹{latestMaintenance.amount}</span>
                      </div>
                      <div className="detail-item">
                        <label>Overdue Interest</label>
                        <span style={{ color: latestMaintenance.interest > 0 ? '#e74c3c' : 'inherit' }}>
                          ₹{latestMaintenance.interest || 0}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Total To Pay</label>
                        <span className="amount">₹{latestMaintenance.totalAmount || latestMaintenance.amount}</span>
                      </div>
                      <div className="detail-item">
                        <label>Due Date</label>
                        <span>{latestMaintenance.dueDate}</span>
                      </div>
                      {latestMaintenance.paymentStatus === "PAID" && (
                        <div className="detail-item">
                          <label>Payment Method</label>
                          <span className="badge badge-collected">{latestMaintenance.paymentMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })() : (
                <div className="empty-state-small">
                  <p>No maintenance records found.</p>
                </div>
              )}
            </div>

            {/* Complaints Summary */}
            <div className="overview-section">
              <h3>📝 Recent Complaints</h3>
              <div className="complaints-summary">
                {complaints.length === 0 ? (
                  <div className="empty-state-small">
                    <p>No complaints submitted yet.</p>
                  </div>
                ) : (
                  complaints.slice(0, 3).map((complaint) => (
                    <div key={complaint.id} className="complaint-item-small">
                      <div className="complaint-item-header">
                        <h4>{complaint.title}</h4>
                        {getStatusBadge(complaint.status)}
                      </div>
                      <p>{complaint.description?.substring(0, 100)}...</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notices Summary */}
            <div className="overview-section">
              <h3>📢 Recent Notices</h3>
              <div className="notices-summary">
                {notices.length === 0 ? (
                  <div className="empty-state-small">
                    <p>No notices available.</p>
                  </div>
                ) : (
                  notices.slice(0, 3).map((notice) => (
                    <div key={notice.id} className="notice-item-small">
                      <h4>{notice.title}</h4>
                      <p>{notice.description?.substring(0, 100)}...</p>
                      <span className="notice-date">{notice.month} {notice.year}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* MY FLAT SECTION */}
        {activeView === "myFlat" && (
          <div className="fade-in-up">
            <div className="page-header">
            </div>

            <div className="admin-card mt-0" style={{ padding: '0' }}>
              <div className="card-header-banner" style={{
                height: '140px',
                background: 'linear-gradient(135deg, #3498db, #2c3e50)',
                borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
                display: 'flex',
                alignItems: 'center',
                padding: '0 40px',
                color: 'white'
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '28px' }}>Flat {flat?.flatNumber}</h2>
                  <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>{user?.managedApartmentName || flat?.apartmentName || "Apartment Management System"}</p>
                </div>
              </div>

              <div style={{ padding: '40px' }}>
                <div className="info-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                  <div className="info-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px' }}>
                    <div className="info-card-icon" style={{ background: '#ebf8ff', color: '#3182ce' }}>🏘️</div>
                    <div className="info-card-content">
                      <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#718096', marginBottom: '8px' }}>Building & Structure</h3>
                      <p style={{ fontSize: '18px', fontWeight: 600 }}>{flat?.blockName} Block, Floor {flat?.floorNumber}</p>
                    </div>
                  </div>

                  <div className="info-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px' }}>
                    <div className="info-card-icon" style={{ background: '#faf5ff', color: '#805ad5' }}>📐</div>
                    <div className="info-card-content">
                      <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#718096', marginBottom: '8px' }}>Flat Type & Size</h3>
                      <p style={{ fontSize: '18px', fontWeight: 600 }}>{flat?.type} ({flat?.unitSize || "N/A"})</p>
                    </div>
                  </div>

                  <div className="info-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px' }}>
                    <div className="info-card-icon" style={{ background: '#f0fff4', color: '#38a169' }}>🔖</div>
                    <div className="info-card-content">
                      <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#718096', marginBottom: '8px' }}>Ownership Status</h3>
                      <p style={{ fontSize: '18px', fontWeight: 600 }}>{flat?.ownershipStatus || "Resident"}</p>
                    </div>
                  </div>

                  <div className="info-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px' }}>
                    <div className="info-card-icon" style={{ background: '#fffaf0', color: '#dd6b20' }}>🚚</div>
                    <div className="info-card-content">
                      <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#718096', marginBottom: '8px' }}>Tenure Details</h3>
                      <p style={{ fontSize: '15px', fontWeight: 600 }}>
                        In: {flat?.moveInDate || "N/A"}<br />
                        Out: {flat?.moveOutDate || "Active"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-40" style={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px dashed #cbd5e1'
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569' }}>
                    <span>ℹ️</span>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      These details are verified by the management office. If you notice any biological discrepancies, please contact the admin desk.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTICES SECTION */}
        {activeView === "notices" && (
          <div className="fade-in-up">
            <div className="page-header">
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        {notice.type === 'EVENT' && (
                          <span style={{ background: '#e8f4fd', color: '#2980b9', borderRadius: '12px', padding: '2px 10px', fontSize: '11px', fontWeight: 700 }}>📅 EVENT</span>
                        )}
                        <h4 style={{ margin: 0 }}>{notice.title}</h4>
                      </div>
                      <div className="notice-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {notice.type === 'EVENT' && notice.rsvpEnabled && (
                          <button
                            className={`btn btn-sm ${rsvpedNotices.has(notice.id) ? 'btn-success' : 'btn-primary'}`}
                            onClick={async () => {
                              try {
                                const isRSVPing = !rsvpedNotices.has(notice.id);
                                await axiosInstance.post(`/user/notices/${notice.id}/rsvp`);

                                setRsvpedNotices(prev => {
                                  const next = new Set(prev);
                                  if (next.has(notice.id)) next.delete(notice.id);
                                  else next.add(notice.id);
                                  return next;
                                });

                                if (isRSVPing) {
                                  showToast('RSVP recorded!');
                                  downloadInvitationPDF(notice);
                                } else {
                                  showToast('RSVP cancelled');
                                }
                                fetchNotices();
                              } catch { showToast('RSVP failed', 'error'); }
                            }}
                          >
                            {rsvpedNotices.has(notice.id) ? '✅ RSVPed' : '🙋 RSVP'}
                          </button>
                        )}
                        {notice.type === 'EVENT' && rsvpedNotices.has(notice.id) && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => downloadInvitationPDF(notice)}
                            title="Download Invitation"
                          >
                            📥 Invitation
                          </button>
                        )}
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
                              download
                              className="btn btn-secondary btn-sm"
                            >
                              ⬇️ Download
                            </a>
                          )
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={() => loadNoticeResponses(notice.id)}>
                          {expandedNoticeId === notice.id ? "Hide Responses" : "View Responses"}
                        </button>
                      </div>
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{notice.description}</p>

                    {notice.type === 'EVENT' && (notice.eventDate || notice.eventLocation) && (
                      <div style={{ background: '#eaf4fb', borderRadius: '8px', padding: '10px 14px', marginTop: '8px', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px' }}>
                        {notice.eventDate && (
                          <span>📅 <strong>Date:</strong> {new Date(notice.eventDate).toLocaleString()}</span>
                        )}
                        {notice.eventLocation && (
                          <span>📍 <strong>Venue:</strong> {notice.eventLocation}</span>
                        )}
                      </div>
                    )}

                    <div className="notice-meta">
                      <span>{notice.month} {notice.year}</span>
                      <span>•</span>
                      <span>Published: {new Date(notice.createdAt).toLocaleDateString()}</span>
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
                          <div style={{ fontSize: '13px', color: '#7f8c8d' }}>No responses yet. Be the first to respond!</div>
                        )}

                        {/* Submit Response Box */}
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ flex: 1 }}
                            placeholder="Type your response or query..."
                            value={responseInputs[notice.id] || ""}
                            onChange={(e) => setResponseInputs(prev => ({ ...prev, [notice.id]: e.target.value }))}
                          />
                          <button
                            className="btn btn-primary"
                            onClick={() => submitNoticeResponse(notice.id)}
                            disabled={submittingResponseFor === notice.id}
                          >
                            {submittingResponseFor === notice.id ? "Sending..." : "Send"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STAFF SECTION */}
        {activeView === "staff" && (
          <div className="fade-in-up mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffList.length === 0 ? (
                <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                  <p className="text-lg font-medium">No staff contacts available at the moment.</p>
                </div>
              ) : (
                staffList
                  .map((staffMember) => (
                    <div key={staffMember.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-100 overflow-hidden flex flex-col">
                      <div className="p-6 flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                            {staffMember.designation === 'HOUSE KEEPING' || staffMember.designation === 'CLEANING' ? '🧹' :
                              staffMember.designation === 'MAINTENANCE' || staffMember.designation === 'ELECTRICIAN' ? '🔧' : '🛡️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-800 truncate">{staffMember.username}</h3>
                            <p className="text-sm text-indigo-600 font-semibold mb-3 tracking-wide uppercase">{staffMember.designation || "Staff"}</p>
                            
                            <div className="space-y-2 mt-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                    <span className="truncate">{staffMember.contactNumber || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    <span className="truncate">{staffMember.email || "N/A"}</span>
                                </div>
                            </div>
                          </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* MAINTENANCE SECTION */}
        {activeView === "maintenance" && (
          <div className="fade-in-up">
            <div className="page-header">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{
                  background: maintenanceList.filter(r => r.paymentStatus !== 'PAID').length > 0 ? '#fee2e2' : '#d4edda',
                  color: maintenanceList.filter(r => r.paymentStatus !== 'PAID').length > 0 ? '#991b1b' : '#155724',
                  padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600
                }}>
                  {maintenanceList.filter(r => r.paymentStatus !== 'PAID').length > 0
                    ? `${maintenanceList.filter(r => r.paymentStatus !== 'PAID').length} Pending`
                    : '✓ All Paid'}
                </span>
              </div>
            </div>

            {/* Summary Cards */}
            {maintenanceList.length > 0 && (() => {
              const paid = maintenanceList.filter(r => r.paymentStatus === 'PAID');
              const pending = maintenanceList.filter(r => r.paymentStatus !== 'PAID');
              const totalDue = pending.reduce((s, r) => s + (r.totalAmount || r.amount || 0), 0);
              const totalPaid = paid.reduce((s, r) => s + (r.totalAmount || r.amount || 0), 0);
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderLeft: '4px solid #3498db' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Total Bills</p>
                    <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#2c3e50' }}>{maintenanceList.length}</p>
                  </div>
                  <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderLeft: '4px solid #27ae60' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Amount Paid</p>
                    <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#27ae60' }}>₹{totalPaid.toFixed(0)}</p>
                  </div>
                  <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderLeft: '4px solid #e74c3c' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Amount Due</p>
                    <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#e74c3c' }}>₹{totalDue.toFixed(0)}</p>
                  </div>
                </div>
              );
            })()}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '10px', padding: '4px', marginBottom: '20px', width: 'fit-content' }}>
              {['invoices', 'history'].map(tab => (
                <button key={tab} onClick={() => setMaintenanceTab(tab)} style={{
                  padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                  background: maintenanceTab === tab ? 'white' : 'transparent',
                  color: maintenanceTab === tab ? '#2c3e50' : '#7f8c8d',
                  boxShadow: maintenanceTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}>
                  {tab === 'invoices' ? '🧾 Monthly Invoices' : '📜 Payment History'}
                </button>
              ))}
            </div>

            {/* INVOICES TAB */}
            {maintenanceTab === 'invoices' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {maintenanceList.length === 0 ? (
                  <div className="empty-state"><p>No invoices found.</p></div>
                ) : (
                  maintenanceList.map(record => {
                    const isPaid = record.paymentStatus === 'PAID';
                    const isOverdue = record.paymentStatus === 'OVERDUE';
                    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                    const monthName = monthNames[(record.month - 1)] || record.month;
                    return (
                      <div key={record.id} style={{
                        background: 'white', borderRadius: '14px', padding: '24px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        border: `1px solid ${isPaid ? '#d4edda' : isOverdue ? '#f8d7da' : '#e9ecef'}`,
                        display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap'
                      }}>
                        {/* Month Badge */}
                        <div style={{
                          background: isPaid ? 'linear-gradient(135deg,#27ae60,#2ecc71)' : isOverdue ? 'linear-gradient(135deg,#e74c3c,#c0392b)' : 'linear-gradient(135deg,#3498db,#2980b9)',
                          color: 'white', borderRadius: '12px', padding: '16px 20px', minWidth: '80px', textAlign: 'center', flexShrink: 0
                        }}>
                          <div style={{ fontSize: '22px', fontWeight: 800 }}>{monthName}</div>
                          <div style={{ fontSize: '13px', opacity: 0.85 }}>{record.year}</div>
                        </div>
                        {/* Details */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '16px', color: '#2c3e50' }}>Invoice #{record.id}</span>
                            {getStatusBadge(record.paymentStatus)}
                          </div>
                          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '13px', color: '#7f8c8d' }}>
                            <span>Base: <strong style={{ color: '#2c3e50' }}>₹{record.amount}</strong></span>
                            {record.interest > 0 && <span style={{ color: '#e74c3c' }}>Interest: <strong>₹{record.interest}</strong></span>}
                            <span>Total: <strong style={{ color: '#2c3e50', fontSize: '15px' }}>₹{record.totalAmount || record.amount}</strong></span>
                            <span>Due: <strong style={{ color: isOverdue ? '#e74c3c' : '#2c3e50' }}>{record.dueDate || 'N/A'}</strong></span>
                            {isPaid && <span>Paid: <strong style={{ color: '#27ae60' }}>{record.paidDate}</strong></span>}
                            {isPaid && record.paymentMethod && <span>Via: <strong>{record.paymentMethod.replace('_', ' ')}</strong></span>}
                          </div>
                        </div>
                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
                          {!isPaid && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ borderRadius: '8px', padding: '8px 18px', fontWeight: 600 }}
                              onClick={() => { setSelectedMaintenance(record); setPaymentStep(1); setPaymentMethod('UPI'); setPaymentRef(''); setShowPaymentModal(true); }}
                            >
                              💳 Pay Now
                            </button>
                          )}
                          {isPaid && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ borderRadius: '8px', padding: '8px 16px', fontWeight: 600 }}
                              onClick={() => generateReceiptPDF(record)}
                            >
                              📥 Download Receipt
                            </button>
                          )}
                          {isPaid && record.receiptUrl && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ borderRadius: '8px', padding: '8px 16px', fontWeight: 600 }}
                              onClick={() => window.open(getReceiptUrl(record.receiptUrl), '_blank')}
                            >
                              🧾 View Upload
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* PAYMENT HISTORY TAB */}
            {maintenanceTab === 'history' && (
              <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                {maintenanceList.filter(r => r.paymentStatus === 'PAID').length === 0 ? (
                  <div className="empty-state"><p>No payment history yet.</p></div>
                ) : (
                  <table className="visitor-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Period</th>
                        <th>Amount Paid</th>
                        <th>Payment Date</th>
                        <th>Method</th>
                        <th>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceList.filter(r => r.paymentStatus === 'PAID').map(record => (
                        <tr key={record.id}>
                          <td><strong>#{record.id}</strong></td>
                          <td>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][record.month-1]} {record.year}</td>
                          <td><strong style={{ color: '#27ae60' }}>₹{record.totalAmount || record.amount}</strong></td>
                          <td>{record.paidDate || '-'}</td>
                          <td>
                            <span style={{ background: '#e8f4fd', color: '#2980b9', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                              {record.paymentMethod?.replace('_', ' ') || '-'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ borderRadius: '8px', fontSize: '12px' }}
                              onClick={() => generateReceiptPDF(record)}
                            >
                              📥 Download
                            </button>
                            {record.receiptUrl && (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ borderRadius: '8px', fontSize: '12px', marginLeft: '6px' }}
                                onClick={() => window.open(getReceiptUrl(record.receiptUrl), '_blank')}
                              >
                                🧾 View
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}


        {/* SERVICE REQUESTS SECTION */}
        {activeView === "serviceRequests" && (
          <div className="fade-in-up">
            <div className="page-header page-header-container">
              <div>
              </div>
              <button className="btn btn-primary" onClick={() => setShowServiceRequestModal(!showServiceRequestModal)}>
                {showServiceRequestModal ? '✕ Close Form' : '+ Request Service'}
              </button>
            </div>

            {/* Service Request Inline Form */}
            {showServiceRequestModal && (
              <div className="inline-form-card inline-form-maintenance fade-in-up mb-24">
                <div className="inline-form-accent accent-blue"></div>
                <div className="inline-form-header">
                  <div className="inline-form-icon icon-blue">
                    <span>🔧</span>
                  </div>
                  <div>
                    <h3>Request a Service</h3>
                    <p>Select a service and provide details</p>
                  </div>
                </div>
                <div className="inline-form-body">
                  <form onSubmit={handleRaiseServiceRequest}>
                    <div className="inline-form-row">
                      <div className="inline-form-group">
                        <label>Service Type <span className="required-star">*</span></label>
                        <select
                          className="inline-form-select"
                          value={serviceRequestFormData.serviceType}
                          onChange={(e) => setServiceRequestFormData({ ...serviceRequestFormData, serviceType: e.target.value })}
                        >
                          <option value="PLUMBER">Plumber</option>
                          <option value="ELECTRICIAN">Electrician</option>
                          <option value="HOUSEKEEPING">Housekeeping</option>
                          <option value="PEST_CONTROL">Pest Control</option>
                          <option value="OTHERS">Others</option>
                        </select>
                      </div>
                      <div className="inline-form-group">
                        <label>Basic Charges</label>
                        <div className="inline-form-input readonly-input" style={{ background: '#f8f9fa', display: 'flex', alignItems: 'center', paddingLeft: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>
                          ₹{serviceCharges[serviceRequestFormData.serviceType] || 0}
                        </div>
                      </div>
                    </div>
                    <div className="inline-form-row">
                      <div className="inline-form-group wide-group">
                        <label>Preferred Timing / Slot</label>
                        <input
                          type="text"
                          className="inline-form-input"
                          placeholder="e.g. Tomorrow 10 AM - 12 PM"
                          value={serviceRequestFormData.preferredSlot}
                          onChange={(e) => setServiceRequestFormData({ ...serviceRequestFormData, preferredSlot: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="inline-form-row">
                      <div className="inline-form-group wide-group">
                        <label>Description <span className="required-star">*</span></label>
                        <textarea
                          className="inline-form-input"
                          rows="3"
                          placeholder="Describe the issue or service needed..."
                          value={serviceRequestFormData.description}
                          onChange={(e) => setServiceRequestFormData({ ...serviceRequestFormData, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="inline-form-actions">
                      <button type="button" className="inline-btn inline-btn-cancel" onClick={() => setShowServiceRequestModal(false)}>Cancel</button>
                      <button type="submit" className="inline-btn inline-btn-submit" disabled={raisingServiceRequest}>
                        {raisingServiceRequest ? 'Raising...' : 'Raise Request'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Service Requests List */}
            <div className="admin-card mt-0">
              <h3 className="section-title">My Service Requests</h3>
              {serviceRequests.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Description</th>
                      <th>Charges</th>
                      <th>Status</th>
                      <th>Requested Slot</th>
                      <th>Allocated Slot</th>
                      <th>Staff</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRequests.map(req => (
                      <tr key={req.id}>
                        <td><strong>{req.serviceType}</strong></td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.description}>
                          {req.description}
                        </td>
                        <td>₹{req.basicCharges}</td>
                        <td>{getStatusBadge(req.status)}</td>
                        <td>{req.preferredSlot || "-"}</td>
                        <td>{req.allocatedSlot || "-"}</td>
                        <td>{req.assignedStaffName || "-"}</td>
                        <td>
                          {req.status === "PENDING" && (
                            <button className="btn btn-danger btn-sm" onClick={() => cancelServiceRequest(req.id)}>Cancel</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>No service requests found.</p>
                </div>
              )}
            </div>
          </div>
        )}


        {/* COMPLAINTS SECTION */}
        {activeView === "complaints" && (
          <div className="fade-in-up">
            <div className="page-header page-header-container">
              <div>
              </div>
              <button className="btn btn-primary" onClick={() => setShowComplaintModal(!showComplaintModal)}>
                {showComplaintModal ? '✕ Close Form' : '+ Raise Complaint'}
              </button>
            </div>

            {/* Complaint Inline Form */}
            {showComplaintModal && (
              <div className="inline-form-card inline-form-complaint fade-in-up mb-24">
                <div className="inline-form-accent accent-red"></div>
                <div className="inline-form-header">
                  <div className="inline-form-icon icon-red">
                    <span>📝</span>
                  </div>
                  <div>
                    <h3>Raise a Complaint</h3>
                    <p>Submit a new issue or request to administration</p>
                  </div>
                </div>
                <div className="inline-form-body">
                  <div className="inline-form-row">
                    <div className="inline-form-group wide-group">
                      <label>Title <span className="required-star">*</span></label>
                      <input
                        type="text"
                        className="inline-form-input"
                        placeholder="Enter complaint title"
                        value={complaintData.title}
                        onChange={(e) => setComplaintData({ ...complaintData, title: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="inline-form-row">
                    <div className="inline-form-group wide-group">
                      <label>Description <span className="required-star">*</span></label>
                      <textarea
                        className="inline-form-input"
                        rows="3"
                        placeholder="Describe your complaint in detail..."
                        value={complaintData.description}
                        onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="inline-form-row">
                    <div className="inline-form-group">
                      <label>Category <span className="required-star">*</span></label>
                      <select
                        className="inline-form-select"
                        value={complaintData.category}
                        onChange={(e) => setComplaintData({ ...complaintData, category: e.target.value })}
                      >
                        <option value="GENERAL">General</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="NOISE">Noise</option>
                        <option value="SECURITY">Security</option>
                        <option value="CLEANLINESS">Cleanliness</option>
                      </select>
                    </div>
                    <div className="inline-form-group">
                      <label>Priority <span className="required-star">*</span></label>
                      <select
                        className="inline-form-select"
                        value={complaintData.priority}
                        onChange={(e) => setComplaintData({ ...complaintData, priority: e.target.value })}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="inline-form-row">
                    <div className="inline-form-group wide-group">
                      <label>Attach Photo (Optional)</label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setComplaintFile(e.target.files[0])}
                          className="inline-form-input"
                          style={{ padding: '8px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => document.querySelector('input[type="file"][accept="image/*"]').click()}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          📷 Take Photo
                        </button>
                      </div>
                      {complaintFile && <p style={{ fontSize: '12px', color: '#2ecc71', marginTop: '5px' }}>📎 {complaintFile.name} selected</p>}
                    </div>
                  </div>
                  <div className="inline-form-actions">
                    <button className="inline-btn inline-btn-cancel" onClick={() => setShowComplaintModal(false)}>
                      Cancel
                    </button>
                    <button className="inline-btn inline-btn-submit btn-gradient-blue" onClick={handleComplaintSubmit} disabled={uploadingComplaintFile}>
                      {uploadingComplaintFile ? '⌛ Submitting...' : '📝 Submit Complaint'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Complaints List */}
            <div className="complaints-list">
              {complaints.length === 0 ? (
                <div className="empty-state">
                  <p>No complaints submitted yet.</p>
                </div>
              ) : (
                complaints.map((complaint) => (
                  <div key={complaint.id} className="complaint-item">
                    <div className="complaint-item-header">
                      <h4>{complaint.title}</h4>
                      {getStatusBadge(complaint.status)}
                    </div>
                    <p>{complaint.description}</p>
                    <div className="complaint-meta">
                      <span>{complaint.category}</span>
                      <span>•</span>
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                      {complaint.imageUrl && (
                        <>
                          <span>•</span>
                          <button
                            className="btn-link"
                            style={{ color: 'var(--primary)', border: 'none', background: 'none', padding: 0, fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => setViewImage(complaint.imageUrl)}
                          >
                            🖼️ View Photo
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SOCIETY RULES SECTION */}
        {activeView === "societyRules" && (
          <div className="fade-in-up">
            <div className="page-header">
            </div>

            {/* Hero Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1a252f 0%, #2c3e50 100%)',
              borderRadius: '16px', padding: '32px 36px', marginBottom: '28px', color: 'white',
              display: 'flex', alignItems: 'center', gap: '24px'
            }}>
              <div style={{ fontSize: '52px', flexShrink: 0 }}>📖</div>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '22px' }}>AMS Society Rulebook</h2>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '14px', maxWidth: '500px', lineHeight: '1.6' }}>
                  These rules are designed to maintain a peaceful, clean, and harmonious environment for all residents.
                  Compliance is mandatory and ensures the well-being of our community.
                </p>
              </div>
            </div>

            {/* Rules from Admin Notices (type=RULES) or defaults */}
            {(() => {
              const ruleNotices = notices.filter(n => n.type === 'RULES' || (n.type === 'NOTICE' && n.title?.toLowerCase().includes('rule')));
              const defaultRules = [
                { id: 'r1', icon: '🔇', title: 'Noise & Quiet Hours', body: 'Residents must maintain silence between 10:00 PM and 6:00 AM. Loud music, parties, or any activity causing noise disturbance is strictly prohibited during these hours.' },
                { id: 'r2', icon: '🐾', title: 'Pet Policy', body: 'Pets are allowed within flats but must be kept on a leash in common areas. Owners are responsible for cleaning after their pets. All pets must be registered with management.' },
                { id: 'r3', icon: '🚗', title: 'Parking Rules', body: 'Each flat is allocated designated parking slots. No vehicle shall be parked in another resident slot, fire zones, or visitor-only areas. Visitor parking requests must be pre-approved.' },
                { id: 'r4', icon: '🗑️', title: 'Waste Management', body: 'Garbage must be disposed in the designated collection bins only. Wet and dry waste must be segregated. Littering in common areas, corridors, or lift lobbies is strictly prohibited.' },
                { id: 'r5', icon: '🏊', title: 'Common Area Usage', body: 'Common amenities (pool, gym, clubhouse) are available from 6:00 AM to 10:00 PM. Residents must carry their ID card. No food or beverages are allowed inside the pool area.' },
                { id: 'r6', icon: '🔧', title: 'Maintenance & Repairs', body: 'Any renovation or repair work within a flat must be reported to management. Work is permitted only on weekdays between 9:00 AM and 7:00 PM. Common infrastructure must not be tampered with.' },
                { id: 'r7', icon: '👥', title: 'Guest Policy', body: 'Residents are responsible for the conduct of their guests. Guests staying for more than 7 days must be registered with management. All guests must check in at the security gate.' },
                { id: 'r8', icon: '💰', title: 'Maintenance Fee Payment', body: 'Maintenance fees are due by the 15th of every month. A late fee of 5% per month is applicable for delayed payments. Persistent defaulters may face suspension of common area access.' },
              ];

              if (ruleNotices.length > 0) {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {ruleNotices.map((notice, i) => (
                      <div key={notice.id} style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: '4px solid #3498db' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                          <div style={{ background: '#ebf5fb', color: '#2980b9', borderRadius: '10px', padding: '10px 14px', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '16px' }}>{notice.title}</h4>
                            <p style={{ margin: 0, color: '#555', lineHeight: '1.7', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{notice.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                  {defaultRules.map((rule, i) => (
                    <div key={rule.id} style={{ background: 'white', borderRadius: '14px', padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e9ecef', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{ fontSize: '28px', flexShrink: 0 }}>{rule.icon}</div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}>Rule {i + 1}</span>
                            <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '14px', fontWeight: 700 }}>{rule.title}</h4>
                          </div>
                          <p style={{ margin: 0, color: '#555', lineHeight: '1.65', fontSize: '13px' }}>{rule.body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '12px', padding: '16px 20px', marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <p style={{ margin: 0, fontSize: '13px', color: '#856404', lineHeight: '1.6' }}>
                <strong>Notice:</strong> Violation of society rules may result in penalties, suspension of amenity access, or escalation to the management committee.
                For any queries, please contact the admin office or use the{' '}
                <button onClick={() => setActiveView('feedback')} style={{ background: 'none', border: 'none', color: '#856404', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600, padding: 0, fontSize: '13px' }}>Feedback &amp; Support</button> section.
              </p>
            </div>
          </div>
        )}

        {/* FAQ SECTION */}
        {activeView === "faq" && (
          <div className="fade-in-up">
            <div className="page-header">
            </div>

            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '14px', padding: '28px 32px', marginBottom: '28px', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🙋</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>How can we help you?</h3>
              <p style={{ margin: 0, opacity: 0.85, fontSize: '14px' }}>Browse the FAQs below. Still stuck? Use Feedback &amp; Support to reach us directly.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { q: 'How do I pay my maintenance fee online?', a: 'Go to Maintenance Fees in the sidebar, click "Pay Now" on any pending invoice, choose UPI / Net Banking / Card, enter details and confirm. A receipt is generated automatically.' },
                { q: 'Can I download a payment receipt?', a: 'Yes! Once a payment is PAID, a "Download Receipt" button appears on the invoice card and in the Payment History tab. Click it to download a formatted PDF receipt.' },
                { q: 'How do I pre-approve a visitor?', a: 'Go to Visitors & Passes, click "Pre-Approve Visitor", fill in visitor name, phone, and purpose. An OTP is generated that security will use to verify the visitor at the gate.' },
                { q: 'How do I book a clubhouse or facility?', a: 'Navigate to Clubhouse or Facilities from the sidebar. Select your preferred date and time slot and submit. The admin will confirm your booking.' },
                { q: 'How do I raise a service request (plumber, electrician, etc.)?', a: 'Go to Service Requests in the sidebar, click "Request Service", choose service type, describe the issue, and provide a preferred time slot. Staff will be assigned promptly.' },
                { q: 'How do I report a complaint or issue?', a: 'Navigate to Complaints in the sidebar, click "Raise Complaint", fill in the title, description, category and priority. You can also attach a photo. Admin will review and update the status.' },
                { q: 'What are the maintenance bill due dates?', a: 'Maintenance bills are generated monthly. The due date is typically 15 days into the following month (e.g., March bill is due by April 15th). A 5% monthly interest may apply for late payments.' },
                { q: 'How do I update my profile or contact details?', a: 'Click "My Profile" in the sidebar, click "Edit Profile", update your username, email, phone number, or upload documents like Aadhar/PAN, then click Save Changes.' },
                { q: 'How do I participate in a poll?', a: 'Go to Polls in the sidebar to see all active polls. Click on a poll to expand it, select your preferred option and submit. Results are shown in real-time.' },
                { q: 'How do I contact security or emergency services?', a: 'On the Overview page, click the "SOS" quick action button to instantly see emergency contacts including Security Gate, Facility Manager, Police (100), and Ambulance (102) with one-tap calling.' },
                { q: 'What do I do if an issue stays "In Progress" for too long?', a: 'If a service request or complaint has been In Progress for an extended period, use the Feedback & Support section to escalate it to the management team.' },
                { q: 'How do I change my password?', a: 'Go to My Profile, click "Change Password", enter your current password and the new password twice, then click Update Password.' },
              ].map((faq, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: `1px solid ${expandedFaq === i ? '#3498db' : '#e9ecef'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    style={{ width: '100%', background: expandedFaq === i ? '#ebf5fb' : 'white', border: 'none', padding: '18px 22px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', transition: 'background 0.2s' }}
                  >
                    <span style={{ fontWeight: 600, color: '#2c3e50', fontSize: '15px', flex: 1, paddingRight: '16px' }}>
                      <span style={{ color: '#3498db', marginRight: '10px', fontSize: '13px' }}>Q{i + 1}.</span>
                      {faq.q}
                    </span>
                    <span style={{ color: '#3498db', fontSize: '22px', flexShrink: 0, transition: 'transform 0.2s', display: 'inline-block', transform: expandedFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                  </button>
                  {expandedFaq === i && (
                    <div className="fade-in-up" style={{ padding: '0 22px 20px 22px', borderTop: '1px solid #ebf5fb' }}>
                      <p style={{ margin: '16px 0 0 0', color: '#555', lineHeight: '1.75', fontSize: '14px' }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', background: 'white', borderRadius: '14px', padding: '22px 26px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', color: '#2c3e50' }}>Didn&apos;t find your answer?</h4>
                <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>Submit a support request and our team will respond within 24 hours.</p>
              </div>
              <button className="btn btn-primary" style={{ borderRadius: '10px', padding: '10px 22px', fontWeight: 600 }} onClick={() => setActiveView('feedback')}>
                📨 Contact Support
              </button>
            </div>
          </div>
        )}

        {/* FEEDBACK & SUPPORT SECTION */}
        {activeView === "feedback" && (
          <div className="fade-in-up">
            <div className="page-header">
            </div>

            {feedbackSuccess && (
              <div className="fade-in-up" style={{ background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '28px' }}>✅</span>
                <div>
                  <strong style={{ color: '#155724' }}>Thank you! Your submission was received.</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#155724', fontSize: '13px' }}>Our team will review and respond within 24 hours.</p>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: '24px', alignItems: 'start' }}>
              {/* Form */}
              <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)', padding: '22px 28px', color: 'white' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>💬 Submit Feedback or Support Request</h3>
                  <p style={{ margin: 0, opacity: 0.85, fontSize: '13px' }}>Your feedback helps us improve. Support requests are handled within 24 hours.</p>
                </div>
                <div style={{ padding: '28px' }}>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px', color: '#2c3e50' }}>Type <span style={{ color: '#e74c3c' }}>*</span></label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {[{ v: 'FEEDBACK', label: '💡 Feedback', sub: 'Share suggestions' }, { v: 'SUPPORT', label: '🛠️ Support', sub: 'Technical help' }].map(opt => (
                        <div key={opt.v} onClick={() => setFeedbackData(p => ({ ...p, type: opt.v }))} style={{ flex: 1, border: `2px solid ${feedbackData.type === opt.v ? '#3498db' : '#e9ecef'}`, borderRadius: '10px', padding: '14px', cursor: 'pointer', background: feedbackData.type === opt.v ? '#ebf5fb' : 'white', transition: 'all 0.2s', textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#2c3e50' }}>{opt.label}</div>
                          <div style={{ fontSize: '11px', color: '#7f8c8d', marginTop: '4px' }}>{opt.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px', color: '#2c3e50' }}>Subject <span style={{ color: '#e74c3c' }}>*</span></label>
                    <input type="text" className="form-input" placeholder="e.g. Suggestion for gym equipment upgrade"
                      value={feedbackData.title}
                      onChange={e => setFeedbackData(p => ({ ...p, title: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px', color: '#2c3e50' }}>Details <span style={{ color: '#e74c3c' }}>*</span></label>
                    <textarea rows={5} className="form-input" placeholder="Describe your feedback or issue in detail..."
                      value={feedbackData.description}
                      onChange={e => setFeedbackData(p => ({ ...p, description: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', padding: '13px', borderRadius: '10px', fontWeight: 700, fontSize: '15px' }}
                    disabled={submittingFeedback}
                    onClick={async () => {
                      if (!feedbackData.title.trim() || !feedbackData.description.trim()) {
                        showToast('Please fill in all required fields', 'error'); return;
                      }
                      setSubmittingFeedback(true);
                      try {
                        await axiosInstance.post('/user/feedback', { 
                          title: feedbackData.title, 
                          description: feedbackData.description, 
                          type: feedbackData.type 
                        });
                        setFeedbackSuccess(true);
                        setFeedbackData({ title: '', description: '', type: 'FEEDBACK' });
                        fetchFeedbacks();
                        setTimeout(() => setFeedbackSuccess(false), 8000);
                      } catch (err) {
                        showToast(err.response?.data?.message || 'Failed to submit', 'error');
                      } finally {
                        setSubmittingFeedback(false);
                      }
                    }}
                  >
                    {submittingFeedback ? '⌛ Submitting...' : (feedbackData.type === 'FEEDBACK' ? '📨 Submit Feedback' : '🛠️ Submit Support Request')}
                  </button>
                </div>
              </div>

              {/* Info sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <h4 style={{ margin: '0 0 14px 0', color: '#2c3e50', fontSize: '15px' }}>📞 Contact Details</h4>
                  {[['📧 Email', 'admin@amssociety.in'], ['📱 Phone', '+91 98765 43210'], ['⏰ Hours', 'Mon–Sat, 9AM–6PM'], ['🏢 Office', 'Ground Floor, Block A']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                      <span style={{ color: '#7f8c8d' }}>{k}</span>
                      <span style={{ fontWeight: 600, color: '#2c3e50' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#f8f9fa', borderRadius: '14px', padding: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50', fontSize: '14px' }}>🔄 Response Times</h4>
                  {[['Feedback', '2–3 working days'], ['Support Request', 'Within 24 hours'], ['Urgent Issues', 'Within 4 hours']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '7px 0', borderBottom: '1px solid #e9ecef' }}>
                      <span style={{ color: '#7f8c8d' }}>{k}</span>
                      <span style={{ fontWeight: 600, color: '#27ae60' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#fff3cd', borderRadius: '14px', padding: '16px', border: '1px solid #ffc107' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#856404', lineHeight: '1.6' }}>
                    💡 <strong>Tip:</strong> For urgent maintenance or security issues, please use the Complaints section or the SOS button on the Overview page.
                  </p>
                </div>
              </div>
            </div>

            {/* Previous submissions */}
            {feedbacks.length > 0 && (
              <div style={{ marginTop: '28px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#2c3e50', fontSize: '17px' }}>📋 My Previous Submissions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {feedbacks.map(item => (
                    <div key={item.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', borderLeft: `4px solid ${item.type === 'SUPPORT' ? '#e74c3c' : '#3498db'}` }}>
                      <div style={{ padding: '18px 22px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ background: item.type === 'SUPPORT' ? '#fee2e2' : '#ebf5fb', color: item.type === 'SUPPORT' ? '#991b1b' : '#2980b9', padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                              {item.type === 'SUPPORT' ? '🛠️ Support' : '💡 Feedback'}
                            </span>
                            <strong style={{ color: '#2c3e50', fontSize: '14px' }}>{item.title}</strong>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                        <p style={{ margin: 0, color: '#7f8c8d', fontSize: '13px', lineHeight: '1.5' }}>{item.description}</p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#95a5a6' }}>Submitted: {new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      {item.adminResponse && (
                        <div style={{ background: '#f8f9fa', padding: '14px 22px', borderTop: '1px solid #eee' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px' }}>💬</span>
                            <strong style={{ fontSize: '12px', color: '#2c3e50' }}>Admin Response</strong>
                            <span style={{ fontSize: '10px', color: '#95a5a6', marginLeft: 'auto' }}>
                              {item.respondedAt ? new Date(item.respondedAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: '#27ae60', fontSize: '13px', fontStyle: 'italic' }}>{item.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </main>

      {/* PAYMENT MODAL – Multi-Step */}
      {showPaymentModal && selectedMaintenance && (
        <div className="modal-overlay">
          <div className="modal-content fade-in-up" style={{ maxWidth: '480px', borderRadius: '20px', padding: 0 }}>

            {/* Modal Top Banner */}
            <div style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)', padding: '24px 28px', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>💳 Pay Maintenance</h3>
                  <p style={{ margin: 0, opacity: 0.85, fontSize: '13px' }}>
                    Invoice #{selectedMaintenance.id} · {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][selectedMaintenance.month-1]} {selectedMaintenance.year}
                  </p>
                </div>
                <button onClick={() => { setShowPaymentModal(false); setReceiptFile(null); setPaymentStep(1); }}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
              {/* Amount */}
              <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>Total Payable</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px' }}>₹{selectedMaintenance?.totalAmount || selectedMaintenance?.amount}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', opacity: 0.8 }}>
                  <div>Base: ₹{selectedMaintenance.amount}</div>
                  {selectedMaintenance.interest > 0 && <div style={{ color: '#ffa07a' }}>Interest: ₹{selectedMaintenance.interest}</div>}
                  <div>Due: {selectedMaintenance.dueDate}</div>
                </div>
              </div>
              {/* Step indicator */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '16px', alignItems: 'center' }}>
                {[1,2,3].map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: paymentStep >= s ? 'white' : 'rgba(255,255,255,0.3)',
                      color: paymentStep >= s ? '#2980b9' : 'white', fontWeight: 700, fontSize: '12px'
                    }}>{paymentStep > s ? '✓' : s}</div>
                    {s < 3 && <div style={{ flex: 1, height: '2px', width: '30px', background: paymentStep > s ? 'white' : 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />}
                  </div>
                ))}
                <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.85 }}>
                  {paymentStep === 1 ? 'Choose Method' : paymentStep === 2 ? 'Enter Details' : 'Confirm'}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px' }}>

              {/* STEP 1: Choose Payment Method */}
              {paymentStep === 1 && (
                <div className="fade-in-up">
                  <p style={{ margin: '0 0 16px 0', fontWeight: 600, color: '#2c3e50' }}>Select Payment Method</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { value: 'CASH', label: 'Cash', icon: '💵', sub: 'Pay at Society Office' },
                      { value: 'UPI', label: 'UPI', icon: '🔗', sub: 'GPay, PhonePe, Paytm' },
                      { value: 'NET_BANKING', label: 'Net Banking', icon: '🏦', sub: 'All major banks' },
                      { value: 'CREDIT_CARD', label: 'Credit Card', icon: '💳', sub: 'Visa, Mastercard, Rupay' },
                      { value: 'DEBIT_CARD', label: 'Debit Card', icon: '💰', sub: 'All ATM cards' },
                    ].map(opt => (
                      <div key={opt.value} onClick={() => setPaymentMethod(opt.value)} style={{
                        border: `2px solid ${paymentMethod === opt.value ? '#3498db' : '#e9ecef'}`,
                        borderRadius: '12px', padding: '14px 12px', cursor: 'pointer',
                        background: paymentMethod === opt.value ? '#ebf5fb' : 'white',
                        transition: 'all 0.2s'
                      }}>
                        <div style={{ fontSize: '24px', marginBottom: '6px' }}>{opt.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#2c3e50' }}>{opt.label}</div>
                        <div style={{ fontSize: '11px', color: '#7f8c8d', marginTop: '2px' }}>{opt.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Enter Payment Details */}
              {paymentStep === 2 && (
                <div className="fade-in-up">
                  <p style={{ margin: '0 0 16px 0', fontWeight: 600, color: '#2c3e50' }}>
                    {paymentMethod === 'UPI' && '🔗 UPI Payment Details'}
                    {paymentMethod === 'NET_BANKING' && '🏦 Net Banking Details'}
                    {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && '💳 Card Details'}
                  </p>

                  {paymentMethod === 'UPI' && (
                    <>
                      <div style={{ background: '#f0f9ff', border: '1px dashed #90cdf4', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📱</div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#2c3e50' }}>UPI ID for Payment</p>
                        <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '16px', color: '#3498db', fontWeight: 700 }}>ams-society@upi</p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#7f8c8d' }}>Scan QR or pay to above UPI ID</p>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#2c3e50' }}>Your UPI Reference / Transaction ID</label>
                        <input type="text" className="form-input" placeholder="e.g. 123456789012"
                          value={paymentRef} onChange={e => setPaymentRef(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
                        <p style={{ fontSize: '11px', color: '#7f8c8d', margin: '6px 0 0 0' }}>Enter the UPI transaction ID from your payment app</p>
                      </div>
                    </>
                  )}

                  {paymentMethod === 'NET_BANKING' && (
                    <>
                      <div style={{ background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#166534', fontSize: '13px' }}>Bank Transfer Details</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                          <div><span style={{ color: '#7f8c8d', width: '120px', display: 'inline-block' }}>Account Name:</span> <strong>AMS Society</strong></div>
                          <div><span style={{ color: '#7f8c8d', width: '120px', display: 'inline-block' }}>Account No.:</span> <strong>1234567890123</strong></div>
                          <div><span style={{ color: '#7f8c8d', width: '120px', display: 'inline-block' }}>IFSC Code:</span> <strong>HDFC0001234</strong></div>
                          <div><span style={{ color: '#7f8c8d', width: '120px', display: 'inline-block' }}>Bank:</span> <strong>HDFC Bank</strong></div>
                        </div>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#2c3e50' }}>Transaction Reference Number</label>
                        <input type="text" className="form-input" placeholder="e.g. NEFT/IMPS reference"
                          value={paymentRef} onChange={e => setPaymentRef(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
                      </div>
                    </>
                  )}

                  {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
                    <>
                      <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '14px', padding: '20px', marginBottom: '16px', color: 'white' }}>
                        <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '16px' }}>{paymentMethod === 'CREDIT_CARD' ? 'CREDIT CARD' : 'DEBIT CARD'}</div>
                        <div style={{ fontSize: '16px', letterSpacing: '3px', fontFamily: 'monospace', marginBottom: '16px' }}>**** **** **** ****</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.8 }}>
                          <span>CARDHOLDER NAME</span>
                          <span>MM / YY</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '12px', color: '#7f8c8d', background: '#fff3cd', padding: '10px 14px', borderRadius: '8px', margin: '0 0 16px 0' }}>
                        ⚠️ This is a demo. In production, payments are processed via a secure payment gateway (Razorpay / PayU). Enter your reference number below if paying offline.
                      </p>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#2c3e50' }}>Card Transaction Reference</label>
                        <input type="text" className="form-input" placeholder="e.g. Bank confirmation number"
                          value={paymentRef} onChange={e => setPaymentRef(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }} />
                      </div>
                    </>
                  )}

                  {paymentMethod === 'CASH' && (
                    <div style={{ background: '#fff7ed', border: '1px dashed #fdba74', borderRadius: '12px', padding: '20px', marginBottom: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>💵</div>
                      <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#9a3412', fontSize: '15px' }}>Cash Payment Instruction</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#7c2d12', lineHeight: '1.6' }}>
                        Please visit the <strong>Society Admin Office</strong> to pay your maintenance fee in cash. 
                        Once you pay, click confirm to notify the admin. They will verify and mark it as confirmed.
                      </p>
                      <div style={{ marginTop: '16px', fontSize: '12px', color: '#9a3412', background: 'rgba(255,255,255,0.5)', padding: '8px', borderRadius: '6px' }}>
                        📍 Office Hours: 9:00 AM - 6:00 PM
                      </div>
                    </div>
                  )}

                  {/* Upload receipt */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#2c3e50' }}>Upload Payment Screenshot / Receipt (Optional)</label>
                    <input type="file" className="form-input" accept="image/*,.pdf"
                      onChange={e => setReceiptFile(e.target.files[0])}
                      style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }} />
                    {receiptFile && <p style={{ fontSize: '12px', color: '#27ae60', margin: '6px 0 0 0' }}>📎 {receiptFile.name}</p>}
                  </div>
                </div>
              )}

              {/* STEP 3: Confirm */}
              {paymentStep === 3 && (
                <div className="fade-in-up" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '52px', marginBottom: '12px' }}>🧾</div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>Confirm Payment</h4>
                  <p style={{ color: '#7f8c8d', margin: '0 0 20px 0', fontSize: '14px' }}>Please review your payment details before confirming.</p>
                  <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '16px', textAlign: 'left' }}>
                    {[['Invoice', `#${selectedMaintenance.id}`],
                      ['Period', `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][selectedMaintenance.month-1]} ${selectedMaintenance.year}`],
                      ['Method', paymentMethod.replace('_', ' ')],
                      ...(paymentRef ? [['Reference', paymentRef]] : []),
                      ['Total Amount', `₹${selectedMaintenance?.totalAmount || selectedMaintenance?.amount}`]
                    ].map(([k, v], i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ecf0f1' }}>
                        <span style={{ color: '#7f8c8d', fontSize: '13px' }}>{k}</span>
                        <span style={{ fontWeight: 600, color: '#2c3e50', fontSize: '13px' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 28px 24px', display: 'flex', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid #f1f5f9' }}>
              <button className="btn btn-secondary"
                onClick={() => { if (paymentStep === 1) { setShowPaymentModal(false); setReceiptFile(null); setPaymentStep(1); } else setPaymentStep(p => p - 1); }}
                style={{ borderRadius: '10px', padding: '10px 20px' }}>
                {paymentStep === 1 ? 'Cancel' : '← Back'}
              </button>
              {paymentStep < 3 ? (
                <button className="btn btn-primary"
                  onClick={() => setPaymentStep(p => p + 1)}
                  style={{ borderRadius: '10px', padding: '10px 24px', fontWeight: 600 }}>
                  Continue →
                </button>
              ) : (
                <button className="btn btn-success"
                  onClick={handleMarkAsPaid}
                  disabled={uploadingReceipt}
                  style={{ borderRadius: '10px', padding: '10px 24px', fontWeight: 600 }}>
                  {uploadingReceipt ? '⌛ Processing...' : '✅ Confirm & Pay'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
      {/* SOS MODAL */}
      {showSOSModal && (
        <div className="modal-overlay" onClick={() => { setShowSOSModal(false); setShowExtendedSOS(false); }} style={{ zIndex: 3000 }}>
          <div className="modal-content fade-in-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', borderRadius: '20px', paddingBottom: '30px' }}>
            <div className="modal-header" style={{ border: 'none', padding: '20px 24px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#fee2e2', color: '#dc2626', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🆘</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Emergency Contacts</h3>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>Tap to call immediately</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowSOSModal(false); setShowExtendedSOS(false); }}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>
            
            <div className="modal-body" style={{ padding: '0 24px' }}>
              <div className="sos-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                <div className="sos-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff1f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '14px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#991b1b', fontSize: '15px' }}>🚨 Security Gate</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c' }}>+91 98765 43210</p>
                  </div>
                  <a href="tel:+919876543210" className="btn btn-danger btn-sm" style={{ borderRadius: '10px', padding: '8px 16px' }}>📞 Call</a>
                </div>

                <div className="sos-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '16px', borderRadius: '14px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#075985', fontSize: '15px' }}>🏢 Facility Manager</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#0369a1' }}>+91 87654 32109</p>
                  </div>
                  <a href="tel:+918765432109" className="btn btn-primary btn-sm" style={{ borderRadius: '10px', padding: '8px 16px' }}>📞 Call</a>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  <a href="tel:100" className="sos-mini-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: 'inherit', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '18px' }}>🚔</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Police</div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>100</div>
                    </div>
                  </a>
                  <a href="tel:102" className="sos-mini-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: 'inherit', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '18px' }}>🚑</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Ambulance</div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>102</div>
                    </div>
                  </a>
                </div>

                {showExtendedSOS && (
                  <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <a href="tel:101" className="sos-mini-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: 'inherit', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '18px' }}>🚒</span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>Fire</div>
                          <div style={{ fontSize: '11px', opacity: 0.7 }}>101</div>
                        </div>
                      </a>
                      <a href="tel:1091" className="sos-mini-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: 'inherit', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '18px' }}>👩</span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>Women</div>
                          <div style={{ fontSize: '11px', opacity: 0.7 }}>1091</div>
                        </div>
                      </a>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <a href="tel:1098" className="sos-mini-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: 'inherit', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '18px' }}>👶</span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>Child Help</div>
                          <div style={{ fontSize: '11px', opacity: 0.7 }}>1098</div>
                        </div>
                      </a>
                    </div>
                  </div>
                )}
                
                {!showExtendedSOS && (
                   <button 
                    onClick={() => setShowExtendedSOS(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: '10px' }}
                   >
                     View More Numbers
                   </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
