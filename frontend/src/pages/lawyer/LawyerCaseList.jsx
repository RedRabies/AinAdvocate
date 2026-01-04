import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../components/common/Toast';
import '../../styles/components/card.css';
import '../../styles/components/button.css';

const LawyerCaseList = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', keyword: '' });
    const [applying, setApplying] = useState(null); // Case ID being applied to
    const [appData, setAppData] = useState({ proposedFee: '', message: '' });
    const [userCategories, setUserCategories] = useState([]);
    const [isVerified, setIsVerified] = useState(false);
    const { addToast } = useToast();

    // Fetch user profile to get categories
    useEffect(() => {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
            const fetchProfile = async () => {
                try {
                    const token = sessionStorage.getItem('token');
                    // Corrected endpoint
                    const res = await axios.get('http://localhost:5000/api/lawyers/profile/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUserCategories(res.data.categories || []);
                    setIsVerified(res.data.isVerified || false);
                } catch (err) {
                    console.error("Failed to fetch lawyer profile", err);
                }
            };
            fetchProfile();
        }
    }, []);

    const fetchCases = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const query = new URLSearchParams(filters).toString();
            const res = await axios.get(`http://localhost:5000/api/cases/search?${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCases(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
    }, [filters.category]); // Auto-refresh on category change

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/cases/${applying}/apply`, appData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast('Application submitted successfully!', 'success');
            setApplying(null);
            setAppData({ proposedFee: '', message: '' });
            fetchCases(); // Refresh to update logic if needed
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to apply', 'error');
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 className="page-title">Find Cases</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                        className="form-select"
                        style={{ padding: '8px', borderRadius: '6px' }}
                        value={filters.category}
                        onChange={e => setFilters({ ...filters, category: e.target.value })}
                    >
                        <option value="">All Categories</option>
                        {['Family Law', 'Criminal Law', 'Property Law', 'Corporate Law', 'Civil Litigation', 'Other'].map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <button onClick={fetchCases} className="btn btn-outline-primary">Search</button>
                </div>
            </div>

            {loading ? <div style={{ textAlign: 'center' }}>Loading cases...</div> : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {cases.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#666' }}>No open cases found matching your criteria.</div>
                    ) : (
                        cases.map(caseItem => (
                            <div key={caseItem._id} className="card" style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <h3 style={{ margin: 0 }}>{caseItem.title}</h3>
                                        <span style={{
                                            background: '#e0f2fe', color: '#0369a1',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                                        }}>
                                            {caseItem.category}
                                        </span>
                                        <span style={{
                                            background: caseItem.urgency === 'HIGH' ? '#fee2e2' : '#f1f5f9',
                                            color: caseItem.urgency === 'HIGH' ? '#b91c1c' : '#64748b',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem'
                                        }}>
                                            {caseItem.urgency}
                                        </span>
                                    </div>
                                    <p style={{ color: '#444', marginBottom: '15px' }}>{caseItem.description}</p>
                                    <div style={{ fontSize: '0.9rem', color: '#888' }}>
                                        Posted by: {caseItem.clientId?.name || 'Client'} • {new Date(caseItem.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    {(() => {
                                        const matchesCategory = userCategories.some(cat =>
                                            cat.toLowerCase().trim() === caseItem.category.toLowerCase().trim() ||
                                            caseItem.category.toLowerCase().includes(cat.toLowerCase().trim()) ||
                                            cat.toLowerCase().includes(caseItem.category.toLowerCase().trim())
                                        );

                                        const isEligible = isVerified && matchesCategory;

                                        return isEligible ? (
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <Link to={`/cases/view/${caseItem._id}`} className="btn btn-outline-primary" style={{ fontSize: '0.9rem', textDecoration: 'none' }}>
                                                    View Details
                                                </Link>
                                                <button
                                                    onClick={() => setApplying(caseItem._id)}
                                                    className="btn btn-primary"
                                                    style={{ whiteSpace: 'nowrap' }}
                                                >
                                                    Apply Now
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <Link to={`/cases/view/${caseItem._id}`} className="btn btn-outline-primary" style={{ fontSize: '0.9rem', textDecoration: 'none' }}>
                                                    View Details
                                                </Link>
                                                <button
                                                    disabled
                                                    className="btn btn-secondary"
                                                    style={{ whiteSpace: 'nowrap', opacity: 0.6, cursor: 'not-allowed' }}
                                                    title={!isVerified ? "Your account is not verified yet." : `Required: ${caseItem.category}. Your categories: ${userCategories.length > 0 ? userCategories.join(', ') : 'None set (Update Profile)'}`}
                                                >
                                                    {!isVerified ? "Not Verified" : "Not Eligible"}
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Application Modal */}
            {applying && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    backdropFilter: 'blur(2px)'
                }}>
                    <div style={{
                        background: '#334155', // Slate-700
                        padding: '30px',
                        borderRadius: '12px',
                        width: '500px',
                        maxWidth: '90%',
                        color: '#f8fafc',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🌐</span>
                            <span style={{ fontWeight: '600', fontSize: '1rem', color: '#f1f5f9' }}>Apply for Case</span>
                        </div>

                        <p style={{ color: '#cbd5e1', marginBottom: '20px', fontSize: '0.95rem' }}>
                            Enter your proposal details below to apply for this case.
                        </p>

                        <form onSubmit={handleApply}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#e2e8f0' }}>Proposed Fee (BDT)</label>
                                <input
                                    type="number"
                                    required
                                    className="form-input-dark"
                                    style={{
                                        width: '100%',
                                        padding: '10px 15px',
                                        borderRadius: '8px',
                                        border: '2px solid #06b6d4', // Cyan border
                                        background: '#1e293b', // Slate-800
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                    value={appData.proposedFee}
                                    onChange={e => setAppData({ ...appData, proposedFee: e.target.value })}
                                    placeholder="e.g. 5000"
                                />
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#e2e8f0' }}>Message to Client</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="form-textarea-dark"
                                    style={{
                                        width: '100%',
                                        padding: '10px 15px',
                                        borderRadius: '8px',
                                        border: '2px solid #06b6d4', // Cyan border
                                        background: '#1e293b',
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                    placeholder="Describe why you are the best fit..."
                                    value={appData.message}
                                    onChange={e => setAppData({ ...appData, message: e.target.value })}
                                ></textarea>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="submit" className="btn" style={{
                                    background: '#06b6d4',
                                    color: 'white',
                                    fontWeight: '600',
                                    border: 'none',
                                    padding: '10px 24px',
                                    borderRadius: '6px'
                                }}>OK</button>
                                <button type="button" onClick={() => setApplying(null)} className="btn" style={{
                                    background: '#475569',
                                    color: 'white',
                                    fontWeight: '600',
                                    border: 'none',
                                    padding: '10px 24px',
                                    borderRadius: '6px'
                                }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LawyerCaseList;
