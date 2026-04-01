import React, { createContext, useContext, useState, useEffect } from 'react';

const LogisticsContext = createContext();

export const useLogistics = () => useContext(LogisticsContext);

const DEFAULT_RATES = {
    baseRate: 10000,
    regulerFee: 2000,
    ratePerKg: 5000,
    expressFee: 25000,
    sameDayFee: 50000,
    ekonomisFee: 5000,
    loyaltyDiscount: 10,
    zonaDalamKota: 3000,
    zonaLuarKota: 8000,
    zonaLuarProvinsi: 10000,
    zonaLuarPulau: 15000
};

export const LogisticsProvider = ({ children }) => {
    // Load orders from localStorage on init
    const [orders, setOrders] = useState(() => {
        const savedOrders = localStorage.getItem('swiftgo_orders');
        return savedOrders ? JSON.parse(savedOrders) : [];
    });

    // Load rates from localStorage on init
    const [rates, setRates] = useState(() => {
        const savedRates = localStorage.getItem('swiftgo_rates');
        return savedRates ? JSON.parse(savedRates) : DEFAULT_RATES;
    });

    const [recentTracking, setRecentTracking] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

    // User state
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('swiftgo_user');
        return savedUser ? JSON.parse(savedUser) : { role: 'customer', name: 'Customer123', avatar: 'C' };
    });

    const showNotification = (message, type = 'info') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    // Save orders to localStorage when they change
    useEffect(() => {
        localStorage.setItem('swiftgo_orders', JSON.stringify(orders));
    }, [orders]);

    // Save rates to localStorage when they change
    useEffect(() => {
        localStorage.setItem('swiftgo_rates', JSON.stringify(rates));
    }, [rates]);

    // Save user to localStorage
    useEffect(() => {
        localStorage.setItem('swiftgo_user', JSON.stringify(user));
    }, [user]);

    const addRecentTracking = (number) => {
        setRecentTracking((prev) => {
            if (prev.includes(number)) return prev;
            return [number, ...prev].slice(0, 5); // Keep last 5
        });
    };

    const addOrder = (newOrder) => {
        setOrders(prev => [newOrder, ...prev]);
    };

    const updateRates = (newRates) => {
        setRates(newRates);
    };

    const deleteOrder = (orderNo) => {
        setOrders(prev => prev.filter(order => order.orderNo !== orderNo));
    };

    const updateOrderStatus = (orderNo, newStatus) => {
        setOrders(prev => prev.map(order =>
            order.orderNo === orderNo ? { ...order, status: newStatus } : order
        ));
    };

    const value = {
        orders,
        addOrder,
        deleteOrder,
        updateOrderStatus,
        rates,
        updateRates,
        notification,
        showNotification,
        recentTracking,
        addRecentTracking,
        currentOrder,
        setCurrentOrder,
        user,
        setUser
    };

    return (
        <LogisticsContext.Provider value={value}>
            {children}
        </LogisticsContext.Provider>
    );
};
