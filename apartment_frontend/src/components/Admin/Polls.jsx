import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./AdminShared.css";

export default function ManagePolls() {
    const [polls, setPolls] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL", "ACTIVE", "CLOSED"

    const [selectedPoll, setSelectedPoll] = useState(null);
    const [showResultsModal, setShowResultsModal] = useState(false);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300'];

    const [formData, setFormData] = useState({
        question: "",
        endDate: "",
        options: ["", ""]
    });

    useEffect(() => {
        loadPolls();
    }, []);

    const loadPolls = async () => {
        try {
            const res = await axiosInstance.get("/admin/polls");
            const data = res.data.data;
            setPolls(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading polls:", error);
            setPolls([]);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.question.trim()) newErrors.question = "Question is required";
        if (!formData.endDate) newErrors.endDate = "End date is required";

        const validOptions = formData.options.filter(opt => opt.trim() !== "");
        if (validOptions.length < 2) {
            newErrors.options = "At least 2 valid options are required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            question: "",
            endDate: "",
            options: ["", ""]
        });
        setErrors({});
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        setFormData({ ...formData, options: [...formData.options, ""] });
    };

    const removeOption = (index) => {
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: newOptions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                options: formData.options.filter(opt => opt.trim() !== "")
            };

            await axiosInstance.post("/admin/polls", payload);
            toast.success("Poll created successfully!");
            resetForm();
            setShowForm(false);
            loadPolls();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePoll = async (id) => {
        const result = await Swal.fire({
            title: "Delete Poll?",
            text: "All votes and results will be permanently lost!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it!"
        });
        if (!result.isConfirmed) return;
        try {
            await axiosInstance.delete(`/admin/polls/${id}`);
            toast.success("Poll deleted successfully!");
            loadPolls();
        } catch (error) {
            console.error("Failed to delete poll", error);
            toast.error("Failed to delete poll. Please try again.");
        }
    };

    const getStatusBadge = (status, endDate) => {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set to end of the day
        const isExpired = end < new Date();
        if (status === 'ACTIVE' && !isExpired) return <span className="badge badge-active">Active</span>;
        return <span className="badge badge-inactive">Closed</span>;
    };

    const viewResults = (poll) => {
        setSelectedPoll(poll);
        setShowResultsModal(true);
    };

    const isPollActive = (status, endDate) => {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set to end of the day
        const isExpired = end < new Date();
        return status === 'ACTIVE' && !isExpired;
    };

    const filteredPolls = polls.filter(poll => {
        const matchesSearch = poll.question?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        const active = isPollActive(poll.status, poll.endDate);

        if (statusFilter === "ACTIVE") matchesStatus = active;
        else if (statusFilter === "CLOSED") matchesStatus = !active;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="fade-in-up">
            <div className="page-header page-header-container">
                <div></div>
                {/* Changed to btn-primary to match the clubhouse page header */}
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
                    {showForm ? '✕ Close Form' : '+ Create Poll'}
                </button>
            </div>



            {showForm && (
                <div className="inline-form-card fade-in-up mb-24">
                    <div className="inline-form-accent accent-blue"></div>
                    <div className="inline-form-header">
                        {/* Adjusted the inline styles to perfectly mimic the clubhouse icon wrapper styling */}
                        <div className="inline-form-icon" style={{ background: '#cce5ff', color: '#0056b3' }}>
                            <span>📊</span>
                        </div>
                        <div>
                            <h3>Create New Poll</h3>
                            <p>Ask the community a question</p>
                        </div>
                    </div>
                    <div className="inline-form-body">
                        <form onSubmit={handleSubmit}>
                            {/* Row 1: Split 50/50 exactly like the clubhouse form */}
                            <div className="inline-form-row">
                                <div className={`inline-form-group ${errors.question ? 'has-error' : ''}`}>
                                    <label>Poll Question <span className="required-star">*</span></label>
                                    <input
                                        type="text"
                                        className={`inline-form-input ${errors.question ? 'error' : ''}`}
                                        placeholder="e.g. What should we name the new garden?"
                                        value={formData.question}
                                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    />
                                    {errors.question && <span className="inline-form-error">{errors.question}</span>}
                                </div>
                                <div className={`inline-form-group ${errors.endDate ? 'has-error' : ''}`}>
                                    <label>End Date <span className="required-star">*</span></label>
                                    <input
                                        type="date"
                                        className={`inline-form-input ${errors.endDate ? 'error' : ''}`}
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                    {errors.endDate && <span className="inline-form-error">{errors.endDate}</span>}
                                </div>
                            </div>

                            {/* Dynamically map options into paired 50/50 chunks */}
                            {Array.from({ length: Math.ceil(formData.options.length / 2) }).map((_, rowIndex) => (
                                <div className="inline-form-row" key={rowIndex}>
                                    {/* Left Option */}
                                    <div className="inline-form-group">
                                        <label>Option {rowIndex * 2 + 1} {rowIndex === 0 && <span className="required-star">*</span>}</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                className="inline-form-input"
                                                placeholder={`Enter option ${rowIndex * 2 + 1}`}
                                                value={formData.options[rowIndex * 2]}
                                                onChange={(e) => handleOptionChange(rowIndex * 2, e.target.value)}
                                            />
                                            {formData.options.length > 2 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={() => removeOption(rowIndex * 2)}
                                                    title="Remove Option"
                                                    style={{ height: '42px', width: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Option */}
                                    <div className="inline-form-group">
                                        {rowIndex * 2 + 1 < formData.options.length && (
                                            <>
                                                <label>Option {rowIndex * 2 + 2} {rowIndex === 0 && <span className="required-star">*</span>}</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input
                                                        type="text"
                                                        className="inline-form-input"
                                                        placeholder={`Enter option ${rowIndex * 2 + 2}`}
                                                        value={formData.options[rowIndex * 2 + 1]}
                                                        onChange={(e) => handleOptionChange(rowIndex * 2 + 1, e.target.value)}
                                                    />
                                                    {formData.options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger"
                                                            onClick={() => removeOption(rowIndex * 2 + 1)}
                                                            title="Remove Option"
                                                            style={{ height: '42px', width: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="inline-form-row">
                                <div className="inline-form-group">
                                    {errors.options && <span className="inline-form-error" style={{ display: 'block', marginBottom: '10px' }}>{errors.options}</span>}
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={addOption}
                                        style={{ width: 'fit-content' }}
                                    >
                                        + Add Another Option
                                    </button>
                                </div>
                                <div className="inline-form-group"></div>
                            </div>

                            {/* Aligned submit button UI with "➕ Make Booking" from clubhouse */}
                            <div className="inline-form-actions">
                                <button type="button" className="inline-btn inline-btn-cancel" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="inline-btn inline-btn-submit btn-gradient-blue" disabled={submitting}>
                                    {submitting ? 'Creating...' : '➕ Create Poll'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-card mt-0">
                <div className="action-group tab-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="filter-group">
                            <label className="filter-label">Status:</label>
                            <select
                                className="inline-form-select"
                                style={{ width: '150px' }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Polls</option>
                                <option value="ACTIVE">Active</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flex: '1', minWidth: '300px', justifyContent: 'flex-end' }}>
                        <input
                            type="text"
                            placeholder="Search poll question..."
                            className="inline-form-input"
                            style={{ maxWidth: '300px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <h3 className="card-title" style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>All Polls</h3>
                <div className="overflow-x-auto bg-white rounded-lg shadow mt-4" style={{ width: '100%' }}>
                    <table className="min-w-full table-auto border-collapse w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal border-b border-gray-200">
                                <th className="py-3 px-6 text-left font-semibold">ID</th>
                                <th className="py-3 px-6 text-left font-semibold">Question</th>
                                <th className="py-3 px-6 text-left font-semibold">End Date</th>
                                <th className="py-3 px-6 text-left font-semibold">Status</th>
                                <th className="py-3 px-6 text-left font-semibold">Created By</th>
                                <th className="py-3 px-6 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {filteredPolls.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500 font-medium">No matching polls found</td>
                                </tr>
                            ) : (
                                filteredPolls.map((poll) => (
                                    <tr key={poll.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                                        <td className="py-4 px-6 text-left font-medium">#{poll.id}</td>
                                        <td className="py-4 px-6 text-left">
                                            <div className="font-semibold text-gray-800" style={{ fontWeight: '600' }}>{poll.question}</div>
                                            <div className="text-xs text-gray-500 mt-1" style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>{poll.options?.length || 0} options</div>
                                        </td>
                                        <td className="py-4 px-6 text-left font-medium text-gray-700">
                                            {new Date(poll.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 text-left">
                                            {getStatusBadge(poll.status, poll.endDate)}
                                        </td>
                                        <td className="py-4 px-6 text-left font-medium text-gray-700">
                                            {poll.createdBy?.username || poll.createdBy || 'Admin'}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center space-x-3 gap-2" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                <button 
                                                    className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors duration-200 border-none cursor-pointer"
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => viewResults(poll)} title="View Results">
                                                    <svg className="w-4 h-4" style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                                <button 
                                                    className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors duration-200 border-none cursor-pointer"
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => handleDeletePoll(poll.id)} title="Delete">
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

            {/*  Results Modal */}
            {showResultsModal && selectedPoll && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="modal-content" style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '600px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#333' }}>📊 Poll Results</h3>
                            <button className="btn-close" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999', lineHeight: 1 }} onClick={() => setShowResultsModal(false)}>✕</button>
                        </div>
                        <h4 style={{ marginBottom: '20px', color: '#444', textAlign: 'center', fontSize: '18px' }}>{selectedPoll.question}</h4>

                        <div style={{ height: '350px', width: '100%' }}>
                            {selectedPoll.options && selectedPoll.options.some(opt => opt.voteCount > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={selectedPoll.options.map(opt => ({ name: opt.text, value: opt.voteCount || 0 }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                            outerRadius={110}
                                            fill="#8884d8"
                                            dataKey="value"
                                            animationDuration={800}
                                        >
                                            {selectedPoll.options.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`${value} votes`, 'Count']}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888', background: '#f8f9fa', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '40px', marginBottom: '10px' }}>🤷‍♂️</span>
                                    <p style={{ margin: 0, fontSize: '16px' }}>No votes have been cast yet.</p>
                                </div>
                            )}
                        </div>
                        <div style={{ marginTop: '25px', textAlign: 'right', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <button className="btn btn-primary" onClick={() => setShowResultsModal(false)} style={{ padding: '8px 24px' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}