import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../components/common/Toast';
import { Link } from 'react-router-dom';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    // Negotiation State
    const [viewingNegotiation, setViewingNegotiation] = useState(null); // App ID
    const [negotiationData, setNegotiationData] = useState({ amount: '', message: '' });

    const fetchApplications = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/cases/lawyer/my-applications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(res.data);
        } catch (err) {
            console.error(err);
            addToast('Failed to load applications', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleNegotiate = async (appId) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/cases/applications/${appId}/negotiate`, negotiationData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast('Counter-offer sent!', 'success');
            setViewingNegotiation(null);
            fetchApplications();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to negotiate', 'error');
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/lawyer-dashboard" style={{ color: '#64748b', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
                &larr; Back to Dashboard
            </Link>
            <h2 className="page-title">My Applications</h2>

            {loading ? <p>Loading...</p> : applications.length === 0 ? (
                <p>You haven't applied to any cases yet.</p>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {applications.map(app => (
                        <div key={app._id} className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{
                                        background: '#bfdbfe', color: '#1e3a8a', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                                    }}>
                                        {app.caseId?.category}
                                    </span>
                                    <h3 style={{ margin: '10px 0' }}>{app.caseId?.title || 'Case Unavailable'}</h3>
                                    <p>Status: <strong style={{
                                        color: app.status === 'ACCEPTED' ? '#16a34a' :
                                            app.status === 'REJECTED' ? '#dc2626' : '#ea580c'
                                    }}>{app.status}</strong></p>
                                    <p>Current Proposal: <strong style={{ fontSize: '1.1rem' }}>৳{app.proposedFee}</strong></p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Link to={`/cases/view/${app.caseId?._id}`} className="btn btn-outline-primary" style={{ fontSize: '0.9rem', marginBottom: '10px', display: 'inline-block' }}>
                                        View Case
                                    </Link>
                                </div>
                            </div>

                            {/* Negotiation History */}
                            {app.negotiationHistory && app.negotiationHistory.length > 0 && (
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginTop: '15px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>Negotiation History</h4>
                                    <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.9rem' }}>
                                        {app.negotiationHistory.map((h, i) => (
                                            <li key={i} style={{ marginBottom: '5px', color: h.sender === 'LAWYER' ? '#2563eb' : '#16a34a' }}>
                                                <strong>{h.sender === 'LAWYER' ? 'You' : 'Client'}:</strong> ৳{h.amount} - <span style={{ color: '#555' }}>"{h.message}"</span>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(h.createdAt).toLocaleString()}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Negotiation Action */}
                            {app.status === 'APPLIED' && (
                                <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                    {viewingNegotiation === app._id ? (
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#eff6ff', padding: '10px', borderRadius: '6px' }}>
                                            <input
                                                type="number"
                                                placeholder="New Amount"
                                                className="form-input"
                                                style={{ width: '120px' }}
                                                value={negotiationData.amount}
                                                onChange={e => setNegotiationData({ ...negotiationData, amount: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Message (optional)"
                                                className="form-input"
                                                style={{ flex: 1 }}
                                                value={negotiationData.message}
                                                onChange={e => setNegotiationData({ ...negotiationData, message: e.target.value })}
                                            />
                                            <button onClick={() => handleNegotiate(app._id)} className="btn btn-primary">Send Offer</button>
                                            <button onClick={() => setViewingNegotiation(null)} className="btn btn-secondary">Cancel</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setViewingNegotiation(app._id);
                                                setNegotiationData({ amount: app.proposedFee, message: '' });
                                            }}
                                            className="btn btn-outline-primary"
                                        >
                                            Negotiate / Update Offer
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyApplications;
