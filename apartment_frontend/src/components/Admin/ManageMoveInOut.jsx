import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./AdminShared.css";

export default function ManageMoveInOut() {
    const [allotments, setAllotments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ACTIVE"); // "ACTIVE", "VACATED"
    const [ownershipFilter, setOwnershipFilter] = useState("ALL");


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const allotRes = await axiosInstance.get("/allotments/history");
            setAllotments(allotRes.data.data || []);
        } catch (error) {
            console.error("Error fetching movement history:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleMoveOut = async (allotmentId) => {
        const result = await Swal.fire({
            title: "Resident Moving Out?",
            text: "This will make the flat available for new residents.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f39c12",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, Move Out!"
        });
        if (!result.isConfirmed) return;

        try {
            await axiosInstance.put(`/allotments/${allotmentId}/vacate`);
            toast.success("Resident moved out successfully!");
            fetchData();
        } catch (error) {
            toast.error("Failed to record move out");
        }
    };

    const filteredAllotments = allotments.filter(item => {
        const matchesSearch =
            item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.blockName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = item.status === statusFilter;
        const matchesOwnership = ownershipFilter === "ALL" || item.ownershipStatus === ownershipFilter;

        return matchesSearch && matchesStatus && matchesOwnership;
    });

    if (loading) {
        return <div className="admin-card">Loading movement records...</div>;
    }

    return (
        <div className="fade-in-up">
            <div className="page-header page-header-container">
            </div>




            <div className="admin-card mt-0">
                <div className="action-group tab-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="filter-group">
                            <label className="filter-label">Status:</label>
                            <select
                                className="inline-form-select"
                                style={{ width: '160px' }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ACTIVE">Currently In (Active)</option>
                                <option value="VACATED">Moved Out (Vacated)</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Type:</label>
                            <select
                                className="inline-form-select"
                                style={{ width: '150px' }}
                                value={ownershipFilter}
                                onChange={(e) => setOwnershipFilter(e.target.value)}
                            >
                                <option value="ALL">All Ownership</option>
                                <option value="OWNER">Owner</option>
                                <option value="TENANT">Tenant</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flex: '1', minWidth: '300px', justifyContent: 'flex-end' }}>
                        <input
                            type="text"
                            placeholder="Search name, flat, or phone..."
                            className="inline-form-input"
                            style={{ maxWidth: '300px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <h3 className="section-title">{statusFilter === 'ACTIVE' ? 'Showing Active Residents' : 'Showing Vacated History'}</h3>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Apartment</th>
                                <th>Flat</th>
                                <th>Ownership</th>
                                <th>Move In</th>
                                {statusFilter === 'VACATED' && <th>Move Out</th>}
                                {statusFilter === 'ACTIVE' && <th>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAllotments.length === 0 ? (
                                <tr><td colSpan="8" className="text-center">No {statusFilter.toLowerCase()} records found</td></tr>
                            ) : (
                                filteredAllotments.map(record => (
                                    <tr key={record.id}>
                                        <td><strong>{record.username}</strong></td>
                                        <td>{record.phone || "N/A"}</td>
                                        <td>{record.apartmentName || "N/A"}</td>
                                        <td>Flat {record.flatNumber} ({record.blockName})</td>
                                        <td>{record.ownershipStatus}</td>
                                        <td>{record.startDate}</td>
                                        {statusFilter === 'VACATED' && <td>{record.endDate}</td>}
                                        {statusFilter === 'ACTIVE' && (
                                            <td>
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => handleMoveOut(record.id)}
                                                >
                                                    Move Out
                                                </button>
                                            </td>
                                        )}
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
