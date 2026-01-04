import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssignedCases, updateCaseStatus } from '../../services/case.service';
import CaseStatusControl from '../../components/cases/CaseStatusControl';
import { useToast } from '../../components/common/Toast';

const MyLawyerCases = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        loadCases();
    }, []);

    const loadCases = async () => {
        try {
            const data = await getAssignedCases();
            setCases(data);
        } catch (err) {
            console.error(err);
            addToast('Failed to load active cases', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateCaseStatus(id, newStatus);
            addToast('Status updated', 'success');
            setCases(cases.map(c => c._id === id ? { ...c, status: newStatus } : c));
        } catch (err) {
            addToast('Failed to update status', 'error');
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 className="page-title">My Active Cases</h2>
            {loading ? <p>Loading...</p> : (
                cases.length === 0 ? (
                    <p>No active cases.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {cases.map(item => (
                            <div key={item._id} className="card" style={{ padding: '20px', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h3>{item.title}</h3>
                                    <CaseStatusControl
                                        currentStatus={item.status}
                                        onChange={(s) => handleStatusChange(item._id, s)}
                                    />
                                </div>
                                <p>Client: {item.clientId?.name || 'Unknown'}</p>
                                <p>{item.description}</p>
                                <div style={{ marginTop: '10px' }}>
                                    <Link to={`/cases/${item._id}/communicate`} className="btn" style={{
                                        background: '#3b82f6', color: 'white', textDecoration: 'none',
                                        display: 'inline-block', padding: '6px 12px', borderRadius: '4px', fontSize: '0.9rem'
                                    }}>
                                        💬 Open Chat & Actions
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default MyLawyerCases;
