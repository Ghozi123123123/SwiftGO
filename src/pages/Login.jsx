import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import '../styles/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useLogistics();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuickLogin = (role) => {
        const userData = role === 'admin'
            ? { role: 'admin', name: 'Zian Admin', avatar: 'A' }
            : { role: 'customer', name: 'ZaraRara', avatar: 'Z' };

        setUser(userData);
        navigate(role === 'admin' ? '/app' : '/app/tracking');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, perform authentication here.
        // For now, default to customer if logged in via form
        setUser({ role: 'customer', name: 'ZaraRara', avatar: 'Z' });
        navigate('/app/tracking');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="brand-section">
                    <h1 className="brand-title">SwiftGO</h1>
                    <p className="brand-tagline">Kirim Cepat, Sampai Tepat</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Email / No. HP</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Ketik di sini"
                            value={formData.username}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group password-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
                            </button>
                        </div>
                        <div className="forgot-password">
                            <a href="#">Lupa Password?</a>
                        </div>
                    </div>

                </form>

                <div className="role-options">
                    <button
                        type="button"
                        className="role-btn admin"
                        onClick={() => handleQuickLogin('admin')}
                    >
                        <div className="role-icon-wrapper">
                            <ShieldCheck size={20} />
                        </div>
                        <div className="role-btn-text">
                            <span className="role-label">Masuk sebagai</span>
                            <span className="role-name">Admin</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="role-btn customer"
                        onClick={() => handleQuickLogin('customer')}
                    >
                        <div className="role-icon-wrapper">
                            <UserIcon size={20} />
                        </div>
                        <div className="role-btn-text">
                            <span className="role-label">Masuk sebagai</span>
                            <span className="role-name">Pelanggan</span>
                        </div>
                    </button>
                </div>

                <div className="login-footer">
                    Belum punya akun?
                    <Link to="/register" className="register-link">Daftar Sekarang</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
