// MOCK API SERVICE - Frontend Only Demo
// No backend required. Data resets on refresh.

const DELAY = 800; // Simulated network delay in ms

// Initial Mock Orders
let mockOrders = [
    { orderNo: 'JNT001234', receiverName: 'Budi Santoso', destination: 'Jakarta', status: 'In Transit' },
    { orderNo: 'JNT001235', receiverName: 'Siti Aminah', destination: 'Surabaya', status: 'Delivered' },
    { orderNo: 'JNT001236', receiverName: 'Andi Pratama', destination: 'Bandung', status: 'Picked Up' },
];

export const logisticsService = {
    // Simulate Trace/Tracking API
    trace: async (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const waybillNo = data.waybillNo || 'MOCK';
                let status = 'In Transit';
                let details = [];

                if (waybillNo === 'JNT001235' || waybillNo === 'JB001235') {
                    status = 'Delivered';
                    details = [
                        { time: '2023-10-26 10:00:00', desc: 'Delivered to [Siti Aminah]', city: 'Surabaya' },
                        { time: '2023-10-26 08:30:00', desc: 'With delivery courier', city: 'Surabaya' },
                        { time: '2023-10-25 18:00:00', desc: 'Arrived at Surabaya Hub', city: 'Surabaya' },
                        { time: '2023-10-24 10:00:00', desc: 'Departed from Jakarta Gateway', city: 'Jakarta' }
                    ];
                } else if (waybillNo === 'JNT001236' || waybillNo === 'JB001236') {
                    status = 'Picked Up';
                    details = [
                        { time: '2023-10-27 09:00:00', desc: 'Picked up by courier', city: 'Bandung' },
                        { time: '2023-10-27 08:00:00', desc: 'Order created', city: 'Bandung' }
                    ];
                } else if (waybillNo === 'JNT001234' || waybillNo === 'JB001234' || waybillNo === '365/YQw60803') {
                    // Specific "In Transit" Mock
                    const now = new Date();
                    status = 'In Transit';
                    details = [
                        { time: now.toISOString().replace('T', ' ').substring(0, 19), desc: 'Departed from Transit Center', city: 'Semarang' },
                        { time: new Date(now - 86400000).toISOString().replace('T', ' ').substring(0, 19), desc: 'Arrived at Transit Center', city: 'Semarang' },
                        { time: new Date(now - 172800000).toISOString().replace('T', ' ').substring(0, 19), desc: 'Departed from Jakarta Hub', city: 'Jakarta' },
                        { time: new Date(now - 259200000).toISOString().replace('T', ' ').substring(0, 19), desc: 'Picked up', city: 'Jakarta' }
                    ];
                } else {
                    // Return "Not Found" for everything else
                    resolve({
                        data: {
                            code: '0',
                            msg: 'Waybill not found',
                            data: null
                        }
                    });
                    return;
                }

                resolve({
                    data: {
                        code: '1',
                        data: {
                            waybillNo: waybillNo,
                            status: status,
                            details: details
                        }
                    }
                });
            }, DELAY);
        });
    },

    // Simulate Get Orders API
    getOrders: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        code: '1',
                        data: [...mockOrders] // Return copy
                    }
                });
            }, DELAY);
        });
    },

    // Simulate Add Order API
    addOrder: async (orderData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newOrder = {
                    orderNo: 'JNT' + Math.floor(100000 + Math.random() * 900000), // Random ID
                    receiverName: orderData.receiverName || 'New Receiver',
                    destination: orderData.destination || 'Unknown',
                    status: 'Picked Up'
                };
                mockOrders.unshift(newOrder); // Add to local mock list

                resolve({
                    data: {
                        code: '1',
                        msg: 'Order created successfully'
                    }
                });
            }, DELAY);
        });
    }
};

export default logisticsService;
