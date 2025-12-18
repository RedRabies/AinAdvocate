import React from 'react';
import '../../styles/layout/footer.css';

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="container footer-content">
                <div className="footer-section">
                    <h3>AinAdvocate</h3>
                    <p>Simple Laws, Trusted Counsel.</p>
                </div>
                <div className="footer-section">
                    <h4>Links</h4>
                    <a href="/lawyers">Find Lawyers</a>
                    <a href="/resources">Legal Resources</a>
                </div>
                <div className="footer-section">
                    <small>&copy; {new Date().getFullYear()} AinAdvocate. University Project.</small>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
