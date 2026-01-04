// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/pages/auth.css';
import '../../styles/components/form.css';
import '../../styles/components/button.css';
import { login as apiLogin } from '../../services/auth.service';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'lawyer') navigate('/lawyer-dashboard');
      else if (user.role === 'admin') navigate('/admin-dashboard');
      else navigate('/client-dashboard');
    }
  }, [navigate]);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await apiLogin(form);
    setLoading(false);
    if (res && res.token) {
      sessionStorage.setItem('token', res.token);
      sessionStorage.setItem('user', JSON.stringify(res.user));

      // Role-based redirect
      const role = res.user.role;
      if (role === 'lawyer') navigate('/lawyer-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
      else navigate('/client-dashboard');
    } else if (res && res.message) {
      setMsg(res.message);
    } else if (res && res.errors) {
      setMsg(res.errors.map(x => x.msg).join(', '));
    } else {
      setMsg('Unknown error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Login</h2>
          <p>Welcome back to AinAdvocate</p>
        </div>

        {msg && <p className="error-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>{msg}</p>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handle}
              required
              className="form-input"
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handle}
              required
              className="form-input"
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? '...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}

