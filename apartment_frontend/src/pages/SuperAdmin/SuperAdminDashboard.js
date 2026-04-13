import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";

const BuildingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22V12h6v10" />
        <line x1="8" y1="6" x2="8.01" y2="6" />
        <line x1="16" y1="6" x2="16.01" y2="6" />
        <line x1="8" y1="10" x2="8.01" y2="10" />
        <line x1="16" y1="10" x2="16.01" y2="10" />
    </svg>
);

const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const StatsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const EditIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);

const LockIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

function SuperAdminDashboard() {
    const [stats, setStats] = useState(null);
    const [apartments, setApartments] = useState([]);
    const [availableApartments, setAvailableApartments] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [showAptModal, setShowAptModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showEditAptModal, setShowEditAptModal] = useState(false);
    const [editingApt, setEditingApt] = useState({ name: "", address: "" });
    const [editingAdmin, setEditingAdmin] = useState(null);

    const [newApt, setNewApt] = useState({ name: "", address: "" });
    const [newAdmin, setNewAdmin] = useState({
        username: "", email: "", password: "", contactNumber: "", apartmentId: "", role: "ROLE_ADMIN"
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [statsRes, aptsRes, adminsRes] = await Promise.all([
                axiosInstance.get("/apartments/overall-dashboard"),
                axiosInstance.get("/apartments?size=100"),
                axiosInstance.get("/users?role=ROLE_ADMIN")
            ]);
            setStats(statsRes.data.data);
            setApartments(aptsRes.data.data.content || []);
            setAdmins(adminsRes.data.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableApts = async () => {
        try {
            const res = await axiosInstance.get("/apartments/available");
            let available = res.data.data || [];

            if (editingAdmin && editingAdmin.managedApartmentId) {
                const current = apartments.find(a => a.id === editingAdmin.managedApartmentId);
                if (current && !available.some(a => a.id === current.id)) {
                    available = [current, ...available];
                }
            }
            setAvailableApartments(available);
        } catch (err) { console.error("Error fetching available apartments", err); }
    };

    useEffect(() => {
        if (showAdminModal) {
            fetchAvailableApts();
        }
    }, [showAdminModal, editingAdmin]);

    const handleCreateApartment = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post("/apartments", newApt);
            setShowAptModal(false);
            setNewApt({ name: "", address: "" });
            fetchInitialData();
        } catch (err) { alert("Failed to create apartment"); }
    };

    const handleUpdateApartment = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/apartments/${editingApt.id}`, editingApt);
            setShowEditAptModal(false);
            fetchInitialData();
        } catch (err) { alert("Failed to update apartment"); }
    };

    const handleDeleteApartment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this apartment? This action cannot be undone.")) return;
        try {
            await axiosInstance.delete(`/apartments/${id}`);
            fetchInitialData();
        } catch (err) { alert("Failed to delete apartment"); }
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAdmin) {
                await axiosInstance.put(`/admin/users/${editingAdmin.id}`, newAdmin);
            } else {
                await axiosInstance.post("/users", newAdmin);
            }
            setShowAdminModal(false);
            setEditingAdmin(null);
            setNewAdmin({ username: "", email: "", password: "", contactNumber: "", apartmentId: "", role: "ROLE_ADMIN" });
            fetchInitialData();
        } catch (err) { alert("Failed to save admin: " + (err.response?.data?.message || err.message)); }
    };

    const toggleAdminStatus = async (id, currentStatus) => {
        try {
            const action = currentStatus === "APPROVED" ? "deactivate" : "reactivate";
            await axiosInstance.put(`/admin/users/${id}/${action}`);
            fetchInitialData();
        } catch (err) { alert("Failed to toggle admin status"); }
    };

    const toggleAptStatus = async (id, currentStatus) => {
        try {
            const action = currentStatus === "ENABLED" ? "disable" : "enable";
            await axiosInstance.put(`/apartments/${id}/${action}`);
            fetchInitialData();
        } catch (err) { alert("Failed to toggle status"); }
    };

    if (loading && !stats) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-slate-500 font-medium tracking-wide animate-pulse">Loading Super Dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-primary-100 selection:text-primary-900">
            {/* Sidebar */}
            <aside className={`bg-sidebar text-white flex flex-col shadow-xl z-20 sticky top-0 hidden md:flex h-screen transition-all duration-300 relative ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="p-6 flex items-center gap-3 border-b border-white/10 overflow-hidden">
                    <div className="p-2 bg-gradient-to-br from-primary to-indigo-600 rounded-xl shadow-lg shadow-primary/30 shrink-0">
                        <BuildingIcon />
                    </div>
                    {isSidebarOpen && (
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 whitespace-nowrap">Secure Gate</span>
                    )}
                </div>
                
                {/* Desktop Sidebar Toggle Button */}
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-8 bg-white text-slate-800 p-1 rounded-full shadow-md border border-slate-200 z-50 hover:bg-slate-50 transition-colors hidden md:block"
                >
                    <svg className={`w-4 h-4 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                
                <nav className="flex-1 py-6 px-4 space-y-2">
                    {[
                        { id: "dashboard", label: "Overview", icon: <StatsIcon /> },
                        { id: "apartments", label: "Apartments", icon: <BuildingIcon /> },
                        { id: "admins", label: "Admins", icon: <UserIcon /> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium
                                ${activeTab === tab.id 
                                ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]" 
                                : "text-slate-400 hover:text-white hover:bg-white/5"} ${!isSidebarOpen && 'justify-center'}`}
                            onClick={() => setActiveTab(tab.id)}
                            title={!isSidebarOpen ? tab.label : undefined}
                        >
                            <span className={activeTab === tab.id ? "text-primary" : ""}>{tab.icon}</span>
                            {isSidebarOpen && <span className="whitespace-nowrap">{tab.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button className={`w-full py-3 px-4 bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 rounded-xl transition-colors duration-200 text-sm font-semibold flex items-center gap-2 justify-center`}
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/";
                        }}
                        title={!isSidebarOpen ? "Logout" : undefined}>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        {isSidebarOpen && <span className="whitespace-nowrap">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden bg-sidebar text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
                 <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg">
                        <BuildingIcon />
                    </div>
                    <span className="text-lg font-bold">Secure Gate</span>
                </div>
                <div className="flex gap-2">
                    {["dashboard", "apartments", "admins"].map(tab => (
                        <button key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${activeTab === tab ? "bg-primary-500/20 text-primary-300" : "bg-white/5 text-slate-300"}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto no-scrollbar">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-800 capitalize tracking-tight">{activeTab}</h2>
                    <div className="px-4 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-sm font-semibold shadow-inner flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        Super Admin
                    </div>
                </header>

                <div className="p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full">
                    {/* Dashboard Tab */}
                    {activeTab === "dashboard" && (
                        <div className="animate-[fadeIn_0.5s_ease-out]">
                            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                <StatCard title="Total Communities" value={stats?.totalApartments} icon={<BuildingIcon />} colorFrom="from-indigo-500" colorTo="to-blue-500" shadowColor="shadow-blue-500/20" />
                                <StatCard title="Management Units" value={stats?.totalBlocks} icon={<StatsIcon />} colorFrom="from-indigo-500" colorTo="to-blue-500" shadowColor="shadow-blue-500/20" />
                                <StatCard title="Total Capacity" value={stats?.totalFlats} icon={<StatsIcon />} colorFrom="from-indigo-500" colorTo="to-blue-500" shadowColor="shadow-blue-500/20" />
                                <StatCard title="Active Population" value={stats?.totalResidents} icon={<UserIcon />} colorFrom="from-indigo-500" colorTo="to-blue-500" shadowColor="shadow-blue-500/20" />
                            </section>
                            
                            <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome back to the Command Center</h3>
                                <p className="text-slate-500">Monitor all activities, manage societies, and orchestrate the overall platform health from here.</p>
                                <div className="mt-6 h-48 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center flex-col gap-3">
                                   <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-300">
                                      <StatsIcon />
                                   </div>
                                   <p className="text-slate-400 font-medium text-sm">Analytics coming soon</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Apartments Tab */}
                    {activeTab === "apartments" && (
                        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <p className="text-slate-500 text-lg">Manage societies and communities registered in the system.</p>
                                <button className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2" 
                                    onClick={() => setShowAptModal(true)}>
                                    <PlusIcon /> Add Apartment
                                </button>
                            </div>
                            
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm tracking-wider uppercase">
                                                <th className="px-6 py-4 font-semibold">Name</th>
                                                <th className="px-6 py-4 font-semibold">Address</th>
                                                <th className="px-6 py-4 font-semibold text-center mt-auto">Status</th>
                                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {apartments.map(apt => (
                                                <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{apt.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 text-sm max-w-[200px] truncate" title={apt.address}>{apt.address}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none
                                                            ${apt.status === "ENABLED" 
                                                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                                                            : "bg-red-100 text-red-700 border border-red-200"}`}>
                                                            {apt.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20" 
                                                                onClick={() => {
                                                                    setEditingApt(apt);
                                                                    setShowEditAptModal(true);
                                                                }} title="Edit">
                                                                <EditIcon />
                                                            </button>
                                                            <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border
                                                                ${apt.status === "ENABLED" 
                                                                ? "text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200" 
                                                                : "text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"}`}
                                                                onClick={() => toggleAptStatus(apt.id, apt.status)}>
                                                                <LockIcon /> {apt.status === "ENABLED" ? "Deactivate" : "Enable"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {apartments.length === 0 && (
                                                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-medium">No apartments found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admins Tab */}
                    {activeTab === "admins" && (
                        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <p className="text-slate-500 text-lg">Assign Society Admins to handle apartment operations.</p>
                                <button className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2" 
                                    onClick={() => {
                                        setEditingAdmin(null);
                                        setNewAdmin({ username: "", email: "", password: "", contactNumber: "", apartmentId: "", role: "ROLE_ADMIN" });
                                        setShowAdminModal(true);
                                    }}>
                                    <PlusIcon /> New Admin
                                </button>
                            </div>
                            
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm tracking-wider uppercase">
                                                <th className="px-6 py-4 font-semibold">Admin Info</th>
                                                <th className="px-6 py-4 font-semibold">Assigned Community</th>
                                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {admins.map(admin => (
                                                <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800">{admin.username}</div>
                                                        <div className="text-sm text-slate-500">{admin.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {admin.managedApartmentName ? (
                                                            <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                                                                {admin.managedApartmentName}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 italic text-sm">Unassigned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none bg-blue-100 text-blue-700 border border-blue-200">
                                                            {admin.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20" 
                                                                onClick={() => {
                                                                    setEditingAdmin(admin);
                                                                    setNewAdmin({
                                                                        username: admin.username, email: admin.email,
                                                                        contactNumber: admin.contactNumber,
                                                                        apartmentId: admin.managedApartmentId || "",
                                                                        role: "ROLE_ADMIN"
                                                                    });
                                                                    setShowAdminModal(true);
                                                                }} title="Edit Admin">
                                                                <EditIcon />
                                                            </button>
                                                            <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border
                                                                ${admin.status === "APPROVED" 
                                                                ? "text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200" 
                                                                : "text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"}`}
                                                                onClick={() => toggleAdminStatus(admin.id, admin.status)}>
                                                                <LockIcon /> {admin.status === "APPROVED" ? "Deactivate" : "Activate"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {admins.length === 0 && (
                                                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-medium">No admins found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modals */}
            <ModalOverlay isVisible={showAptModal || showEditAptModal || showAdminModal} onClose={() => {
                 setShowAptModal(false); setShowEditAptModal(false); setShowAdminModal(false);
            }}>
                {showAptModal && (
                    <div className="p-6 md:p-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">Register New Community</h3>
                        <form onSubmit={handleCreateApartment} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Apartment Name</label>
                                <input type="text" placeholder="e.g. Green Valley Society" required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800 placeholder-slate-400"
                                    value={newApt.name} onChange={e => setNewApt({ ...newApt, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Address</label>
                                <input type="text" placeholder="Location details..." required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-800 placeholder-slate-400"
                                    value={newApt.address} onChange={e => setNewApt({ ...newApt, address: e.target.value })} />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => setShowAptModal(false)}>Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-md shadow-primary/20 transition-colors">Create Apartment</button>
                            </div>
                        </form>
                    </div>
                )}

                {showEditAptModal && (
                    <div className="p-6 md:p-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">Edit Community Details</h3>
                        <form onSubmit={handleUpdateApartment} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Apartment Name</label>
                                <input type="text" required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                    value={editingApt.name} onChange={e => setEditingApt({ ...editingApt, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Address</label>
                                <input type="text" required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                    value={editingApt.address} onChange={e => setEditingApt({ ...editingApt, address: e.target.value })} />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => setShowEditAptModal(false)}>Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-md shadow-primary/20 transition-colors">Save Changes</button>
                            </div>
                        </form>
                    </div>
                )}

                {showAdminModal && (
                    <div className="p-6 md:p-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">{editingAdmin ? "Edit Society Admin" : "Create Society Admin"}</h3>
                        <form onSubmit={handleAdminSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                                    <input type="text" required value={newAdmin.username}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                        onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                                    <input type="email" required value={newAdmin.email}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                        onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} />
                                </div>
                                {!editingAdmin && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                                        <input type="password" required value={newAdmin.password}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                            onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Number</label>
                                    <input type="text" value={newAdmin.contactNumber}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800"
                                        onChange={e => setNewAdmin({ ...newAdmin, contactNumber: e.target.value })} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Allocate Apartment</label>
                                    <select required value={newAdmin.apartmentId}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800 appearance-none bg-white"
                                        onChange={e => setNewAdmin({ ...newAdmin, apartmentId: e.target.value })}>
                                        <option value="">Select a community...</option>
                                        {availableApartments.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => {
                                    setShowAdminModal(false);
                                    setEditingAdmin(null);
                                }}>Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-md shadow-primary/20 transition-colors">
                                    {editingAdmin ? "Update Admin" : "Create & Allocate"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </ModalOverlay>
        </div>
    );
}

function StatCard({ title, value, icon, colorFrom, colorTo, shadowColor }) {
    return (
        <div className={`bg-gradient-to-br ${colorFrom} ${colorTo} rounded-3xl p-6 text-white shadow-xl ${shadowColor} relative overflow-hidden group`}>
            {/* Background design elements */}
            <div className="absolute -right-8 -top-8 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute right-4 bottom-4 bg-white/20 p-3 rounded-2xl shadow-inner backdrop-blur-sm group-hover:-translate-y-1 transition-transform duration-300">
                <div className="w-6 h-6 opacity-80">{icon}</div>
            </div>
            
            <div className="relative z-10">
                <h3 className="text-white/80 font-medium text-sm lg:text-base tracking-wide mb-1 uppercase drop-shadow-sm">{title}</h3>
                <div className="text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-md">
                    {value !== undefined ? value : "..."}
                </div>
            </div>
        </div>
    );
}

function ModalOverlay({ isVisible, onClose, children }) {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transition-all transform scale-100 opacity-100">
                {children}
            </div>
        </div>
    );
}

export default SuperAdminDashboard;
