import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, User, MapPin, Truck, CreditCard, Zap, Rocket, Banknote, QrCode, Home, Plus, Trash2 } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useLogistics } from '../context/LogisticsContext';
import { INDONESIA_CITIES, INDONESIA_DISTRICTS } from '../data/indonesiaData';
import { calculateEstimation } from '../services/estimationUtils';
import '../styles/Shipping.css';

const INDONESIA_PROVINCES = [
    "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
    "Jambi", "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung",
    "DKI Jakarta", "Banten", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta",
    "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
    "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan",
    "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara", "Gorontalo",
    "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
    "Maluku Utara", "Maluku", "Papua Barat", "Papua Barat Daya", "Papua",
    "Papua Tengah", "Papua Pegunungan", "Papua Selatan"
];

const getRegionWeight = (province) => {
    const javaBali = ["DKI Jakarta", "Banten", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Bali"];
    const sumatra = ["Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung"];
    const kalimantan = ["Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara"];
    const sulawesi = ["Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara"];
    const nusaTenggara = ["Nusa Tenggara Barat", "Nusa Tenggara Timur"];
    const papuaMaluku = ["Maluku Utara", "Maluku", "Papua Barat", "Papua Barat Daya", "Papua", "Papua Tengah", "Papua Pegunungan", "Papua Selatan"];

    if (javaBali.includes(province)) return 1;
    if (sumatra.includes(province)) return 2;
    if (kalimantan.includes(province)) return 3;
    if (sulawesi.includes(province)) return 4;
    if (nusaTenggara.includes(province)) return 5;
    if (papuaMaluku.includes(province)) return 6;
    return 1;
};

const Shipping = () => {
    const navigate = useNavigate();
    const { addOrder, rates, orders, showNotification, user } = useLogistics();

    if (user?.role !== 'admin') {
        return <Navigate to="/app/tracking" replace />;
    }
    const [formData, setFormData] = useState({
        senderName: '',
        senderPhone: '',
        senderAddress: '',
        senderProvince: '',
        senderCity: '',
        senderDistrict: '',
        senderDistrictManual: '',
        senderPostal: '',

        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        receiverProvince: '',
        receiverCity: '',
        receiverDistrict: '',
        receiverDistrictManual: '',
        receiverPostal: '',

        items: [{
            itemName: '',
            itemType: '',
            weight: '',
            length: '',
            width: '',
            height: ''
        }],

        service: 'Reguler',
        payment: 'Non-COD'
    });

    const [volume, setVolume] = useState(0);
    const [estimation, setEstimation] = useState(null);
    const [costs, setCosts] = useState({
        base: 0,
        weightFee: 0,
        serviceFee: 0,
        locationFee: 0,
        discount: 0,
        discountAmount: 0,
        chargeableWeight: 0,
        total: 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Reset dependent fields if parent changes
            if (name === 'senderProvince') {
                updated.senderCity = '';
                updated.senderDistrict = '';
                updated.senderDistrictManual = '';
                updated.senderPostal = '';
            }
            if (name === 'senderCity') {
                updated.senderDistrict = '';
                updated.senderDistrictManual = '';
                updated.senderPostal = '';
            }
            if (name === 'senderDistrict') {
                if (value !== 'Lainnya') {
                    // Auto-fill postal code
                    const districts = INDONESIA_DISTRICTS[prev.senderCity] || [];
                    const districtData = districts.find(d => d.name === value);
                    if (districtData) updated.senderPostal = districtData.zip;
                    updated.senderDistrictManual = '';
                } else {
                    updated.senderPostal = '';
                }
            }

            if (name === 'receiverProvince') {
                updated.receiverCity = '';
                updated.receiverDistrict = '';
                updated.receiverDistrictManual = '';
                updated.receiverPostal = '';
            }
            if (name === 'receiverCity') {
                updated.receiverDistrict = '';
                updated.receiverDistrictManual = '';
                updated.receiverPostal = '';
            }
            if (name === 'receiverDistrict') {
                if (value !== 'Lainnya') {
                    // Auto-fill postal code
                    const districts = INDONESIA_DISTRICTS[prev.receiverCity] || [];
                    const districtData = districts.find(d => d.name === value);
                    if (districtData) updated.receiverPostal = districtData.zip;
                    updated.receiverDistrictManual = '';
                } else {
                    updated.receiverPostal = '';
                }
            }

            return updated;
        });
    };

    const handleServiceSelect = (service) => {
        setFormData(prev => ({ ...prev, service }));
    };

    const handlePaymentSelect = (payment) => {
        setFormData(prev => ({ ...prev, payment }));
    };



    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { itemName: '', itemType: '', weight: '', length: '', width: '', height: '' }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [name]: value };
            return { ...prev, items: newItems };
        });
    };

    useEffect(() => {
        let totalVol = 0;
        let totalActualWeight = 0;

        formData.items.forEach(item => {
            const l = parseFloat(item.length) || 0;
            const w = parseFloat(item.width) || 0;
            const h = parseFloat(item.height) || 0;
            totalVol += (l * w * h) / 6000;
            totalActualWeight += parseFloat(item.weight) || 0;
        });

        setVolume(totalVol);

        // Cost Calculation
        const rawChargeable = Math.max(totalActualWeight, totalVol);
        // Custom Rounding: If decimal > 0.50 round up, else round down
        const roundedWeight = (rawChargeable - Math.floor(rawChargeable)) > 0.50
            ? Math.ceil(rawChargeable)
            : Math.floor(rawChargeable);

        const chargeableWeight = roundedWeight;

        let zoneTariff = 0;
        if (formData.senderCity && formData.receiverCity) {
            const sCity = formData.senderCity.toLowerCase();
            const rCity = formData.receiverCity.toLowerCase();

            if (sCity === rCity) {
                zoneTariff = rates?.zonaDalamKota || 5000; // Same city
            } else if (formData.senderProvince === formData.receiverProvince) {
                zoneTariff = rates?.zonaLuarKota || 7000; // Same province, different city
            } else {
                const w1 = getRegionWeight(formData.senderProvince);
                const w2 = getRegionWeight(formData.receiverProvince);
                if (w1 === w2) {
                    zoneTariff = rates?.zonaLuarProvinsi || 18000; // Different province, same region
                } else {
                    zoneTariff = rates?.zonaLuarPulau || 40000; // Base Luar Pulau directly from Admin Panel
                }
            }
        }

        const weightFee = chargeableWeight * zoneTariff;
        
        let serviceFee = 0;
        if (formData.service === 'Reguler') serviceFee = rates?.regulerFee || 2000;
        else if (formData.service === 'Ekspress' || formData.service === 'Express') serviceFee = rates?.expressFee || 25000;
        else if (formData.service === 'Same Day') serviceFee = rates?.sameDayFee || 50000;
        else if (formData.service === 'Ekonomis') serviceFee = rates?.ekonomisFee || 0;

        const base = 0; // Base fee is now deprecated in favor of specific service fees
        const locationFee = zoneTariff; // Storing as zone tariff for display

        // Loyalty Discount Logic (20% for EVERY 6th shipment with same name & address)
        let discount = 0;
        let discountAmount = 0;
        if (formData.senderName && formData.senderName.trim() !== '' && formData.senderAddress && formData.senderAddress.trim() !== '') {
            const senderOrderCount = orders.filter(order => {
                const oName = (order.senderName || '').trim().toLowerCase().replace(/\s+/g, ' ');
                const oAddr = (order.senderAddress || '').trim().toLowerCase().replace(/\s+/g, ' ');
                const fName = (formData.senderName || '').trim().toLowerCase().replace(/\s+/g, ' ');
                const fAddr = (formData.senderAddress || '').trim().toLowerCase().replace(/\s+/g, ' ');
                return oName === fName && oAddr === fAddr;
            }).length;

            // Trigger discount for the 6th, 12th, 18th, etc. shipment
            if (senderOrderCount > 0 && (senderOrderCount + 1) % 6 === 0) {
                discount = 20;
                const subT = base + weightFee + serviceFee;
                discountAmount = (subT * discount) / 100;
            }
        }

        // Calculate Estimation
        if (formData.receiverProvince && formData.service) {
            const est = calculateEstimation(formData.receiverProvince, formData.service);
            setEstimation(est);
        } else {
            setEstimation(null);
        }

        setCosts({
            base,
            weightFee,
            serviceFee,
            locationFee,
            discount,
            discountAmount,
            chargeableWeight: roundedWeight,
            total: base + weightFee + serviceFee - discountAmount
        });
    }, [formData.items, formData.service, formData.senderCity, formData.receiverCity, formData.senderProvince, formData.receiverProvince, formData.senderName, rates, orders]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Form Validation
        const requiredTopFields = [
            'senderName', 'senderPhone', 'senderAddress', 'senderCity',
            'receiverName', 'receiverPhone', 'receiverAddress', 'receiverCity'
        ];

        const missingFields = requiredTopFields.filter(key =>
            !formData[key] || formData[key].toString().trim() === ''
        );

        const missingItems = formData.items.some(item =>
            !item.itemName || !item.itemType || !item.weight || !item.length || !item.width || !item.height
        );

        if (missingFields.length > 0 || missingItems) {
            showNotification(`Mohon lengkapi semua kolom data pengirim, penerima, dan detail barang.`, 'warning');
            return;
        }

        const confirmCreate = window.confirm(`Apakah Anda yakin ingin membuat pengiriman ini?\nTotal Biaya: Rp ${costs.total.toLocaleString()}`);
        if (!confirmCreate) return;



        const newOrder = {
            orderNo: `SWG-${Math.floor(1000 + Math.random() * 9000)}`,
            senderName: formData.senderName,
            senderPhone: formData.senderPhone,
            senderAddress: formData.senderAddress,
            senderProvince: formData.senderProvince,
            senderCity: formData.senderCity,
            senderDistrict: formData.senderDistrict === 'Lainnya' ? formData.senderDistrictManual : formData.senderDistrict,
            senderPostal: formData.senderPostal,
            receiverName: formData.receiverName,
            receiverPhone: formData.receiverPhone,
            receiverAddress: formData.receiverAddress,
            receiverProvince: formData.receiverProvince,
            receiverCity: formData.receiverCity,
            receiverDistrict: formData.receiverDistrict === 'Lainnya' ? formData.receiverDistrictManual : formData.receiverDistrict,
            receiverPostal: formData.receiverPostal,
            destination: formData.receiverCity,
            status: 'Pending',
            date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount: `Rp ${costs.total.toLocaleString()}`,
            items: formData.items,
            service: formData.service,
            payment: formData.payment,
            discountAmount: costs.discountAmount,
            discountRate: costs.discount,
            estimatedArrival: estimation?.formattedArrivalDate,
            estimatedDays: estimation?.formattedEstimation,
            weightFee: costs.weightFee,
            serviceFee: costs.serviceFee,
            locationFee: costs.locationFee,
            chargeableWeight: costs.chargeableWeight
        };



        addOrder(newOrder);
        showNotification(formData.payment === 'COD' ? 'Pengiriman Berhasil Dibuat! (Metode COD)' : 'Pengiriman berhasil dibuat! (Metode Non-COD)', 'success');
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
                                    {INDONESIA_PROVINCES.map(prov => (
                                        <option key={prov} value={prov}>{prov}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Kota/Kabupaten</label>
                                <select
                                    name="senderCity"
                                    value={formData.senderCity}
                                    onChange={handleChange}
                                    className="form-select"
                                    disabled={!formData.senderProvince}
                                >
                                    <option value="">{formData.senderProvince ? 'Pilih Kota/Kabupaten' : 'Pilih Provinsi Terlebih Dahulu'}</option>
                                    {formData.senderProvince && INDONESIA_CITIES[formData.senderProvince]?.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Kecamatan</label>
                                <select
                                    name="senderDistrict"
                                    value={formData.senderDistrict}
                                    onChange={handleChange}
                                    className="form-select"
                                    disabled={!formData.senderCity}
                                >
                                    <option value="">{formData.senderCity ? 'Pilih Kecamatan' : 'Pilih Kota Terlebih Dahulu'}</option>
                                    {(INDONESIA_DISTRICTS[formData.senderCity] || []).map(dist => (
                                        <option key={dist.name} value={dist.name}>{dist.name}</option>
                                    ))}
                                    {formData.senderCity && (
                                        <option value="Lainnya">Kecamatan Tidak Terdaftar (Ketik Manual)</option>
                                    )}
                                </select>
                            </div>
                            {formData.senderDistrict === 'Lainnya' && (
                                <div className="form-group">
                                    <label>Tulis Nama Kecamatan</label>
                                    <input
                                        type="text"
                                        name="senderDistrictManual"
                                        value={formData.senderDistrictManual}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Ketik Nama Kecamatan"
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Kode Pos</label>
                                <input
                                    type="text"
                                    name="senderPostal"
                                    value={formData.senderPostal}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Kode Pos"
                                />
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
                                    {INDONESIA_PROVINCES.map(prov => (
                                        <option key={prov} value={prov}>{prov}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Kota/Kabupaten</label>
                                <select
                                    name="receiverCity"
                                    value={formData.receiverCity}
                                    onChange={handleChange}
                                    className="form-select"
                                    disabled={!formData.receiverProvince}
                                >
                                    <option value="">{formData.receiverProvince ? 'Pilih Kota/Kabupaten' : 'Pilih Provinsi Terlebih Dahulu'}</option>
                                    {formData.receiverProvince && INDONESIA_CITIES[formData.receiverProvince]?.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Kecamatan</label>
                                <select
                                    name="receiverDistrict"
                                    value={formData.receiverDistrict}
                                    onChange={handleChange}
                                    className="form-select"
                                    disabled={!formData.receiverCity}
                                >
                                    <option value="">{formData.receiverCity ? 'Pilih Kecamatan' : 'Pilih Kota Terlebih Dahulu'}</option>
                                    {(INDONESIA_DISTRICTS[formData.receiverCity] || []).map(dist => (
                                        <option key={dist.name} value={dist.name}>{dist.name}</option>
                                    ))}
                                    {formData.receiverCity && (
                                        <option value="Lainnya">Kecamatan Tidak Terdaftar (Ketik Manual)</option>
                                    )}
                                </select>
                            </div>
                            {formData.receiverDistrict === 'Lainnya' && (
                                <div className="form-group">
                                    <label>Tulis Nama Kecamatan</label>
                                    <input
                                        type="text"
                                        name="receiverDistrictManual"
                                        value={formData.receiverDistrictManual}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Ketik Nama Kecamatan"
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Kode Pos</label>
                                <input
                                    type="text"
                                    name="receiverPostal"
                                    value={formData.receiverPostal}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Kode Pos"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Alamat Lengkap</label>
                                <textarea name="receiverAddress" value={formData.receiverAddress} onChange={handleChange} className="form-textarea" placeholder="Jl. Contoh No. 123, RT/RW"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Detail Barang */}
                    <div className="shipping-card">
                        <div className="section-header detail-barang-header">
                            <div className="detail-barang-title-group">
                                <div className="section-number">3</div>
                                <h2 className="section-title">Detail Barang</h2>
                            </div>
                            <button
                                type="button"
                                className="add-item-btn"
                                onClick={addItem}
                            >
                                <Plus size={16} /> Tambah Barang
                            </button>
                        </div>

                        {formData.items.map((item, index) => (
                            <div key={index} className="item-entry" style={{ marginBottom: index === formData.items.length - 1 ? 0 : '24px' }}>
                                {formData.items.length > 1 && (
                                    <button
                                        type="button"
                                        className="remove-item-btn"
                                        onClick={() => removeItem(index)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nama Barang</label>
                                        <input
                                            type="text"
                                            name="itemName"
                                            value={item.itemName}
                                            onChange={(e) => handleItemChange(index, e)}
                                            className="form-input"
                                            placeholder="Contoh: Baju, Elektronik"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Jenis Barang</label>
                                        <select
                                            name="itemType"
                                            value={item.itemType}
                                            onChange={(e) => handleItemChange(index, e)}
                                            className="form-select"
                                        >
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
                                        <input
                                            type="number"
                                            name="weight"
                                            value={item.weight}
                                            onChange={(e) => handleItemChange(index, e)}
                                            className="form-input"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <div className="dimension-grid">
                                            <div className="form-group">
                                                <label>P (cm)</label>
                                                <input
                                                    type="number"
                                                    name="length"
                                                    value={item.length}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="form-input"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>L (cm)</label>
                                                <input
                                                    type="number"
                                                    name="width"
                                                    value={item.width}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="form-input"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>T (cm)</label>
                                                <input
                                                    type="number"
                                                    name="height"
                                                    value={item.height}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="form-input"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="volume-display">
                            Total Volume gabungan: <strong>{volume.toFixed(2)} kg</strong>
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
                                    <div className={`service-card ${formData.service === 'Ekonomis' ? 'active' : ''}`} onClick={() => handleServiceSelect('Ekonomis')}>
                                        <div className="service-radio"></div>
                                        <div className="service-info">
                                            <strong><Package size={16} /> Ekonomis</strong>
                                            <p>3-7 hari kerja</p>
                                        </div>
                                    </div>
                                    <div className={`service-card ${formData.service === 'Reguler' ? 'active' : ''}`} onClick={() => handleServiceSelect('Reguler')}>
                                        <div className="service-radio"></div>
                                        <div className="service-info">
                                            <strong><Truck size={16} /> Reguler</strong>
                                            <p>3-5 hari kerja</p>
                                        </div>
                                    </div>
                                    <div className={`service-card ${formData.service === 'Ekspress' ? 'active' : ''}`} onClick={() => handleServiceSelect('Ekspress')}>
                                        <div className="service-radio"></div>
                                        <div className="service-info">
                                            <strong><Zap size={16} /> Ekspress</strong>
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
                                <span>Berat Aktual (Total)</span>
                                <span>{formData.items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0)} kg</span>
                            </div>
                            <div className="cost-item">
                                <span>Berat Volume (Total)</span>
                                <span>{volume.toFixed(2)} kg</span>
                            </div>
                            <div className="cost-item" style={{ fontWeight: 'bold', borderTop: '1px dashed #eee', paddingTop: '8px' }}>
                                <span>Berat Dihitung</span>
                                <span>{costs.chargeableWeight} kg</span>
                            </div>
                            <div className="cost-divider" style={{ margin: '10px 0' }}></div>

                            {costs.locationFee > 0 && (
                                <>
                                    <div className="cost-item" style={{ fontSize: '15px', color: '#1e293b' }}>
                                        <span>Zona Pengiriman</span>
                                        <span style={{ fontWeight: '700' }}>
                                            {formData.senderCity === formData.receiverCity ? "Dalam Kota" :
                                                formData.senderProvince === formData.receiverProvince ? "Luar Kota" :
                                                getRegionWeight(formData.senderProvince) === getRegionWeight(formData.receiverProvince) ? "Luar Provinsi" :
                                                    "Luar Pulau"}
                                        </span>
                                    </div>
                                    <div className="cost-item" style={{ fontSize: '15px' }}>
                                        <span>Tarif Zona (per kg)</span>
                                        <span>Rp {costs.locationFee.toLocaleString()}</span>
                                    </div>
                                </>
                            )}

                            <div className="cost-item">
                                <span>Biaya Berat</span>
                                <span>Rp {costs.weightFee.toLocaleString()}</span>
                            </div>
                            <div className="cost-item">
                                <span>Biaya Layanan</span>
                                <span>Rp {costs.serviceFee.toLocaleString()}</span>
                            </div>


                            {costs.discount > 0 && (
                                <div className="cost-item discount" style={{ color: '#059669' }}>
                                    <span>Diskon Loyalitas ({costs.discount}%)</span>
                                    <span>-Rp {costs.discountAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="cost-divider"></div>
                            {estimation && (
                                <div className="estimation-info" style={{
                                    background: '#F0FDF4',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    border: '1px solid #DCFCE7'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px', color: '#15803d' }}>
                                        <span>Estimasi Pengiriman:</span>
                                        <strong>{estimation.formattedEstimation}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#15803d' }}>
                                        <span>Estimasi Sampai:</span>
                                        <strong>{estimation.formattedArrivalDate}</strong>
                                    </div>
                                </div>
                            )}
                            <div className="cost-item subtotal">
                                <span>Subtotal</span>
                                <span>Rp {(costs.base + costs.weightFee + costs.serviceFee).toLocaleString()}</span>
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
