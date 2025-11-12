// src/Login.js
import React, { useState } from 'react';
import { login as apiLogin } from './authService';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await apiLogin(form);
    setLoading(false);
    if (res && res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      onLogin && onLogin(res.user);
    } else if (res && res.message) {
      setMsg(res.message);
    } else if (res && res.errors) {
      setMsg(res.errors.map(x=>x.msg).join(', '));
    } else {
      setMsg('Unknown error');
    }
  };

  return (
    <div style={{maxWidth:420,margin:'0 auto'}}>
      <h3>Login</h3>
      <form onSubmit={submit}>
        <div>
          <label>Email</label><br/>
          <input type="email" name="email" value={form.email} onChange={handle} required />
        </div>
        <div>
          <label>Password</label><br/>
          <input type="password" name="password" value={form.password} onChange={handle} required />
        </div>
        <div style={{marginTop:10}}>
          <button type="submit" disabled={loading}>{loading? '...' : 'Login'}</button>
        </div>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
