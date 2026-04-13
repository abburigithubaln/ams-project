import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./AdminShared.css";

export default function ManageParking() {
    const [slots, setSlots] = useState([]);
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");


    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAllocateModal, setShowAllocateModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [createForm, setCreateForm] = useState({ slotNumber: "", type: "FOUR_WHEELER" });
    const [allocateForm, setAllocateForm] = useState({
        residentId: "",
        vehicleNumber: "",
        isExtra: false,
        isTemporary: false
    });

    const showToast = (message, type = "success") => {
        if (type === "error") toast.error(message);
        else toast.success(message);
    };



    const loadSlots = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/admin/parking/slots");
            setSlots(res.data.data || []);
        } catch {
            showToast("Failed to load parking slots", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadResidents = useCallback(async () => {
        try {
            const res = await axiosInstance.get("/admin/residents");
            setResidents(res.data.data || []);
        } catch (err) {
            showToast("Failed to load residents list", "error");
        }
    }, []);

    useEffect(() => {
        loadSlots();
        loadResidents();
    }, [loadSlots, loadResidents]);

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post("/admin/parking/slots", createForm);
            showToast("Parking slot created successfully");
            setShowCreateModal(false);
            setCreateForm({ slotNumber: "", type: "FOUR_WHEELER" });
            loadSlots();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to create slot", "error");
        }
    };

    const handleDeleteSlot = async (id) => {
        const result = await Swal.fire({
            title: "Delete Parking Slot?",
            text: "This slot will be permanently removed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it!"
        });
        if (!result.isConfirmed) return;
        try {
            await axiosInstance.delete(`/admin/parking/slots/${id}`);
            showToast("Parking slot deleted successfully");
            loadSlots();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to delete slot", "error");
        }
    };

    const openAllocateModal = (slot) => {
        setSelectedSlot(slot);
        setAllocateForm({ residentId: "", vehicleNumber: "", isExtra: false, isTemporary: false });
        setShowAllocateModal(true);
    };

    const handleAllocate = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/admin/parking/slots/${selectedSlot.id}/allocate`, {
                ...allocateForm,
                residentId: Number(allocateForm.residentId)
            });
            showToast("Slot allocated successfully");
            setShowAllocateModal(false);
            loadSlots();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to allocate slot", "error");
        }
    };

    const handleDeallocate = async (id) => {
        const result = await Swal.fire({
            title: "Deallocate Slot?",
            text: "This slot will become available again.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, deallocate!"
        });
        if (!result.isConfirmed) return;
        try {
            await axiosInstance.post(`/admin/parking/slots/${id}/deallocate`);
            showToast("Slot deallocated successfully");
            loadSlots();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to deallocate slot", "error");
        }
    };

    const filteredSlots = activeTab === "all"
        ? slots
        : activeTab === "available"
            ? slots.filter(s => s.status === "AVAILABLE")
            : activeTab === "allocated"
                ? slots.filter(s => s.status === "ALLOCATED" && !s.isTemporary)
                : slots.filter(s => s.isTemporary);

    const allotmentBadge = (slot) => {
        if (slot.isTemporary) return <span className="badge badge-pending">Temporary</span>;
        if (slot.isExtra) return <span className="badge badge-info">Extra</span>;
        if (slot.status === "ALLOCATED") return <span className="badge badge-active">Standard</span>;
        return null;
    };

    return (
        <div className="fade-in-up">
            <div className="page-header page-header-container">
                <div></div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ Add Slot</button>
            </div>


            {/* Stats */}
            <div className="stat-grid mb-24">
                <div className="stat-card">
                    <div className="stat-icon-wrap" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
                    </div>
                    <div className="stat-content">
                        <h3>Total Slots</h3>
                        <p className="stat-number">{slots.length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>
                    </div>
                    <div className="stat-content">
                        <h3>Available</h3>
                        <p className="stat-number">{slots.filter(s => s.status === "AVAILABLE").length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                    </div>
                    <div className="stat-content">
                        <h3>Allocated</h3>
                        <p className="stat-number">{slots.filter(s => s.status === "ALLOCATED").length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <div className="stat-content">
                        <h3>Temporary</h3>
                        <p className="stat-number">{slots.filter(s => s.isTemporary).length}</p>
                    </div>
                </div>
            </div>

            <div className="admin-card mt-0">
                {/* Tabs */}
                <div className="action-group tab-container" style={{ marginBottom: '20px' }}>
                    {["all", "available", "allocated", "temporary"].map(tab => (
                        <button
                            key={tab}
                            className={`btn ${activeTab === tab ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-container" style={{ padding: '30px' }}>
                        <div className="loading-spinner"></div>
                        <p>Loading parking slots...</p>
                    </div>
                ) : filteredSlots.length > 0 ? (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Slot No.</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Allocation</th>
                                    <th>Resident</th>
                                    <th>Flat</th>
                                    <th>Vehicle</th>
                                    <th>Allocated At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSlots.map(slot => (
                                    <tr key={slot.id}>
                                        <td><strong>{slot.slotNumber}</strong></td>
                                        <td>{slot.type === "TWO_WHEELER" ? "2 Wheeler" : "4 Wheeler"}</td>
                                        <td>
                                            <span className={`badge ${slot.status === "AVAILABLE" ? "badge-active" : "badge-inactive"}`}>
                                                {slot.status}
                                            </span>
                                        </td>
                                        <td>{allotmentBadge(slot)}</td>
                                        <td>{slot.residentName || "—"}</td>
                                        <td>{slot.flatNumber || "—"}</td>
                                        <td>{slot.vehicleNumber || "—"}</td>
                                        <td>{slot.allocatedAt ? new Date(slot.allocatedAt).toLocaleDateString() : "—"}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {slot.status === "AVAILABLE" ? (
                                                    <button className="btn btn-sm btn-primary" onClick={() => openAllocateModal(slot)}>
                                                        Allocate
                                                    </button>
                                                ) : (
                                                    <button className="btn btn-sm btn-warning" onClick={() => handleDeallocate(slot.id)}>
                                                        Deallocate
                                                    </button>
                                                )}
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteSlot(slot.id)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No parking slots found for the selected filter.</p>
                    </div>
                )}
            </div>

            {/* Create Slot Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h3>Add Parking Slot</h3>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateSlot}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Slot Number *</label>
                                    <input
                                        required
                                        className="form-input"
                                        placeholder="e.g. P-01, B2-04"
                                        value={createForm.slotNumber}
                                        onChange={e => setCreateForm({ ...createForm, slotNumber: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Vehicle Type *</label>
                                    <select className="form-input" value={createForm.type} onChange={e => setCreateForm({ ...createForm, type: e.target.value })}>
                                        <option value="TWO_WHEELER">Two Wheeler</option>
                                        <option value="FOUR_WHEELER">Four Wheeler</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Slot</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Allocate Modal */}
            {showAllocateModal && selectedSlot && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '480px' }}>
                        <div className="modal-header">
                            <h3>Allocate Slot {selectedSlot.slotNumber}</h3>
                            <button className="modal-close" onClick={() => setShowAllocateModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAllocate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Resident *</label>
                                    <select
                                        required
                                        className="form-input"
                                        value={allocateForm.residentId}
                                        onChange={e => setAllocateForm({ ...allocateForm, residentId: e.target.value })}
                                    >
                                        <option value="">Select Resident</option>
                                        {residents.filter(r => r.status === "APPROVED").map(r => (
                                            <option key={r.id} value={r.id}>{r.username} — {r.email}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Vehicle Number</label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g. MH12AB1234 (Optional)"
                                        value={allocateForm.vehicleNumber}
                                        onChange={e => setAllocateForm({ ...allocateForm, vehicleNumber: e.target.value })}
                                    />
                                </div>
                                <div className="form-group" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={allocateForm.isExtra}
                                            onChange={e => setAllocateForm({ ...allocateForm, isExtra: e.target.checked, isTemporary: false })}
                                        />
                                        Extra Permanent Slot
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={allocateForm.isTemporary}
                                            onChange={e => setAllocateForm({ ...allocateForm, isTemporary: e.target.checked, isExtra: false })}
                                        />
                                        Temporary Slot
                                    </label>
                                </div>
                                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                                    {allocateForm.isTemporary
                                        ? "Temporary: slot for another/visitor vehicle — can be deallocated anytime."
                                        : allocateForm.isExtra
                                            ? "Extra: additional permanent slot beyond the resident's standard allocation."
                                            : "Standard: regular permanent parking slot allocation."}
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAllocateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Allocate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
