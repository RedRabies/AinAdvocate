import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/layout/header.css';
import NotificationBell from '../notification/NotificationBell';

const Header = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/');
    };

    return (
        <header className="main-header">
            <div className="container header-content" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '40px' }}>
                {/* 1. Logo */}
                <Link to="/" className="logo" style={{ fontSize: '1.8rem' }}>AinAdvocate</Link>

                {/* 2. Public Shortcuts (Center) */}
                <nav className="nav-links" style={{ justifyContent: 'center' }}>
                    <Link to="/lawyers" style={{ fontSize: '1.1rem' }}>Find Lawyers</Link>
                    {user && user.role === 'lawyer' ? (
                        <Link to="/find-cases" style={{ fontSize: '1.1rem' }}>Find Cases</Link>
                    ) : (
                        <Link to="/cases" style={{ fontSize: '1.1rem' }}>Cases</Link>
                    )}
                    <Link to="/resources" style={{ fontSize: '1.1rem' }}>Resources</Link>
                </nav>

                {/* 3. User Actions (Right) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    {token ? (
                        <>
                            <NotificationBell />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                                <span style={{ fontWeight: '600', color: '#fff', fontSize: '1rem' }}>
                                    {user.name}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#cbd5e1', textTransform: 'capitalize' }}>
                                    {user.role}
                                </span>
                            </div>

                            {user.role === 'lawyer' && (
                                <Link to="/lawyer-dashboard" className="btn btn-sm btn-outline-light">Dashboard</Link>
                            )}
                            {user.role === 'client' && (
                                <Link to="/client-dashboard" className="btn btn-sm btn-outline-light">Dashboard</Link>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/admin-dashboard" className="btn btn-sm btn-outline-light">Admin</Link>
                            )}

                            <button onClick={handleLogout} className="btn-link" style={{ fontSize: '1rem', opacity: 0.9 }}>Logout</button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <Link to="/login" style={{ fontSize: '1.1rem', color: '#e5e7eb', textDecoration: 'none' }}>Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '1rem' }}>Get Started</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
