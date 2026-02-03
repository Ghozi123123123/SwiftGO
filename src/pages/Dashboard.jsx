import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Users,
    Package,
    TrendingUp,
    Clock,
    Search,

    ArrowUpRight,
    ArrowDownRight,
    Printer,
    Wallet,
    Plus,
    CheckCircle,
    Loader,
    Truck,
    Zap,
    Rocket
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { downloadReceipt } from '../services/receiptUtils';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { orders, balance, addBalance } = useLogistics();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [topUpAmount, setTopUpAmount] = React.useState('');
    const [searchQuery, setSearchQuery] = React.useState('');

    // Calculate status counts
    const pendingCount = orders.filter(order => order.status === 'Pending').length;
    const prosesCount = orders.filter(order => order.status === 'Proses').length;
    const selesaiCount = orders.filter(order => order.status === 'Selesai').length;

    // Calculate total revenue from all orders
    const totalRevenue = orders.reduce((sum, order) => {
        const amount = parseInt(order.amount.replace(/[^0-9]/g, '')) || 0;
        return sum + amount;
    }, 0);

    const balanceStats = [
        { label: 'Saldo Anda', value: `Rp ${balance.toLocaleString()}`, icon: <Wallet size={20} />, color: '#c41e1e', isBalance: true },
        { label: 'Total Pendapatan', value: `Rp ${totalRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, color: '#16a34a' },
    ];

    const otherStats = [
        { label: 'Total Pesanan', value: orders.length.toLocaleString(), icon: <Package size={20} />, color: '#c41e1e' },
        { label: 'Pending', value: pendingCount.toLocaleString(), icon: <Clock size={20} />, color: '#f59e0b' },
        { label: 'Diproses', value: prosesCount.toLocaleString(), icon: <Loader size={20} />, color: '#2563eb' },
        { label: 'Selesai', value: selesaiCount.toLocaleString(), icon: <CheckCircle size={20} />, color: '#16a34a' },
    ];

    const recentOrders = orders
        .filter(order =>
            order.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.receiverName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Dashboard Overview</h1>
                </div>
                <div className="header-actions">
                </div>
            </header>

            {/* Balance Card - Full Width */}
            <div className="balance-stats-grid">
                {balanceStats.map((stat, index) => (
                    <div key={index} className={`stat-card balance-card ${stat.isBalance ? 'balance-card-red' : ''}`}>
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <h2 className="stat-value">{stat.value}</h2>
                        </div>
                        {stat.isBalance && (
                            <div className="balance-actions">
                                <button className="add-balance-btn" onClick={() => setIsModalOpen(true)} title="Top Up">
                                    <Plus size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Other Stats - 4 Columns */}
            <div className="stats-grid">
                {otherStats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <h2 className="stat-value">{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Top Up Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Isi Saldo</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Masukkan jumlah saldo yang ingin Anda tambahkan.</p>
                            <div className="input-group">
                                <span className="currency-prefix">Rp</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-modal-btn" onClick={() => setIsModalOpen(false)}>Batal</button>
                            <button className="confirm-modal-btn" onClick={() => {
                                if (topUpAmount) {
                                    addBalance(topUpAmount);
                                    setTopUpAmount('');
                                    setIsModalOpen(false);
                                }
                            }}>Tambah Saldo</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-content">
                <div className="content-card shipping-methods">
                    <div className="card-header">
                        <h3>Metode Pengiriman</h3>
                        <div className="card-actions">
                            <Link to="/app/orders" className="text-btn">Lihat Semua</Link>
                        </div>
                    </div>
                    <div className="methods-list">
                        {[
                            { label: 'Reguler', key: 'Reguler', icon: <Truck size={20} />, color: '#c41e1e' },
                            { label: 'Express', key: 'Express', icon: <Zap size={20} />, color: '#2563eb' },
                            { label: 'Same Day', key: 'Same Day', icon: <Rocket size={20} />, color: '#16a34a' }
                        ].map((method, index) => {
                            const methodOrders = orders.filter(o => o.service === method.key);
                            const count = methodOrders.length;
                            const totalAmount = methodOrders.reduce((sum, o) => {
                                const amount = parseInt(o.amount.replace(/[^0-9]/g, '')) || 0;
                                return sum + amount;
                            }, 0);
                            const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                            return (
                                <div key={index} className="method-item">
                                    <div className="method-info">
                                        <div className="method-icon" style={{ backgroundColor: `${method.color}15`, color: method.color }}>
                                            {method.icon}
                                        </div>
                                        <div className="method-details" style={{ flex: 1 }}>
                                            <span className="method-name">{method.label}</span>
                                            <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 'bold', marginTop: '2px' }}>
                                                Rp {totalAmount.toLocaleString()}
                                            </div>
                                        </div>
                                        <span className="method-unit">{count} Pesanan</span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: method.color
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="content-card recent-activity">
                    <div className="card-header">
                        <div className="header-title-group" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <h3>Pesanan Terbaru</h3>
                            <div className="search-bar-small" style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                background: '#f3f4f6',
                                padding: '6px 12px',
                                borderRadius: '8px'
                            }}>
                                <Search size={16} color="#6b7280" />
                                <input
                                    type="text"
                                    placeholder="Cari resi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        marginLeft: '8px',
                                        outline: 'none',
                                        fontSize: '14px',
                                        width: '150px'
                                    }}
                                />
                            </div>
                        </div>
                        <button
                            className="text-btn"
                            onClick={() => navigate('/app/orders')}
                        >
                            Lihat Semua
                        </button>
                    </div>
                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>ID Pesanan</th>
                                    <th>Pelanggan</th>
                                    <th>Status</th>
                                    <th>Jumlah</th>
                                    <th></th>
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
                                        <td className="order-amount">{order.amount}</td>
                                        <td>
                                            <button
                                                className="icon-btn-small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadReceipt(order);
                                                }}
                                                title="Cetak Struk"
                                            >
                                                <Printer size={16} color="#c41e1e" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center">Belum ada pesanan terbaru.</td>
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
