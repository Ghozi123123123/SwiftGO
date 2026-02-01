import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    History,
    Calculator,
    Settings,
    ChevronLeft,
    Package,
    LogOut
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        // Simple navigation to login
        navigate('/login');
    };

    const menuItems = [
        {
            path: '/app',
            name: 'Dashboard',
            icon: <LayoutDashboard size={20} />
        },
        {
            path: '/app/shipping',
            name: 'Buat Pengiriman',
            icon: <ClipboardList size={20} />
        },
        {
            path: '/app/orders',
            name: 'Riwayat',
            icon: <History size={20} />
        },
        {
            path: '/app/settings',
            name: 'Panel Admin',
            icon: <Settings size={20} />
        }
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <Link to="/app" className="sidebar-brand">
                    <div className="sidebar-logo">
                        <img src="/favicon.png" alt="SwiftGO Logo" />
                    </div>
                    {!isCollapsed && <span className="sidebar-brand-text">SwiftGo</span>}
                </Link>
                <button
                    className="sidebar-toggle"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <ChevronLeft size={16} />
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="sidebar-menu">
                    {menuItems.map((item) => (
                        <li key={item.path} className="sidebar-item">
                            <Link
                                to={item.path}
                                className={`sidebar-link ${currentPath === item.path ? 'active' : ''}`}
                            >
                                <span className="sidebar-icon">{item.icon}</span>
                                {!isCollapsed && <span className="sidebar-text">{item.name}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                {!isCollapsed && (
                    <div className="user-info">
                        <div className="user-avatar">Z</div>
                        <div className="user-details">
                            <span className="user-name">ZaraRara</span>
                            <span className="user-role">Premium User</span>
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
