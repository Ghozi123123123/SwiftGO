import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Box, FileText, Settings, LogOut, Package } from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <>
            <header className="navbar">
                <div className="navbar-container">
                    <Link to="/app" className="brand">
                        <div className="logo-icon">
                            <Package size={20} color="white" />
                        </div>
                        <h1 className="logo-text">SwiftGo</h1>
                    </Link>

                    <div className="user-section">
                        <span className="user-name">Customer123</span>
                        <button className="logout-btn" title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="sub-nav">
                <div className="sub-nav-container">
                    <Link to="/app" className={`nav-tab ${currentPath === '/app' ? 'active' : ''}`}>
                        <Home size={18} className="tab-icon" />
                        Dashboard
                    </Link>
                    <Link to="/app/shipping" className={`nav-tab ${currentPath === '/app/shipping' ? 'active' : ''}`}>
                        <Box size={18} className="tab-icon" />
                        Buat Pengiriman
                    </Link>
                    <Link to="/app/orders" className={`nav-tab ${currentPath === '/app/orders' ? 'active' : ''}`}>
                        <FileText size={18} className="tab-icon" />
                        Riwayat
                    </Link>
                    <Link to="/app/admin" className={`nav-tab ${currentPath === '/app/admin' ? 'active' : ''}`}>
                        <Settings size={18} className="tab-icon" />
                        Admin Panel
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Navbar;
