import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";

export default function ResidentParking() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  useEffect(() => {
    loadMySlots();
  }, []);

  const loadMySlots = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/user/parking/my-slots");
      setSlots(res.data.data || []);
    } catch {
      showToast("Failed to load your parking slots", "error");
    } finally {
      setLoading(false);
    }
  };

  const slotTypeLabel = (slot) => {
    if (slot.isTemporary) return "Temporary";
    if (slot.isExtra) return "Extra (Permanent)";
    return "Standard";
  };

  return (
    <div className="fade-in-up">
      {/* Refresh option removed per user request */}

      {toast.show && (
        <div className={`toast-notification ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-card mt-0">
        {loading ? (
          <div className="loading-container" style={{ padding: "30px" }}>
            <div className="loading-spinner"></div>
            <p>Loading your parking slots...</p>
          </div>
        ) : slots.length > 0 ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Slot Number</th>
                  <th>Vehicle Type</th>
                  <th>Vehicle Number</th>
                  <th>Allocation Type</th>
                  <th>Status</th>
                  <th>Allocated At</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => (
                  <tr key={slot.id}>
                    <td><strong>{slot.slotNumber}</strong></td>
                    <td>{slot.type}</td>
                    <td>{slot.vehicleNumber || "N/A"}</td>
                    <td>
                      <span className={`badge ${slot.isTemporary ? "badge-pending" : slot.isExtra ? "badge-info" : "badge-active"}`}>
                        {slotTypeLabel(slot)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${slot.status === "ALLOCATED" ? "badge-active" : "badge-inactive"}`}>
                        {slot.status}
                      </span>
                    </td>
                    <td>
                      {slot.allocatedAt
                        ? new Date(slot.allocatedAt).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No parking slots allocated to you yet. Please contact the admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
