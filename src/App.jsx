import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { LogisticsProvider } from './context/LogisticsContext';
import './styles/global.css';

import OrderList from './pages/OrderList';
import Shipping from './pages/Shipping';
import OrderDetail from './pages/OrderDetail';
import Settings from './pages/Settings';

function App() {
  return (
    <LogisticsProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Redirect root to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes - Main App */}
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:orderNo" element={<OrderDetail />} />
            <Route path="create-order" element={<Shipping />} />
            <Route path="shipping" element={<Shipping />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LogisticsProvider>
  );
}

export default App;
