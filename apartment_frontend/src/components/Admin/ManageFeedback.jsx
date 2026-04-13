import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./AdminShared.css";

export default function ManageFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [responseStatus, setResponseStatus] = useState("ACKNOWLEDGED");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  // Using react-toastify instead of custom showToast

  const loadFeedbacks = async () => {
    try {
      const res = await axiosInstance.get("/admin/feedback");
      setFeedbacks(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error loading feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.put(`/admin/feedback/${selectedItem.id}/respond`, {
        adminResponse: responseText,
        status: responseStatus,
      });
      toast.success("Response sent successfully!");
      setSelectedItem(null);
      setResponseText("");
      setResponseStatus("ACKNOWLEDGED");
      loadFeedbacks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send response");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Feedback?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!"
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.delete(`/admin/feedback/${id}`);
      toast.success("Deleted successfully!");
      if (selectedItem?.id === id) setSelectedItem(null);
      loadFeedbacks();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const openItem = (item) => {
    setSelectedItem(item);
    setResponseText(item.adminResponse || "");
    setResponseStatus(item.status === "PENDING" ? "ACKNOWLEDGED" : item.status);
  };

  const filtered =
    activeTab === "ALL"
      ? feedbacks
      : feedbacks.filter((f) => f.type === activeTab);

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { cls: "badge-pending", label: "⏳ Pending" },
      ACKNOWLEDGED: { cls: "badge-progress", label: "👀 Acknowledged" },
      RESOLVED: { cls: "badge-resolved", label: "✅ Resolved" },
      CLOSED: { cls: "badge-cancelled", label: "🔒 Closed" },
    };
    const s = map[status] || { cls: "badge-neutral", label: status };
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  const getTypeBadge = (type) => {
    if (type === "SUPPORT")
      return (
        <span
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "2px 10px",
            borderRadius: "10px",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          🛠️ Support
        </span>
      );
    return (
      <span
        style={{
          background: "#ebf5fb",
          color: "#2980b9",
          padding: "2px 10px",
          borderRadius: "10px",
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        💡 Feedback
      </span>
    );
  };

  const stats = {
    total: feedbacks.length,
    feedback: feedbacks.filter((f) => f.type === "FEEDBACK").length,
    support: feedbacks.filter((f) => f.type === "SUPPORT").length,
    pending: feedbacks.filter((f) => f.status === "PENDING").length,
  };

  if (loading) return <div className="admin-card">Loading...</div>;

  return (
    <div className="admin-card fade-in-up">

      {/* Page Header */}
      <div className="section-header">
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="mini-stat">
          <span className="mini-stat-number">{stats.total}</span>
          <span className="mini-stat-label">Total</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-number" style={{ color: "#2980b9" }}>
            {stats.feedback}
          </span>
          <span className="mini-stat-label">Feedback</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-number" style={{ color: "#e74c3c" }}>
            {stats.support}
          </span>
          <span className="mini-stat-label">Support</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-number" style={{ color: "#e67e22" }}>
            {stats.pending}
          </span>
          <span className="mini-stat-label">Pending Reply</span>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          borderBottom: "2px solid #f1f5f9",
          paddingBottom: "0",
        }}
      >
        {["ALL", "FEEDBACK", "SUPPORT"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "none",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              color: activeTab === tab ? "var(--primary)" : "#7f8c8d",
              borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: "-2px",
              transition: "all 0.2s",
            }}
          >
            {tab === "ALL" ? "📋 All" : tab === "FEEDBACK" ? "💡 Feedback" : "🛠️ Support"}
            <span
              style={{
                marginLeft: "6px",
                background: activeTab === tab ? "var(--primary)" : "#e9ecef",
                color: activeTab === tab ? "white" : "#7f8c8d",
                borderRadius: "10px",
                padding: "1px 8px",
                fontSize: "11px",
              }}
            >
              {tab === "ALL"
                ? stats.total
                : tab === "FEEDBACK"
                ? stats.feedback
                : stats.support}
            </span>
          </button>
        ))}
      </div>

      {/* Respond Panel */}
      {selectedItem && (
        <div className="inline-form-card fade-in-up mb-24">
          <div className="inline-form-accent accent-blue"></div>
          <div className="inline-form-header">
            <div className="inline-form-icon icon-blue">
              <span>{selectedItem.type === "SUPPORT" ? "🛠️" : "💡"}</span>
            </div>
            <div>
              <h3>
                #{selectedItem.id} — {selectedItem.title}
              </h3>
              <p>
                From: <strong>{selectedItem.username}</strong>
                {selectedItem.flatNumber && ` · Flat ${selectedItem.flatNumber}`} ·{" "}
                {new Date(selectedItem.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="inline-form-body">
            <div className="inline-form-row">
              <div className="inline-form-group wide-group">
                <label>Message from Resident</label>
                <div
                  className="form-input read-only-input"
                  style={{
                    whiteSpace: "pre-wrap",
                    minHeight: "80px",
                    backgroundColor: "#f8f9fa",
                    lineHeight: "1.6",
                  }}
                >
                  {selectedItem.description}
                </div>
              </div>
            </div>

            <div className="inline-form-row">
              <div className="inline-form-group">
                <label>Type</label>
                <div style={{ marginTop: "8px" }}>{getTypeBadge(selectedItem.type)}</div>
              </div>
              <div className="inline-form-group">
                <label>Current Status</label>
                <div style={{ marginTop: "8px" }}>{getStatusBadge(selectedItem.status)}</div>
              </div>
            </div>

            {selectedItem.adminResponse && (
              <div className="inline-form-row">
                <div className="inline-form-group wide-group">
                  <label>Previous Admin Response</label>
                  <div
                    className="form-input read-only-input"
                    style={{ background: "#f0fdf4", borderColor: "#86efac", whiteSpace: "pre-wrap" }}
                  >
                    {selectedItem.adminResponse}
                  </div>
                </div>
              </div>
            )}

            <div className="inline-form-row">
              <div className="inline-form-group wide-group">
                <label>
                  Your Response <span style={{ color: "#e74c3c" }}>*</span>
                </label>
                <textarea
                  rows={4}
                  className="form-input"
                  placeholder="Type your response to the resident..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  style={{ resize: "vertical", lineHeight: "1.6" }}
                />
              </div>
            </div>

            <div className="inline-form-row">
              <div className="inline-form-group">
                <label>Update Status</label>
                <select
                  className="form-select"
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value)}
                >
                  <option value="ACKNOWLEDGED">👀 Acknowledged</option>
                  <option value="RESOLVED">✅ Resolved</option>
                  <option value="CLOSED">🔒 Closed</option>
                </select>
              </div>
            </div>

            <div className="inline-form-actions">
              <button
                className="inline-btn inline-btn-cancel"
                onClick={() => setSelectedItem(null)}
              >
                Cancel
              </button>
              <button
                className="inline-btn inline-btn-submit btn-gradient-green"
                onClick={handleRespond}
                disabled={submitting}
              >
                {submitting ? "⌛ Sending..." : "📨 Send Response"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Subject</th>
            <th>Resident</th>
            <th>Flat</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center" style={{ padding: "40px", color: "#95a5a6" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
                No {activeTab === "FEEDBACK" ? "feedback" : activeTab === "SUPPORT" ? "support requests" : "submissions"} yet
              </td>
            </tr>
          ) : (
            filtered.map((item) => (
              <tr
                key={item.id}
                style={{
                  background:
                    item.status === "PENDING" ? "rgba(231,76,60,0.04)" : undefined,
                }}
              >
                <td>#{item.id}</td>
                <td>{getTypeBadge(item.type)}</td>
                <td>
                  <div>
                    <strong style={{ color: "#2c3e50", fontSize: "13px" }}>{item.title}</strong>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "12px",
                        color: "#95a5a6",
                        lineHeight: "1.4",
                      }}
                    >
                      {item.description?.substring(0, 60)}
                      {item.description?.length > 60 ? "..." : ""}
                    </p>
                    {item.adminResponse && (
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "11px",
                          color: "#27ae60",
                          fontStyle: "italic",
                        }}
                      >
                        ✅ Replied
                      </p>
                    )}
                  </div>
                </td>
                <td>{item.username}</td>
                <td>{item.flatNumber ? `Flat ${item.flatNumber}` : "—"}</td>
                <td>{getStatusBadge(item.status)}</td>
                <td style={{ fontSize: "12px", color: "#7f8c8d" }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-primary" onClick={() => openItem(item)}>
                      {item.adminResponse ? "Edit Reply" : "Respond"}
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
