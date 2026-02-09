import React from 'react';
import { CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import '../styles/Toast.css';

const Toast = () => {
    const { notification } = useLogistics();

    if (!notification.show) return null;

    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return <CheckCircle size={20} />;
            case 'error':
                return <XCircle size={20} />;
            case 'warning':
                return <AlertCircle size={20} />;
            case 'info':
            default:
                return <Info size={20} />;
        }
    };

    return (
        <div className={`toast-container ${notification.show ? 'show' : ''} ${notification.type}`}>
            <div className="toast-content">
                <div className="toast-icon">
                    {getIcon()}
                </div>
                <div className="toast-message">
                    {notification.message}
                </div>
            </div>
            <div className={`toast-progress ${notification.type}`}></div>
        </div>
    );
};

export default Toast;
