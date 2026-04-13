import React, { useState, useEffect } from "react";
import "../../components/Admin/AdminShared.css";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosConfig";

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/user/facilities");
        setFacilities(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load facilities.");
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      AVAILABLE: { class: "badge-active", label: "Available" },
      UNDER_MAINTENANCE: { class: "badge-in-progress", label: "Under Maintenance" },
      CLOSED: { class: "badge-inactive", label: "Closed" }
    };
    const statusInfo = statusMap[status] || { class: "badge-neutral", label: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
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

  const filteredFacilities = filter === "ALL"
    ? facilities
    : filter === "AVAILABLE"
      ? facilities.filter(f => f.status === "AVAILABLE")
      : facilities.filter(f => f.status !== "AVAILABLE");

  if (loading) {
    return <div className="admin-card">Loading facilities...</div>;
  }

  return (
    <div className="fade-in-up">
      <div className="page-header page-header-container">
      </div>



      {/* Filter Tabs */}
      <div className="tab-container" style={{ marginBottom: '20px' }}>
        <button
          className={`btn ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('ALL')}
          style={{ marginRight: '10px' }}
        >
          All ({facilities.length})
        </button>
        <button
          className={`btn ${filter === 'AVAILABLE' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('AVAILABLE')}
          style={{ marginRight: '10px' }}
        >
          Available ({facilities.filter(f => f.status === 'AVAILABLE').length})
        </button>
        <button
          className={`btn ${filter === 'UNAVAILABLE' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('UNAVAILABLE')}
        >
          Unavailable ({facilities.filter(f => f.status !== 'AVAILABLE').length})
        </button>
      </div>

      {/* Facilities Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-4" style={{ width: '100%' }}>
        <table className="min-w-full table-auto border-collapse w-full text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal border-b border-gray-200">
              <th className="py-3 px-6 text-left font-semibold">Facility</th>
              <th className="py-3 px-6 text-left font-semibold">Timings</th>
              <th className="py-3 px-6 text-left font-semibold">Charges</th>
              <th className="py-3 px-6 text-left font-semibold">Capacity</th>
              <th className="py-3 px-6 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {filteredFacilities.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                  {filter === 'ALL' ? 'No facilities available at the moment.' : 'No facilities found for this filter.'}
                </td>
              </tr>
            ) : (
              filteredFacilities.map((facility, index) => (
                <tr key={facility.id} className={`border-b border-gray-200 hover:bg-gray-50 transition duration-150 ${facility.status !== 'AVAILABLE' ? 'opacity-75 bg-gray-50' : 'bg-white'}`} style={{ opacity: facility.status !== 'AVAILABLE' ? 0.7 : 1 }}>
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
                    {facility.status !== 'AVAILABLE' && (
                      <span className="block mt-1 text-xs font-medium" style={{ display: 'block', marginTop: '4px', fontSize: '12px', color: '#b45309', fontWeight: '500' }}>
                        {facility.status === 'UNDER_MAINTENANCE' ? 'Under Maintenance' : 'Closed'}
                      </span>
                    )}
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
