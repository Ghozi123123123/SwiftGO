import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, DollarSign, Zap, Clock, Package } from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import '../styles/Settings.css';

const Settings = () => {
    const { rates, updateRates } = useLogistics();
    const [formData, setFormData] = useState({ ...rates });
    const [isSaving, setIsSaving] = useState(false);

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
            alert('Pengaturan tarif berhasil diperbarui!');
        }, 500);
    };

    return (
        <div className="settings-page">
            <header className="settings-header">
                <h2>Pengaturan Tarif</h2>
                <p>Kelola tarif dasar dan biaya layanan pengiriman SwiftGo.</p>
            </header>

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
                                <label>Tarif per Cm³ (Volume)</label>
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
