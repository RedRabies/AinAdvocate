import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../../services/admin.service';
import { BarChart, KPICard } from '../../components/admin/AnalyticsCharts';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const stats = await getAnalytics();
            setData(stats);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading Analytics...</div>;
    if (!data) return <div>Failed to load data.</div>;

    // Prepare chart data
    const monthLabels = data.growth.map(g => g._id);
    const monthValues = data.growth.map(g => g.count);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* KPI Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <KPICard title="Total Cases" value={data.overview.totalCases} subtext={`${data.overview.activeCases} Active`} color="#3b82f6" />
                <KPICard title="Total Lawyers" value={data.users.lawyers} color="#8b5cf6" />
                <KPICard title="Total Clients" value={data.users.clients} color="#10b981" />
                <KPICard title="Closed Cases" value={data.overview.closedCases} color="#64748b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                {/* Growth Chart */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0 }}>Case Growth (Last 6 Months)</h3>
                    <BarChart data={monthValues} labels={monthLabels} />
                </div>

                {/* Categories */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0 }}>Cases by Category</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {data.categories.map(cat => (
                            <div key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span>{cat._id}</span>
                                <span style={{ fontWeight: 'bold' }}>{cat.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
