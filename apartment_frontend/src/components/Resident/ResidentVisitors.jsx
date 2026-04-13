import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import "../../components/Admin/AdminShared.css";

const getStatusBadge = (status) => {
  switch (status) {
    case "PRE_APPROVED": return <span className="badge badge-pending">Pre-Approved</span>;
    case "CHECKED_IN": return <span className="badge badge-active">Active</span>;
    case "CHECKED_OUT": return <span className="badge badge-collected">Checked Out</span>;
    case "CANCELLED": return <span className="badge badge-rejected">Cancelled</span>;
    default: return <span className="badge badge-secondary">{status}</span>;
  }
};

const getParcelStatusBadge = (status) => {
  switch (status) {
    case "PENDING": return <span className="badge badge-pending">At Gate</span>;
    case "COLLECTED": return <span className="badge badge-collected">Collected</span>;
    default: return <span className="badge badge-secondary">{status}</span>;
  }
};

const ResidentVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [showPassModal, setShowPassModal] = useState(false);
  const [activeTab, setActiveTab] = useState("visitors"); // visitors, passes, parcels

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    purpose: "FRIENDS_FAMILY",
    visitDate: new Date().toISOString().split("T")[0]
  });

  const [preApprovedPass, setPreApprovedPass] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [visitorRes, parcelRes] = await Promise.all([
        axiosInstance.get("/user/visitors"),
        axiosInstance.get("/user/parcels")
      ]);
      setVisitors(visitorRes.data.data || []);
      setParcels(parcelRes.data.data || []);
    } catch (err) {
      console.error("Error fetching visitor data:", err);
    } finally {
    }
  };

  const handlePreApprove = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/user/visitors/pre-approve", formData);
      setPreApprovedPass(res.data.data);
      setShowPassModal(true);
      fetchData();
      setFormData({
        name: "",
        phone: "",
        purpose: "FRIENDS_FAMILY",
        visitDate: new Date().toISOString().split("T")[0]
      });
    } catch (err) {
      toast.error("Failed to pre-approve visitor. Please try again.");
    }
  };

  return (
    <div className="fade-in-up">
      <div className="page-header page-header-container">
        <div></div>
        <button className="btn btn-primary" onClick={() => setActiveTab("passes")}>
          🎫 Create Visitor Pass
        </button>
      </div>

      <div className="tab-container mt-4">
        <div className={`tab ${activeTab === "visitors" ? "active" : ""}`} onClick={() => setActiveTab("visitors")}>
          <span className="tab-icon">🕒</span> Visitor History
        </div>
        <div className={`tab ${activeTab === "parcels" ? "active" : ""}`} onClick={() => setActiveTab("parcels")}>
          <span className="tab-icon">📦</span> Deliveries & Parcels
        </div>
        <div className={`tab ${activeTab === "passes" ? "active" : ""}`} onClick={() => setActiveTab("passes")}>
          <span className="tab-icon">🎫</span> My Passes
        </div>
      </div>

      {activeTab === "visitors" && (
        <div className="admin-card mt-4">
          <div className="card-header">
            <h3>Recent Visitors</h3>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Visitor Name</th>
                  <th>Phone</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Entry Time</th>
                  <th>Exit Time</th>
                </tr>
              </thead>
              <tbody>
                {visitors.length === 0 ? (
                  <tr><td colSpan="6" className="text-center">No visitor records found.</td></tr>
                ) : (
                  visitors.map((v) => (
                    <tr key={v.id}>
                      <td className="font-bold">{v.name}</td>
                      <td>{v.phone}</td>
                      <td>{v.purpose?.replace(/_/g, " ")}</td>
                      <td>{getStatusBadge(v.status)}</td>
                      <td>{v.entryTime ? new Date(v.entryTime).toLocaleString() : "-"}</td>
                      <td>{v.exitTime ? new Date(v.exitTime).toLocaleString() : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "parcels" && (
        <div className="admin-card mt-4">
          <div className="card-header">
            <h3>Parcel Tracking</h3>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Courier</th>
                  <th>Tracking #</th>
                  <th>Recipient</th>
                  <th>Status</th>
                  <th>Received At</th>
                  <th>Collected At</th>
                </tr>
              </thead>
              <tbody>
                {parcels.length === 0 ? (
                  <tr><td colSpan="6" className="text-center">No parcels found at gate.</td></tr>
                ) : (
                  parcels.map((p) => (
                    <tr key={p.id}>
                      <td className="font-bold">{p.courier}</td>
                      <td><code>{p.trackingNumber}</code></td>
                      <td>{p.recipientName}</td>
                      <td>{getParcelStatusBadge(p.status)}</td>
                      <td>{new Date(p.receivedTime).toLocaleString()}</td>
                      <td>{p.collectedTime ? new Date(p.collectedTime).toLocaleString() : "Pending Collection"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "passes" && (
        <div className="passes-grid mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div className="admin-card">
            <div className="card-header">
              <h3>Create New Pass</h3>
            </div>
            <form onSubmit={handlePreApprove} className="admin-form">
              <div className="form-group">
                <label>Visitor Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Purpose</label>
                  <select
                    className="form-select"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  >
                    <option value="FRIENDS_FAMILY">Friends & Family</option>
                    <option value="DELIVERY">Delivery</option>
                    <option value="GUEST">Guest</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Visit Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.visitDate}
                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full mt-10">Generate Pass & OTP</button>
            </form>
          </div>

          <div className="admin-card">
            <div className="card-header">
              <h3>Active Pre-Approved Passes</h3>
            </div>
            <div className="active-passes-list" style={{ overflowY: 'auto', maxHeight: '500px' }}>
              {visitors.filter(v => v.status === "PRE_APPROVED").length === 0 ? (
                <div className="empty-state-small">No active passes.</div>
              ) : (
                visitors.filter(v => v.status === "PRE_APPROVED").map(pass => (
                  <div key={pass.id} className="pass-card-item mt-10" style={{
                    border: '2px dashed #3498db',
                    borderRadius: '12px',
                    padding: '15px',
                    background: '#f0f9ff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>{pass.name}</h4>
                      <span className="otp-display" style={{
                        background: '#3498db',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                      }}>{pass.otp}</span>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                      {pass.purpose} • Share this OTP at the gate for entry.
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showPassModal && preApprovedPass && (
        <div className="modal-overlay">
          <div className="modal-content text-center" style={{ maxWidth: '400px' }}>
            <div className="pass-digital" style={{
              background: 'linear-gradient(135deg, #3498db, #2c3e50)',
              color: 'white',
              padding: '30px',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎫</div>
              <h2 style={{ margin: 0 }}>Visitor Pass</h2>
              <p style={{ opacity: 0.8 }}>AMS Residency</p>

              <div className="otp-box mt-20" style={{
                background: 'white',
                color: '#2c3e50',
                padding: '15px',
                borderRadius: '12px',
                fontSize: '32px',
                fontWeight: 'bold',
                letterSpacing: '4px'
              }}>
                {preApprovedPass.otp}
              </div>

              <div className="mt-20 text-left">
                <div style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase' }}>Visitor</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{preApprovedPass.name}</div>

                <div className="mt-10" style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase' }}>Flat</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{preApprovedPass.flatNumber}</div>
              </div>

              <div className="mt-30" style={{ fontSize: '11px', lineHeight: '1.4', opacity: 0.8 }}>
                Inform the visitor to share this 6-digit OTP with the security officer at the gate.
              </div>
            </div>
            <button className="btn btn-secondary mt-20 w-full" onClick={() => setShowPassModal(false)}>Close Pass</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentVisitors;
