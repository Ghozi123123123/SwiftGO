import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
    const navigate = useNavigate();
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

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, perform authentication here.
        // For now, simple navigation to the main application.
        navigate('/app');
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

                    <button type="submit" className="login-button">
                        MASUK
                    </button>
                </form>

                <div className="login-footer">
                    Belum punya akun?
                    <Link to="/register" className="register-link">Daftar Sekarang</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
