import React, { createContext, useContext, useState, useEffect } from 'react';

const LogisticsContext = createContext();

export const useLogistics = () => useContext(LogisticsContext);

const DEFAULT_RATES = {
    baseRate: 10000,
    ratePerKg: 5000,
    expressFee: 25000,
    sameDayFee: 50000,
    loyaltyDiscount: 10
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

    // Load balance from localStorage on init
    const [balance, setBalance] = useState(() => {
        const savedBalance = localStorage.getItem('swiftgo_balance');
        return savedBalance ? Number(savedBalance) : 0;
    });

    const [balanceHistory, setBalanceHistory] = useState(() => {
        const savedHistory = localStorage.getItem('swiftgo_balance_history');
        return savedHistory ? JSON.parse(savedHistory) : [];
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

    // Save balance to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('swiftgo_balance', balance.toString());
    }, [balance]);

    // Save balance history to localStorage
    useEffect(() => {
        localStorage.setItem('swiftgo_balance_history', JSON.stringify(balanceHistory));
    }, [balanceHistory]);

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

    const addBalance = (amount, description = 'Isi Saldo (Top Up)') => {
        const numAmount = Number(amount);
        setBalance(prev => prev + numAmount);
        setBalanceHistory(prev => [{
            id: Date.now(),
            type: 'increase',
            amount: numAmount,
            description: description,
            date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        }, ...prev].slice(0, 10)); // Keep last 10
    };

    const deductBalance = (amount, description = 'Pembayaran Pengiriman') => {
        const numAmount = Number(amount);
        setBalance(prev => prev - numAmount);
        setBalanceHistory(prev => [{
            id: Date.now(),
            type: 'decrease',
            amount: numAmount,
            description: description,
            date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        }, ...prev].slice(0, 10)); // Keep last 10
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
        balance,
        balanceHistory,
        addBalance,
        deductBalance,
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
