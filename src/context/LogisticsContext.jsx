import React, { createContext, useContext, useState, useEffect } from 'react';

const LogisticsContext = createContext();

export const useLogistics = () => useContext(LogisticsContext);

const DEFAULT_RATES = {
    baseRate: 10000,
    ratePerKg: 10,
    expressFee: 25000,
    sameDayFee: 50000
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

    const [recentTracking, setRecentTracking] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);

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

    const addBalance = (amount) => {
        setBalance(prev => prev + Number(amount));
    };

    const deductBalance = (amount) => {
        setBalance(prev => prev - Number(amount));
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
        addBalance,
        deductBalance,
        recentTracking,
        addRecentTracking,
        currentOrder,
        setCurrentOrder,
    };

    return (
        <LogisticsContext.Provider value={value}>
            {children}
        </LogisticsContext.Provider>
    );
};
