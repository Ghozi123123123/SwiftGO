import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { Search, Package, Truck, Navigation, User, Check, AlertCircle } from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import '../styles/Tracking.css';
import '../styles/ShipmentModal.css';

const Tracking = () => {
    const { orders, user } = useLogistics();
    const [searchQuery, setSearchQuery] = useState('');

    if (user?.role === 'admin') {
        return <Navigate to="/app" replace />;
    }

    const [foundOrder, setFoundOrder] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        setError('');

        if (!searchQuery.trim()) {
            setError('Silakan masukkan nomor resi.');
            setFoundOrder(null);
            return;
        }

        const resiToSearch = searchQuery.trim().toUpperCase();
        const order = orders.find(o =>
            o.orderNo.toUpperCase() === resiToSearch ||
            `SW-RESI-${o.orderNo.split('-')[1]}` === resiToSearch
        );

        if (order) {
            setFoundOrder(order);
        } else {
            setFoundOrder(null);
            setError('Nomor resi tidak ditemukan. Silakan periksa kembali.');
        }
    };

    const getStatusState = (status) => {
        const states = {
            'Pending': { step: 1, label: 'Menunggu Penjemputan' },
            'Proses': { step: 3, label: 'Sedang Diproses' },
            'Selesai': { step: 4, label: 'Sampai di Tujuan' },
            'Dibatalkan': { step: 0, label: 'Pengiriman Dibatalkan' }
        };
        return states[status] || states['Pending'];
    };

    return (
        <div className="tracking-page">
            <header className="tracking-header">
                <h2>Lacak Pengiriman</h2>
                <p>Pantau posisi paket Anda secara real-time.</p>
            </header>

            <div className="tracking-search-container">
                <form className="tracking-search-form" onSubmit={handleSearch}>
                    <div className="search-input-wrapper">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Masukkan Nomor Resi (contoh: SW-RESI-XXXX)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="track-btn">LACAK</button>
                </form>
                {error && <div className="tracking-error"><AlertCircle size={16} /> {error}</div>}
            </div>

            {foundOrder && (
                <div className="tracking-result animate-fade-in">
                    <div className="shipment-modal-content standalone">
                        <div className="progress-tracker">
                            {(() => {
                                const { step } = getStatusState(foundOrder.status);
                                return (
                                    <>
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
                                                {foundOrder.senderCity?.toLowerCase() === foundOrder.receiverCity?.toLowerCase()
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
                                    </>
                                );
                            })()}
                        </div>

                        <div className="modal-grid">
                            <div className="modal-left-col">
                                <div className="timeline-details">
                                    {(() => {
                                        const { step } = getStatusState(foundOrder.status);
                                        return (
                                            <>
                                                {step >= 4 && (
                                                    <div className="timeline-row">
                                                        <div className="timeline-date">15:30</div>
                                                        <div className="timeline-marker active"><User size={14} /></div>
                                                        <div className="timeline-info">
                                                            <h4>Paket Diterima</h4>
                                                            <p>Paket telah sampai di tujuan dan diterima.</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {step >= 3 && (
                                                    <div className="timeline-row">
                                                        <div className="timeline-date">02:00</div>
                                                        <div className="timeline-marker active"><Navigation size={14} /></div>
                                                        <div className="timeline-info">
                                                            <h4>Kurir Menjemput</h4>
                                                            <p>Kurir sedang menjemput paketmu di hub terdekat.</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {step >= 2 && (
                                                    <div className="timeline-row">
                                                        <div className="timeline-date">10:00</div>
                                                        <div className="timeline-marker active"><Truck size={14} /></div>
                                                        <div className="timeline-info">
                                                            <h4>Berangkat Dari {foundOrder.senderCity}</h4>
                                                            <p>Paketmu sedang dalam perjalanan menuju kota tujuan.</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="timeline-row">
                                                    <div className="timeline-date">{foundOrder.date}</div>
                                                    <div className="timeline-marker active"><Package size={14} /></div>
                                                    <div className="timeline-info">
                                                        <h4>Pesanan Dibuat</h4>
                                                        <p>Pesanan dengan nomor {foundOrder.orderNo} telah berhasil dibuat.</p>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="modal-right-col">
                                <div className="modal-info-summary">
                                    <div className="info-block">
                                        <h4>Pengirim</h4>
                                        <p>{foundOrder.senderName}</p>
                                        <small>{foundOrder.senderCity}</small>
                                    </div>
                                    <div className="info-block">
                                        <h4>Penerima</h4>
                                        <p>{foundOrder.receiverName}</p>
                                        <small>{foundOrder.receiverCity}</small>
                                    </div>
                                </div>
                                <div className="modal-product-details">
                                    <h4><Package size={16} color="#c41e1e" /> Detail Pengiriman</h4>
                                    <table className="product-details-table">
                                        <tbody>
                                            <tr><td>Layanan</td><td>SwiftGo {foundOrder.service}</td></tr>
                                            <tr><td>Nama Barang</td><td>{foundOrder.item}</td></tr>
                                            <tr><td>Status</td><td><span className={`status-pill ${foundOrder.status.toLowerCase()}`}>{foundOrder.status}</span></td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!foundOrder && !error && (
                <div className="tracking-placeholder animate-fade-in">
                    <div className="placeholder-icon">
                        <Truck size={48} />
                    </div>
                    <h3>Belum Ada Data Lacak</h3>
                    <p>Masukkan nomor resi Anda pada kolom di atas untuk melihat status pengiriman.</p>
                </div>
            )}
        </div>
    );
};

export default Tracking;
