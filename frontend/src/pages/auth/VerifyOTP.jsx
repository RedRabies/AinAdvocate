import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/pages/auth.css';
import '../../styles/components/form.css';
import '../../styles/components/button.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
            if (res.data.token) {
                sessionStorage.setItem('token', res.data.token);
                sessionStorage.setItem('user', JSON.stringify(res.data.user));

                const role = res.data.user.role;
                if (role === 'lawyer') navigate('/lawyer-dashboard');
                else if (role === 'admin') navigate('/admin-dashboard');
                else if (role === 'client') navigate('/client-dashboard'); // Ensure Clients go to their dashboard
                else navigate('/client-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Verify Your Email</h2>
                    <p>Enter the 6-digit OTP sent to {email}</p>
                </div>
                {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="form-input"
                            style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Verify OTP</button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;
