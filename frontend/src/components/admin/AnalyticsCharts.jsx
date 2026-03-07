import React from 'react';

export const BarChart = ({ data, labels, color = '#3b82f6' }) => {
    // Determine max value for scaling
    const max = Math.max(...data, 1);

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '8px', paddingTop: '20px' }}>
            {data.map((value, index) => (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{
                            width: '100%',
                            height: `${(value / max) * 100}%`,
                            background: color,
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.5s ease'
                        }}></div>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                        {labels[index]}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const KPICard = ({ title, value, subtext, color = '#1e293b' }) => (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', flex: 1, minWidth: '200px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>{title}</h4>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
        {subtext && <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{subtext}</div>}
    </div>
);
