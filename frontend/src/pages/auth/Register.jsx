// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/pages/auth.css';
import '../../styles/components/form.css';
import '../../styles/components/button.css';
import { register as apiRegister } from '../../services/auth.service';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await apiRegister(form);
    setLoading(false);
    if (res && res.email) {
      // Success - redirect to Verify OTP
      navigate('/verify-otp', { state: { email: form.email } });
    } else if (res && res.token) {
      // Fallback if backend still returns token (it shouldn't)
      navigate('/dashboard');
    } else if (res && res.message) {
      setMsg(res.message);
    } else if (res && res.errors) {
      setMsg(res.errors.map(x => x.msg).join(', '));
    } else {
      setMsg('Unknown error');
    }
  };

  const { name, email, password, role } = form; // Destructure form for easier use in JSX

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join AinAdvocate as a Client or Lawyer</p>
        </div>

        {msg && <p className="error-text" style={{ textAlign: 'center' }}>{msg}</p>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" value={name} onChange={handle} required className="form-input" placeholder="Your Full Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" value={email} onChange={handle} required className="form-input" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" value={password} onChange={handle} required className="form-input" placeholder="Strong password" />
          </div>
          <div className="form-group">
            <label className="form-label">I am a:</label>
            <select name="role" value={role} onChange={handle} className="form-select" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <option value="client">Client (Seeking Legal Help)</option>
              <option value="lawyer">Lawyer (Offering Legal Services)</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
            {loading ? '...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}
