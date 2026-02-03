import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import JsBarcode from 'jsbarcode';

export const downloadReceipt = async (order) => {
    // Create a temporary container for the receipt
    const receiptContainer = document.createElement('div');
    receiptContainer.style.position = 'absolute';
    receiptContainer.style.left = '-9999px';
    receiptContainer.style.top = '0';
    receiptContainer.style.width = '600px'; // Wider to accommodate the layout
    receiptContainer.style.padding = '0';
    receiptContainer.style.backgroundColor = '#ffffff';
    receiptContainer.style.fontFamily = "'Arial', sans-serif"; // More standard font looks closer to the receipt
    receiptContainer.style.color = '#000000';

    const getCityCode = (cityName) => {
        if (!cityName) return 'JKT';
        return cityName.substring(0, 3).toUpperCase();
    };

    const formatDate = (dateString) => {
        if (!dateString) return new Date().toLocaleDateString('id-ID');
        return dateString;
    };

    const getEstimatedDate = (dateString, service) => {
        const date = new Date(); // Use current date as base if string parsing fails or for simplicity
        let daysToAdd = 3;
        if (service === 'Express') daysToAdd = 1;
        if (service === 'Same Day') daysToAdd = 0;

        date.setDate(date.getDate() + daysToAdd);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const originCode = getCityCode(order.senderCity);
    const destCode = getCityCode(order.receiverCity || order.destination);

    // Mock sort code based on destination
    const sortCode = (order.receiverCity || 'Jakarta').substring(0, 3).toUpperCase() + '01';

    receiptContainer.innerHTML = `
        <div style="width: 100%; box-sizing: border-box; border: 2px solid #000; background: white;">
            <!-- Top Section -->
            <div style="display: flex; border-bottom: 2px solid #000;">
                <!-- Logo & Barcode Area -->
                <div style="flex: 2; border-right: 2px solid #000; padding: 10px;">
                    <div style="background: #333; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; font-style: italic; font-size: 18px; margin-bottom: 10px;">
                        Swift<span style="color: #ef4444;">Go</span> Express
                    </div>
                    <div style="font-size: 28px; font-weight: 900; letter-spacing: 1px; margin-bottom: 5px;">${order.orderNo}</div>
                    
                    <!-- Functional Barcode -->
                    <div style="margin-bottom: 5px;">
                        <svg class="barcode-main"></svg>
                    </div>
                    <div style="font-size: 10px; font-weight: bold;">Ref: -</div>
                    <div style="font-size: 10px; font-weight: bold;">POS SWIFTGO ${originCode}</div>
                </div>

                <!-- Codes Area -->
                <div style="flex: 1; display: flex; flex-direction: column;">
                    <div style="display: flex; border-bottom: 2px solid #000;">
                        <div style="background: #333; color: white; padding: 5px 10px; font-weight: bold; font-size: 20px; flex: 1; text-align: center; border-right: 2px solid #000;">
                            ${(order.service || 'REGULER').toUpperCase().substring(0, 8)}
                        </div>
                        <div style="flex: 1; padding: 5px; text-align: center;">
                            <div style="font-size: 16px; font-weight: bold;">${originCode}</div>
                            <div style="font-size: 24px; font-weight: 900;">${destCode}</div>
                        </div>
                    </div>
                    <div style="flex: 1; padding: 10px; display: flex; flex-direction: column; justify-content: center;">
                        <div style="font-size: 32px; font-weight: 900; line-height: 1;">${sortCode}</div>
                        <div style="font-size: 11px; margin-top: 5px;">Dibuat : ${formatDate(order.date)}</div>
                        <div style="font-size: 11px;">Estimasi: ${getEstimatedDate(order.date, order.service)}</div>
                    </div>
                </div>
            </div>

            <!-- Middle Section -->
            <div style="display: flex; border-bottom: 2px solid #000;">
                <!-- Addresses -->
                <div style="flex: 2; border-right: 2px solid #000; padding: 10px;">
                    <div style="font-size: 11px; margin-bottom: 8px;">
                        <strong>PENGIRIM: ${order.senderName?.toUpperCase() || 'PENGIRIM'}</strong> ${order.senderPhone || ''}
                    </div>
                    <div style="font-size: 11px; margin-bottom: 15px;">
                        <strong>PENERIMA: YTH ${order.receiverName?.toUpperCase() || 'PENERIMA'}</strong><br/>
                        ${order.receiverPhone || ''}<br/>
                        ${(order.receiverAddress || order.destination || '').toUpperCase()}<br/>
                        ${(order.receiverCity || '').toUpperCase()}
                    </div>
                    <div style="font-size: 14px; font-weight: bold; margin-top: 20px;">
                        ${(order.receiverDistrict || '').toUpperCase()}, ${(order.receiverCity || '').toUpperCase()}, ${(order.receiverProvince || '').toUpperCase()}
                    </div>
                    
                    <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="background: #000; color: white; font-weight: bold; padding: 2px 8px; border-radius: 4px;">KT</div>
                        <div style="text-align: right; font-size: 10px; color: #555;">
                            ${(order.itemType || 'PAKET').toUpperCase()} & BARANG<br/>PRIBADI
                        </div>
                    </div>
                </div>

                <!-- Weight & Cost -->
                <div style="flex: 1; display: flex; flex-direction: column;">
                    <div style="border-bottom: 2px solid #000; padding: 10px;">
                        <div style="font-size: 24px; font-weight: 900;">${order.weight || '1'} kg</div>
                        <div style="font-size: 12px; font-weight: bold;">30x20x10 cm</div>
                        <div style="font-size: 12px; font-weight: bold;">CW: ${order.weight || '1'} kg</div>
                    </div>
                    <div style="border-bottom: 2px solid #000; padding: 5px 10px;">
                         <div style="font-size: 36px; font-weight: 900; text-align: center;">1/1</div>
                    </div>
                    <div style="flex: 1; padding: 10px;">
                        <div style="font-size: 12px; font-weight: bold;">Total Biaya</div>
                        <div style="font-size: 20px; font-weight: 900;">${order.amount}</div>
                        <div style="font-size: 10px; margin-top: 5px; display: flex; justify-content: space-between;">
                            <span>B. Kirim</span>
                            <span>: ${order.amount}</span>
                        </div>
                         <div style="font-size: 10px; display: flex; justify-content: space-between;">
                            <span>B. Lainnya</span>
                            <span>: Rp0</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Terms Line -->
            <div style="border-bottom: 2px dashed #000; font-size: 8px; padding: 2px 10px; display: flex; justify-content: space-between; color: #555;">
                <span>Syarat & ketentuan berlaku.</span>
                <span>Info lebih lanjut: https://swiftgo.com/sk</span>
            </div>

            <!-- Bottom Stub (Footer) -->
            <div style="display: flex; padding: 10px;">
                <div style="flex: 1.5; padding-right: 10px;">
                    <div style="display: flex; align-items: center; margin-bottom: 5px; gap: 10px;">
                        <div style="background: #333; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; font-style: italic;">
                            Swift<span style="color: #ef4444;">Go</span>
                        </div>
                        <div style="background: #333; color: white; padding: 2px 8px; font-size: 10px; font-weight: bold;">
                            ${(order.service || 'REGULER').toUpperCase().substring(0, 8)}
                        </div>
                    </div>
                    <div style="font-size: 18px; font-weight: 900; letter-spacing: 1px;">${order.orderNo}</div>
                    
                    <!-- Small Barcode -->
                    <div style="margin-bottom: 5px;">
                        <svg class="barcode-small"></svg>
                    </div>
                    
                    <div style="font-size: 9px; display: grid; grid-template-columns: 80px 1fr; gap: 2px;">
                        <strong>Pengirim</strong> <span>: ${order.senderName?.toUpperCase().substring(0, 15) || 'PENGIRIM'}</span>
                        <strong>Penerima</strong> <span>: ${order.receiverName?.toUpperCase().substring(0, 15) || 'PENERIMA'}</span>
                        <strong>Kota Tujuan</strong> <span>: ${(order.receiverCity || '').toUpperCase()}</span>
                    </div>
                     <div style="font-size: 9px; display: grid; grid-template-columns: 80px 1fr; gap: 2px; margin-top: 5px;">
                        <strong>Dibuat</strong> <span>: ${formatDate(order.date)}</span>
                        <strong>Estimasi</strong> <span>: ${getEstimatedDate(order.date, order.service)}</span>
                    </div>
                </div>

                <div style="flex: 0.8; padding-left: 10px; border-left: 1px solid #000;">
                     <div style="border: 2px solid #000; padding: 10px; text-align: center; margin-bottom: 5px;">
                        <div style="font-size: 10px;">Ingin tahu status paketmu? Yuk lacak secara real-time!</div>
                     </div>
                     <div style="background: #333; color: white; padding: 10px; text-align: center; display: flex; items-align: center; justify-content: center; gap: 10px;">
                        <div style="width: 40px; height: 40px; background: white;">
                           <!-- Fake QR -->
                            <div style="width: 100%; height: 100%; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;">
                                ${Array.from({ length: 16 }).map(() => `<div style="background: ${Math.random() > 0.3 ? 'black' : 'white'};"></div>`).join('')}
                            </div>
                        </div>
                        <div style="text-align: left; font-size: 14px; font-weight: bold; line-height: 1.2;">
                            SCAN<br/>DI SINI
                        </div>
                     </div>
                </div>
                
                <div style="flex: 1; padding-left: 10px; border-left: 1px solid #000; font-size: 9px;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 2px;">
                        <strong>Total Biaya</strong> <strong>${order.amount}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>B. Kirim</span> <span>: ${order.amount}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                         <span>B. Lainnya</span> <span>: Rp0</span>
                    </div>
                     <div style="border-top: 2px solid #000; margin-top: 25px; padding-top: 2px; text-align: right; font-size: 12px; font-weight: bold;">
                        ${order.weight || '1'} kg
                    </div>
                </div>
            </div>
            <div style="border-top: 2px dashed #000; font-size: 8px; padding: 2px 10px; text-align: right; color: #555;">
                Info lebih lanjut: https://swiftgo.com/sk
            </div>
        </div>
    `;

    document.body.appendChild(receiptContainer);

    // Generate Barcodes
    try {
        JsBarcode(receiptContainer.querySelector('.barcode-main'), order.orderNo, {
            format: "CODE128",
            lineColor: "#000",
            width: 2,
            height: 50,
            displayValue: false, // We display text manually above
            margin: 0
        });

        JsBarcode(receiptContainer.querySelector('.barcode-small'), order.orderNo, {
            format: "CODE128",
            lineColor: "#000",
            width: 1.5,
            height: 30,
            displayValue: false,
            margin: 0
        });
    } catch (err) {
        console.error("Barcode generation error:", err);
    }

    try {
        const canvas = await html2canvas(receiptContainer, {
            scale: 2, // Good enough quality
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [100, 150] // Custom receipt size roughly matching A6 or label printer
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`SwiftGo-Resi-${order.orderNo}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Gagal mengunduh resi. Silakan coba lagi.');
    } finally {
        document.body.removeChild(receiptContainer);
    }
};
