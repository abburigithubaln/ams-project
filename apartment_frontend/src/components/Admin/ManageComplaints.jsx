import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./AdminShared.css";

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [viewImage, setViewImage] = useState(null);


  useEffect(() => {
    loadComplaints();
    loadStaff();
  }, []);

  const loadComplaints = async () => {
    try {
      const response = await axiosInstance.get("/admin/complaints");
      const data = response.data.data;
      // Filter out items that should be in the Feedback module
      const filtered = (Array.isArray(data) ? data : []).filter(
        c => c.category !== 'FEEDBACK' && c.category !== 'SUPPORT'
      );
      setComplaints(filtered);
    } catch (error) {
      console.error("Error loading complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await axiosInstance.get("/admin/staff");
      const data = response.data.data;
      setStaffList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading staff:", error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/complaints/${id}/status?status=${status}`);
      loadComplaints();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffId) {
      toast.warning("Please select a staff member");
      return;
    }
    try {
      await axiosInstance.put(`/admin/complaints/${selectedComplaint.id}/assign-staff?staffId=${selectedStaffId}`);
      toast.success("Staff assigned successfully!");
      setSelectedStaffId("");
      setSelectedComplaint(null);
      loadComplaints();
    } catch (error) {
      console.error("Failed to assign staff", error);
      toast.error("Failed to assign staff. Please try again.");
    }
  };

  const handleDeleteComplaint = async (id) => {
    const result = await Swal.fire({
      title: "Delete Complaint?",
      text: "This will permanently remove the complaint!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!"
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.delete(`/admin/complaints/${id}`);
      toast.success("Complaint deleted successfully!");
      loadComplaints();
    } catch (error) {
      console.error("Failed to delete complaint", error);
      toast.error("Failed to delete complaint. Please try again.");
    }
  };

  const openStaffAssignment = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedStaffId(complaint.staffId ? String(complaint.staffId) : "");
  };



  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { class: "badge-pending", label: "Pending" },
      IN_PROGRESS: { class: "badge-in-progress", label: "In Progress" },
      RESOLVED: { class: "badge-resolved", label: "Resolved" },
      REJECTED: { class: "badge-rejected", label: "Rejected" }
    };
    const statusInfo = statusMap[status] || { class: "badge-neutral", label: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      LOW: { class: "badge-low", label: "Low" },
      MEDIUM: { class: "badge-medium", label: "Medium" },
      HIGH: { class: "badge-high", label: "High" },
      URGENT: { class: "badge-urgent", label: "Urgent" }
    };
    const priorityInfo = priorityMap[priority] || { class: "badge-neutral", label: priority };
    return <span className={`badge ${priorityInfo.class}`}>{priorityInfo.label}</span>;
  };

  const filteredComplaints = filterStatus === "ALL"
    ? complaints
    : complaints.filter(c => c.status === filterStatus);

  if (loading) {
    return <div className="admin-card">Loading complaints...</div>;
  }

  return (
    <div className="admin-card fade-in-up">
      {/* Staff Assignment Modal Code Removed */}

      <div className="section-header">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {selectedComplaint && (
        <div className="inline-form-card fade-in-up mb-24">
          <div className="inline-form-accent accent-blue"></div>
          <div className="inline-form-header">
            <div className="inline-form-icon icon-blue">
              <span>📋</span>
            </div>
            <div>
              <h3>Complaint #{selectedComplaint.id} Details</h3>
              <p>View complete description and status</p>
            </div>
          </div>
          <div className="inline-form-body">
            <div className="inline-form-row">
              <div className="inline-form-group wide-group">
                <label>Title</label>
                <div className="form-input read-only-input" style={{ backgroundColor: '#f8f9fa' }}>{selectedComplaint.title}</div>
              </div>
            </div>

            <div className="inline-form-row">
              <div className="inline-form-group wide-group">
                <label>Description</label>
                <div className="form-input read-only-input" style={{ whiteSpace: 'pre-wrap', minHeight: '80px', backgroundColor: '#f8f9fa' }}>
                  {selectedComplaint.description}
                </div>
              </div>
            </div>

            <div className="inline-form-row">
              <div className="inline-form-group">
                <label>Flat Number</label>
                <div className="form-input read-only-input" style={{ backgroundColor: '#f8f9fa' }}>
                  Flat {selectedComplaint.flatNumber || selectedComplaint.flatId}
                </div>
              </div>
              <div className="inline-form-group">
                <label>Category</label>
                <div className="form-input read-only-input" style={{ backgroundColor: '#f8f9fa' }}>
                  {selectedComplaint.category || "General"}
                </div>
              </div>
            </div>

            <div className="inline-form-row">
              <div className="inline-form-group">
                <label>Priority</label>
                <div style={{ marginTop: '10px' }}>
                  {getPriorityBadge(selectedComplaint.priority)}
                </div>
              </div>
              <div className="inline-form-group">
                <label>Status</label>
                <div style={{ marginTop: '10px' }}>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
              </div>
            </div>

            <div className="inline-form-row">
              <div className="inline-form-group">
                <label>Assigned Staff</label>
                <div className="form-input read-only-input" style={{ backgroundColor: '#f8f9fa' }}>
                  {selectedComplaint.staffName
                    ? `${selectedComplaint.staffName} (${selectedComplaint.staffDesignation || 'Staff'})`
                    : "Not Assigned"}
                </div>
              </div>
            </div>

            <div className="inline-form-row">
              <div className="inline-form-group" style={{
                width: selectedComplaint.resolvedAt ? '48%' : '100%'
              }}>
                <label>Submitted On</label>
                <div className="form-input read-only-input" style={{ backgroundColor: '#f8f9fa' }}>
                  {new Date(selectedComplaint.createdAt).toLocaleString()}
                </div>
              </div>
              {selectedComplaint.resolvedAt && (
                <div className="inline-form-group" style={{ width: '48%' }}>
                  <label>Resolved On</label>
                  <div className="form-input read-only-input" style={{ backgroundColor: '#f8f9fa' }}>
                  {new Date(selectedComplaint.resolvedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {selectedComplaint.imageUrl && (
            <div className="inline-form-row" style={{ padding: '0 40px 20px 40px' }}>
              <div className="inline-form-group wide-group">
                <label>Attached Photo</label>
                <div 
                  className="complaint-image-container" 
                  style={{ marginTop: '10px', cursor: 'pointer', maxWidth: '300px' }}
                  onClick={() => setViewImage(selectedComplaint.imageUrl)}
                >
                  <img 
                    src={selectedComplaint.imageUrl} 
                    alt="Complaint Attachment" 
                    style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} 
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Click to enlarge</p>
                </div>
              </div>
            </div>
          )}

            <div className="inline-form-actions">
              <button className="inline-btn inline-btn-cancel" onClick={() => setSelectedComplaint(null)}>
                Close
              </button>

              {(selectedComplaint.status === "PENDING" || selectedComplaint.status === "IN_PROGRESS") && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    className="inline-form-select"
                    style={{ width: 'auto', minWidth: '160px', padding: '10px' }}
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                  >
                    <option value="">-- Select Staff --</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.username} - {staff.designation || 'Staff'}
                      </option>
                    ))}
                  </select>
                  <button
                    className="inline-btn inline-btn-submit btn-gradient-orange"
                    onClick={handleAssignStaff}
                  >
                    ▶ {selectedComplaint.staffId ? "Save Reassignment" : "Assign & Start"}
                  </button>
                </div>
              )}
              {selectedComplaint.status === "IN_PROGRESS" && (
                <button
                  className="inline-btn inline-btn-submit btn-gradient-green"
                  onClick={() => {
                    handleStatusUpdate(selectedComplaint.id, "RESOLVED");
                    setSelectedComplaint(null);
                  }}
                >
                  ✅ Mark as Resolved
                </button>
              )}
              {selectedComplaint.status !== "RESOLVED" && selectedComplaint.status !== "REJECTED" && (
                <button
                  className="inline-btn inline-btn-submit btn-gradient-red"
                  onClick={() => {
                    handleStatusUpdate(selectedComplaint.id, "REJECTED");
                    setSelectedComplaint(null);
                  }}
                >
                  ❌ Reject
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Complaints Stats */}
      <div className="stats-row">
        <div className="mini-stat">
          <span className="mini-stat-number">{complaints.filter(c => c.status === "PENDING").length}</span>
          <span className="mini-stat-label">Pending</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-number">{complaints.filter(c => c.status === "IN_PROGRESS").length}</span>
          <span className="mini-stat-label">In Progress</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-number">{complaints.filter(c => c.status === "RESOLVED").length}</span>
          <span className="mini-stat-label">Resolved</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-number">{complaints.filter(c => c.priority === "URGENT" && c.status !== "RESOLVED").length}</span>
          <span className="mini-stat-label">Urgent</span>
        </div>
      </div>

      {/* Complaints Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Flat</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredComplaints.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">No complaints found</td>
            </tr>
          ) : (
            filteredComplaints.map((complaint) => (
              <tr key={complaint.id}>
                <td>#{complaint.id}</td>
                <td>
                  <div className="complaint-title">
                    <strong>{complaint.title}</strong>
                    {complaint.description && (
                      <p className="complaint-preview">{complaint.description.substring(0, 50)}...</p>
                    )}
                  </div>
                </td>
                <td>Flat {complaint.flatNumber || complaint.flatId}</td>
                <td>{complaint.category || "General"}</td>
                <td>{getPriorityBadge(complaint.priority)}</td>
                <td>{getStatusBadge(complaint.status)}</td>
                <td>{complaint.staffName || "—"}</td>
                <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-primary"
                      onClick={() => openStaffAssignment(complaint)}
                    >
                      View
                    </button>
                    {(complaint.status === "PENDING" || complaint.status === "IN_PROGRESS") && (
                      <button
                        className="btn btn-warning"
                        onClick={() => openStaffAssignment(complaint)}
                      >
                        {complaint.staffId ? "Reassign" : "Assign"}
                      </button>
                    )}
                    {complaint.status === "IN_PROGRESS" && (
                      <button
                        className="btn btn-success"
                        onClick={() => handleStatusUpdate(complaint.id, "RESOLVED")}
                      >
                        Resolve
                      </button>
                    )}
                    {complaint.status !== "RESOLVED" && complaint.status !== "REJECTED" && (
                      <button
                        className="btn btn-warning"
                        style={{ background: '#e67e22', color: 'white', border: 'none' }}
                        onClick={() => handleStatusUpdate(complaint.id, "REJECTED")}
                      >
                        Reject
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteComplaint(complaint.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Image Viewer Modal */}
      {viewImage && (
        <div className="modal-overlay" onClick={() => setViewImage(null)} style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', zIndex: 1000 
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ 
            maxWidth: '90vw', maxHeight: '90vh', padding: '10px', 
            position: 'relative', backgroundColor: 'white', borderRadius: '8px' 
          }}>
            <button 
              onClick={() => setViewImage(null)}
              style={{ 
                position: 'absolute', top: '-15px', right: '-15px', 
                borderRadius: '50%', width: '30px', height: '30px', 
                border: 'none', background: '#e74c3c', color: 'white', 
                cursor: 'pointer', fontWeight: 'bold' 
              }}
            >
              ✕
            </button>
            <img 
              src={viewImage} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', borderRadius: '4px' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
