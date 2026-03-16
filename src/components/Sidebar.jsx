import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    History,
    Settings,
    ChevronLeft,
    LogOut,
    ShieldCheck,
    Search,
    X
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import '../styles/Sidebar.css';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useLogistics();
    const currentPath = location.pathname;
    const [isCollapsed, setIsCollapsed] = useState(false);

    const showText = !isCollapsed || mobileOpen;

    const handleLogout = () => {
        // Simple navigation to login
        navigate('/login');
    };

    const menuItems = [
        {
            path: '/app',
            name: 'Dashboard',
            icon: <LayoutDashboard size={20} />,
            adminOnly: true
        },
        {
            path: '/app/tracking',
            name: 'Lacak Paket',
            icon: <Search size={20} />,
            userOnly: true
        },
        {
            path: '/app/shipping',
            name: 'Buat Pengiriman',
            icon: <ClipboardList size={20} />,
            adminOnly: true
        },
        {
            path: '/app/orders',
            name: 'Riwayat',
            icon: <History size={20} />,
            adminOnly: true
        },
        {
            path: '/app/settings',
            name: 'Panel Admin',
            icon: <Settings size={20} />,
            adminOnly: true
        }
    ];

    const filteredMenuItems = menuItems.filter(item => {
        if (item.adminOnly && user?.role !== 'admin') return false;
        if (item.userOnly && user?.role === 'admin') return false;
        return true;
    });

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
                <Link to="/app" className="sidebar-brand" onClick={() => setMobileOpen && setMobileOpen(false)}>
                    <div className="sidebar-logo">
                        <img src="/favicon.png" alt="SwiftGo Logo" />
                    </div>
                    {showText && <span className="sidebar-brand-text">SwiftGo</span>}
                </Link>
                
                <button
                    className="sidebar-toggle desktop-only"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <ChevronLeft size={16} />
                </button>
                
                <button 
                    className="mobile-close-btn"
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                >
                    <X size={20} color="#666" />
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="sidebar-menu">
                    {filteredMenuItems.map((item) => (
                        <li key={item.path} className="sidebar-item">
                            <Link
                                to={item.path}
                                className={`sidebar-link ${currentPath === item.path ? 'active' : ''}`}
                                onClick={() => setMobileOpen && setMobileOpen(false)}
                            >
                                <span className="sidebar-icon">{item.icon}</span>
                                {showText && <span className="sidebar-text">{item.name}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                {showText && (
                    <div className="user-info">
                        <div className="user-avatar">{user?.avatar || 'C'}</div>
                        <div className="user-details">
                            <span className="user-name">{user?.name || 'Customer123'}</span>
                            <span className="user-role">
                                {user?.role === 'admin' ? (
                                    <span className="role-chip admin">
                                        <ShieldCheck size={12} /> Admin
                                    </span>
                                ) : (
                                    'Premium User'
                                )}
                            </span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout} title="Keluar">
                            <LogOut size={18} />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
