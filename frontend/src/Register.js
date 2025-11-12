// src/Register.js
import React, { useState } from 'react';
import { register as apiRegister } from './authService';

export default function Register({ onRegistered }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await apiRegister(form);
    setLoading(false);
    if (res && res.id) {
      setMsg('Registered successfully. Please login.');
      onRegistered && onRegistered();
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
      <h3>Register</h3>
      <form onSubmit={submit}>
        <div>
          <label>Name</label><br/>
          <input name="name" value={form.name} onChange={handle} required />
        </div>
        <div>
          <label>Email</label><br/>
          <input type="email" name="email" value={form.email} onChange={handle} required />
        </div>
        <div>
          <label>Password</label><br/>
          <input type="password" name="password" value={form.password} onChange={handle} required />
        </div>
        <div>
          <label>Role</label><br/>
          <select name="role" value={form.role} onChange={handle}>
            <option value="client">Client</option>
            <option value="lawyer">Lawyer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{marginTop:10}}>
          <button type="submit" disabled={loading}>{loading? '...' : 'Register'}</button>
        </div>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
