// src/Homepage.js
import React from 'react';

export default function Homepage({ onNavigate }) {
  return (
    <div style={{maxWidth:900, margin:'0 auto', padding:20}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>AinAdvocate</h1>
        <nav>
          <button onClick={() => onNavigate('home')} style={{marginRight:8}}>Home</button>
          <button onClick={() => onNavigate('login')} style={{marginRight:8}}>Login</button>
          <button onClick={() => onNavigate('register')}>Register</button>
        </nav>
      </header>

      <section style={{marginTop:24}}>
        <h2>Legal help made simple</h2>
        <p>
          AinAdvocate connects clients with qualified lawyers and provides a simple case
          management interface. Register as a client or lawyer to get started. Admins can
          manage users and oversee the system.
        </p>

        <div style={{display:'flex',gap:16,marginTop:20}}>
          <div style={{flex:1,padding:16,border:'1px solid #ddd',borderRadius:6}}>
            <h3>Clients</h3>
            <p>Create cases, search for lawyers, and track progress.</p>
          </div>
          <div style={{flex:1,padding:16,border:'1px solid #ddd',borderRadius:6}}>
            <h3>Lawyers</h3>
            <p>Accept cases, message clients, and manage your workload.</p>
          </div>
          <div style={{flex:1,padding:16,border:'1px solid #ddd',borderRadius:6}}>
            <h3>Admins</h3>
            <p>Oversee the platform, verify lawyers, and manage disputes.</p>
          </div>
        </div>
      </section>

      <footer style={{marginTop:40,borderTop:'1px solid #eee',paddingTop:12}}>
        <small>© {new Date().getFullYear()} AinAdvocate — University Project</small>
      </footer>
    </div>
  );
}
