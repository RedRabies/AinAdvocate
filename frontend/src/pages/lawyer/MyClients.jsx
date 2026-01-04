import React, { useState, useEffect } from 'react';
import { getMyClients } from '../../services/lawyer.service';
import { useToast } from '../../components/common/Toast';
import '../../styles/components/card.css';

const MyClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await getMyClients();
            setClients(data);
        } catch (err) {
            console.error(err);
            addToast('Failed to load clients', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 className="page-title">My Clients</h2>
            {loading ? <p>Loading...</p> : (
                clients.length === 0 ? (
                    <p>No clients found.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                        {clients.map(client => (
                            <div key={client._id} className="card" style={{ padding: '20px', textAlign: 'center' }}>
                                <h3>{client.name}</h3>
                                <p>{client.email}</p>
                                <p>{client.phone}</p>
                                <button className="btn btn-primary" onClick={() => window.location.href = `mailto:${client.email}`}>
                                    Contact
                                </button>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default MyClients;
