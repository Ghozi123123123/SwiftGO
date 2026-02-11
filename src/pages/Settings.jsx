import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Settings as SettingsIcon, Save, Zap, Clock, Package, FileText } from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { downloadShippingReport } from '../services/reportUtils';
import '../styles/Settings.css';

const Settings = () => {
    const { rates, updateRates, showNotification, orders, user } = useLogistics();
    const [formData, setFormData] = useState({ ...rates });
    const [isSaving, setIsSaving] = useState(false);

    if (user?.role !== 'admin') {
        return <Navigate to="/app" replace />;
    }


    const [showChart, setShowChart] = useState(true);
    const [hoveredData, setHoveredData] = useState(null);

    const dailyRevenueData = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = Array.from({ length: daysInMonth }, (_, i) =>
            (i + 1).toString().padStart(2, '0')
        );

        const currentMonthName = now.toLocaleString('id-ID', { month: 'long' });

        return days.map(day => {
            const revenue = orders
                .filter(order => order.status !== 'Dibatalkan' && order.date.startsWith(day))
                .reduce((sum, order) => sum + (parseInt(order.amount.replace(/[^0-9]/g, '')) || 0), 0);
            return {
                day,
                revenue,
                dateLong: `${day} ${currentMonthName} ${year}`
            };
        });
    }, [orders]);

    const maxRevenue = Math.max(...dailyRevenueData.map(d => d.revenue), 10000);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseInt(value) || 0
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate minor delay for UX
        setTimeout(() => {
            updateRates(formData);
            setIsSaving(false);
            showNotification('Pengaturan tarif berhasil diperbarui!', 'success');
        }, 500);
    };

    return (
        <div className="settings-page">
            <header className="settings-header header-with-toggle">
                <div>
                    <h2>Pengaturan & Grafik Pendapatan</h2>
                    <p>Kelola tarif layanan SwiftGo.</p>
                </div>
            </header>

            {showChart && (
                <div className="revenue-chart-container animate-fade-in">
                    <div className="chart-svg-wrapper">
                        <svg viewBox="0 0 800 200" className="revenue-chart-svg">
                            {/* Grid Lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                                <line
                                    key={i}
                                    x1="40"
                                    y1={170 - (p * 150)}
                                    x2="780"
                                    y2={170 - (p * 150)}
                                    className="grid-line"
                                />
                            ))}

                            {/* Y-Axis Labels */}
                            {[1.0, 0.8, 0.6, 0.4, 0.2, 0].map((val, i) => (
                                <text key={i} x="30" y={25 + (i * 30)} className="axis-label y-axis">{val.toFixed(1)}</text>
                            ))}

                            {/* Data Path */}
                            <path
                                d={`M ${dailyRevenueData.map((d, i) =>
                                    `${40 + (i * (740 / (dailyRevenueData.length - 1)))},${170 - (d.revenue / maxRevenue * 150)}`
                                ).join(' L ')}`}
                                className="chart-line-path"
                                fill="none"
                            />

                            {/* Points and Interaction Areas */}
                            {dailyRevenueData.map((d, i) => {
                                const x = 40 + (i * (740 / (dailyRevenueData.length - 1)));
                                const y = 170 - (d.revenue / maxRevenue * 150);
                                const patchWidth = 740 / (dailyRevenueData.length - 1);
                                return (
                                    <g key={i} onMouseEnter={() => setHoveredData({ ...d, x, y })} onMouseLeave={() => setHoveredData(null)}>
                                        <circle cx={x} cy={y} r="4" className={`chart-point ${hoveredData?.day === d.day ? 'active' : ''}`} />
                                        <rect x={x - patchWidth / 2} y="0" width={patchWidth} height="200" fill="transparent" style={{ cursor: 'pointer' }} />
                                    </g>
                                );
                            })}

                            {/* X-Axis Labels (Filtered to show every 5th day + last day) */}
                            {dailyRevenueData.map((d, i) => {
                                const isVisible = i % 5 === 0 || i === dailyRevenueData.length - 1;
                                if (!isVisible) return null;
                                return (
                                    <text key={i} x={40 + (i * (740 / (dailyRevenueData.length - 1)))} y="195" className="axis-label x-axis">{d.day}</text>
                                );
                            })}

                            {/* Tooltip */}
                            {hoveredData && (() => {
                                let tooltipX = hoveredData.x - 125;

                                // Boundary check for foreignObject container
                                if (tooltipX < 10) tooltipX = 10;
                                if (tooltipX + 250 > 790) tooltipX = 790 - 250;

                                return (
                                    <g className="chart-tooltip-group">
                                        <line x1={hoveredData.x} y1={hoveredData.y} x2={hoveredData.x} y2={hoveredData.y - 12} stroke="#c41e1e" strokeDasharray="4" strokeWidth="1.5" />
                                        <foreignObject
                                            x={tooltipX}
                                            y={hoveredData.y - 75}
                                            width="250"
                                            height="70"
                                            style={{ overflow: 'visible', pointerEvents: 'none' }}
                                        >
                                            <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                <div className="tooltip-hug-container">
                                                    <div className="tooltip-hug-line main">
                                                        <span className="tooltip-hug-dot"></span>
                                                        <span>Tanggal: {hoveredData.dateLong}</span>
                                                    </div>
                                                    <div className="tooltip-hug-line sub">
                                                        <span>Total Pendapatan: Rp {hoveredData.revenue.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </foreignObject>
                                    </g>
                                );
                            })()}
                        </svg>
                    </div>
                </div>
            )}


            <div className="settings-card">
                <form className="settings-form" onSubmit={handleSubmit}>
                    <div className="settings-section">
                        <h3 className="settings-section-title">
                            <Package size={18} color="#c41e1e" />
                            Tarif Dasar & Berat
                        </h3>
                        <div className="input-grid">
                            <div className="input-group">
                                <label>Tarif Dasar (Reguler)</label>
                                <div className="input-wrapper">
                                    <span className="prefix">Rp</span>
                                    <input
                                        type="number"
                                        name="baseRate"
                                        value={formData.baseRate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Tarif per kg</label>
                                <div className="input-wrapper">
                                    <span className="prefix">Rp</span>
                                    <input
                                        type="number"
                                        name="ratePerKg"
                                        value={formData.ratePerKg}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Diskon Loyalitas (%)</label>
                                <div className="input-wrapper">
                                    <span className="prefix">%</span>
                                    <input
                                        type="number"
                                        name="loyaltyDiscount"
                                        value={formData.loyaltyDiscount}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3 className="settings-section-title">
                            <Zap size={18} color="#c41e1e" />
                            Layanan Tambahan
                        </h3>
                        <div className="input-grid">
                            <div className="input-group">
                                <label>Biaya Express</label>
                                <div className="input-wrapper">
                                    <span className="prefix">Rp</span>
                                    <input
                                        type="number"
                                        name="expressFee"
                                        value={formData.expressFee}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Biaya Same Day</label>
                                <div className="input-wrapper">
                                    <span className="prefix">Rp</span>
                                    <input
                                        type="number"
                                        name="sameDayFee"
                                        value={formData.sameDayFee}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="save-btn" disabled={isSaving}>
                        <Save size={18} />
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
