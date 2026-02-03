import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Printer,
    Trash2,
    X,
    Check,
    Package,
    Truck,
    MapPin,
    User,
    Navigation
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { downloadReceipt } from '../services/receiptUtils';
import '../styles/OrderList.css';
import '../styles/ShipmentModal.css';

const OrderList = () => {
    const { orders, deleteOrder, updateOrderStatus } = useLogistics();
    const navigate = useNavigate();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

    const handleRowClick = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleStatusChange = (e, orderNo) => {
        e.stopPropagation();
        const newStatus = e.target.value;
        updateOrderStatus(orderNo, newStatus);
    };

    // Helper to determine active steps in the modal
    const getStatusState = (status) => {
        const states = {
            'Pending': { step: 1, label: 'Menunggu Penjemputan' },
            'Proses': { step: 3, label: 'Sedang Diproses' },
            'Selesai': { step: 4, label: 'Sampai di Tujuan' },
            'Dibatalkan': { step: 0, label: 'Pengiriman Dibatalkan' }
        };
        return states[status] || states['Pending'];
    };

    const handleCancelClick = () => {
        setIsCancelConfirmOpen(true);
    };

    const handleConfirmCancel = () => {
        if (selectedOrder) {
            updateOrderStatus(selectedOrder.orderNo, 'Dibatalkan');
            setIsCancelConfirmOpen(false);
            setIsModalOpen(false);
        }
    };

    const handleCancelNo = () => {
        setIsCancelConfirmOpen(false);
    };

    return (
        <div className="container order-list-page">
            <div className="page-header">
                <h2>Riwayat Pengiriman</h2>
                <div className="stats-mini">
                    <span>Total: <strong>{orders.length}</strong></span>
                </div>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table className="order-table">
                        <thead>
                            <tr>
                                <th>Tgl</th>
                                <th>No. Resi</th>
                                <th>Pengirim</th>
                                <th>Penerima</th>
                                <th>Tujuan</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={index} onClick={() => handleRowClick(order)} style={{ cursor: 'pointer' }}>
                                    <td className="order-date">{order.date}</td>
                                    <td className="order-no">{order.orderNo}</td>
                                    <td>{order.senderName}</td>
                                    <td>{order.receiverName}</td>
                                    <td>{order.destination}</td>
                                    <td>
                                        <select
                                            className={`status-select ${order.status.toLowerCase().replace(' ', '-')}`}
                                            value={order.status}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => handleStatusChange(e, order.orderNo)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Proses">Proses</option>
                                            <option value="Selesai">Selesai</option>
                                        </select>
                                    </td>
                                    <td className="order-amount">{order.amount}</td>
                                    <td>
                                        <div className="action-group" style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn-print"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadReceipt(order);
                                                }}
                                                title="Cetak Struk"
                                            >
                                                <Printer size={14} />
                                                Cetak
                                            </button>
                                            {order.status === 'Selesai' && (
                                                <button
                                                    className="btn-delete"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm('Apakah Anda yakin ingin menghapus riwayat pengiriman ini?')) {
                                                            deleteOrder(order.orderNo);
                                                        }
                                                    }}
                                                    title="Hapus Riwayat"
                                                >
                                                    <Trash2 size={14} />
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center">Belum ada riwayat pengiriman.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Shipment Status Modal */}
            {isModalOpen && selectedOrder && (() => {
                const currentStatus = orders.find(o => o.orderNo === selectedOrder.orderNo)?.status || selectedOrder.status;
                const { step } = getStatusState(currentStatus);

                return (
                    <div className="shipment-modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="shipment-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="shipment-modal-header">
                                <h3>Status Pengiriman - {selectedOrder.orderNo}</h3>
                            </div>

                            <div className="progress-tracker">
                                <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}>
                                    <div className="step-icon-wrapper">
                                        <Package size={20} />
                                        {step >= 1 && <div className="step-check"><Check size={10} strokeWidth={4} /></div>}
                                    </div>
                                    <span className="step-label">Paket diproses</span>
                                </div>
                                <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}>
                                    <div className="step-icon-wrapper">
                                        <Truck size={20} />
                                        {step >= 2 && <div className="step-check"><Check size={10} strokeWidth={4} /></div>}
                                    </div>
                                    <span className="step-label">Berangkat</span>
                                </div>
                                <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''}`}>
                                    <div className="step-icon-wrapper">
                                        <Navigation size={20} />
                                        {step >= 3 && <div className="step-check"><Check size={10} strokeWidth={4} /></div>}
                                    </div>
                                    <span className="step-label">Luar Kota</span>
                                </div>
                                <div className={`progress-step ${step >= 4 ? 'active' : ''} ${step === 4 ? 'current' : ''}`}>
                                    <div className="step-icon-wrapper">
                                        <User size={20} />
                                        {step >= 4 && <div className="step-check"><Check size={10} strokeWidth={4} /></div>}
                                    </div>
                                    <span className="step-label">Diterima</span>
                                </div>
                            </div>

                            <div className="modal-grid">
                                <div className="modal-left-col">
                                    <div className="timeline-details">
                                        {step >= 1 && (
                                            <div className="timeline-row">
                                                <div className="timeline-date">10:00</div>
                                                <div className="timeline-marker active"></div>
                                                <div className="timeline-info">
                                                    <div className="timeline-icon-box" style={{ color: '#c41e1e', marginBottom: '8px' }}>
                                                        <Package size={18} />
                                                    </div>
                                                    <h4>Gudang Sortir {selectedOrder.senderCity || 'Jakarta Pusat'}</h4>
                                                    <p>Paket telah sampai di pusat sortir {selectedOrder.senderCity || 'Jakarta Pusat'}.</p>
                                                </div>
                                            </div>
                                        )}
                                        {step >= 2 && (
                                            <div className="timeline-row">
                                                <div className="timeline-date">
                                                    <div>{selectedOrder.date}</div>
                                                    <div>10:00</div>
                                                </div>
                                                <div className="timeline-marker active"></div>
                                                <div className="timeline-info">
                                                    <div className="timeline-icon-box" style={{ color: '#c41e1e', marginBottom: '8px' }}>
                                                        <Truck size={18} />
                                                    </div>
                                                    <h4>Berangkat Dari {selectedOrder.senderCity || 'Jakarta'}</h4>
                                                    <p>Paketmu sedang dalam perjalanan menuju kota tujuan.</p>
                                                </div>
                                            </div>
                                        )}
                                        {step >= 3 && (
                                            <div className="timeline-row">
                                                <div className="timeline-date">
                                                    <div>{selectedOrder.date}</div>
                                                    <div>02:00</div>
                                                </div>
                                                <div className="timeline-marker active"></div>
                                                <div className="timeline-info">
                                                    <div className="timeline-icon-box" style={{ color: '#c41e1e', marginBottom: '8px' }}>
                                                        <Navigation size={18} />
                                                    </div>
                                                    <h4>Kurir Menjemput</h4>
                                                    <p>Kurir sedang menjemput paketmu di hub terdekat.</p>
                                                </div>
                                            </div>
                                        )}
                                        {step >= 4 && (
                                            <div className="timeline-row">
                                                <div className="timeline-date">
                                                    <div>{selectedOrder.date}</div>
                                                    <div>15:30</div>
                                                </div>
                                                <div className="timeline-marker active"></div>
                                                <div className="timeline-info">
                                                    <div className="timeline-icon-box" style={{ color: '#c41e1e', marginBottom: '8px' }}>
                                                        <User size={18} />
                                                    </div>
                                                    <h4>Paket Diterima</h4>
                                                    <p>Paket telah sampai di tujuan dan diterima oleh penghuni alamat.</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="timeline-row">
                                            <div className="timeline-date">{selectedOrder.date}</div>
                                            <div className="timeline-marker active"></div>
                                            <div className="timeline-info">
                                                <div className="timeline-icon-box" style={{ color: '#c41e1e', marginBottom: '8px' }}>
                                                    <Check size={18} />
                                                </div>
                                                <h4>Penjadwalan</h4>
                                                <p>Penjadwalan penjemputan paket</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-right-col">
                                    <div className="modal-info-summary" style={{ padding: '20px', background: '#F9FAFB', borderRadius: '16px', marginBottom: '16px', border: '1px solid #E5E7EB', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="info-block">
                                            <h4 style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px', textTransform: 'uppercase' }}>Pengirim</h4>
                                            <p style={{ fontWeight: 'bold' }}>{selectedOrder.senderName || '-'}</p>
                                        </div>
                                        <div className="info-block">
                                            <h4 style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px', textTransform: 'uppercase' }}>Penerima</h4>
                                            <p style={{ fontWeight: 'bold' }}>{selectedOrder.receiverName || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="modal-product-details" style={{ padding: '20px', background: '#F9FAFB', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Package size={16} color="#c41e1e" /> Detail Produk
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', fontSize: '14px' }}>
                                            <div><span style={{ color: '#6B7280' }}>Nama Barang:</span> {selectedOrder.item || '-'}</div>
                                            <div><span style={{ color: '#6B7280' }}>Kategori:</span> {selectedOrder.itemType || '-'}</div>
                                            <div><span style={{ color: '#6B7280' }}>Berat:</span> {selectedOrder.weight || '0'} kg</div>
                                            <div><span style={{ color: '#6B7280' }}>Dimensi:</span> {selectedOrder.length || 0}x{selectedOrder.width || 0}x{selectedOrder.height || 0} cm</div>
                                        </div>
                                    </div>

                                    <button className="btn-print-large"
                                        onClick={() => downloadReceipt(selectedOrder)}
                                        style={{
                                            width: '100%',
                                            marginTop: '16px',
                                            padding: '14px',
                                            background: '#c41e1e',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(196, 30, 30, 0.2)'
                                        }}
                                    >
                                        <Printer size={18} /> Cetak Resi
                                    </button>
                                </div>
                            </div>

                            <button className="modal-footer-btn" onClick={() => setIsModalOpen(false)}>
                                Sembunyikan Detail Status
                            </button>
                            <div className="modal-actions" style={{ marginTop: '10px' }}>
                                <button className="cancel-btn" onClick={handleCancelClick} style={{ width: '100%', marginTop: 0 }}>
                                    Batalkan Pengiriman
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Confirmation Modal */}
            {isCancelConfirmOpen && (
                <div className="confirmation-modal" onClick={handleCancelNo}>
                    <div className="confirmation-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Konfirmasi Pembatalan</h3>
                        <p>Apakah anda yakin ingin membatalkan pengiriman?</p>
                        <div className="confirmation-buttons">
                            <button className="btn-yes" onClick={handleConfirmCancel}>Iya</button>
                            <button className="btn-no" onClick={handleCancelNo}>Tidak</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderList;
