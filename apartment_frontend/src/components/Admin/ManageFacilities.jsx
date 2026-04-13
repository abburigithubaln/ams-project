import React, { useState, useEffect } from "react";
import "../../components/Admin/AdminShared.css";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosConfig";

const STATUS_OPTIONS = [
  { id: "AVAILABLE", name: "Available", class: "badge-active" },
  { id: "UNDER_MAINTENANCE", name: "Under Maintenance", class: "badge-in-progress" },
  { id: "CLOSED", name: "Closed", class: "badge-inactive" }
];

export default function ManageFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "AVAILABLE",
    openingTime: "06:00",
    closingTime: "22:00",
    charges: "",
    capacity: ""
  });

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/facilities");
      setFacilities(res.data.data || []);
    } catch (err) {
      setErrorMessage("Failed to fetch facilities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Facility name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.charges === "" || isNaN(formData.charges)) {
      newErrors.charges = "Valid charges are required";
    }
    if (!formData.capacity || isNaN(formData.capacity)) {
      newErrors.capacity = "Valid capacity is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "AVAILABLE",
      openingTime: "06:00",
      closingTime: "22:00",
      charges: "",
      capacity: ""
    });
    setErrors({});
    setEditingFacility(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setErrorMessage("");

    const payload = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      openingTime: formData.openingTime,
      closingTime: formData.closingTime,
      charges: parseFloat(formData.charges),
      capacity: parseInt(formData.capacity)
    };

    try {
      if (editingFacility) {
        await axiosInstance.put(`/admin/facilities/${editingFacility.id}`, payload);
        toast.success("Facility updated successfully!");
      } else {
        await axiosInstance.post("/admin/facilities", payload);
        toast.success("Facility created successfully!");
      }
      await fetchFacilities();
      resetForm();
      setShowForm(false);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save facility";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name || "",
      description: facility.description || "",
      status: facility.status || "AVAILABLE",
      openingTime: facility.openingTime || "06:00",
      closingTime: facility.closingTime || "22:00",
      charges: facility.charges !== undefined ? facility.charges : "",
      capacity: facility.capacity || ""
    });
    setShowForm(true);
    setErrors({});
    setErrorMessage("");
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Facility?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!"
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.delete(`/admin/facilities/${id}`);
      toast.success("Facility deleted successfully!");
      await fetchFacilities();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete facility";
      setErrorMessage(msg);
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = STATUS_OPTIONS.find(s => s.id === status) || STATUS_OPTIONS[0];
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.name}</span>;
  };

  const getGradient = (index) => {
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    ];
    return gradients[index % gradients.length];
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
    setErrorMessage("");
  };

  if (loading) {
    return <div className="admin-card">Loading facilities...</div>;
  }

  return (
    <div className="fade-in-up">
      <div className="page-header page-header-container">
        <div></div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}
        >
          {showForm ? '✕ Close Form' : '+ Add Facility'}
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="inline-form-card inline-form-maintenance fade-in-up mb-24">
          <div className="inline-form-accent accent-blue"></div>
          <div className="inline-form-header">
            <div className="inline-form-icon icon-blue">
              <span>🏊</span>
            </div>
            <div>
              <h3>{editingFacility ? "Edit Facility" : "Add New Facility"}</h3>
              <p>{editingFacility ? "Update facility details" : "Create a new facility"}</p>
            </div>
          </div>
          <div className="inline-form-body">
            <form onSubmit={handleSubmit}>
              <div className="inline-form-row">
                <div className={`inline-form-group ${errors.name ? 'has-error' : ''}`}>
                  <label>Facility Name <span className="required-star">*</span></label>
                  <input
                    type="text"
                    className={`inline-form-input ${errors.name ? 'error' : ''}`}
                    placeholder="e.g., Swimming Pool"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {errors.name && <span className="inline-form-error">{errors.name}</span>}
                </div>
                <div className="inline-form-group">
                  <label>Status <span className="required-star">*</span></label>
                  <select
                    className="inline-form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="inline-form-row">
                <div className={`inline-form-group ${errors.description ? 'has-error' : ''}`}>
                  <label>Description <span className="required-star">*</span></label>
                  <textarea
                    className={`inline-form-input ${errors.description ? 'error' : ''}`}
                    rows="2"
                    placeholder="Describe the facility..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  {errors.description && <span className="inline-form-error">{errors.description}</span>}
                </div>
              </div>

              <div className="inline-form-row">
                <div className={`inline-form-group ${errors.charges ? 'has-error' : ''}`}>
                  <label>Charges (₹) <span className="required-star">*</span></label>
                  <input
                    type="number"
                    className={`inline-form-input ${errors.charges ? 'error' : ''}`}
                    placeholder="0.00"
                    value={formData.charges}
                    onChange={(e) => setFormData({ ...formData, charges: e.target.value })}
                  />
                  {errors.charges && <span className="inline-form-error">{errors.charges}</span>}
                </div>
                <div className={`inline-form-group ${errors.capacity ? 'has-error' : ''}`}>
                  <label>Capacity <span className="required-star">*</span></label>
                  <input
                    type="number"
                    className={`inline-form-input ${errors.capacity ? 'error' : ''}`}
                    placeholder="Maximum capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                  {errors.capacity && <span className="inline-form-error">{errors.capacity}</span>}
                </div>
              </div>

              <div className="inline-form-row">
                <div className="inline-form-group">
                  <label>Opening Time</label>
                  <input
                    type="time"
                    className="inline-form-input"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                  />
                </div>
                <div className="inline-form-group">
                  <label>Closing Time</label>
                  <input
                    type="time"
                    className="inline-form-input"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                  />
                </div>
              </div>

              {errorMessage && (
                <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{errorMessage}</div>
              )}

              <div className="inline-form-actions">
                <button type="button" className="inline-btn inline-btn-cancel" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="inline-btn inline-btn-submit btn-gradient-blue" disabled={submitting}>
                  {submitting ? 'Saving...' : editingFacility ? '✓ Update Facility' : '➕ Add Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {errorMessage && !showForm && (
        <div style={{ color: 'red', padding: '10px', marginBottom: '10px' }}>{errorMessage}</div>
      )}

      {/* Facilities Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-6" style={{ width: '100%' }}>
        <table className="min-w-full table-auto border-collapse w-full text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal border-b border-gray-200">
              <th className="py-3 px-6 text-left font-semibold">Facility</th>
              <th className="py-3 px-6 text-left font-semibold">Timings</th>
              <th className="py-3 px-6 text-left font-semibold">Charges</th>
              <th className="py-3 px-6 text-left font-semibold">Capacity</th>
              <th className="py-3 px-6 text-left font-semibold">Status</th>
              <th className="py-3 px-6 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {facilities.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500 font-medium">
                  No facilities found. Click "+ Add Facility" to create one.
                </td>
              </tr>
            ) : (
              facilities.map((facility, index) => (
                <tr key={facility.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                  <td className="py-4 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3" style={{ background: getGradient(index), width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                        {facility.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium text-gray-800 block text-base" style={{ fontSize: '15px', color: '#1f2937', fontWeight: '500', display: 'block' }}>{facility.name}</span>
                        <span className="text-gray-500 text-xs block truncate" style={{ fontSize: '12px', color: '#6b7280', display: 'block', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{facility.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-left">
                    <div className="flex items-center text-gray-700" style={{ display: 'flex', alignItems: 'center', color: '#374151' }}>
                      <svg className="w-4 h-4 mr-2 text-gray-500" style={{ width: '16px', height: '16px', marginRight: '8px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"/></svg>
                      <span className="font-medium" style={{ fontWeight: '500' }}>{facility.openingTime} - {facility.closingTime}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-left">
                    <div className="flex items-center text-gray-700" style={{ display: 'flex', alignItems: 'center', color: '#374151' }}>
                      <svg className="w-4 h-4 mr-2 text-green-600" style={{ width: '16px', height: '16px', marginRight: '8px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="font-medium" style={{ fontWeight: '500' }}>₹{facility.charges}/- {facility.charges === 0 ? '(Free)' : ''}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-left">
                    <div className="flex items-center text-gray-700" style={{ display: 'flex', alignItems: 'center', color: '#374151' }}>
                      <svg className="w-4 h-4 mr-2 text-blue-500" style={{ width: '16px', height: '16px', marginRight: '8px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                      <span className="font-medium" style={{ fontWeight: '500' }}>{facility.capacity} pax</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-left">
                    {getStatusBadge(facility.status)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex item-center justify-center space-x-3" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <button 
                         onClick={() => handleEdit(facility)}
                         className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors duration-200" 
                         style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                         title="Edit">
                        <svg className="w-4 h-4" style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button 
                         onClick={() => handleDelete(facility.id)}
                         className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors duration-200" 
                         style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                         title="Delete">
                        <svg className="w-4 h-4" style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
