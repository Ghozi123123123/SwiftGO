import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, User, MapPin, Truck, CreditCard, Zap, Rocket, Banknote, QrCode, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLogistics } from '../context/LogisticsContext';
import '../styles/Shipping.css';

const Shipping = () => {
    const navigate = useNavigate();
    const { addOrder, rates, balance, deductBalance, orders, showNotification } = useLogistics();
    const [formData, setFormData] = useState({
        senderName: '',
        senderPhone: '',
        senderAddress: '',
        senderProvince: '',
        senderCity: '',
        senderDistrict: '',
        senderPostal: '',

        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        receiverProvince: '',
        receiverCity: '',
        receiverDistrict: '',
        receiverPostal: '',

        itemName: '',
        itemType: '',
        weight: '',
        length: '',
        width: '',
        height: '',

        service: 'Reguler',
        payment: 'Non-COD'
    });

    const [volume, setVolume] = useState(0);
    const [costs, setCosts] = useState({
        base: rates?.baseRate || 10000,
        weightFee: 0,
        serviceFee: 0,
        locationFee: 0,
        discount: 0,
        discountAmount: 0,
        total: rates?.baseRate || 10000
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceSelect = (service) => {
        setFormData(prev => ({ ...prev, service }));
    };

    const handlePaymentSelect = (payment) => {
        setFormData(prev => ({ ...prev, payment }));
    };

    useEffect(() => {
        const l = parseFloat(formData.length) || 0;
        const w = parseFloat(formData.width) || 0;
        const h = parseFloat(formData.height) || 0;
        const vol = l * w * h;
        setVolume(vol);

        // Cost Calculation
        const base = rates?.baseRate || 10000;
        const weight = parseFloat(formData.weight) || 0;
        const weightFee = weight * (rates?.ratePerKg || 5000);
        let serviceFee = 0;
        if (formData.service === 'Express') serviceFee = rates?.expressFee || 25000;
        else if (formData.service === 'Same Day') serviceFee = rates?.sameDayFee || 50000;

        // Location Fee Logic
        let locationFee = 0;
        if (formData.senderCity && formData.receiverCity) {
            if (formData.senderProvince !== formData.receiverProvince) {
                locationFee = 15000; // Inter-province
            } else if (formData.senderCity.toLowerCase() !== formData.receiverCity.toLowerCase()) {
                locationFee = 5000; // Intra-province, different city
            }
        }

        // Loyalty Discount Logic
        let discount = 0;
        let discountAmount = 0;
        if (formData.senderName && formData.senderName.trim() !== '') {
            const senderOrderCount = orders.filter(order =>
                order.senderName.toLowerCase() === formData.senderName.trim().toLowerCase()
            ).length;

            if (senderOrderCount > 0 && (senderOrderCount + 1) % 5 === 0) {
                discount = rates?.loyaltyDiscount || 0;
                const subT = base + weightFee + serviceFee + locationFee;
                discountAmount = (subT * discount) / 100;
            }
        }

        setCosts({
            base,
            weightFee,
            serviceFee,
            locationFee,
            discount,
            discountAmount,
            total: base + weightFee + serviceFee + locationFee - discountAmount
        });
    }, [formData.length, formData.width, formData.height, formData.weight, formData.service, formData.senderCity, formData.receiverCity, formData.senderProvince, formData.receiverProvince, formData.senderName, rates, orders]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Form Validation
        const requiredFields = {
            senderName: 'Nama Pengirim',
            senderPhone: 'No. Telepon Pengirim',
            senderAddress: 'Alamat Pengirim',
            senderCity: 'Kota Pengirim',
            receiverName: 'Nama Penerima',
            receiverPhone: 'No. Telepon Penerima',
            receiverAddress: 'Alamat Penerima',
            receiverCity: 'Kota Penerima',
            itemName: 'Nama Barang',
            itemType: 'Jenis Barang',
            weight: 'Berat Barang',
            length: 'Panjang',
            width: 'Lebar',
            height: 'Tinggi'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key]) => !formData[key] || formData[key].toString().trim() === '')
            .map(([_, label]) => label);

        if (missingFields.length > 0) {
            showNotification(`Mohon lengkapi kolom berikut:\n- ${missingFields.join('\n- ')}`, 'warning');
            return;
        }

        if (formData.payment === 'Non-COD' && balance < costs.total) {
            showNotification(`Saldo tidak mencukupi! Saldo Anda: Rp ${balance.toLocaleString()}. Total Biaya: Rp ${costs.total.toLocaleString()}. Silakan isi saldo terlebih dahulu.`, 'error');
            navigate('/app');
            return;
        }

        const newOrder = {
            orderNo: `SWG-${Math.floor(1000 + Math.random() * 9000)}`,
            senderName: formData.senderName,
            senderPhone: formData.senderPhone,
            senderAddress: formData.senderAddress,
            senderProvince: formData.senderProvince,
            senderCity: formData.senderCity,
            senderDistrict: formData.senderDistrict,
            senderPostal: formData.senderPostal,
            receiverName: formData.receiverName,
            receiverPhone: formData.receiverPhone,
            receiverAddress: formData.receiverAddress,
            receiverProvince: formData.receiverProvince,
            receiverCity: formData.receiverCity,
            receiverDistrict: formData.receiverDistrict,
            receiverPostal: formData.receiverPostal,
            destination: formData.receiverCity,
            status: 'Pending',
            date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount: `Rp ${costs.total.toLocaleString()}`,
            item: formData.itemName,
            itemType: formData.itemType,
            weight: formData.weight,
            length: formData.length,
            width: formData.width,
            height: formData.height,
            service: formData.service,
            payment: formData.payment
        };

        if (formData.payment === 'Non-COD') {
            deductBalance(costs.total, `Pembayaran ${newOrder.orderNo}`);
        }

        addOrder(newOrder);
        showNotification(formData.payment === 'COD' ? 'Pengiriman Berhasil Dibuat! (Metode COD)' : 'Pengiriman Berhasil Dibuat! Saldo Anda telah terpotong.', 'success');
        navigate('/app/orders');
    };

    return (
        <div className="shipping-page">
            <div className="shipping-container">
                <div className="page-header">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} color="#000000" />
                    </button>
                    <h1 className="page-title">Buat Pengiriman Baru</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Section 1: Data Pengirim */}
                    <div className="shipping-card">
                        <div className="section-header">
                            <div className="section-number">1</div>
                            <h2 className="section-title">Data Pengirim</h2>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nama Pengirim</label>
                                <input type="text" name="senderName" value={formData.senderName} onChange={handleChange} className="form-input" placeholder="Nama Lengkap" />
                            </div>
                            <div className="form-group">
                                <label>No. Telepon</label>
                                <input type="text" name="senderPhone" value={formData.senderPhone} onChange={handleChange} className="form-input" placeholder="08xxxxxxxxxx" />
                            </div>
                            <div className="form-group">
                                <label>Provinsi</label>
                                <select name="senderProvince" value={formData.senderProvince} onChange={handleChange} className="form-select">
                                    <option value="">Pilih Provinsi</option>
                                    <option value="DKI Jakarta">DKI Jakarta</option>
                                    <option value="Jawa Barat">Jawa Barat</option>
                                    <option value="Jawa Tengah">Jawa Tengah</option>
                                    <option value="Jawa Timur">Jawa Timur</option>
                                    <option value="Banten">Banten</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Kota/Kabupaten</label>
                                <input type="text" name="senderCity" value={formData.senderCity} onChange={handleChange} className="form-input" placeholder="Kota/Kabupaten" />
                            </div>
                            <div className="form-group">
                                <label>Kecamatan</label>
                                <input type="text" name="senderDistrict" value={formData.senderDistrict} onChange={handleChange} className="form-input" placeholder="Kecamatan" />
                            </div>
                            <div className="form-group">
                                <label>Kode Pos</label>
                                <input type="text" name="senderPostal" value={formData.senderPostal} onChange={handleChange} className="form-input" placeholder="Kode Pos" />
                            </div>
                            <div className="form-group full-width">
                                <label>Alamat Lengkap</label>
                                <textarea name="senderAddress" value={formData.senderAddress} onChange={handleChange} className="form-textarea" placeholder="Jl. Contoh No. 123, RT/RW"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Data Penerima */}
                    <div className="shipping-card">
                        <div className="section-header">
                            <div className="section-number">2</div>
                            <h2 className="section-title">Data Penerima</h2>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nama Penerima</label>
                                <input type="text" name="receiverName" value={formData.receiverName} onChange={handleChange} className="form-input" placeholder="Nama Lengkap" />
                            </div>
                            <div className="form-group">
                                <label>No. Telepon</label>
                                <input type="text" name="receiverPhone" value={formData.receiverPhone} onChange={handleChange} className="form-input" placeholder="08xxxxxxxxxx" />
                            </div>
                            <div className="form-group">
                                <label>Provinsi</label>
                                <select name="receiverProvince" value={formData.receiverProvince} onChange={handleChange} className="form-select">
                                    <option value="">Pilih Provinsi</option>
                                    <option value="DKI Jakarta">DKI Jakarta</option>
                                    <option value="Jawa Barat">Jawa Barat</option>
                                    <option value="Jawa Tengah">Jawa Tengah</option>
                                    <option value="Jawa Timur">Jawa Timur</option>
                                    <option value="Banten">Banten</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Kota/Kabupaten</label>
                                <input type="text" name="receiverCity" value={formData.receiverCity} onChange={handleChange} className="form-input" placeholder="Kota/Kabupaten" />
                            </div>
                            <div className="form-group">
                                <label>Kecamatan</label>
                                <input type="text" name="receiverDistrict" value={formData.receiverDistrict} onChange={handleChange} className="form-input" placeholder="Kecamatan" />
                            </div>
                            <div className="form-group">
                                <label>Kode Pos</label>
                                <input type="text" name="receiverPostal" value={formData.receiverPostal} onChange={handleChange} className="form-input" placeholder="Kode Pos" />
                            </div>
                            <div className="form-group full-width">
                                <label>Alamat Lengkap</label>
                                <textarea name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} className="form-textarea" placeholder="Jl. Contoh No. 123, RT/RW"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Detail Barang */}
                    <div className="shipping-card">
                        <div className="section-header">
                            <div className="section-number">3</div>
                            <h2 className="section-title">Detail Barang</h2>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nama Barang</label>
                                <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} className="form-input" placeholder="Contoh: Baju, Elektronik" />
                            </div>
                            <div className="form-group">
                                <label>Jenis Barang</label>
                                <select name="itemType" value={formData.itemType} onChange={handleChange} className="form-select">
                                    <option value="">Pilih Jenis</option>
                                    <option value="Dokumen">📄 Dokumen</option>
                                    <option value="Elektronik">📱 Elektronik</option>
                                    <option value="Pakaian">👕 Pakaian</option>
                                    <option value="Makanan">🍔 Makanan</option>
                                    <option value="Kosmetik">💄 Kosmetik</option>
                                    <option value="Furniture">🪑 Furniture</option>
                                    <option value="Lainnya">📦 Lainnya</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Berat (kg)</label>
                                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="form-input" placeholder="0" />
                            </div>
                            <div className="form-group full-width">
                                <div className="dimension-grid">
                                    <div className="form-group">
                                        <label>P (cm)</label>
                                        <input type="number" name="length" value={formData.length} onChange={handleChange} className="form-input" placeholder="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>L (cm)</label>
                                        <input type="number" name="width" value={formData.width} onChange={handleChange} className="form-input" placeholder="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>T (cm)</label>
                                        <input type="number" name="height" value={formData.height} onChange={handleChange} className="form-input" placeholder="0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="volume-display" style={{ marginTop: '16px', padding: '12px', background: '#F9FAFB', borderRadius: '8px', fontSize: '14px', color: '#4B5563' }}>
                            Total Volume: <strong>{volume.toLocaleString()} cm³</strong>
                        </div>
                    </div>

                    {/* Section 4: Layanan & Pembayaran */}
                    <div className="shipping-card">
                        <div className="section-header">
                            <div className="section-number">4</div>
                            <h2 className="section-title">Layanan & Pembayaran</h2>
                        </div>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Jenis Layanan</label>
                                <div className="service-selection">
                                    <div className={`service-card ${formData.service === 'Reguler' ? 'active' : ''}`} onClick={() => handleServiceSelect('Reguler')}>
                                        <div className="service-radio"></div>
                                        <div className="service-info">
                                            <strong><Truck size={16} /> Reguler</strong>
                                            <p>3-5 hari kerja</p>
                                        </div>
                                    </div>
                                    <div className={`service-card ${formData.service === 'Express' ? 'active' : ''}`} onClick={() => handleServiceSelect('Express')}>
                                        <div className="service-radio"></div>
                                        <div className="service-info">
                                            <strong><Zap size={16} /> Express</strong>
                                            <p>1-2 hari kerja</p>
                                        </div>
                                    </div>
                                    <div className={`service-card ${formData.service === 'Same Day' ? 'active' : ''}`} onClick={() => handleServiceSelect('Same Day')}>
                                        <div className="service-radio"></div>
                                        <div className="service-info">
                                            <strong><Rocket size={16} /> Same Day</strong>
                                            <p>Hari yang sama</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group full-width">
                                <label>Metode Pembayaran</label>
                                <div className="service-selection">
                                    <div className={`service-card ${formData.payment === 'Non-COD' ? 'active' : ''}`} onClick={() => handlePaymentSelect('Non-COD')}>
                                        <div className="service-radio"></div>
                                        <div className="service-info">
                                            <strong><CreditCard size={16} /> Non-COD</strong>
                                        </div>
                                    </div>
                                    <div className={`service-card ${formData.payment === 'COD' ? 'active' : ''}`} onClick={() => handlePaymentSelect('COD')}>
                                        <div className="service-radio"></div>
                                        <div className="service-info">
                                            <strong><Home size={16} /> COD</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Rincian Biaya */}
                    <div className="shipping-card">
                        <div className="section-header">
                            <div className="section-number">5</div>
                            <h2 className="section-title">Rincian Biaya</h2>
                        </div>
                        <div className="cost-breakdown">
                            <div className="cost-item">
                                <span>Biaya Dasar</span>
                                <span>Rp {costs.base.toLocaleString()}</span>
                            </div>
                            <div className="cost-item">
                                <span>Biaya Berat</span>
                                <span>Rp {costs.weightFee.toLocaleString()}</span>
                            </div>
                            <div className="cost-item">
                                <span>Biaya Layanan</span>
                                <span>Rp {costs.serviceFee.toLocaleString()}</span>
                            </div>
                            <div className="cost-item">
                                <span>Ongkir</span>
                                <span>Rp {costs.locationFee.toLocaleString()}</span>
                            </div>
                            {costs.discount > 0 && (
                                <div className="cost-item discount" style={{ color: '#059669' }}>
                                    <span>Diskon Loyalitas ({costs.discount}%)</span>
                                    <span>-Rp {costs.discountAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="cost-divider"></div>
                            <div className="cost-item subtotal">
                                <span>Subtotal</span>
                                <span>Rp {(costs.base + costs.weightFee + costs.serviceFee + costs.locationFee).toLocaleString()}</span>
                            </div>
                            <div className="cost-item total">
                                <strong>Total</strong>
                                <strong>Rp {costs.total.toLocaleString()}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="submit-section">
                        <button type="submit" className="btn-confirm-order">Konfirmasi & Buat Pengiriman</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Shipping;
