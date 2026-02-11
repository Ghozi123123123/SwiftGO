import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
    Printer,
    Trash2,
    X,
    Check,
    Package,
    Truck,
    MapPin,
    User,
    Navigation,
    Eye,
    Download,
    MoreVertical,
    Copy,
    ArrowUpCircle,
    ArrowDownCircle,
    ExternalLink,
    Compass,
    CheckCircle2,
    ChevronRight,
    MapPinned,
    FileText
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { downloadShippingReport } from '../services/reportUtils';
import { downloadReceipt, generateReceiptCanvas, printReceipt } from '../services/receiptUtils';
import '../styles/OrderList.css';
import '../styles/ShipmentModal.css';

const OrderList = () => {
    const { orders, deleteOrder, updateOrderStatus, addBalance, showNotification, user } = useLogistics();
    const navigate = useNavigate();

    if (user?.role !== 'admin') {
        return <Navigate to="/app/tracking" replace />;
    }
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [receiptCanvas, setReceiptCanvas] = useState(null);
    const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
    const [activeMenuIndex, setActiveMenuIndex] = useState(null);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenuIndex(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRowClick = (order) => {
        // Prevent clicking if a menu or button was clicked
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const toggleMenu = (e, index) => {
        e.stopPropagation();
        setActiveMenuIndex(activeMenuIndex === index ? null : index);
    };

    const handleCopyResi = (e, resi) => {
        e.stopPropagation();
        navigator.clipboard.writeText(resi);
        showNotification(`Resi ${resi} berhasil disalin!`, 'success');
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

    const handleCancelClick = (e, order) => {
        e.stopPropagation();
        setSelectedOrder(order);
        setIsCancelConfirmOpen(true);
        setActiveMenuIndex(null);
    };

    const handleConfirmCancel = () => {
        if (selectedOrder) {
            updateOrderStatus(selectedOrder.orderNo, 'Dibatalkan');

            // Refund balance if payment was Non-COD
            if (selectedOrder.payment === 'Non-COD') {
                const amount = parseInt(selectedOrder.amount.replace(/[^0-9]/g, '')) || 0;
                addBalance(amount, `Refund Pembatalan ${selectedOrder.orderNo}`);
                showNotification(`Pesanan dibatalkan. Saldo sebesar Rp ${amount.toLocaleString()} telah dikembalikan ke akun Anda.`, 'success');
            } else {
                showNotification('Pesanan telah dibatalkan.', 'info');
            }

            setIsCancelConfirmOpen(false);
            setIsModalOpen(false);
        }
    };

    const handleCancelNo = () => {
        setIsCancelConfirmOpen(false);
    };

    const handleLihatStruk = async (e, order) => {
        e.stopPropagation();
        setIsLoadingReceipt(true);
        setSelectedOrder(order);
        setIsPreviewModalOpen(true);
        setActiveMenuIndex(null);
        try {
            const canvas = await generateReceiptCanvas(order);
            setReceiptCanvas(canvas.toDataURL());
        } catch (error) {
            console.error("Error generating receipt preview:", error);
            setIsPreviewModalOpen(false);
        } finally {
            setIsLoadingReceipt(false);
        }
    };

    return (
        <div className="container order-list-page">
            <div className="page-header">
                <h2>Riwayat Pengiriman</h2>
                <div className="stats-mini">
                    <span>Total Pesanan: <strong>{orders.length}</strong></span>
                    <button
                        className="download-report-btn-history"
                        onClick={() => downloadShippingReport(orders)}
                    >
                        <FileText size={16} />
                        Unduh Laporan
                    </button>
                </div>
            </div>

            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th width="40">NO</th>
                            <th width="220">TRANSAKSI</th>
                            <th>ALAMAT</th>
                            <th width="240">EKSPEDISI & ONGKIR</th>
                            <th width="200">ISI PAKET</th>
                            <th width="120">AKSI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                            <tr key={index}>
                                <td className="row-no">{index + 1}</td>
                                <td className="col-transaksi">
                                    <div className="transaksi-main">
                                        <div className="payment-label">
                                            <span className={`payment-dot ${order.payment === 'COD' ? 'cod' : 'non-cod'}`}></span>
                                            {order.payment || 'Non COD'}
                                        </div>
                                        <div className="order-no-text">{order.orderNo}</div>
                                        <div className="order-time-text">{order.date} 09:52</div>
                                        {user?.role === 'admin' ? (
                                            <select
                                                className={`status-select-minimal ${order.status.toLowerCase().replace(' ', '-')}`}
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.orderNo, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                disabled={order.status === 'Dibatalkan'}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Proses">Proses</option>
                                                <option value="Selesai">Selesai</option>
                                                {order.status === 'Dibatalkan' && <option value="Dibatalkan">Dibatalkan</option>}
                                            </select>
                                        ) : (
                                            <span className={`status-pill ${order.status.toLowerCase().replace(' ', '-')}`}>
                                                {order.status}
                                            </span>
                                        )}

                                    </div>
                                </td>
                                <td className="col-alamat">
                                    <div className="address-content">
                                        <div className="address-line"><strong>{order.senderName} / {order.senderPhone?.slice(-4) || 'XXXX'}</strong></div>
                                        <div className="address-line">{order.senderCity}, {order.senderProvince}</div>
                                        <div className="address-line"><strong>{order.receiverName} / {order.receiverPhone?.slice(-4) || 'XXXX'}</strong></div>
                                        <div className="address-line">{order.receiverCity}, {order.receiverProvince}</div>
                                        <div className="address-line address-hint">{order.receiverAddress}</div>
                                    </div>
                                </td>
                                <td className="col-ekspedisi">
                                    <div className="ekspedisi-content">
                                        <div className="exp-service-row">
                                            <Truck size={14} className="icon-tiny" />
                                            SwiftGo {order.service}
                                        </div>
                                        <div className="exp-amount-row">{order.amount}</div>
                                        <div className="exp-cod-row">
                                            {order.payment === 'COD' && `COD: ${order.amount}`}
                                        </div>
                                        <div className="exp-resi-row">
                                            Resi: {order.status === 'Pending' ? '-' : `SW-RESI-${order.orderNo.split('-')[1]}`}
                                            {order.status !== 'Pending' && (
                                                <button className="btn-copy-mini" onClick={(e) => handleCopyResi(e, `SW-RESI-${order.orderNo.split('-')[1]}`)}>
                                                    <Copy size={10} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="exp-btns">
                                        </div>
                                    </div>
                                </td>
                                <td className="col-paket">
                                    <div className="paket-content">
                                        <div className="item-name-row">{order.item}</div>
                                        <div className="item-spec-row">Berat: {order.weight} kg</div>
                                        <div className="item-spec-row">Dimensi: {order.length}x{order.width}x{order.height} cm</div>
                                    </div>
                                </td>
                                <td className="col-aksi">
                                    <div className="action-main">
                                        <button className="btn-print-outline" onClick={(e) => { e.stopPropagation(); printReceipt(order); }}>
                                            <Printer size={16} /> Print
                                        </button>
                                        <div className="more-menu-container" ref={activeMenuIndex === index ? menuRef : null}>
                                            <button className="btn-more" onClick={(e) => toggleMenu(e, index)}>
                                                <MoreVertical size={18} />
                                            </button>
                                            {activeMenuIndex === index && (
                                                <div className="dropdown-menu">

                                                    <button onClick={() => handleRowClick(order)}><Compass size={14} /> Tracking</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="6" className="empty-state">Belum ada riwayat pengiriman.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
                                    <span className="step-label">
                                        {(selectedOrder.senderCity || '').toLowerCase() === (selectedOrder.receiverCity || selectedOrder.destination || '').toLowerCase()
                                            ? 'Dalam Kota'
                                            : 'Luar Kota'}
                                    </span>
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
                                                <div className="timeline-marker active">
                                                    <Package size={14} />
                                                </div>
                                                <div className="timeline-info">
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
                                                <div className="timeline-marker active">
                                                    <Truck size={14} />
                                                </div>
                                                <div className="timeline-info">
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
                                                <div className="timeline-marker active">
                                                    <Navigation size={14} />
                                                </div>
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
                                                <div className="timeline-marker active">
                                                    <User size={14} />
                                                </div>
                                                <div className="timeline-info">
                                                    <h4>Paket Diterima</h4>
                                                    <p>Paket telah sampai di tujuan dan diterima oleh penghuni alamat.</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="timeline-row">
                                            <div className="timeline-date">{selectedOrder.date}</div>
                                            <div className="timeline-marker active">
                                                <Check size={14} />
                                            </div>
                                            <div className="timeline-info">
                                                <h4>Penjadwalan</h4>
                                                <p>Penjadwalan penjemputan paket</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-right-col">
                                    <div className="modal-info-summary">
                                        <div className="info-block">
                                            <h4>Pengirim</h4>
                                            <p>{selectedOrder.senderName || '-'}</p>
                                        </div>
                                        <div className="info-block">
                                            <h4>Penerima</h4>
                                            <p>{selectedOrder.receiverName || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="modal-product-details">
                                        <h4>
                                            <Package size={16} color="#c41e1e" /> Detail Produk
                                        </h4>
                                        <table className="product-details-table">
                                            <tbody>
                                                <tr>
                                                    <td>Nama Barang</td>
                                                    <td>{selectedOrder.item || '-'}</td>
                                                </tr>
                                                <tr>
                                                    <td>Kategori</td>
                                                    <td>{selectedOrder.itemType || '-'}</td>
                                                </tr>
                                                <tr>
                                                    <td>Berat</td>
                                                    <td>{selectedOrder.weight || '0'} kg</td>
                                                </tr>
                                                <tr>
                                                    <td>Dimensi</td>
                                                    <td>{selectedOrder.length || 0}x{selectedOrder.width || 0}x{selectedOrder.height || 0} cm</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <button className="btn-print-large" onClick={() => downloadReceipt(selectedOrder)}>
                                        <Download size={18} /> Download Resi
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

            {/* Receipt Preview Modal */}
            {isPreviewModalOpen && (
                <div className="receipt-preview-overlay" onClick={closePreviewModal}>
                    <div className="receipt-preview-content" onClick={(e) => e.stopPropagation()}>
                        <div className="preview-header">
                            <h3>Pratinjau Struk - {selectedOrder?.orderNo}</h3>
                            <button className="close-preview" onClick={closePreviewModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="preview-body">
                            {isLoadingReceipt ? (
                                <div className="loading-preview">
                                    <div className="spinner"></div>
                                    <p>Menyiapkan struk...</p>
                                </div>
                            ) : (
                                receiptCanvas && <img src={receiptCanvas} alt="Receipt Preview" />
                            )}
                        </div>
                        <div className="preview-footer">
                            <button className="btn-footer btn-download" onClick={() => downloadReceipt(selectedOrder)}>
                                <Download size={18} /> Download
                            </button>
                            <button className="btn-footer btn-print" onClick={() => printReceipt(selectedOrder)}>
                                <Printer size={18} /> Cetak
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderList;
