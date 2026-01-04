import React, { useState, useEffect } from 'react';
import { getCaseInbox, acceptCase } from '../../services/case.service';
import { useToast } from '../../components/common/Toast';
import '../../styles/components/card.css';

const CaseInbox = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        loadInbox();
    }, []);

    const loadInbox = async () => {
        try {
            const data = await getCaseInbox();
            setCases(data);
        } catch (err) {
            console.error(err);
            addToast('Failed to load pending cases', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        if (!window.confirm("Are you sure you want to take this case?")) return;
        try {
            await acceptCase(id);
            addToast('Case accepted!', 'success');
            setCases(cases.filter(c => c._id !== id));
        } catch (err) {
            console.error(err);
            addToast('Failed to accept case', 'error');
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 className="page-title">Case Inbox</h2>
            {loading ? <p>Loading...</p> : (
                cases.length === 0 ? (
                    <p>No pending cases found.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {cases.map(item => (
                            <div key={item._id} className="card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                                <h3>{item.title}</h3>
                                <p style={{ color: '#666' }}>Category: {item.category}</p>
                                <p>{item.description}</p>
                                <button className="btn btn-primary" onClick={() => handleAccept(item._id)}>
                                    Accept Case
                                </button>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default CaseInbox;
