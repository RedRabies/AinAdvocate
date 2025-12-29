import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyCases } from '../../services/case.service';
import CaseCard from '../../components/cases/CaseCard'; // Fix path relative to pages/cases
import '../../styles/components/button.css';

const MyCases = () => {
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 className="page-title" style={{ margin: 0 }}>My Cases</h2>
                    <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Track the status of your legal requests</p>
                </div>
                <button onClick={() => navigate('/cases/create')} className="btn btn-primary">
                    + New Case Request
                </button>
            </div>

            {loading ? (
                <p>Loading cases...</p>
            ) : cases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '12px' }}>
                    <h3 style={{ color: '#94a3b8' }}>No cases found</h3>
                    <p style={{ color: '#cbd5e1' }}>You haven't submitted any case requests yet.</p>
                    <button onClick={() => navigate('/cases/create')} className="btn btn-outline-primary" style={{ marginTop: '20px' }}>
                        Create your first case
                    </button>
                </div>
            ) : (
                <div>
                    {cases.map(caseItem => (
                        <CaseCard key={caseItem._id} data={caseItem} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCases;
