import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';

const MainLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
            <Sidebar mobileOpen={isMobileMenuOpen} setMobileOpen={setIsMobileMenuOpen} />
            
            {/* Overlay for mobile when sidebar is open */}
            {isMobileMenuOpen && (
                <div 
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 998,
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <header className="mobile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="mobile-header-logo">
                            <img src="/favicon.png" alt="SwiftGo Logo" />
                        </div>
                        <span style={{ fontWeight: 800, color: '#c41e1e', fontSize: '18px' }}>SwiftGo</span>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                        <Menu size={24} color="#333" />
                    </button>
                </header>

                <div className="main-content-scrollable" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
