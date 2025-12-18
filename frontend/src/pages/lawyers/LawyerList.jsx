import React, { useState, useEffect } from 'react';
import { getAllLawyers } from '../../services/lawyer.service';
import LawyerCard from '../../components/lawyer/LawyerCard';
import '../../styles/pages/lawyers.css';
import '../../styles/components/form.css';

const LawyerList = () => {
    const [lawyers, setLawyers] = useState([]);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ location: '', specialization: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLawyers();
    }, [search, filters]);

    const loadLawyers = async () => {
        try {
            const query = { search, ...filters };
            const data = await getAllLawyers(query);
            setLawyers(data);
            setLoading(false);
        } catch (err) {
            console.error("Error loading lawyers:", err);
            setLoading(false);
        }
    };

    return (
        <div className="container lawyer-list-page">
            <h2 className="page-title">Find a Lawyer</h2>

            {/* Filter Bar */}
            <div className="filter-bar">
                <input
                    placeholder="Search by name or keyword..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="form-input"
                />
                <input
                    placeholder="Location"
                    value={filters.location}
                    onChange={e => setFilters({ ...filters, location: e.target.value })}
                    className="form-input"
                />
                <select
                    value={filters.specialization}
                    onChange={e => setFilters({ ...filters, specialization: e.target.value })}
                    className="form-select"
                >
                    <option value="">All Specializations</option>
                    <option value="Family Law">Family Law</option>
                    <option value="Criminal Law">Criminal Law</option>
                    <option value="Corporate Law">Corporate Law</option>
                    <option value="Property Law">Property Law</option>
                </select>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="lawyer-grid">
                    {lawyers.map(lawyer => (
                        <LawyerCard key={lawyer._id} lawyer={lawyer} />
                    ))}
                </div>
            )}

            {!loading && lawyers.length === 0 && <p style={{ textAlign: 'center', color: '#718096' }}>No lawyers found matching your criteria.</p>}
        </div>
    );
};

export default LawyerList;
