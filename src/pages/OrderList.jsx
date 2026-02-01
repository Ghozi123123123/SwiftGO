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
                                    <td colSpan="7" className="text-center">Belum ada riwayat pengiriman.</td>
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
                                <h3>Status Pengiriman</h3>
                            </div>

                            <div className="progress-tracker">
                                <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}>
                                    <div className="step-icon-wrapper">
                                        <Package size={20} />
                                        {step >= 1 && <div className="step-check"><Check size={10} strokeWidth={4} /></div>}
                                    </div>
                                    <span className="step-label">Paket sudah diproses</span>
                                </div>
                                <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}>
                                    <div className="step-icon-wrapper">
                                        <Truck size={20} />
                                        {step >= 2 && <div className="step-check"><Check size={10} strokeWidth={4} /></div>}
                                    </div>
                                    <span className="step-label">Berangkat dari kota asal</span>
                                </div>
                                <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''}`}>
                                    <div className="step-icon-wrapper">
                                        <Navigation size={20} />
                                        {step >= 3 && <div className="step-check"><Check size={10} strokeWidth={4} /></div>}
                                    </div>
                                    <span className="step-label">Pengantaran ke alamat</span>
                                </div>
                                <div className={`progress-step ${step >= 4 ? 'active' : ''} ${step === 4 ? 'current' : ''}`}>
                                    <div className="step-icon-wrapper">
                                        <User size={20} />
                                        {step >= 4 && <div className="step-check"><Check size={10} strokeWidth={4} /></div>}
                                    </div>
                                    <span className="step-label">Sampai di tujuan</span>
                                </div>
                            </div>

                            <div className="timeline-details">
                                {step >= 1 && (
                                    <div className="timeline-row">
                                        <div className="timeline-date">10:00</div>
                                        <div className="timeline-marker active"></div>
                                        <div className="timeline-info">
                                            <h4>Gudang Sortir Jakarta Pusat</h4>
                                            <p>Paket telah sampai di pusat sortir Jakarta Pusat.</p>
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
                                            <h4>Berangkat Dari Jakarta</h4>
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
                                            <h4>Paket Diterima</h4>
                                            <p>Paket telah sampai di tujuan dan diterima oleh penghuni alamat.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="timeline-row">
                                    <div className="timeline-date">{selectedOrder.date}</div>
                                    <div className="timeline-marker active"></div>
                                    <div className="timeline-info">
                                        <h4>Penjadwalan</h4>
                                        <p>Penjadwalan penjemputan paket</p>
                                    </div>
                                </div>
                            </div>

                            <button className="modal-footer-btn" onClick={() => setIsModalOpen(false)}>
                                Sembunyikan Detali Status
                            </button>
                            <button className="cancel-btn" onClick={handleCancelClick}>
                                Batalkan Pengiriman
                            </button>
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
