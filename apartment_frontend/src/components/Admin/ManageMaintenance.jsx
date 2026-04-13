import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./AdminShared.css";

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

export default function ManageMaintenance({ flats, apartments, blocks, staff }) {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [mainTab, setMainTab] = useState("billing"); // "billing" or "requests"
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    flatId: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [summary, setSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadMaintenanceRecords();
    loadServiceRequests();
  }, []);

  const filteredMaintenance = maintenanceRecords.filter(m => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return m.paymentStatus === "PENDING";
    if (activeTab === "overdue") return m.paymentStatus === "OVERDUE";
    if (activeTab === "paid") return m.paymentStatus === "PAID";
    return true;
  });

  const loadMaintenanceRecords = async () => {
    try {
      const response = await axiosInstance.get("/admin/maintenance");
      let data = response.data;
      if (data?.data) data = data.data;
      if (data?.content) data = data.content;
      setMaintenanceRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading maintenance:", error);
      setMaintenanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServiceRequests = async () => {
    try {
      const response = await axiosInstance.get("/admin/maintenance-requests");
      setServiceRequests(response.data.data || []);
    } catch (error) {
      console.error("Error loading service requests:", error);
    }
  };

  const [selectedServiceRequest, setSelectedServiceRequest] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceUpdateData, setServiceUpdateData] = useState({
    allocatedSlot: "",
    assignedStaffId: "",
    status: ""
  });

  const handleUpdateServiceRequest = async () => {
    try {
      setSubmitting(true);
      await axiosInstance.put(`/admin/maintenance-requests/${selectedServiceRequest.id}`, serviceUpdateData);
      toast.success("Service request updated successfully!");
      setShowServiceModal(false);
      loadServiceRequests();
    } catch (err) {
      toast.error("Failed to update service request");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteServiceRequest = async (id) => {
    const result = await Swal.fire({
      title: "Delete Service Request?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!"
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.delete(`/admin/maintenance-requests/${id}`);
      toast.success("Service request deleted!");
      loadServiceRequests();
    } catch (err) {
      toast.error("Failed to delete request");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.flatId) newErrors.flatId = "Please select a flat";
    if (!formData.amount || formData.amount <= 0) newErrors.amount = "Please enter a valid amount";
    if (!formData.month) newErrors.month = "Month is required";
    if (!formData.year) newErrors.year = "Year is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      flatId: "",
      amount: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
    setErrors({});
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (maintenance) => {
    setIsEditing(true);
    setEditId(maintenance.id);

    // Attempt to match flatId for the <select> element or fallback if not available
    const matchedFlatId = maintenance.flatId || flats.find(f => f.flatNumber === maintenance.flatNumber)?.id || "";

    setFormData({
      flatId: matchedFlatId,
      amount: maintenance.amount || "",
      month: maintenance.month || new Date().getMonth() + 1,
      year: maintenance.year || new Date().getFullYear()
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = { ...formData, flatId: Number(formData.flatId) };

      if (isEditing) {
        await axiosInstance.put(`/admin/maintenance/${editId}`, payload);
        toast.success("Maintenance updated successfully!");
      } else {
        await axiosInstance.post("/admin/maintenance", payload);
        toast.success("Maintenance bill created successfully!");
      }

      resetForm();
      setShowForm(false);
      loadMaintenanceRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save maintenance request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedMaintenance) return;

    try {
      setSubmitting(true);
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

      await axiosInstance.put(`/admin/maintenance/${selectedMaintenance.id}/mark-paid?paymentMethod=${paymentMethod}${receiptUrl ? `&receiptUrl=${encodeURIComponent(receiptUrl)}` : ''}`);
      toast.success("Payment recorded successfully!");
      setShowPaymentModal(false);
      setReceiptFile(null);
      loadMaintenanceRecords();
    } catch (error) {
      toast.error("Failed to update status");
      setUploadingReceipt(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Removed custom showToast helper — using react-toastify instead

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/maintenance/${id}`);
      toast.success("Maintenance bill deleted!");
      loadMaintenanceRecords();
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error("Failed to delete maintenance request");
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleSendReminders = async () => {
    const result = await Swal.fire({
      title: "Send Payment Reminders?",
      text: "This will notify all pending/overdue residents.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f39c12",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, send reminders!"
    });
    if (!result.isConfirmed) return;
    setSendingReminders(true);
    try {
      const res = await axiosInstance.post("/admin/maintenance/send-reminders");
      toast.success(res.data?.message || "Reminders sent successfully!");
    } catch (error) {
      toast.error("Failed to send reminders");
    } finally {
      setSendingReminders(false);
    }
  };

  const handleSendSingleReminder = async (m) => {
    setSendingReminderId(m.id);
    try {
      const res = await axiosInstance.post(`/admin/maintenance/${m.id}/send-reminder`);
      toast.success(res.data?.message || `Reminder sent to Flat ${m.flatNumber}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reminder");
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleViewSummary = async () => {
    try {
      const res = await axiosInstance.get("/admin/maintenance/summary");
      setSummary(res.data?.data);
      setShowSummary(true);
    } catch (error) {
      toast.error("Failed to fetch summary");
    }
  };

  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    try {
      const res = await axiosInstance.get("/admin/maintenance/report/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "financial_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download report");
    } finally {
      setDownloadingReport(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { class: "badge-pending", label: "Pending" },
      PAID: { class: "badge-paid", label: "Paid" },
      OVERDUE: { class: "badge-overdue", label: "Overdue" },
      CANCELLED: { class: "badge-cancelled", label: "Cancelled" },
      ACCEPTED: { class: "badge-resolved", label: "Accepted" },
      COMPLETED: { class: "badge-paid", label: "Completed" },
    };
    const statusInfo = statusMap[status] || { class: "badge-neutral", label: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return <div className="admin-card">Loading maintenance requests...</div>;
  }

  return (
    <div className="fade-in-up">
      <div className="tab-container mb-24" style={{ display: 'flex', gap: '10px' }}>
        <button className={`btn ${mainTab === "billing" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMainTab("billing")}>
          💸 Maintenance Billing
        </button>
        <button className={`btn ${mainTab === "requests" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMainTab("requests")}>
          🔧 Service Requests
        </button>
      </div>

      {mainTab === "billing" ? (
        <>
          <div className="page-header page-header-container mt-0" style={{ boxShadow: 'none', background: 'transparent', padding: '0 0 20px 0' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={handleSendReminders} disabled={sendingReminders}
                style={{ background: 'linear-gradient(135deg,#f39c12,#e67e22)', color: 'white', border: 'none' }}>
                {sendingReminders ? '⏳ Sending...' : '🔔 Send Reminders'}
              </button>
              <button className="btn btn-secondary" onClick={handleViewSummary}
                style={{ background: 'linear-gradient(135deg,#3498db,#2980b9)', color: 'white', border: 'none' }}>
                📊 Payment Summary
              </button>
              <button className="btn btn-secondary" onClick={handleDownloadReport} disabled={downloadingReport}
                style={{ background: 'linear-gradient(135deg,#27ae60,#219a52)', color: 'white', border: 'none' }}>
                {downloadingReport ? '⏳ Downloading...' : '⬇️ Financial Report'}
              </button>
            </div>
            <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}>
              {showForm ? '✕ Close Form' : '+ Create Bill'}
            </button>
          </div>

          {/* Inline Form */}
          {showForm && (
            <div className="inline-form-card inline-form-maintenance fade-in-up mb-24">
              <div className="inline-form-accent accent-green"></div>
              <div className="inline-form-header">
                <div className="inline-form-icon icon-green">
                  <span>🔧</span>
                </div>
                <div>
                  <h3>Create Maintenance Request</h3>
                  <p>Add a new maintenance billing for a flat</p>
                </div>
              </div>
              <div className="inline-form-body">
                <form onSubmit={handleSubmit}>
                  <div className="inline-form-row">
                    <div className={`inline-form-group ${errors.flatId ? 'has-error' : ''}`}>
                      <label>Select Flat <span className="required-star">*</span></label>
                      <select
                        className={`inline-form-select ${errors.flatId ? 'error' : ''}`}
                        value={formData.flatId}
                        onChange={(e) => setFormData({ ...formData, flatId: e.target.value })}
                        disabled={isEditing}
                      >
                        <option value="">Select Flat</option>
                        {flats && flats.filter(f => f.status === 'ALLOCATED').map(flat => (
                          <option key={flat.id} value={flat.id}>
                            Flat {flat.flatNumber}
                          </option>
                        ))}
                      </select>
                      {errors.flatId && <span className="inline-form-error">{errors.flatId}</span>}
                    </div>
                    <div className={`inline-form-group ${errors.amount ? 'has-error' : ''}`}>
                      <label>Amount <span className="required-star">*</span></label>
                      <input
                        type="number"
                        className={`inline-form-input ${errors.amount ? 'error' : ''}`}
                        placeholder="Enter amount"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                      {errors.amount && <span className="inline-form-error">{errors.amount}</span>}
                    </div>
                  </div>

                  <div className="inline-form-row">
                    <div className={`inline-form-group ${errors.month ? 'has-error' : ''}`}>
                      <label>Month <span className="required-star">*</span></label>
                      <select
                        className={`inline-form-select ${errors.month ? 'error' : ''}`}
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                      >
                        {[...Array(12).keys()].map(i => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                      {errors.month && <span className="inline-form-error">{errors.month}</span>}
                    </div>
                    <div className={`inline-form-group ${errors.year ? 'has-error' : ''}`}>
                      <label>Year <span className="required-star">*</span></label>
                      <input
                        type="number"
                        className={`inline-form-input ${errors.year ? 'error' : ''}`}
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      />
                      {errors.year && <span className="inline-form-error">{errors.year}</span>}
                    </div>
                  </div>

                  <div className="inline-form-actions">
                    <button type="button" className="inline-btn inline-btn-cancel" onClick={() => { resetForm(); setShowForm(false); }}>
                      Cancel
                    </button>
                    <button type="submit" className="inline-btn inline-btn-submit btn-gradient-green" disabled={submitting}>
                      {submitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? '✏️ Update Request' : '➕ Create Request')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}




          {/* Maintenance Table */}
          <div className="admin-card mt-0">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <h3 className="section-title" style={{ margin: 0 }}>Maintenance Records</h3>
              <div className="tab-container" style={{ display: 'flex', gap: '8px' }}>
                {['all', 'pending', 'overdue', 'paid'].map(tab => (
                  <button
                    key={tab}
                    className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Flat Number</th>
                  <th>Amount</th>
                  <th>Interest</th>
                  <th>Total</th>
                  <th>Month/Year</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaintenance.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center">No maintenance records found for "{activeTab}"</td>
                  </tr>
                ) : (
                  filteredMaintenance.map((maintenance) => (
                    <tr key={maintenance.id}>
                      <td>Flat {maintenance.flatNumber || maintenance.flatId}</td>
                      <td>₹{maintenance.amount}</td>
                      <td><span style={{ color: 'var(--danger)' }}>₹{maintenance.interest || 0}</span></td>
                      <td><strong>₹{maintenance.totalAmount || maintenance.amount}</strong></td>
                      <td>{maintenance.month}/{maintenance.year}</td>
                      <td>{maintenance.dueDate}</td>
                      <td>{maintenance.paidDate || "-"}</td>
                      <td>{getStatusBadge(maintenance.paymentStatus)}</td>
                      <td>{maintenance.paymentMethod || "-"}</td>
                      <td>
                        <div className="action-buttons">
                          {(maintenance.paymentStatus === "PENDING" || maintenance.paymentStatus === "OVERDUE") && (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleEdit(maintenance)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn btn-success"
                                onClick={() => {
                                  setSelectedMaintenance(maintenance);
                                  setShowPaymentModal(true);
                                }}
                              >
                                Mark Paid
                              </button>
                              <button
                                className="btn btn-primary"
                                style={{ background: 'linear-gradient(135deg,#f39c12,#e67e22)', color: 'white', border: 'none' }}
                                onClick={() => handleSendSingleReminder(maintenance)}
                                disabled={sendingReminderId === maintenance.id}
                              >
                                {sendingReminderId === maintenance.id ? '⏳...' : '🔔 Reminder'}
                              </button>
                            </>
                          )}
                          {maintenance.paymentStatus === "PAID" && (
                            <>
                              {maintenance.receiptUrl && (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => window.open(getReceiptUrl(maintenance.receiptUrl), "_blank")}
                                >
                                  View Receipt
                                </button>
                              )}
                            </>
                          )}
                          {deleteConfirmId === maintenance.id ? (
                            <div className="action-buttons">
                              <button className="btn btn-danger" onClick={() => confirmDelete(maintenance.id)}>
                                Confirm Delete
                              </button>
                              <button className="btn btn-secondary" onClick={cancelDelete}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button className="btn btn-danger" onClick={() => handleDelete(maintenance.id)}>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAYMENT MODAL (Admin) */}
          {showPaymentModal && (
            <div className="modal-overlay">
              <div className="modal-content fade-in-up" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                  <h3 style={{ margin: 0 }}>Admin: Confirm Payment</h3>
                  <button
                    className="btn-btn-danger btn-sm"
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}
                    onClick={() => setShowPaymentModal(false)}
                  >✕</button>
                </div>
                <div className="modal-body" style={{ padding: '20px 0' }}>
                  <p style={{ marginBottom: '15px' }}>Receive payment for <strong>Flat {selectedMaintenance?.flatNumber}</strong>:</p>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Payment Method</label>
                    <select
                      className="form-input"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="CASH">Cash (Received)</option>
                      <option value="UPI">UPI</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="NET_BANKING">Net Banking</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Upload Receipt (Optional)</label>
                    <input
                      type="file"
                      className="form-input"
                      accept="image/*,.pdf"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                    />
                  </div>
                  <p style={{ fontSize: '14px', color: '#7f8c8d' }}>
                    Total to record: <strong>₹{selectedMaintenance?.totalAmount || selectedMaintenance?.amount}</strong>
                  </p>
                </div>
                <div className="modal-footer" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => { setShowPaymentModal(false); setReceiptFile(null); }}>Cancel</button>
                  <button className="btn btn-success" onClick={handleStatusUpdate} disabled={submitting || uploadingReceipt}>
                    {uploadingReceipt ? 'Uploading...' : submitting ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT SUMMARY MODAL */}
          {showSummary && summary && (
            <div className="modal-overlay">
              <div className="modal-content fade-in-up" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                  <h3 style={{ margin: 0 }}>📊 Payment Summary</h3>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }} onClick={() => setShowSummary(false)}>✕</button>
                </div>
                <div className="modal-body" style={{ padding: '20px 0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {[
                      { label: 'Total Bills', value: summary.totalBills, color: '#2c3e50', icon: '🧾' },
                      { label: 'Paid', value: summary.paid, color: '#27ae60', icon: '✅' },
                      { label: 'Pending', value: summary.pending, color: '#f39c12', icon: '⏳' },
                      { label: 'Overdue', value: summary.overdue, color: '#e74c3c', icon: '⚠️' },
                    ].map(item => (
                      <div key={item.label} style={{ background: '#f8f9fa', borderRadius: '12px', padding: '16px', borderLeft: `4px solid ${item.color}` }}>
                        <div style={{ fontSize: '24px', marginBottom: '6px' }}>{item.icon}</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: item.color }}>{item.value}</div>
                        <div style={{ fontSize: '13px', color: '#666' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '16px', background: 'linear-gradient(135deg,#2c3e50,#34495e)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span>💰 Total Collected</span>
                      <strong>₹{Number(summary.totalCollected).toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span>📌 Outstanding Amount</span>
                      <strong style={{ color: '#f39c12' }}>₹{Number(summary.totalOutstanding).toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px' }}>
                      <span>🔴 Total Interest Accrued</span>
                      <strong style={{ color: '#e74c3c' }}>₹{Number(summary.totalInterest).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button className="btn btn-secondary" onClick={handleDownloadReport} disabled={downloadingReport}>
                    {downloadingReport ? '⏳ Downloading...' : '⬇️ Download CSV Report'}
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowSummary(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="page-header page-header-container mt-0" style={{ boxShadow: 'none', background: 'transparent', padding: '0 0 20px 0' }}>
          </div>

          <div className="admin-card mt-0">
            <h3 className="section-title">All Service Requests</h3>
            {serviceRequests.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Flat</th>
                    <th>Resident</th>
                    <th>Service</th>
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
                      <td>Flat {req.flatNumber}</td>
                      <td>{req.residentName}</td>
                      <td><strong>{req.serviceType}</strong></td>
                      <td>₹{req.basicCharges}</td>
                      <td>{getStatusBadge(req.status)}</td>
                      <td>{req.preferredSlot || "-"}</td>
                      <td>{req.allocatedSlot || "-"}</td>
                      <td>{req.assignedStaffName || "-"}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-primary btn-sm" onClick={() => {
                            setSelectedServiceRequest(req);
                            setServiceUpdateData({
                              allocatedSlot: req.allocatedSlot || "",
                              assignedStaffId: "",
                              status: req.status
                            });
                            setShowServiceModal(true);
                          }}>Manage</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteServiceRequest(req.id)}>Delete</button>
                        </div>
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

          {showServiceModal && (
            <div className="modal-overlay">
              <div className="modal-content fade-in-up" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                  <h3 style={{ margin: 0 }}>Manage Request</h3>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }} onClick={() => setShowServiceModal(false)}>✕</button>
                </div>
                <div className="modal-body" style={{ padding: '20px 0' }}>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Allocate Timing Slot</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 26th March, 2 PM"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                      value={serviceUpdateData.allocatedSlot}
                      onChange={(e) => setServiceUpdateData({ ...serviceUpdateData, allocatedSlot: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Assign Staff Member</label>
                    <select
                      className="form-input"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                      value={serviceUpdateData.assignedStaffId}
                      onChange={(e) => setServiceUpdateData({ ...serviceUpdateData, assignedStaffId: e.target.value })}
                    >
                      <option value="">Select Staff</option>
                      {staff && staff.map(s => (
                        <option key={s.id} value={s.id}>{s.username} ({s.designation})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Request Status</label>
                    <select
                      className="form-input"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                      value={serviceUpdateData.status}
                      onChange={(e) => setServiceUpdateData({ ...serviceUpdateData, status: e.target.value })}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => setShowServiceModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleUpdateServiceRequest} disabled={submitting}>
                    {submitting ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
