import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./AdminShared.css";

export default function ManageVisitors() {
    const [visitors, setVisitors] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [activeTab, setActiveTab] = useState("visitors");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [visRes, vehRes] = await Promise.all([
                axiosInstance.get("/admin/visitors"),
                axiosInstance.get("/admin/vehicles"),
            ]);
            setVisitors(visRes.data.data || []);
            setVehicles(vehRes.data.data || []);
        } catch (error) {
            console.error("Error loading visitor/vehicle data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVisitors = visitors.filter(v =>
        v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredVehicles = vehicles.filter(v =>
        v.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="fade-in-up">
            <div className="page-header page-header-container">
            </div>

            <div className="stat-grid mb-24">
                <div className="stat-card">
                    <div className="stat-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg>
                    </div>
                    <div className="stat-content">
                        <h3>Currently In</h3>
                        <p className="stat-number">{visitors.filter(v => v.status === 'CHECKED_IN').length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-3-3.87" /><path d="M9 21v-2a4 4 0 0 1 4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div className="stat-content">
                        <h3>Total Visitors</h3>
                        <p className="stat-number">{visitors.length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                    </div>
                    <div className="stat-content">
                        <h3>Active Vehicles</h3>
                        <p className="stat-number">{vehicles.filter(v => v.status === 'PARKED').length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                    </div>
                    <div className="stat-content">
                        <h3>Total Vehicles</h3>
                        <p className="stat-number">{vehicles.length}</p>
                    </div>
                </div>
            </div>

            <div className="admin-card mt-0">
                <div className="action-group tab-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className={`btn ${activeTab === "visitors" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setActiveTab("visitors")}
                        >
                            Visitors ({visitors.length})
                        </button>
                        <button
                            className={`btn ${activeTab === "vehicles" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setActiveTab("vehicles")}
                        >
                            Vehicles ({vehicles.length})
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flex: '1', minWidth: '300px', justifyContent: 'flex-end' }}>
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="inline-form-input"
                            style={{ maxWidth: '300px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container" style={{ padding: '30px' }}>
                        <div className="loading-spinner"></div>
                        <p>Loading data...</p>
                    </div>
                ) : (
                    <div style={{ marginTop: '20px' }}>
                        {activeTab === "visitors" && (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Phone</th>
                                            <th>Flat</th>
                                            <th>Purpose</th>
                                            <th>Entry Time</th>
                                            <th>Exit Time</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredVisitors.length > 0 ? (
                                            filteredVisitors.map(v => (
                                                <tr key={v.id}>
                                                    <td><strong>{v.name}</strong></td>
                                                    <td>{v.phone || "N/A"}</td>
                                                    <td>{v.flatNumber || "N/A"}</td>
                                                    <td>{v.purpose || "N/A"}</td>
                                                    <td>{formatDate(v.entryTime)}</td>
                                                    <td>{formatDate(v.exitTime)}</td>
                                                    <td>
                                                        <span className={`badge ${v.status === 'CHECKED_IN' ? 'badge-active' : 'badge-inactive'}`}>
                                                            {v.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">No visitors found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === "vehicles" && (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Vehicle No.</th>
                                            <th>Type</th>
                                            <th>Owner Name</th>
                                            <th>Flat</th>
                                            <th>Entry Time</th>
                                            <th>Exit Time</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredVehicles.length > 0 ? (
                                            filteredVehicles.map(v => (
                                                <tr key={v.id}>
                                                    <td><strong>{v.vehicleNumber}</strong></td>
                                                    <td>{v.vehicleType}</td>
                                                    <td>{v.ownerName || "N/A"}</td>
                                                    <td>{v.flatNumber || "N/A"}</td>
                                                    <td>{formatDate(v.entryTime)}</td>
                                                    <td>{formatDate(v.exitTime)}</td>
                                                    <td>
                                                        <span className={`badge ${v.status === 'PARKED' ? 'badge-active' : 'badge-inactive'}`}>
                                                            {v.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">No vehicles found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
