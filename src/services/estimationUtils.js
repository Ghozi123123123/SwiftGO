/**
 * SwiftGO Estimation Utilities
 * Calculates delivery days and arrival dates based on region and service type.
 */

export const calculateEstimation = (destinationProvince, service, shippingDate = new Date()) => {
    const javaTimur = ["Jawa Timur"];
    const javaIsland = ["DKI Jakarta", "Banten", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta"];

    // Default ranges based on requirements
    let range = { min: 3, max: 5 }; // Default Reguler

    if (service === 'Ekonomis') {
        range = { min: 3, max: 7 };
    } else if (service === 'Express' || service === 'Ekspress') {
        range = { min: 1, max: 2 };
    } else if (service === 'Same Day') {
        range = { min: 0, max: 1 };
    } else {
        range = { min: 3, max: 5 }; // Reguler
    }

    let days = 0;
    if (javaTimur.includes(destinationProvince)) {
        // Pengiriman dekat (Jawa Timur): waktu paling cepat dalam rentang layanan
        days = range.min;
    } else if (javaIsland.includes(destinationProvince)) {
        // Pengiriman sedang (Pulau Jawa): waktu tengah dalam rentang layanan
        days = Math.ceil((range.min + range.max) / 2);
    } else {
        // Pengiriman jauh (luar Pulau Jawa): waktu mendekati batas maksimal layanan
        days = range.max;
    }

    /**
     * Adds working days (excluding Sunday) to a date.
     * @param {Date} startDate 
     * @param {number} daysToAdd 
     * @returns {Date}
     */
    const addWorkingDays = (startDate, daysToAdd) => {
        let currentDate = new Date(startDate);
        if (daysToAdd === 0) return currentDate;

        let addedDays = 0;
        while (addedDays < daysToAdd) {
            currentDate.setDate(currentDate.getDate() + 1);
            if (currentDate.getDay() !== 0) { // 0 is Sunday
                addedDays++;
            }
        }
        return currentDate;
    };

    const arrivalDate = addWorkingDays(shippingDate, days);

    return {
        estimatedDays: days,
        estimatedArrivalDate: arrivalDate,
        formattedEstimation: days === 0 ? "Hari yang sama" : `${days} hari kerja`,
        formattedArrivalDate: arrivalDate.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }),
        simpleArrivalDate: arrivalDate.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    };
};
