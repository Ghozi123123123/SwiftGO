import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const downloadReceipt = async (order) => {
    // Create a temporary container for the receipt
    const receiptContainer = document.createElement('div');
    receiptContainer.style.position = 'absolute';
    receiptContainer.style.left = '-9999px';
    receiptContainer.style.top = '0';
    receiptContainer.style.width = '500px';
    receiptContainer.style.padding = '0';
    receiptContainer.style.backgroundColor = '#ffffff';
    receiptContainer.style.fontFamily = "'Inter', 'Segoe UI', system-ui, sans-serif";
    receiptContainer.style.color = '#1f2937';

    const maskName = (name) => {
        if (!name) return '***';
        if (name.length <= 4) return name;
        return name.substring(0, 3) + '***' + name.substring(name.length - 3);
    };

    const maskPhone = (phone) => {
        if (!phone) return '****';
        if (phone.length <= 7) return phone;
        return phone.substring(0, 4) + '***' + phone.substring(phone.length - 2);
    };

    receiptContainer.innerHTML = `
        <div style="padding: 30px; border-left: 2px dashed #E5E7EB; border-right: 2px dashed #E5E7EB; background: white; min-height: 600px;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 50px; height: 50px; background: white; border: 1px solid #E5E7EB; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 5px;">
                        <img src="/favicon.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                    </div>
                    <div>
                        <h1 style="margin: 0; font-size: 24px; color: #c41e1e; font-weight: 800; font-family: 'Inter', sans-serif;">SwiftGo Express</h1>
                        <p style="margin: 0; font-size: 14px; color: #6B7280; font-weight: 500;">Cepat, Aman, Terpercaya</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; font-size: 12px; color: #9CA3AF; text-transform: uppercase; font-weight: 600;">Resi Pelanggan</p>
                    <p style="margin: 2px 0 0; font-size: 16px; color: #c41e1e; font-weight: 800;">${order.orderNo}</p>
                </div>
            </div>

            <div style="height: 1px; background: #E5E7EB; margin-bottom: 30px;"></div>

            <!-- Barcode Section -->
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; margin-bottom: 8px;">
                    <div style="display: flex; gap: 2px; align-items: flex-end; height: 60px;">
                        ${Array.from({ length: 40 }).map((_, i) => `
                            <div style="width: ${[1, 2, 3][Math.floor(Math.random() * 3)]}px; height: ${70 + Math.random() * 30}%; background: black;"></div>
                        `).join('')}
                    </div>
                    <p style="margin: 5px 0 0; font-size: 12px; font-weight: 600; color: #374151; letter-spacing: 2px;">${order.orderNo}</p>
                </div>
                <p style="margin: 0; font-size: 14px; color: #6B7280;">Scan barcode untuk melacak pengiriman</p>
            </div>

            <!-- Address Section -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 35px; padding: 0 10px;">
                <div>
                    <h3 style="margin: 0 0 8px; font-size: 12px; color: #9CA3AF; text-transform: uppercase; font-weight: 600;">Pengirim</h3>
                    <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 800;">${maskName(order.senderName || 'ZaraRara')}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #4B5563;">${maskPhone(order.senderPhone || '0877****')}</p>
                    <p style="margin: 0; font-size: 14px; color: #6B7280;">${order.senderCity || 'Malang, Jawa Timur'}</p>
                </div>
                <div>
                    <h3 style="margin: 0 0 8px; font-size: 12px; color: #9CA3AF; text-transform: uppercase; font-weight: 600;">Penerima</h3>
                    <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 800;">${order.receiverName}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #4B5563;">${maskPhone(order.receiverPhone)}</p>
                    <p style="margin: 0; font-size: 14px; color: #6B7280;">${order.destination}</p>
                </div>
            </div>

            <!-- Details Card -->
            <div style="background: #F9FAFB; border-radius: 16px; padding: 25px; margin-bottom: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; text-align: center;">
                    <div>
                        <p style="margin: 0 0 6px; font-size: 13px; color: #9CA3AF;">Barang</p>
                        <p style="margin: 0; font-size: 15px; color: #111827; font-weight: 800;">${order.item || 'Lainnya'}</p>
                    </div>
                    <div>
                        <p style="margin: 0 0 6px; font-size: 13px; color: #9CA3AF;">Berat</p>
                        <p style="margin: 0; font-size: 15px; color: #111827; font-weight: 800;">${order.weight || '1'} kg</p>
                    </div>
                    <div>
                        <p style="margin: 0 0 6px; font-size: 13px; color: #9CA3AF;">Layanan</p>
                        <p style="margin: 0; font-size: 15px; color: #111827; font-weight: 800;">${order.service || 'Reguler'}</p>
                    </div>
                </div>
            </div>

            <div style="height: 1px; background: #E5E7EB; margin-bottom: 20px;"></div>

            <!-- Footer -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 10px;">
                <p style="margin: 0; font-size: 13px; color: #6B7280;">${order.date}, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                <p style="margin: 0; font-size: 24px; color: #c41e1e; font-weight: 900;">${order.amount}</p>
            </div>
        </div>
    `;

    document.body.appendChild(receiptContainer);

    try {
        const canvas = await html2canvas(receiptContainer, {
            scale: 3,
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff',
            borderRadius: 24
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [120, 180] // More compact format for receipt
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`SwiftGo-Receipt-${order.orderNo}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Gagal mengunduh struk premium. Silakan coba lagi.');
    } finally {
        document.body.removeChild(receiptContainer);
    }
};
