// src/pages/home/Homepage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/pages/home.css';
import '../../styles/components/button.css';

const Homepage = () => {
  return (
    <div className="homepage-container">
      <section style={{ padding: '40px 20px', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 30 }}>How it Works</h2>
        <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
          <div style={{ flex: 1, padding: 16, border: '1px solid #ddd', borderRadius: 6 }}>
            <h3>Clients</h3>
            <p>Create cases, search for lawyers, and track progress.</p>
          </div>
          <div style={{ flex: 1, padding: 16, border: '1px solid #ddd', borderRadius: 6 }}>
            <h3>Lawyers</h3>
            <p>Accept cases, message clients, and manage your workload.</p>
          </div>
          <div style={{ flex: 1, padding: 16, border: '1px solid #ddd', borderRadius: 6 }}>
            <h3>Admins</h3>
            <p>Oversee the platform, verify lawyers, and manage disputes.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
