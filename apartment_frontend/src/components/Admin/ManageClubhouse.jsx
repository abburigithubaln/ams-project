import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./AdminShared.css";

export default function ManageClubhouse() {
    const [bookings, setBookings] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const [flats, setFlats] = useState([]);
    const [maxCapacity, setMaxCapacity] = useState("");
    const [settingCapacity, setSettingCapacity] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editBookingId, setEditBookingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [formData, setFormData] = useState({
        name: "",
        residentEmail: "",
        occasionType: "",
        occasionDate: "",
        slot: "",
        capacity: "",
        roomsForGuests: "",
        specialRequests: "",
        flatId: ""
    });

    useEffect(() => {
        loadBookings();
        loadFlats();
        loadMaxCapacity();
    }, []);

    const loadFlats = async () => {
        try {
            const res = await axiosInstance.get("/flats");
            let data = res.data;
            if (data && data.data) data = data.data;
            if (data && data.content) data = data.content;
            setFlats(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading flats:", error);
        }
    };

    const loadMaxCapacity = async () => {
        try {
            const res = await axiosInstance.get("/admin/clubhouse/capacity");
            if (res.data.data) {
                setMaxCapacity(res.data.data);
            }
        } catch (error) {
            console.error("Error loading capacity:", error);
        }
    };

    const handleSetCapacity = async () => {
        if (!maxCapacity) return;
        setSettingCapacity(true);
        try {
            await axiosInstance.put("/admin/clubhouse/capacity", { capacity: parseInt(maxCapacity) });
            toast.success("Max capacity updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update capacity");
        } finally {
            setSettingCapacity(false);
        }
    };

    const loadBookings = async () => {
        try {
            const res = await axiosInstance.get("/admin/clubhouse");
            const data = res.data.data;
            setBookings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading bookings:", error);
            setBookings([]);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.occasionType.trim()) newErrors.occasionType = "Occasion type is required";
        if (!formData.occasionDate) newErrors.occasionDate = "Date is required";
        if (!formData.slot) newErrors.slot = "Slot selection is required";
        if (!formData.flatId) newErrors.flatId = "Flat selection is required";
        if (!formData.capacity) newErrors.capacity = "Capacity is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            name: "",
            residentEmail: "",
            occasionType: "",
            occasionDate: "",
            slot: "",
            capacity: "",
            roomsForGuests: "",
            specialRequests: "",
            flatId: ""
        });
        setErrors({});
        setIsEditing(false);
        setEditBookingId(null);
    };

    const handleAdminBookingSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            if (isEditing) {
                await axiosInstance.put(`/admin/clubhouse/${editBookingId}`, formData);
                toast.success("Booking updated successfully!");
            } else {
                await axiosInstance.post("/admin/clubhouse", formData);
                toast.success("Clubhouse booked successfully!");
            }
            resetForm();
            setShowForm(false);
            loadBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axiosInstance.put(`/admin/clubhouse/${id}/status?status=${status}`);
            toast.success(`Booking ${status.toLowerCase()} successfully!`);
            loadBookings();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleEditBooking = (booking) => {
        setFormData({
            name: booking.name || "",
            residentEmail: "",
            occasionType: booking.occasionType || "",
            occasionDate: booking.occasionDate || "",
            slot: booking.slot || "DAY",
            capacity: booking.capacity || "",
            roomsForGuests: booking.roomsForGuests || "",
            specialRequests: booking.specialRequests || "",
            flatId: booking.flatId || ""
        });
        setEditBookingId(booking.id);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteBooking = async (id) => {
        const result = await Swal.fire({
            title: "Delete Booking?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it!"
        });
        if (result.isConfirmed) {
            try {
                await axiosInstance.delete(`/admin/clubhouse/${id}`);
                toast.success("Booking deleted successfully!");
                loadBookings();
            } catch (error) {
                toast.error("Failed to delete booking");
            }
        }
    };

    const getStatusBadge = (booking) => {
        const isPast = new Date(booking.occasionDate) < new Date().setHours(0, 0, 0, 0);
        if (isPast && booking.status === 'APPROVED') {
            return <span className="badge" style={{ backgroundColor: '#6c757d', color: '#fff' }}>Completed</span>;
        }

        switch (booking.status) {
            case 'APPROVED': return <span className="badge badge-active">Approved</span>;
            case 'REJECTED': return <span className="badge badge-inactive">Rejected</span>;
            case 'CANCELLED': return <span className="badge badge-inactive" style={{ backgroundColor: '#6c757d' }}>Cancelled</span>;
            default: return <span className="badge" style={{ backgroundColor: '#ffc107', color: '#000' }}>Pending</span>;
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const nameMatch = booking.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const flatMatch = booking.flatNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === "ALL" || booking.status === statusFilter;

        // Custom check for 'Completed' logic if needed, but here we filter by original API status
        return (nameMatch || flatMatch) && statusMatch;
    });

    return (
        <div className="fade-in-up">
            <div className="page-header page-header-container">
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '5px 10px', borderRadius: '5px', border: '1px solid #dee2e6' }}>
                    <label style={{ marginRight: '10px', fontSize: '14px', fontWeight: '500' }}>Max Capacity:</label>
                    <input
                        type="number"
                        style={{ width: '80px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', marginRight: '10px' }}
                        value={maxCapacity}
                        onChange={(e) => setMaxCapacity(e.target.value)}
                        placeholder="Limit"
                    />
                    <button className="btn btn-sm btn-primary" onClick={handleSetCapacity} disabled={settingCapacity}>
                        {settingCapacity ? 'Saving...' : 'Set'}
                    </button>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
                    {showForm ? '✕ Close Form' : '+ Book Clubhouse'}
                </button>
            </div>



            {showForm && (
                <div className="inline-form-card fade-in-up mb-24">
                    <div className="inline-form-accent accent-purple"></div>
                    <div className="inline-form-header">
                        <div className="inline-form-icon" style={{ background: '#e0b3ff', color: '#6a0dad' }}>
                            <span>🏛️</span>
                        </div>
                        <div>
                            <h3>{isEditing ? 'Edit Booking' : 'Admin Booking'}</h3>
                            <p>{isEditing ? 'Update clubhouse booking details' : 'Book the clubhouse (e.g. for a community event)'}</p>
                        </div>
                    </div>
                    <div className="inline-form-body">
                        <form onSubmit={handleAdminBookingSubmit}>
                            <div className="inline-form-row">
                                <div className={`inline-form-group ${errors.name ? 'has-error' : ''}`}>
                                    <label>Resident Name <span className="required-star">*</span></label>
                                    <input
                                        type="text"
                                        className={`inline-form-input ${errors.name ? 'error' : ''}`}
                                        placeholder="Auto-filled when flat is selected"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    {errors.name && <span className="inline-form-error">{errors.name}</span>}
                                </div>
                                <div className="inline-form-group">
                                    <label>Resident Email</label>
                                    <input
                                        type="email"
                                        className="inline-form-input"
                                        placeholder="Auto-filled when flat is selected"
                                        value={formData.residentEmail}
                                        readOnly
                                        style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed', color: '#6c757d' }}
                                    />
                                </div>
                                <div className={`inline-form-group ${errors.occasionType ? 'has-error' : ''}`}>
                                    <label>Occasion Type <span className="required-star">*</span></label>
                                    <input
                                        type="text"
                                        className={`inline-form-input ${errors.occasionType ? 'error' : ''}`}
                                        placeholder="e.g. Community Gathering"
                                        value={formData.occasionType}
                                        onChange={(e) => setFormData({ ...formData, occasionType: e.target.value })}
                                    />
                                    {errors.occasionType && <span className="inline-form-error">{errors.occasionType}</span>}
                                </div>
                            </div>

                            <div className="inline-form-row">
                                <div className={`inline-form-group ${errors.flatId ? 'has-error' : ''}`}>
                                    <label>Select Flat <span className="required-star">*</span></label>
                                    <select
                                        className={`inline-form-input ${errors.flatId ? 'error' : ''}`}
                                        value={formData.flatId}
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            const selectedFlat = flats.find(f => String(f.id) === String(selectedId));
                                            setFormData({
                                                ...formData,
                                                flatId: selectedId,
                                                name: selectedFlat?.residentName || "",
                                                residentEmail: selectedFlat?.residentEmail || ""
                                            });
                                        }}
                                    >
                                        <option value="">-- Select Flat --</option>
                                        {flats.map(flat => (
                                            <option key={flat.id} value={flat.id}>
                                                {flat.flatNumber} {flat.blockName ? `(${flat.blockName})` : ''}
                                                {flat.residentName ? ` — ${flat.residentName}` : ' — Vacant'}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.flatId && <span className="inline-form-error">{errors.flatId}</span>}
                                </div>
                                <div className={`inline-form-group ${errors.occasionDate ? 'has-error' : ''}`}>
                                    <label>Occasion Date <span className="required-star">*</span></label>
                                    <input
                                        type="date"
                                        className={`inline-form-input ${errors.occasionDate ? 'error' : ''}`}
                                        value={formData.occasionDate}
                                        onChange={(e) => setFormData({ ...formData, occasionDate: e.target.value })}
                                    />
                                    {errors.occasionDate && <span className="inline-form-error">{errors.occasionDate}</span>}
                                </div>
                                <div className={`inline-form-group ${errors.slot ? 'has-error' : ''}`}>
                                    <label>Select Slot <span className="required-star">*</span></label>
                                    <select
                                        className={`inline-form-input ${errors.slot ? 'error' : ''}`}
                                        value={formData.slot}
                                        onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                                    >
                                        <option value="">-- Select Slot --</option>
                                        <option value="DAY">Day (Morning - Evening)</option>
                                        <option value="NIGHT">Night (Evening - Late Night)</option>
                                    </select>
                                    {errors.slot && <span className="inline-form-error">{errors.slot}</span>}
                                </div>
                                <div className={`inline-form-group ${errors.capacity ? 'has-error' : ''}`}>
                                    <label>Capacity <span className="required-star">*</span></label>
                                    <input
                                        type="number"
                                        className={`inline-form-input ${errors.capacity ? 'error' : ''}`}
                                        placeholder="Expected attendees"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    />
                                    {errors.capacity && <span className="inline-form-error">{errors.capacity}</span>}
                                </div>
                            </div>

                            <div className="inline-form-row">
                                <div className="inline-form-group">
                                    <label>Rooms For Guests</label>
                                    <input
                                        type="number"
                                        className="inline-form-input"
                                        placeholder="Number of rooms"
                                        value={formData.roomsForGuests}
                                        onChange={(e) => setFormData({ ...formData, roomsForGuests: e.target.value })}
                                    />
                                </div>
                                <div className="inline-form-group">
                                    <label>Special Requests</label>
                                    <input
                                        type="text"
                                        className="inline-form-input"
                                        placeholder="Any special notes"
                                        value={formData.specialRequests}
                                        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="inline-form-actions">
                                <button type="button" className="inline-btn inline-btn-cancel" onClick={() => { setShowForm(false); resetForm(); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="inline-btn inline-btn-submit btn-gradient-purple" disabled={submitting}>
                                    {submitting ? (isEditing ? 'Updating...' : 'Booking...') : (isEditing ? '✏️ Update Booking' : '➕ Make Booking')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-card mt-0">
                <div className="card-header-actions mb-16">
                    <h3 className="card-title">All Bookings</h3>
                    <div className="filter-group">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search by name or flat..."
                                className="inline-form-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="inline-form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Booking Ref</th>
                                <th>Name / Flat</th>
                                <th>Occasion</th>
                                <th>Date</th>
                                <th>Slot</th>
                                <th>Capacity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center">No bookings found matching your search</td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>#{booking.id}</td>
                                        <td>
                                            <div><strong>{booking.name}</strong></div>
                                            {booking.flatNumber && <div className="text-muted text-sm">Flat: {booking.flatNumber}</div>}
                                        </td>
                                        <td>
                                            <div>{booking.occasionType}</div>
                                            {booking.specialRequests && <div className="text-muted text-sm">Notes: {booking.specialRequests}</div>}
                                        </td>
                                        <td>{booking.occasionDate}</td>
                                        <td>
                                            <span className={`badge ${booking.slot === 'DAY' ? 'badge-active' : 'badge-inactive'}`}
                                                style={{ backgroundColor: booking.slot === 'DAY' ? '#ffc107' : '#343a40', color: booking.slot === 'DAY' ? '#000' : '#fff' }}>
                                                {booking.slot}
                                            </span>
                                        </td>
                                        <td>{booking.capacity || 'N/A'} {booking.roomsForGuests ? `(+${booking.roomsForGuests} rooms)` : ''}</td>
                                        <td>{getStatusBadge(booking)}</td>
                                        <td>
                                            <div className="action-group">
                                                {(() => {
                                                    const isPast = new Date(booking.occasionDate) < new Date().setHours(0, 0, 0, 0);
                                                    const isRejected = booking.status === 'REJECTED';
                                                    return booking.userRole === 'ROLE_ADMIN' && !isPast && !isRejected && (
                                                        <button className="btn btn-primary btn-sm" onClick={() => handleEditBooking(booking)}>Edit</button>
                                                    );
                                                })()}
                                                {booking.status === 'PENDING' && (
                                                    <>
                                                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(booking.id, 'APPROVED')}>Approve</button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(booking.id, 'REJECTED')}>Reject</button>
                                                    </>
                                                )}
                                                <button className="btn btn-secondary btn-sm" onClick={() => deleteBooking(booking.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
