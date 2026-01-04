import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../styles/pages/dashboard.css'; // Reuse dashboard styles for cards

const CaseList = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    const filteredCases = cases.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category ? c.category === category : true;
        return matchesSearch && matchesCategory;
    });

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/cases/public');
                setCases(res.data);
            } catch (err) {
                console.error("Failed to fetch cases", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, []);

    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading cases...</div>;

    return (
        <div className="container page-content" style={{ padding: '80px 20px 40px' }}>
            <div className="section-header" style={{ marginBottom: '30px' }}>
                <h2>Open Legal Cases</h2>
                <p>Browse cases posted by clients looking for legal representation.</p>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search cases..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, padding: '10px' }}
                />
                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="form-select"
                    style={{ width: '200px', padding: '10px' }}
                >
                    <option value="">All Categories</option>
                    {['Family Law', 'Criminal Law', 'Property Law', 'Corporate Law', 'Civil Litigation', 'Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {filteredCases.length === 0 ? (
                <p>No open cases found matching your criteria.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {filteredCases.map((c) => (
                        <div key={c._id} className="card case-card" style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <span className={`badge badge-${c.urgency?.toLowerCase() || 'medium'}`}
                                    style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        background: c.urgency === 'HIGH' ? '#fecaca' : '#e5e7eb',
                                        color: c.urgency === 'HIGH' ? '#991b1b' : '#374151'
                                    }}>
                                    {c.urgency || 'MEDIUM'}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    {new Date(c.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', margin: '0 0 10px 0', color: '#1f2937' }}>{c.title}</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {c.description}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 500, color: '#4b5563', fontSize: '0.9rem' }}>{c.category}</span>
                                {/* Assuming logged in user should view details, or maybe public can't view full details? 
                                    If user is logged in, they can view. If not, maybe redirect to login? 
                                    Link to existing details page. */}
                                <Link to={`/cases/view/${c._id}`} className="btn-link" style={{ color: '#2563eb' }}>View Details &rarr;</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CaseList;
