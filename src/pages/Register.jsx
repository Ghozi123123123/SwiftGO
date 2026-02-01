import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/Login.css';

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: '',
        confirmPassword: ''
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
        // Validation logic would go here
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        console.log('Registration Data:', formData);
        // Navigate back to login after "successful" registration
        navigate('/login');
    };

    return (
        <div className="login-container">
            <div className="login-card register-card">
                <div className="brand-section">
                    <h1 className="brand-title">SwiftGO</h1>
                    <p className="brand-tagline">Gabung Sekarang, Kirim Lebih Cepat</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Nama Lengkap</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            placeholder="Nama Lengkap"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

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
                            required
                        />
                    </div>

                    <div className="form-row">
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
                                    required
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
                        </div>

                        <div className="form-group password-group">
                            <label htmlFor="confirmPassword">Konfirmasi Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="login-button">
                        DAFTAR
                    </button>
                </form>

                <div className="login-footer">
                    Sudah punya akun?
                    <Link to="/login" className="register-link">Masuk</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
