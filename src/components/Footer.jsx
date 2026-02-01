import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-section">
                    <h3>J&T <span className="highlight">CARGO</span></h3>
                    <p>Your reliable logistics partner for specialized large package delivery.</p>
                </div>
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/app/orders">Orders</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Contact</h4>
                    <p>support@jtcargo.co.id</p>
                    <p>+62 800 100 1188</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} J&T Cargo Inspired Project. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
