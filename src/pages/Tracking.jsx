import React, { useState } from 'react';
import { Search, Package, Truck, Navigation, User, Check, AlertCircle } from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import '../styles/Tracking.css';
import '../styles/ShipmentModal.css';

const Tracking = () => {
    const { orders } = useLogistics();
    const [searchQuery, setSearchQuery] = useState('');
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
                    {/* Live Tracking Map Section - AS REQUESTED */}
                    <div className="live-tracking-dashboard">
                        <div className="map-sidebar">
                            <h3>Optimization API</h3>
                            <div className="map-tabs">
                                <span className="map-tab">1. Location</span>
                                <span className="map-tab">2. Shipments</span>
                                <span className="map-tab">3. Vehicles</span>
                                <span className="map-tab active">4. Solution</span>
                            </div>

                            <table className="vehicle-table">
                                <thead>
                                    <tr>
                                        <th>Vehicle ID</th>
                                        <th>Route</th>
                                        <th># of Stops</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="radio" checked readOnly /> 1</div></td>
                                        <td><div className="route-strip route-blue"></div></td>
                                        <td>4</td>
                                        <td>14:20</td>
                                    </tr>
                                    <tr>
                                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="radio" readOnly /> 2</div></td>
                                        <td><div className="route-strip route-red"></div></td>
                                        <td>3</td>
                                        <td>13:15</td>
                                    </tr>
                                    <tr>
                                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="radio" readOnly /> 3</div></td>
                                        <td><div className="route-strip route-orange"></div></td>
                                        <td>4</td>
                                        <td>12:55</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style={{ marginTop: 'auto', paddingTop: '40px', display: 'flex', gap: '12px' }}>
                                <button className="btn-map-action" style={{ flex: 1 }}>Cancel</button>
                                <button className="btn-map-action primary" style={{ flex: 1 }}>Save edits</button>
                            </div>
                        </div>

                        <div className="map-visual-container">
                            <div className="simulated-map">
                                <svg className="map-route-svg">
                                    {/* Blue Route */}
                                    <path d="M 100 80 L 150 50 L 250 100 L 220 180 L 120 250 L 80 150 Z" className="route-path" style={{ stroke: '#3b82f6' }} />
                                    {/* Red Route */}
                                    <path d="M 250 100 L 350 150 L 320 300 L 200 350 L 150 250" className="route-path" style={{ stroke: '#ef4444' }} />
                                    {/* Orange Route */}
                                    <path d="M 350 150 L 450 100 L 500 200 L 400 250 L 350 150" className="route-path" style={{ stroke: '#f97316' }} />
                                </svg>

                                {/* Markers for Blue Route */}
                                <div className="stop-marker" style={{ top: '50px', left: '150px' }}>1</div>
                                <div className="stop-marker" style={{ top: '150px', left: '80px' }}>2</div>
                                <div className="stop-marker" style={{ top: '250px', left: '120px' }}>3</div>
                                <div className="stop-marker" style={{ top: '180px', left: '220px' }}>4</div>

                                {/* Current Location Pin */}
                                <div className="current-pin-wrapper" style={{ top: '100px', left: '250px' }}>
                                    <div className="current-pin">
                                        <Truck size={20} />
                                    </div>
                                </div>

                                {/* Markers for Red Route */}
                                <div className="stop-marker" style={{ top: '150px', left: '350px', borderColor: '#ef4444' }}>1</div>
                                <div className="stop-marker" style={{ top: '300px', left: '320px', borderColor: '#ef4444' }}>2</div>
                                <div className="stop-marker" style={{ top: '350px', left: '200px', borderColor: '#ef4444' }}>3</div>

                                {/* Markers for Orange Route */}
                                <div className="stop-marker" style={{ top: '100px', left: '450px', borderColor: '#f97316' }}>1</div>
                                <div className="stop-marker" style={{ top: '200px', left: '500px', borderColor: '#f97316' }}>2</div>
                                <div className="stop-marker" style={{ top: '250px', left: '400px', borderColor: '#f97316' }}>3</div>
                                <div className="stop-marker" style={{ top: '150px', left: '350px', borderColor: '#f97316' }}>4</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px' }}></div>

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
                                            <span className="step-label">Luar Kota</span>
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
