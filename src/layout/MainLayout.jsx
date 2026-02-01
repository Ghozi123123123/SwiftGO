import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
