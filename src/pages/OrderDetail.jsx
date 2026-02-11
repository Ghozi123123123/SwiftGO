import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Printer,
    MapPin,
    Package as PackageIcon,
    ChevronRight,
    CheckCircle2,
    Truck,
    Download,
    User,
    Navigation
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
                    {(() => {
                        const statusMapping = {
                            'Pending': 1,
                            'Proses': 3,
                            'Selesai': 4,
                            'Dibatalkan': 0
                        };
                        const step = statusMapping[order.status] || 1;

                        return (
                            <div className="timeline-details">
                                {step >= 4 && (
                                    <div className="timeline-row">
                                        <div className="timeline-date">
                                            <div>{order.date}</div>
                                            <div>15:30</div>
                                        </div>
                                        <div className="timeline-marker active">
                                            <User size={14} />
                                        </div>
                                        <div className="timeline-info">
                                            <h4>Paket Diterima</h4>
                                            <p>Paket telah sampai di tujuan dan diterima oleh penghuni alamat.</p>
                                        </div>
                                    </div>
                                )}
                                {step >= 3 && (
                                    <div className="timeline-row">
                                        <div className="timeline-date">
                                            <div>{order.date}</div>
                                            <div>02:00</div>
                                        </div>
                                        <div className="timeline-marker active">
                                            <Navigation size={14} />
                                        </div>
                                        <div className="timeline-info">
                                            <h4>Kurir Menjemput</h4>
                                            <p>Kurir sedang menjemput paketmu di hub terdekat.</p>
                                        </div>
                                    </div>
                                )}
                                {step >= 2 && (
                                    <div className="timeline-row">
                                        <div className="timeline-date">
                                            <div>{order.date}</div>
                                            <div>10:00</div>
                                        </div>
                                        <div className="timeline-marker active">
                                            <Truck size={14} />
                                        </div>
                                        <div className="timeline-info">
                                            <h4>Berangkat Dari {order.senderCity || 'Jakarta'}</h4>
                                            <p>Paketmu sedang dalam perjalanan menuju kota tujuan.</p>
                                        </div>
                                    </div>
                                )}
                                {step >= 1 && (
                                    <div className="timeline-row">
                                        <div className="timeline-date">10:00</div>
                                        <div className="timeline-marker active">
                                            <PackageIcon size={14} />
                                        </div>
                                        <div className="timeline-info">
                                            <h4>Gudang Sortir {order.senderCity || 'Jakarta Pusat'}</h4>
                                            <p>Paket telah sampai di pusat sortir {order.senderCity}.</p>
                                        </div>
                                    </div>
                                )}
                                <div className="timeline-row">
                                    <div className="timeline-date">{order.date}</div>
                                    <div className="timeline-marker active">
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <div className="timeline-info">
                                        <h4>Penjadwalan</h4>
                                        <p>Penjadwalan penjemputan paket</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            <div className="address-grid">
                <div className="address-card">
                    <h3 className="card-title"><User size={16} color="#c41e1e" /> Pengirim</h3>
                    <p className="name">{order.senderName || 'Customer123'}</p>
                    <p className="phone">{order.senderPhone || '087784950041'}</p>
                    <p className="address">{order.senderCity || 'Bandung, Jawa Barat'}</p>
                </div>
                <div className="address-card">
                    <h3 className="card-title"><User size={16} color="#c41e1e" /> Penerima</h3>
                    <p className="name">{order.receiverName}</p>
                    <p className="phone">{order.receiverPhone || '-'}</p>
                    <p className="address">
                        {order.receiverAddress || order.destination}<br />
                        {order.receiverDistrict && `${order.receiverDistrict}, `}{order.receiverCity || order.destination}{order.receiverProvince && `, ${order.receiverProvince}`}
                    </p>
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
                        <label>Kategori</label>
                        <span>{order.itemType || 'UMUM'}</span>
                    </div>

                    <div className="item-field">
                        <label>Berat</label>
                        <span>{order.weight || '1'} kg</span>
                    </div>
                    <div className="item-field">
                        <label>Dimensi</label>
                        <span>{order.length || 0}x{order.width || 0}x{order.height || 0} cm</span>
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
                <Download size={20} />
                Download Resi
            </button>
        </div>
    );
};

export default OrderDetail;
