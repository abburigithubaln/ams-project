import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import "../Admin/AdminShared.css";

export default function ClubhouseBookings() {
    const [bookings, setBookings] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editBookingId, setEditBookingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        occasionType: "",
        occasionDate: "",
        slot: "DAY",
        capacity: "",
        roomsForGuests: "",
        specialRequests: ""
    });

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const res = await axiosInstance.get("/user/clubhouse");
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
        if (!formData.capacity) newErrors.capacity = "Capacity is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            name: "",
            occasionType: "",
            occasionDate: "",
            slot: "DAY",
            capacity: "",
            roomsForGuests: "",
            specialRequests: ""
        });
        setErrors({});
        setIsEditing(false);
        setEditBookingId(null);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            if (isEditing) {
                await axiosInstance.put(`/user/clubhouse/${editBookingId}`, formData);
                toast.success("Booking updated successfully! Wait for admin re-approval.");
            } else {
                await axiosInstance.post("/user/clubhouse", formData);
                toast.success("Clubhouse booked successfully! Wait for admin approval.");
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

    const handleEdit = (booking) => {
        setFormData({
            name: booking.name || "",
            occasionType: booking.occasionType || "",
            occasionDate: booking.occasionDate || "",
            slot: booking.slot || "DAY",
            capacity: booking.capacity || "",
            roomsForGuests: booking.roomsForGuests || "",
            specialRequests: booking.specialRequests || ""
        });
        setEditBookingId(booking.id);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="fade-in-up">
            <div className="page-header page-header-container">
                <div></div>
                <button className="btn btn-primary" onClick={() => { if (!showForm) { resetForm(); } setShowForm(!showForm); }}>
                    {showForm ? '✕ Close Form' : (isEditing ? '✏️ Editing Booking' : '+ Book Clubhouse')}
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
                            <h3>{isEditing ? 'Edit Booking' : 'Make a Booking'}</h3>
                            <p>{isEditing ? 'Update your booking details' : 'Fill out the details for your event'}</p>
                        </div>
                    </div>
                    <div className="inline-form-body">
                        <form onSubmit={handleBookingSubmit}>
                            <div className="inline-form-row">
                                <div className={`inline-form-group ${errors.name ? 'has-error' : ''}`}>
                                    <label>Your Name <span className="required-star">*</span></label>
                                    <input
                                        type="text"
                                        className={`inline-form-input ${errors.name ? 'error' : ''}`}
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    {errors.name && <span className="inline-form-error">{errors.name}</span>}
                                </div>
                                <div className={`inline-form-group ${errors.occasionType ? 'has-error' : ''}`}>
                                    <label>Occasion Type <span className="required-star">*</span></label>
                                    <input
                                        type="text"
                                        className={`inline-form-input ${errors.occasionType ? 'error' : ''}`}
                                        placeholder="e.g. Birthday Party, Get together"
                                        value={formData.occasionType}
                                        onChange={(e) => setFormData({ ...formData, occasionType: e.target.value })}
                                    />
                                    {errors.occasionType && <span className="inline-form-error">{errors.occasionType}</span>}
                                </div>
                            </div>

                            <div className="inline-form-row">
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
                                <div className={`inline-form-group ${errors.capacity ? 'has-error' : ''}`}>
                                    <label>Expected Capacity <span className="required-star">*</span></label>
                                    <input
                                        type="number"
                                        className={`inline-form-input ${errors.capacity ? 'error' : ''}`}
                                        placeholder="Number of people"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    />
                                    {errors.capacity && <span className="inline-form-error">{errors.capacity}</span>}
                                </div>
                                <div className="inline-form-group">
                                    <label>Preferred Slot <span className="required-star">*</span></label>
                                    <select
                                        className="inline-form-select"
                                        value={formData.slot}
                                        onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                                    >
                                        <option value="DAY">☀️ Day Slot</option>
                                        <option value="NIGHT">🌙 Night Slot</option>
                                    </select>
                                </div>
                            </div>

                            <div className="inline-form-row">
                                <div className="inline-form-group">
                                    <label>Rooms For Guests</label>
                                    <input
                                        type="number"
                                        className="inline-form-input"
                                        placeholder="Number of rooms needed"
                                        value={formData.roomsForGuests}
                                        onChange={(e) => setFormData({ ...formData, roomsForGuests: e.target.value })}
                                    />
                                </div>
                                <div className="inline-form-group">
                                    <label>Special Requests</label>
                                    <input
                                        type="text"
                                        className="inline-form-input"
                                        placeholder="Any special notes or requests"
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
                <h3 className="card-title">My Bookings</h3>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Occasion</th>
                                <th>Date</th>
                                <th>Capacity</th>
                                <th>Rooms</th>
                                <th>Slot</th>
                                <th>Notes</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center">You haven't made any bookings yet</td>
                                </tr>
                            ) : (
                                bookings.map((booking) => {
                                    const isPast = new Date(booking.occasionDate) < new Date().setHours(0, 0, 0, 0);
                                    return (
                                        <tr key={booking.id}>
                                            <td><strong>{booking.occasionType}</strong></td>
                                            <td>{booking.occasionDate}</td>
                                            <td>{booking.capacity || 'N/A'}</td>
                                            <td>{booking.roomsForGuests || 'None'}</td>
                                            <td>{booking.slot === 'DAY' ? '☀️ Day' : '🌙 Night'}</td>
                                            <td>{booking.specialRequests || '-'}</td>
                                            <td>{getStatusBadge(booking)}</td>
                                            <td>
                                                {!isPast && booking.status !== 'REJECTED' && (booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleEdit(booking)}>Edit</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
