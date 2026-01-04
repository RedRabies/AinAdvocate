import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getMyCases } from '../../services/case.service';
import '../../styles/components/button.css';
import { useToast } from '../../components/common/Toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const MyCases = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingApps, setViewingApps] = useState(null); // Case ID
    const [applications, setApplications] = useState([]);

    const [hireModal, setHireModal] = useState({ open: false, caseId: null, lawyerId: null });

    // Negotiation State
    const [viewingNegotiation, setViewingNegotiation] = useState(null); // App ID
    const [negotiationData, setNegotiationData] = useState({ amount: '', message: '' });

    const handleNegotiate = async (appId) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/cases/applications/${appId}/negotiate`, negotiationData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast('Offer sent!', 'success');
            setViewingNegotiation(null);
            // Refresh applications
            const res = await axios.get(`http://localhost:5000/api/cases/${viewingApps}/applications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(res.data);
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to negotiate', 'error');
        }
    };

    useEffect(() => {
        loadCases();
    }, []);

    const loadCases = async () => {
        try {
            const data = await getMyCases();
            setCases(data);
        } catch (err) {
            console.error("Failed to load cases", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewApps = async (caseId) => {
        setViewingApps(caseId);
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/cases/${caseId}/applications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(res.data);
        } catch (err) {
            addToast('Failed to load applications', 'error');
        }
    };

    const handleSelectLawyer = (caseId, lawyerId) => {
        setHireModal({ open: true, caseId, lawyerId });
    };

    const confirmHire = async () => {
        const { caseId, lawyerId } = hireModal;
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/cases/${caseId}/select-lawyer/${lawyerId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast('Lawyer hired successfully!', 'success');
            setViewingApps(null);
            loadCases(); // Refresh status
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to select lawyer', 'error');
        } finally {
            setHireModal({ open: false, caseId: null, lawyerId: null });
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 className="page-title" style={{ margin: 0 }}>My Cases</h2>
                    <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Track your requests and manage applicants</p>
                </div>
                <button onClick={() => navigate('/cases/create')} className="btn btn-primary">
                    + New Case Request
                </button>
            </div>

            {loading ? <p>Loading...</p> : cases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '12px' }}>
                    <p>No cases found.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {cases.map(c => (
                        <div key={c._id} className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3>{c.title}</h3>
                                    <span style={{
                                        background: c.status === 'OPEN' ? '#dbeafe' : '#f1f5f9',
                                        color: c.status === 'OPEN' ? '#1e40af' : '#64748b',
                                        padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem'
                                    }}>
                                        {c.status}
                                    </span>
                                    <p style={{ color: '#666', marginTop: '10px' }}>{c.description}</p>
                                    {c.budget > 0 && (c.status === 'ASSIGNED' || c.status === 'CLOSED' || c.status === 'IN_PROGRESS') && (
                                        <p style={{ fontWeight: 'bold', color: '#10b981', marginTop: '5px' }}>Agreed Fee: ৳{c.budget}</p>
                                    )}
                                </div>
                                {c.status === 'OPEN' ? (
                                    <button onClick={() => handleViewApps(c._id)} className="btn btn-outline-primary">
                                        View Applicants
                                    </button>
                                ) : (
                                    <button onClick={() => navigate(`/cases/${c._id}/communicate`)} className="btn btn-primary">
                                        Open Case Dashboard
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Applications Modal */}
            {viewingApps && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '600px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3>Lawyer Proposals</h3>
                            <button onClick={() => setViewingApps(null)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {applications.length === 0 ? (
                            <p>No lawyers have applied yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {applications.map(app => (
                                    <div key={app._id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <h4 style={{ margin: 0 }}>{app.lawyerId.name}</h4>
                                            <span style={{ fontWeight: 'bold', color: '#16a34a' }}>Quote: ৳{app.proposedFee}</span>
                                        </div>
                                        <p style={{ margin: '10px 0', color: '#555', fontStyle: 'italic' }}>"{app.message}"</p>

                                        {/* Negotiation History */}
                                        {app.negotiationHistory && app.negotiationHistory.length > 0 && (
                                            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '0.9rem' }}>
                                                <strong>Negotiation History:</strong>
                                                <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                                                    {app.negotiationHistory.map((h, i) => (
                                                        <li key={i} style={{ color: h.sender === 'CLIENT' ? '#2563eb' : '#16a34a' }}>
                                                            {h.sender === 'CLIENT' ? 'You' : 'Lawyer'}: ৳{h.amount} - "{h.message}"
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
                                            {/* Negotiation Input (Toggle) */}
                                            {viewingNegotiation === app._id ? (
                                                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                    <input
                                                        type="number"
                                                        placeholder="Amt"
                                                        className="form-input"
                                                        style={{ width: '80px', padding: '6px' }}
                                                        value={negotiationData.amount}
                                                        onChange={e => setNegotiationData({ ...negotiationData, amount: e.target.value })}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Msg"
                                                        className="form-input"
                                                        style={{ width: '120px', padding: '6px' }}
                                                        value={negotiationData.message}
                                                        onChange={e => setNegotiationData({ ...negotiationData, message: e.target.value })}
                                                    />
                                                    <button onClick={() => handleNegotiate(app._id)} className="btn btn-sm btn-primary">Send</button>
                                                    <button onClick={() => setViewingNegotiation(null)} className="btn btn-sm btn-secondary">x</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setViewingNegotiation(app._id);
                                                        setNegotiationData({ amount: app.proposedFee, message: '' });
                                                    }}
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    Negotiate
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleSelectLawyer(viewingApps, app.lawyerId._id)}
                                                className="btn btn-sm btn-primary"
                                                style={{ background: '#16a34a', border: 'none' }}
                                            >
                                                Hire for ৳{app.proposedFee}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={hireModal.open}
                onClose={() => setHireModal({ ...hireModal, open: false })}
                onConfirm={confirmHire}
                title="Hire Lawyer"
                message="Are you sure you want to hire this lawyer? The agreed amount will be set as the final fee."
            />
        </div>
    );
};

export default MyCases;
