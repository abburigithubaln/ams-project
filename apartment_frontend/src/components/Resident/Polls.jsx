import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./ResidentPolls.css";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export default function ResidentPolls() {
    const [polls, setPolls] = useState([]);
    const [votedPolls, setVotedPolls] = useState({});
    const [shownResults, setShownResults] = useState({});

    useEffect(() => {
        loadPolls();
    }, []);

    const isPollActive = (status, endDate) => {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const isExpired = end < new Date();
        return status === 'ACTIVE' && !isExpired;
    };

    const loadPolls = async () => {
        try {
            const response = await axiosInstance.get("/user/polls");
            const allPolls = response.data.data || [];
            
            // Sort: Active first, then by ID descending within each group
            const sorted = [...allPolls].sort((a, b) => {
                const aActive = isPollActive(a.status, a.endDate);
                const bActive = isPollActive(b.status, b.endDate);
                
                if (aActive === bActive) {
                    return b.id - a.id; // Same status, newer first
                }
                return aActive ? -1 : 1; // Active first
            });
            
            setPolls(sorted);
        } catch (error) {
            console.error("Failed to load polls", error);
        }
    };

    const handleVote = async (pollId, option) => {
        try {
            await axiosInstance.post(`/user/polls/${pollId}/vote/${option.id}`);
            alert("Vote submitted successfully");
            // Fetch results after voting
            const resultResponse = await axiosInstance.get(`/user/polls/${pollId}/results`);
            setVotedPolls(prev => ({
                ...prev,
                [pollId]: resultResponse.data.data
            }));
        } catch (error) {
            console.error("Vote failed", error);
            alert(error.response?.data?.message || "Failed to vote");
            loadPolls();
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300'];

    return (
        <div className="resident-polls-card fade-in-up">
            <h3 className="section-title" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>Active Polls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {polls.length === 0 ? (
                    <div className="col-span-full bg-white rounded-lg shadow p-8 text-center text-gray-500" style={{ gridColumn: '1 / -1', background: 'white', borderRadius: '8px', padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                        <p className="text-lg">No active polls at the moment.</p>
                    </div>
                ) : (
                    polls.map((poll) => {
                        const active = isPollActive(poll.status, poll.endDate);
                        const hasVoted = poll.hasVoted || !!votedPolls[poll.id];
                        const showOptions = active && !hasVoted;
                        const canViewResults = !active; // Only show results after poll closes

                        return (
                            <div key={poll.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', overflow: 'hidden', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column' }}>
                                <div className="p-6 flex-grow" style={{ padding: '24px', flexGrow: 1 }}>
                                    <div className="flex justify-between items-start mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <h4 className="font-bold text-lg text-gray-800 leading-tight" style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1f2937', lineHeight: 1.25, margin: 0 }}>{poll.question}</h4>
                                        <div className="flex gap-2 items-center shrink-0 ml-3" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, marginLeft: '12px' }}>
                                            {hasVoted && <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '9999px', fontWeight: '600' }}>Voted</span>}
                                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '9999px', fontWeight: '600', backgroundColor: active ? '#d1fae5' : '#f3f4f6', color: active ? '#065f46' : '#1f2937' }}>
                                                {active ? "Active" : "Closed"}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {showOptions && (
                                        <div className="mt-6 flex flex-col gap-3" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {poll.options.map((option) => (
                                                <button
                                                    key={option.id}
                                                    className="w-full text-left px-5 py-3 rounded-lg border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 transition-colors duration-200 font-medium text-gray-700 hover:text-indigo-700 cursor-pointer text-base"
                                                    style={{ width: '100%', textAlign: 'left', padding: '12px 20px', borderRadius: '8px', border: '5px solid #e0e7ff', background: 'transparent', transition: 'all 0.2s', fontWeight: '500', color: '#374151' }}
                                                    onClick={(e) => {
                                                        e.target.style.borderColor = '#6366f1';
                                                        e.target.style.backgroundColor = '#eef2ff';
                                                        handleVote(poll.id, option);
                                                    }}
                                                    onMouseOver={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.backgroundColor = '#eef2ff'; }}
                                                    onMouseOut={(e) => { e.target.style.borderColor = '#e0e7ff'; e.target.style.backgroundColor = 'transparent'; }}
                                                >
                                                    {option.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {!showOptions && active && hasVoted && (
                                        <div className="mt-5 p-4 bg-emerald-50 rounded-lg flex items-center gap-3 text-emerald-700 font-medium" style={{ marginTop: '20px', padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', color: '#047857', fontWeight: '500' }}>
                                            <svg className="w-5 h-5 text-emerald-500 shrink-0" style={{ width: '20px', height: '20px', color: '#10b981', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span style={{ fontSize: '14px' }}>Voted successfully! Results will be available once the poll closes.</span>
                                        </div>
                                    )}

                                    {canViewResults ? (
                                        <div className="mt-6" style={{ marginTop: '24px' }}>
                                            {!shownResults[poll.id] ? (
                                                <button 
                                                    className="w-full py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                                                    style={{ width: '100%', padding: '10px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                                                    onClick={() => setShownResults(prev => ({ ...prev, [poll.id]: true }))}
                                                >
                                                    📊 View Final Results
                                                </button>
                                            ) : (
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100" style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb' }}>
                                                    <div className="flex justify-between items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                        <h5 className="font-semibold text-gray-700" style={{ fontWeight: '600', color: '#374151', margin: 0 }}>Final Statistics</h5>
                                                        <button 
                                                            className="text-sm text-gray-500 hover:text-gray-800 font-medium underline" 
                                                            style={{ fontSize: '0.875rem', color: '#6b7280', textDecoration: 'underline', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                                            onClick={() => setShownResults(prev => ({ ...prev, [poll.id]: false }))}
                                                        >
                                                            Hide
                                                        </button>
                                                    </div>
                                                    <div className="w-full h-64" style={{ width: '100%', height: '256px' }}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={poll.options.map(opt => ({
                                                                        name: opt.text,
                                                                        value: opt.voteCount || 0
                                                                    }))}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    labelLine={true}
                                                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                                    outerRadius={80}
                                                                    fill="#8884d8"
                                                                    dataKey="value"
                                                                    animationDuration={1000}
                                                                >
                                                                    {poll.options.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip />
                                                                <Legend />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-sm text-gray-500 font-medium" style={{ backgroundColor: '#f9fafb', padding: '16px 24px', borderTop: '1px solid #f3f4f6', fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                                    <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg className="w-4 h-4" style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        <span>{active ? `Ends on: ${new Date(poll.endDate).toLocaleDateString()}` : `Closed on: ${new Date(poll.endDate).toLocaleDateString()}`}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
