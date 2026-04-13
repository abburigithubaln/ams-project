import React, { useState } from "react";
import axiosInstance from "../../utils/axiosConfig";

export default function ManageApartments({ admin, apartments, blocks, flats, loadApartments, loadBlocks, loadFlats }) {
  const isSuperAdmin = admin?.role === "ROLE_SUPER_ADMIN";
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? "apartments" : "blocks");
  const [editingId, setEditingId] = useState(null);

  const [flatFilterStatus, setFlatFilterStatus] = useState("ALL");
  const [aptData, setAptData] = useState({ name: "", address: "" });
  const [blockData, setBlockData] = useState({ apartmentId: admin?.managedApartmentId || "", blockName: "" });
  const [flatData, setFlatData] = useState({ blockId: "", flatNumber: "", type: "", floorNumber: "", status: "AVAILABLE", isBulk: true, numFlats: 1, startFlatNo: "" });

  // Form Visibility States
  const [showAptForm, setShowAptForm] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [showFlatForm, setShowFlatForm] = useState(false);

  const resetForms = () => {
    setEditingId(null);
    setAptData({ name: "", address: "" });
    setBlockData({ apartmentId: admin?.managedApartmentId || "", blockName: "" });
    setFlatData({ blockId: "", flatNumber: "", type: "", floorNumber: "", status: "AVAILABLE", isBulk: true, numFlats: 1, startFlatNo: "" });
    setShowAptForm(false);
    setShowBlockForm(false);
    setShowFlatForm(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForms();
    setFlatFilterStatus("ALL");
  };

  // --- APARTMENTS ---
  const handleSubmitApartment = async () => {
    try {
      if (editingId) {
        await axiosInstance.put(`/apartments/${editingId}`, aptData);
        alert("Apartment updated successfully");
      } else {
        await axiosInstance.post("/apartments", aptData);
        alert("Apartment added successfully");
      }
      loadApartments();
      resetForms();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Operation failed.");
    }
  };

  const handleEditApartment = (apt) => {
    setAptData({ name: apt.name, address: apt.address });
    setEditingId(apt.id);
    setShowAptForm(true);
  };

  const handleDeleteApartment = async (id) => {
    if (!window.confirm("Delete this apartment? This will delete all associated blocks and flats.")) return;
    try {
      await axiosInstance.delete(`/apartments/${id}`);
      loadApartments();
      loadBlocks();
      loadFlats();
    } catch (error) {
      alert("Failed to delete apartment");
    }
  };

  // --- BLOCKS ---
  const handleSubmitBlock = async () => {
    try {
      if (editingId) {
        await axiosInstance.put(`/blocks/${editingId}`, blockData);
        alert("Block updated successfully");
      } else {
        await axiosInstance.post("/blocks/create", blockData);
        alert("Block added successfully");
      }
      loadBlocks();
      resetForms();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Operation failed.");
    }
  };

  const handleEditBlock = (block) => {
    setBlockData({
      apartmentId: block.apartmentId || (block.apartment ? block.apartment.id : ""),
      blockName: block.blockName
    });
    setEditingId(block.id);
    setShowBlockForm(true);
  };

  const handleDeleteBlock = async (id) => {
    if (!window.confirm("Delete this block?")) return;
    try {
      await axiosInstance.delete(`/blocks/${id}`);
      loadBlocks();
      loadFlats();
    } catch (error) {
      alert("Failed to delete block");
    }
  };

  // --- FLATS ---
  const handleSubmitFlat = async () => {
    try {
      if (editingId) {
        await axiosInstance.put(`/flats/${editingId}`, {
          ...flatData,
          blockId: Number(flatData.blockId),
          floorNumber: Number(flatData.floorNumber)
        });
        alert("Flat updated successfully");
      } else if (flatData.isBulk) {
        const count = parseInt(flatData.numFlats) || 1;
        const startNo = parseInt(flatData.startFlatNo);
        if (isNaN(startNo)) return alert("Please enter a valid starting flat number");

        const requests = [];
        for (let i = 0; i < count; i++) {
          requests.push(axiosInstance.post("/flats/create", {
            blockId: Number(flatData.blockId),
            flatNumber: (startNo + i).toString(),
            type: flatData.type,
            floorNumber: Number(flatData.floorNumber),
            status: "AVAILABLE",
            unitSize: "" 
          }));
        }
        await Promise.all(requests);
        alert(`Successfully created ${count} flats`);
      } else {
        await axiosInstance.post("/flats/create", {
           ...flatData,
           blockId: Number(flatData.blockId),
           floorNumber: Number(flatData.floorNumber),
           unitSize: ""
        });
        alert("Flat added successfully");
      }
      loadFlats();
      resetForms();
    } catch (error) {
      console.error("Flat error:", error.response?.data);
      alert(error.response?.data?.message || "Failed to save flat(s)");
    }
  };

  const handleEditFlat = (flat) => {
    setFlatData({
      blockId: flat.blockId || (flat.block ? flat.block.id : ""),
      flatNumber: flat.flatNumber,
      type: flat.type,
      floorNumber: flat.floorNumber,
      status: flat.status,
      isBulk: false 
    });
    setEditingId(flat.id);
    setShowFlatForm(true);
  };

  const handleDeleteFlat = async (id) => {
    if (!window.confirm("Delete this flat?")) return;
    try {
      await axiosInstance.delete(`/flats/${id}`);
      loadFlats();
    } catch (error) {
      alert("Failed to delete flat");
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-3 mb-8 border-b border-slate-100 pb-4">
        {isSuperAdmin && (
          <button 
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === "apartments" ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`} 
            onClick={() => handleTabChange("apartments")}
          >
            Apartments
          </button>
        )}
        <button 
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === "blocks" ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`} 
          onClick={() => handleTabChange("blocks")}
        >
          Blocks
        </button>
        <button 
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === "flats" ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`} 
          onClick={() => handleTabChange("flats")}
        >
          Flats
        </button>
      </div>

      {/* APARTMENTS TAB */}
      {activeTab === "apartments" && (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          {(showAptForm || editingId) && (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden">
            {/* Decorative Background Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-200/40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-2xl">🏢</div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{editingId ? "Edit Apartment Details" : "Register New Apartment"}</h3>
                <p className="text-sm text-slate-500">Provide the official name and location</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Apartment Name</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-800 bg-white" 
                  placeholder="e.g. Sunrise Towers" 
                  value={aptData.name} 
                  onChange={(e) => setAptData({ ...aptData, name: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-800 bg-white" 
                  placeholder="e.g. 123 Main St, City" 
                  value={aptData.address} 
                  onChange={(e) => setAptData({ ...aptData, address: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-2 relative z-10">
              {editingId && <button className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-colors" onClick={resetForms}>Cancel</button>}
              <button 
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-md shadow-primary/20 transition-colors" 
                onClick={handleSubmitApartment}
              >
                {editingId ? "Save Changes" : "Create Apartment"}
              </button>
            </div>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Registered Apartments ({apartments.length})</h3>
            {!showAptForm && !editingId && (
              <button 
                onClick={() => setShowAptForm(true)} 
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold shadow-md transition-all"
              >
                + Add Apartment
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {apartments.map((a) => (
              <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center hover:border-primary-300 hover:shadow-md transition-all gap-4 group">
                <div>
                  <h4 className="text-lg font-bold text-slate-800 group-hover:text-primary-700 transition-colors">{a.name}</h4>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 align-middle">
                     <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                     {a.address}
                  </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 text-slate-700 hover:text-amber-600 hover:bg-amber-50 border border-slate-200 rounded-lg text-sm font-semibold transition-all" onClick={() => handleEditApartment(a)}>Edit</button>
                  <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg text-sm font-semibold transition-all" onClick={() => handleDeleteApartment(a.id)}>Delete</button>
                </div>
              </div>
            ))}
            {apartments.length === 0 && <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No apartments registered yet.</div>}
          </div>
        </div>
      )}

      {/* BLOCKS TAB */}
      {activeTab === "blocks" && (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          {(showBlockForm || editingId) && (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden">
             <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-2xl">🏗️</div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{editingId ? "Edit Management Block" : "Add New Block"}</h3>
                <p className="text-sm text-slate-500">Group flats logically under specific blocks</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
              {isSuperAdmin ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Community</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-800 bg-white appearance-none" 
                    value={blockData.apartmentId} 
                    onChange={(e) => setBlockData({ ...blockData, apartmentId: e.target.value })}
                  >
                    <option value="">-- Choose Community --</option>
                    {apartments.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Community</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 outline-none cursor-not-allowed" value={admin?.managedApartmentName || "My Apartment"} readOnly disabled />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Block Identifier</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-800 bg-white" 
                  placeholder="e.g. Block A, Tower 1" 
                  value={blockData.blockName} 
                  onChange={(e) => setBlockData({ ...blockData, blockName: e.target.value })} 
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 relative z-10">
              {editingId && <button className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-colors" onClick={resetForms}>Cancel</button>}
              <button 
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-md shadow-primary/20 transition-colors" 
                onClick={handleSubmitBlock}
              >
                {editingId ? "Save Changes" : "Create Block"}
              </button>
            </div>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Existing Blocks</h3>
            {!showBlockForm && !editingId && (
              <button 
                onClick={() => setShowBlockForm(true)} 
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold shadow-md transition-all"
              >
                + Add Block
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Array.isArray(blocks) ? blocks : [])
              .filter(b => isSuperAdmin || (b.apartmentId || b.apartment?.id) === admin?.managedApartmentId)
              .map((b) => (
                <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-primary-300 hover:shadow-md transition-all group">
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-slate-800 group-hover:text-primary-700 transition-colors">{b.blockName}</h4>
                    <p className="text-sm text-slate-500 mt-1">Community: <span className="font-medium text-slate-700">{b.apartmentName || "Unknown"}</span></p>
                  </div>
                  <div className="flex gap-2 border-t border-slate-100 pt-4 mt-auto">
                    <button className="flex-1 py-2 bg-slate-100 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg text-sm font-semibold transition-all" onClick={() => handleEditBlock(b)}>Edit</button>
                    <button className="flex-1 py-2 bg-slate-100 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-all" onClick={() => handleDeleteBlock(b.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {blocks.filter(b => isSuperAdmin || (b.apartmentId || b.apartment?.id) === admin?.managedApartmentId).length === 0 && (
                <div className="md:col-span-2 text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No blocks found.</div>
              )}
          </div>
        </div>
      )}

      {/* FLATS TAB */}
      {activeTab === "flats" && (
        (() => {
          const filteredFlats = (Array.isArray(flats) ? flats : []).filter(f => {
            const statusMatch = flatFilterStatus === "ALL" || f.status === flatFilterStatus;
            if (!statusMatch) return false;
            if (isSuperAdmin) return true;
            const blockId = f.blockId || f.block?.id;
            const blockObj = Array.isArray(blocks) ? blocks.find(b => b.id === blockId) : null;
            return (blockObj?.apartmentId || blockObj?.apartment?.id) === admin?.managedApartmentId;
          });
          return (
            <div className="animate-[fadeIn_0.3s_ease-out]">
              {(showFlatForm || editingId) && (
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-2xl">🚪</div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{editingId ? "Edit Flat Details" : (flatData.isBulk ? "Bulk Generate Flats" : "Register Single Flat")}</h3>
                      <p className="text-sm text-slate-500">{editingId ? "Update existing unit information" : "Add housing units to your community"}</p>
                    </div>
                  </div>
                  {!editingId && (
                    <button 
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2" 
                      onClick={() => setFlatData({...flatData, isBulk: !flatData.isBulk})}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                      Switch to {flatData.isBulk ? "Single Creation" : "Bulk Generation"}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assigned Block</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500 appearance-none" 
                      value={flatData.blockId} 
                      onChange={(e) => setFlatData({ ...flatData, blockId: e.target.value })} 
                      disabled={!!editingId}
                    >
                      <option value="">-- Choose Block --</option>
                      {blocks
                        .filter(b => isSuperAdmin || (b.apartmentId || b.apartment?.id) === admin?.managedApartmentId)
                        .map((b) => <option key={b.id} value={b.id}>{b.blockName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Floor Level</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500" 
                      placeholder="e.g. 1" 
                      value={flatData.floorNumber} 
                      onChange={(e) => setFlatData({ ...flatData, floorNumber: e.target.value })} 
                      disabled={!!editingId} 
                    />
                  </div>

                  {!editingId && flatData.isBulk ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Starting Flat Number</label>
                        <input 
                          type="number" 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-800 bg-white" 
                          placeholder="e.g. 101" 
                          value={flatData.startFlatNo} 
                          onChange={(e) => setFlatData({ ...flatData, startFlatNo: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Quantity</label>
                        <input 
                          type="number" 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-800 bg-white" 
                          placeholder="e.g. 10" 
                          value={flatData.numFlats} 
                          onChange={(e) => setFlatData({ ...flatData, numFlats: e.target.value })} 
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Flat Identifier</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500" 
                        placeholder="e.g. 101" 
                        value={flatData.flatNumber} 
                        onChange={(e) => setFlatData({ ...flatData, flatNumber: e.target.value })} 
                        disabled={!!editingId} 
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Configuration Type</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500 appearance-none" 
                      value={flatData.type} 
                      onChange={(e) => setFlatData({ ...flatData, type: e.target.value })} 
                      disabled={!!editingId}
                    >
                      <option value="">-- Layout --</option>
                      <option value="1BHK">1 BHK Layout</option>
                      <option value="2BHK">2 BHK Layout</option>
                      <option value="3BHK">3 BHK Layout</option>
                      <option value="4BHK">4 BHK Layout +</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Status</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-800 bg-white appearance-none" 
                      value={flatData.status} 
                      onChange={(e) => setFlatData({ ...flatData, status: e.target.value })}
                    >
                      <option value="AVAILABLE">🟢 Available for Allocation</option>
                      <option value="ALLOCATED">🔴 Currently Allocated</option>
                      <option value="UNDER_MAINTENANCE">⚠️ Under Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 relative z-10">
                  {editingId && <button className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-colors" onClick={resetForms}>Cancel</button>}
                  <button 
                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-md shadow-primary/20 transition-colors" 
                    onClick={handleSubmitFlat}
                  >
                    {editingId ? "Update Status" : (flatData.isBulk ? `Generate ${flatData.numFlats || 0} Housing Units` : "Register Single Unit")}
                  </button>
                </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-slate-800">Unit Directory <span className="bg-slate-100 text-slate-600 py-1 px-2.5 rounded-lg text-sm ml-2">{filteredFlats.length} total</span></h3>
                  {!showFlatForm && !editingId && (
                    <button 
                      onClick={() => setShowFlatForm(true)} 
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold shadow-md transition-all"
                    >
                      + Add Flat
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-slate-600 whitespace-nowrap">Filter by Status:</label>
                  <select
                    className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-700 outline-none shadow-sm cursor-pointer"
                    value={flatFilterStatus}
                    onChange={(e) => setFlatFilterStatus(e.target.value)}
                  >
                    <option value="ALL">Viewing All</option>
                    <option value="AVAILABLE">Available Only</option>
                    <option value="ALLOCATED">Allocated Only</option>
                    <option value="UNDER_MAINTENANCE">Maintenance Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredFlats.length > 0 ? (
                  filteredFlats.map((f) => (
                    <div key={f.id} className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-shadow gap-4 relative overflow-hidden group">
                      
                      {/* Left color bar indicating status */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        f.status === 'AVAILABLE' ? 'bg-emerald-400' : 
                        f.status === 'ALLOCATED' ? 'bg-indigo-400' : 'bg-amber-400'
                      }`}></div>

                      <div className="pl-3 flex-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                        <div>
                          <div className="flex items-center gap-2">
                             <h4 className="text-lg font-bold text-slate-800">Flat {f.flatNumber}</h4>
                             <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase ${
                                  f.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 
                                  f.status === 'ALLOCATED' ? 'bg-indigo-100 text-indigo-700' : 
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {f.status ? f.status.replace("_", " ") : "UNKNOWN"}
                             </span>
                          </div>
                          <div className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                            <span className="bg-slate-100 px-2 rounded">{f.type}</span>
                            <span>•</span>
                            <span>Floor {f.floorNumber}</span>
                          </div>
                        </div>

                        <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

                        <div className="text-sm text-slate-500 flex flex-col justify-center">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            <span className="font-medium text-slate-700">{f.apartmentName || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
                            <span>Block: {f.blockName || "Unknown"}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none p-2 bg-slate-100 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-200" onClick={() => handleEditFlat(f)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          <span className="sm:hidden text-sm font-semibold">Edit</span>
                        </button>
                        <button className="flex-1 sm:flex-none p-2 bg-slate-100 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-200" onClick={() => handleDeleteFlat(f.id)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          <span className="sm:hidden text-sm font-semibold">Delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mt-2">
                    No matching housing units found.
                  </div>
                )}
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
