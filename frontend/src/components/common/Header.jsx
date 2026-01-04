import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/layout/header.css';

const Header = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="main-header">
            <div className="container header-content">
                <Link to="/" className="logo">AinAdvocate</Link>
                <nav className="nav-links">
                    <Link to="/lawyers">Find Lawyers</Link>
                    <Link to="/cases">Cases</Link>
                    <Link to="/resources">Resources</Link>
                    {token ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <span style={{ fontWeight: '500', color: '#e5e7eb' }}>
                                Hello, {user.name} ({user.role})
                            </span>
                            {user.role === 'lawyer' && <Link to="/lawyer-dashboard">Dashboard</Link>}
                            {user.role === 'client' && <Link to="/client-dashboard">Dashboard</Link>}
                            {user.role === 'admin' && <Link to="/admin-dashboard">Admin</Link>}
                            <button onClick={handleLogout} className="btn-link">Logout</button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register" className="btn btn-sm btn-primary">Get Started</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
