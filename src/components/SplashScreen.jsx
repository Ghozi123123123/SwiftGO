import React from 'react';
import './SplashScreen.css';
import logo from '../assets/logo.png';

const SplashScreen = () => {
    return (
        <div className="splash-screen">
            <div className="splash-content">
                <div className="logo-container">
                    <img src={logo} alt="SwiftGo Logo" className="splash-logo" />
                </div>
                <h1 className="splash-title">SwiftGo</h1>
                <p className="splash-subtitle">Kirim Cepat, Sampai Tepat</p>
            </div>
            <div className="splash-loader">
                <div className="loader-bar"></div>
            </div>
        </div>
    );
};

export default SplashScreen;
