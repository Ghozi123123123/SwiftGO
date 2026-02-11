import React from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import {
    Package,
    DollarSign,
    TrendingUp,
    Clock,
    Search,
    Wallet,
    Printer,
    CheckCircle,
    Loader,
    Truck,
    Zap,
    Rocket,
    XCircle
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { downloadReceipt } from '../services/receiptUtils';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { orders, balance, balanceHistory, showNotification, user } = useLogistics();

    if (user?.role !== 'admin') {
        return <Navigate to="/app/tracking" replace />;
    }
    const [searchQuery, setSearchQuery] = React.useState('');

    // Calculate status counts
    const pendingCount = orders.filter(order => order.status === 'Pending').length;
    const prosesCount = orders.filter(order => order.status === 'Proses').length;
    const selesaiCount = orders.filter(order => order.status === 'Selesai').length;
    const dibatalkanCount = orders.filter(order => order.status === 'Dibatalkan').length;

    const totalRevenue = orders.reduce((sum, order) => {
        if (order.status === 'Dibatalkan') return sum;
        const amount = parseInt(order.amount.replace(/[^0-9]/g, '')) || 0;
        return sum + amount;
    }, 0);

    const codRevenue = orders
        .filter(order => order.status !== 'Dibatalkan' && order.payment === 'COD')
        .reduce((sum, order) => sum + (parseInt(order.amount.replace(/[^0-9]/g, '')) || 0), 0);

    const nonCodRevenue = orders
        .filter(order => order.status !== 'Dibatalkan' && (order.payment === 'Non-COD' || !order.payment))
        .reduce((sum, order) => sum + (parseInt(order.amount.replace(/[^0-9]/g, '')) || 0), 0);

    const balanceStats = [
        { label: 'Total Pendapatan', value: `Rp ${totalRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, color: '#16a34a', adminOnly: true },
        { label: 'Pendapatan COD', value: `Rp ${codRevenue.toLocaleString()}`, icon: <DollarSign size={20} />, color: '#ef4444', adminOnly: true },
        { label: 'Pendapatan SALDO', value: `Rp ${nonCodRevenue.toLocaleString()}`, icon: <Wallet size={20} />, color: '#16a34a', adminOnly: true },
    ];

    const filteredBalanceStats = balanceStats.filter(stat => !stat.adminOnly || user?.role === 'admin');

    const otherStats = [
        { label: 'Total Pesanan', value: orders.length.toLocaleString(), icon: <Package size={20} />, color: '#c41e1e' },
        { label: 'Pending', value: pendingCount.toLocaleString(), icon: <Clock size={20} />, color: '#f59e0b' },
        { label: 'Diproses', value: prosesCount.toLocaleString(), icon: <Loader size={20} />, color: '#2563eb' },
        { label: 'Selesai', value: selesaiCount.toLocaleString(), icon: <CheckCircle size={20} />, color: '#16a34a' },
        { label: 'Paket Dibatalkan', value: dibatalkanCount.toLocaleString(), icon: <XCircle size={20} />, color: '#6b7280' },
    ];

    const recentOrders = orders
        .filter(order =>
            order.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.receiverName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header animate-fade-in">
                <div className="header-left">
                    <h1>Dashboard Overview</h1>
                </div>
                <div className="header-actions">
                    <div className="date-display">
                        <Clock size={16} />
                        <span className="date-text">
                            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            </header>


            <div className="balance-stats-grid animate-slide-up">
                {filteredBalanceStats.map((stat, index) => (
                    <div
                        key={index}
                        className={`stat-card balance-card ${stat.label === 'Total Pendapatan' ? 'clickable' : ''} revenue-card`}
                        onClick={() => {
                            if (stat.label === 'Total Pendapatan') navigate('/app/settings');
                        }}
                    >
                        <div className="stat-card-inner">
                            <div className="stat-icon-wrapper">
                                <div className="stat-icon">
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">{stat.label}</span>
                                <h2 className="stat-value">{stat.value}</h2>
                            </div>
                        </div>
                        <div className="card-decoration"></div>
                    </div>
                ))}
            </div>


            <div className="stats-grid animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {otherStats.map((stat, index) => (
                    <div key={index} className="stat-card minimal">
                        <div className="stat-icon-minimal" style={{ color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <h2 className="stat-value">{stat.value}</h2>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                        <div className="stat-progress-bg">
                            <div className="stat-progress-fill" style={{ backgroundColor: stat.color, width: '40%' }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-content animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="content-card shipping-methods">
                    <div className="card-header">
                        <h3>Metode Pengiriman</h3>
                        <div className="card-actions">
                            <Link to="/app/orders" className="text-btn">Detail Statistik</Link>
                        </div>
                    </div>
                    <div className="bar-chart-container">
                        {(() => {
                            const methods = [
                                { label: 'Reguler', key: 'Reguler', icon: <Truck size={14} />, color: '#ef4444', gradient: 'linear-gradient(to top, #c41e1e, #ef4444)' },
                                { label: 'Express', key: 'Express', icon: <Zap size={14} />, color: '#ef4444', gradient: 'linear-gradient(to top, #a31919, #c41e1e)' },
                                { label: 'Same Day', key: 'Same Day', icon: <Rocket size={14} />, color: '#ef4444', gradient: 'linear-gradient(to top, #8b1515, #a31919)' }
                            ];

                            const methodsData = methods.map(method => {
                                const methodOrders = orders.filter(o => o.service === method.key && o.status !== 'Dibatalkan');
                                const totalAmount = methodOrders.reduce((sum, o) => {
                                    const amount = parseInt(o.amount.replace(/[^0-9]/g, '')) || 0;
                                    return sum + amount;
                                }, 0);
                                return {
                                    ...method,
                                    count: methodOrders.length,
                                    totalAmount: totalAmount
                                };
                            });

                            const maxCount = Math.max(...methodsData.map(m => m.count), 1);

                            return methodsData.map((method, index) => {
                                const barHeight = maxCount > 0 ? (method.count / maxCount) * 80 : 0;

                                return (
                                    <div key={index} className="bar-column">
                                        <div className="bar-value">{method.count}</div>
                                        <div
                                            className="bar-chart-bar"
                                            style={{
                                                height: `${Math.max(barHeight, 5)}%`,
                                                background: method.gradient + (method.count === 0 ? ' #f1f5f9' : '')
                                            }}
                                        >
                                            <div className="bar-tooltip">
                                                <div className="tooltip-title">{method.label}</div>
                                                <div className="tooltip-row">
                                                    <span>Pesanan:</span>
                                                    <strong>{method.count}</strong>
                                                </div>
                                                <div className="tooltip-row">
                                                    <span>Revenue:</span>
                                                    <strong>Rp{method.totalAmount.toLocaleString()}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bar-label">
                                            <div className="bar-icon-circle" style={{ backgroundColor: `${method.color}15`, color: method.color }}>
                                                {method.icon}
                                            </div>
                                            <span className="bar-label-text">{method.label}</span>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                <div className="content-card recent-activity">
                    <div className="card-header">
                        <h3>Pesanan Terbaru</h3>
                        <Link to="/app/orders" className="text-btn">Lihat Semua</Link>
                    </div>

                    <div className="search-container-dashboard" style={{ marginBottom: '24px' }}>
                        <div className="search-bar-small">
                            <Search size={16} color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="Cari nomor resi atau nama..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    marginLeft: '12px',
                                    outline: 'none',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    width: '100%',
                                    color: '#0f172a'
                                }}
                            />
                        </div>
                    </div>

                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Resi</th>
                                    <th>Pelanggan</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.orderNo}>
                                        <td className="order-id">{order.orderNo}</td>
                                        <td>{order.receiverName}</td>
                                        <td>
                                            <span className={`status-pill ${order.status.toLowerCase().replace(' ', '-')}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="icon-btn-small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadReceipt(order);
                                                }}
                                            >
                                                <Printer size={16} color="#c41e1e" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                            Belum ada pesanan yang sesuai.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
