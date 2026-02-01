import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Printer,
    MapPin,
    Package as PackageIcon,
    ChevronRight,
    CheckCircle2,
    Truck
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { downloadReceipt } from '../services/receiptUtils';
import '../styles/OrderDetail.css';

const OrderDetail = () => {
    const { orderNo } = useParams();
    const navigate = useNavigate();
    const { orders } = useLogistics();

    const order = orders.find(o => o.orderNo === orderNo);

    if (!order) {
        return (
            <div className="order-detail-page">
                <div className="detail-header">
                    <button className="back-btn" onClick={() => navigate('/app/orders')}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Pesanan Tidak Ditemukan</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="order-detail-page">
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Detail Pengiriman</h2>
            </header>

            <div className="status-card">
                <span className="label">Nomor Resi</span>
                <h1 className="order-no">{order.orderNo}</h1>
                <div className={`status-large ${order.status.toLowerCase().replace(' ', '-')}`}>
                    <CheckCircle2 size={16} />
                    {order.status}
                </div>
            </div>

            <div className="timeline-card">
                <div className="timeline-header">
                    <h3><MapPin size={18} color="#c41e1e" /> Timeline Perjalanan</h3>
                </div>
                <div className="timeline-list">
                    <div className="timeline-item active">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                            <h4>Pesanan Dibuat</h4>
                            <p>Admin</p>
                            <span className="time">{order.date}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="address-grid">
                <div className="address-card">
                    <h3 className="card-title"><User size={16} color="#c41e1e" /> Pengirim</h3>
                    <p className="name">{order.senderName || 'ZaraRara'}</p>
                    <p className="phone">{order.senderPhone || '087784950041'}</p>
                    <p className="address">{order.senderCity || 'Bandung, Jawa Barat'}</p>
                </div>
                <div className="address-card">
                    <h3 className="card-title"><User size={16} color="#c41e1e" /> Penerima</h3>
                    <p className="name">{order.receiverName}</p>
                    <p className="phone">{order.receiverPhone || '-'}</p>
                    <p className="address">{order.destination}</p>
                </div>
            </div>

            <div className="item-card">
                <h3 className="card-title"><PackageIcon size={16} color="#c41e1e" /> Detail Barang</h3>
                <div className="item-grid">
                    <div className="item-field">
                        <label>Nama Barang</label>
                        <span>{order.item || 'Paket Logistik'}</span>
                    </div>
                    <div className="item-field">
                        <label>Jenis</label>
                        <span>UMUM</span>
                    </div>
                    <div className="item-field">
                        <label>Berat</label>
                        <span>{order.weight || '1'} kg</span>
                    </div>
                    <div className="item-field">
                        <label>Layanan</label>
                        <span>{order.service || 'Reguler'}</span>
                    </div>
                    <div className="item-field">
                        <label>Pembayaran</label>
                        <span>{order.payment || 'Tunai'}</span>
                    </div>
                </div>
                <div className="total-divider">
                    <span className="label">Total Biaya</span>
                    <span className="amount">{order.amount}</span>
                </div>
            </div>

            <button className="print-btn-large" onClick={() => downloadReceipt(order)}>
                <Printer size={20} />
                Cetak Resi
            </button>
        </div>
    );
};

export default OrderDetail;
