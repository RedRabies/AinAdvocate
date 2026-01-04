import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notification.service';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Poll every 60 seconds (Simple Refetch)
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleRead = async (n) => {
        if (!n.isRead) {
            await markAsRead(n._id);
            fetchNotifications();
        }
        if (n.link) navigate(n.link);
        else if (n.relatedId) navigate(`/cases/${n.relatedId}`); // Default assumption
        setShowDropdown(false);
    };

    const handleMarkAll = async () => {
        await markAllAsRead();
        fetchNotifications();
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '8px' }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '0', right: '0',
                        background: '#ef4444', color: 'white',
                        fontSize: '0.7rem', fontWeight: 'bold',
                        borderRadius: '50%', width: '18px', height: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div style={{
                    position: 'absolute', right: 0, top: '40px',
                    width: '320px', background: 'white',
                    borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    zIndex: 1000, overflow: 'hidden'
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Notifications</span>
                        <button onClick={handleMarkAll} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.8rem', cursor: 'pointer' }}>Mark all read</button>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    onClick={() => handleRead(n)}
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #f1f5f9',
                                        background: n.isRead ? 'white' : '#eff6ff',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{n.message}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
