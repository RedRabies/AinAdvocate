import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import ChatWindow from '../../components/chat/ChatWindow';

import AppointmentScheduler from '../../components/appointment/AppointmentScheduler';
import PaymentForm from '../../components/payment/PaymentForm';
import InvoiceViewer from '../../components/payment/InvoiceViewer';

const CaseChat = () => {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('chat');

    useEffect(() => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if user is nested or flat
                const userData = decoded.user || decoded;
                setUser(userData);
            } catch (e) {
                console.error("Token decode error", e);
                localStorage.removeItem('token'); // Clear invalid token
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
        setLoading(false);
    }, [navigate]);

    if (loading) return <div className="p-10 text-center">Loading chat interface...</div>;
    if (!user) return <div className="p-10 text-center text-red-500">Access Denied. Please log in.</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="max-w-6xl mx-auto">
                {/* Modern Tabs */}
                {/* Floating Dock Navigation Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-white/60 backdrop-blur-xl p-2 rounded-2xl border border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] gap-2">
                        <button
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] relative group ${activeTab === 'chat'
                                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                                }`}
                            onClick={() => setActiveTab('chat')}
                        >
                            <span className="text-xl">💬</span>
                            <span>Chat Room</span>
                        </button>

                        <button
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] relative ${activeTab === 'appointments'
                                    ? 'bg-gradient-to-tr from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                                }`}
                            onClick={() => setActiveTab('appointments')}
                        >
                            <span className="text-xl">📅</span>
                            <span>Appointments</span>
                        </button>

                        <button
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] relative ${activeTab === 'payments'
                                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                                }`}
                            onClick={() => setActiveTab('payments')}
                        >
                            <span className="text-xl">�</span>
                            <span>Payments</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {activeTab === 'chat' && (
                        <ChatWindow caseId={caseId} currentUser={user} />
                    )}

                    {activeTab === 'appointments' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AppointmentScheduler caseId={caseId} currentUser={user} />
                            <div className="bg-blue-50 p-6 rounded-lg">
                                <h4 className="font-bold text-lg mb-2">Instructions</h4>
                                <p className="text-sm text-gray-700">Select a date and time to request a meeting with your lawyer. Once confirmed, it will appear in the list.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <PaymentForm caseId={caseId} currentUser={user} />
                            <InvoiceViewer caseId={caseId} currentUser={user} />
                        </div>
                    )}
                </div>
            </div>
            {/* Footer if needed */}
        </div>
    );
};

export default CaseChat;
