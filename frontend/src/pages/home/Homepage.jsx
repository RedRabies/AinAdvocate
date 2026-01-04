// src/pages/home/Homepage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/pages/home.css';
import '../../styles/components/button.css';

const Homepage = () => {
  return (
    <div className="homepage-container">
      <section style={{ padding: '60px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 50, fontSize: '2.5rem', color: '#1e293b' }}>
          Welcome to AinAdvocate
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30 }}>
          {/* Client Shortcut */}
          <Link to="/register?role=client" style={{ textDecoration: 'none' }}>
            <div className="feature-card" style={{
              padding: 40,
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              textAlign: 'center',
              background: 'white',
              transition: 'transform 0.2s, box-shadow 0.2s',
              height: '100%',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>👤</div>
              <h3 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: 15 }}>I am a Client</h3>
              <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6 }}>
                Post a case, find the perfect lawyer, and manage your legal journey with ease.
              </p>
              <div style={{ marginTop: 20, color: '#3b82f6', fontWeight: '600' }}>Get Started &rarr;</div>
            </div>
          </Link>

          {/* Lawyer Shortcut */}
          <Link to="/register?role=lawyer" style={{ textDecoration: 'none' }}>
            <div className="feature-card" style={{
              padding: 40,
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              textAlign: 'center',
              background: 'white',
              transition: 'transform 0.2s, box-shadow 0.2s',
              height: '100%',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>⚖️</div>
              <h3 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: 15 }}>I am a Lawyer</h3>
              <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6 }}>
                Connect with clients, manage your cases, and grow your practice efficiently.
              </p>
              <div style={{ marginTop: 20, color: '#3b82f6', fontWeight: '600' }}>Join Network &rarr;</div>
            </div>
          </Link>

          {/* Resources Shortcut */}
          <Link to="/resources" style={{ textDecoration: 'none' }}>
            <div className="feature-card" style={{
              padding: 40,
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              textAlign: 'center',
              background: 'white',
              transition: 'transform 0.2s, box-shadow 0.2s',
              height: '100%',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>📚</div>
              <h3 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: 15 }}>Legal Resources</h3>
              <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6 }}>
                Access our library of legal documents, guides, and informative articles.
              </p>
              <div style={{ marginTop: 20, color: '#3b82f6', fontWeight: '600' }}>Browse Library &rarr;</div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
