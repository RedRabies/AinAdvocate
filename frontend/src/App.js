
import React, { useState, useEffect } from 'react';
import './App.css';
import Register from './Register';
import Login from './Login';
import Homepage from './Homepage';

function App() {
  const [view, setView] = useState('home'); // 'home' | 'login' | 'register' | 'profile'
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const onLogin = (u) => {
    setUser(u);
    setView('profile');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('login');
  };

  return (
    <div className="App" style={{padding:20}}>
      {view === 'home' && <Homepage onNavigate={setView} />}

      {view !== 'home' && (
        <div>
          <h2>AinAdvocate — Auth Demo</h2>
          {!user && (
            <div style={{marginBottom:12}}>
              <button onClick={() => setView('login')} disabled={view==='login'}>Login</button>
              <button onClick={() => setView('register')} disabled={view==='register'} style={{marginLeft:8}}>Register</button>
              <button onClick={() => setView('home')} style={{marginLeft:8}}>Home</button>
            </div>
          )}

          {user ? (
            <div>
              <h3>Welcome, {user.name} ({user.role})</h3>
              <p>Email: {user.email}</p>
              <button onClick={logout}>Logout</button>
            </div>
          ) : (
            <div>
              {view === 'login' && <Login onLogin={onLogin} />}
              {view === 'register' && <Register onRegistered={() => setView('login')} />}
            </div>
          )}

