import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, Globe, ArrowRight, Package, Truck, Smartphone } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
    const [trackingNumber, setTrackingNumber] = React.useState('');
    const navigate = useNavigate();

    const handleTrack = () => {
        if (trackingNumber.trim()) {
            navigate(`/tracking?id=${trackingNumber}`);
        }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-new">
                <div className="container hero-container">
                    <div className="hero-left">
                        <p className="hero-subtitle">LOGISTICS PARTNER</p>
                        <h1>FAST DELIVERY <br />& SECURE <br />SHIPPING</h1>
                        <p className="hero-description">
                            Reliable logistics solutions for your business. We ensure your packages arrive on time, every time.
                        </p>

                        <div className="hero-actions">
                            <button className="btn-primary" onClick={() => navigate('/app/shipping')}>
                                Book Now <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="hero-right">
                        <div className="hero-image-wrapper">
                            <img src="https://images.unsplash.com/photo-1621955964441-c173e01c135b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Delivery" className="hero-main-img" />

                            {/* Stats Overlay - Right Side aligned vertically */}
                            <div className="hero-stats-vertical">
                                <div className="stat-item-v">
                                    <h3>5+</h3>
                                    <p>Years Exp</p>
                                </div>
                                <div className="stat-item-v">
                                    <h3>100+</h3>
                                    <p>Cities</p>
                                </div>
                                <div className="stat-item-v">
                                    <h3>1M+</h3>
                                    <p>Parcels</p>
                                </div>
                            </div>
                        </div>

                        {/* Flying Card - Must be kept */}
                        <div className="flying-card-wrapper">
                            <div className="visual-card">
                                <div className="card-icon"><img src="https://cdn-icons-png.flaticon.com/512/2830/2830305.png" alt="Delivery" width="50" /></div>
                                <div className="card-text">
                                    <strong>Fast Delivery</strong>
                                    <span>Express Shipping</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery / "Travel Journal" Style -> "Our Fleet & Reach" */}
            <section className="gallery-section">
                <div className="container">
                    <div className="section-header-left">
                        <h3>Our Reach</h3>
                        <p>Delivering to every corner</p>
                        <a href="#" className="view-all-link">View Coverage <ArrowRight size={16} /></a>
                    </div>
                    <div className="gallery-grid">
                        <div className="gallery-item item-1">
                            <img src="https://images.unsplash.com/photo-1566576912902-74161937727c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Transport" />
                            <span className="gallery-label">Jakarta</span>
                        </div>
                        <div className="gallery-item item-2">
                            <img src="https://images.unsplash.com/photo-1494412651409-ae1e0954332e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Delivery" />
                            <span className="gallery-label">Surabaya</span>
                        </div>
                        <div className="gallery-item item-3">
                            <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Air" />
                            <span className="gallery-label">Bali</span>
                        </div>
                        <div className="gallery-item item-4">
                            <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Warehouse" />
                            <span className="gallery-label">Medan</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* "Why Hire Me" Style -> "Why Choose J&T" */}
            <section className="why-choose-section">
                <div className="container">
                    <p className="section-supertitle">BENEFITS</p>
                    <h2>Why You Choose Us for<br />Your Logistics Needs?</h2>
                    <p className="section-desc-centered">
                        With over 5 years of experience and a deep understanding of logistics technology, we ensure your packages arrive safely and on time.
                    </p>
                </div>
            </section>

            {/* Partners - Minimalist */}
            <section className="partners-minimal">
                <div className="container">
                    <div className="partners-row">
                        <span className="partner-logo">SHOPEE</span>
                        <span className="partner-logo">TOKOPEDIA</span>
                        <span className="partner-logo">LAZADA</span>
                        <span className="partner-logo">TIKTOK</span>
                        <span className="partner-logo">BLIBLI</span>
                    </div>
                </div>
            </section>

            {/* Services List - "What Can I Do" Style */}
            <section className="services-list-section">
                <div className="container services-list-container">
                    <div className="services-header">
                        <p className="supertitle">SERVICES</p>
                        <h2>What We Do</h2>
                    </div>
                    <div className="services-list-grid">
                        <div className="service-list-item">
                            <span className="service-num">01</span>
                            <h3>Express Delivery</h3>
                            <p>Next day delivery for urgent requirements.</p>
                        </div>
                        <div className="service-list-item">
                            <span className="service-num">02</span>
                            <h3>Freight Cargo</h3>
                            <p>Large volume shipping for B2B needs.</p>
                        </div>
                        <div className="service-list-item">
                            <span className="service-num">03</span>
                            <h3>Warehousing</h3>
                            <p>Secure storage and inventory management.</p>
                        </div>
                        <div className="service-list-item">
                            <span className="service-num">04</span>
                            <h3>International</h3>
                            <p>Cross-border shipping solutions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Process - "How we'll work together" Style */}
            <section className="process-split-section">
                <div className="container">
                    <h2 className="process-title">How we'll work together</h2>

                    <div className="process-content-grid">
                        <div className="process-steps-vertical">
                            <div className="p-step">
                                <div className="p-icon"><Package size={20} /></div>
                                <div className="p-content">
                                    <h4>Booking</h4>
                                    <p>Create an order via our app or website easily.</p>
                                </div>
                            </div>
                            <div className="p-step">
                                <div className="p-icon"><Truck size={20} /></div>
                                <div className="p-content">
                                    <h4>Pickup</h4>
                                    <p>Driver arrives to pick up your package.</p>
                                </div>
                            </div>
                            <div className="p-step">
                                <div className="p-icon"><Globe size={20} /></div>
                                <div className="p-content">
                                    <h4>Transit</h4>
                                    <p>Real-time tracking as it moves through our network.</p>
                                </div>
                            </div>
                            <div className="p-step">
                                <div className="p-icon"><ShieldCheck size={20} /></div>
                                <div className="p-content">
                                    <h4>Delivery</h4>
                                    <p>Safe arrival at the destination.</p>
                                </div>
                            </div>
                        </div>

                        <div className="process-image">
                            <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Working together" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Get In Touch */}
            <section className="get-in-touch">
                <div className="container">
                    <div className="contact-grid">
                        <div className="contact-info">
                            <h3>Get In Touch</h3>
                            <p>Ready to streamline your logistics? Let's talk.</p>

                            <div className="contact-items">
                                <div className="c-item">
                                    <label>Email</label>
                                    <a href="mailto:support@swiftgo.com">support@swiftgo.com</a>
                                </div>
                                <div className="c-item">
                                    <label>Phone</label>
                                    <a href="tel:+622112345678">+62 21 1234 5678</a>
                                </div>
                            </div>
                        </div>
                        <div className="contact-form-wrapper">
                            <button className="btn-black-full">Contact Support</button>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
