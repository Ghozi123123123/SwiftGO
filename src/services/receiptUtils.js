import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import JsBarcode from 'jsbarcode';

const getCityCode = (cityName) => {
    if (!cityName) return 'JKT';
    return cityName.substring(0, 3).toUpperCase();
};

const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Try to parse the date to ensure consistent formatting
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return dateString;
};

const getEstimatedDate = (dateString, service) => {
    if (service === 'Same Day') return formatDate(dateString);

    let date = new Date();
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
        date = parsedDate;
    }

    let daysToAdd = 3;
    if (service === 'Express') daysToAdd = 1;
    if (service === 'Same Day') daysToAdd = 0;

    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const createReceiptElement = (order) => {
    const receiptContainer = document.createElement('div');
    receiptContainer.style.width = '600px';
    receiptContainer.style.padding = '0';
    receiptContainer.style.backgroundColor = '#ffffff';
    receiptContainer.style.fontFamily = "'Arial', sans-serif";
    receiptContainer.style.color = '#000000';

    const originCode = getCityCode(order.senderCity);
    const destCode = getCityCode(order.receiverCity || order.destination);
    const sortCode = (order.receiverCity || 'Jakarta').substring(0, 3).toUpperCase() + '01';

    receiptContainer.innerHTML = `
        <div style="width: 100%; box-sizing: border-box; border: 2px solid #000; background: white;">
            <!-- Top Section -->
            <div style="display: flex; border-bottom: 2px solid #000;">
                <div style="flex: 2; border-right: 2px solid #000; padding: 10px;">
                    <div style="background: #333; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; font-style: italic; font-size: 18px; margin-bottom: 10px;">
                        Swift<span style="color: #ef4444;">Go</span> Express
                    </div>
                    <div style="font-size: 28px; font-weight: 900; letter-spacing: 1px; margin-bottom: 5px;">${order.orderNo}</div>
                    <div style="margin-bottom: 5px;">
                        <svg class="barcode-main"></svg>
                    </div>
                    <div style="font-size: 10px; font-weight: bold;">POS SWIFTGO ${originCode}</div>
                </div>
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
                <div style="flex: 2; border-right: 2px solid #000; padding: 10px;">
                    <div style="font-size: 11px; margin-bottom: 8px;">
                        <strong>PENGIRIM: ${order.senderName?.toUpperCase() || 'PENGIRIM'}</strong> ${order.senderPhone || ''}
                    </div>
                    <div style="font-size: 11px; margin-bottom: 15px;">
                        <strong>PENERIMA: YTH ${order.receiverName?.toUpperCase() || 'PENERIMA'}</strong><br/>
                        ${order.receiverPhone || ''}<br/>
                        ${(order.receiverAddress || '').toUpperCase()}<br/>
                        ${(order.receiverCity || order.destination || '').toUpperCase()}
                    </div>
                    <div style="font-size: 14px; font-weight: bold; margin-top: 20px;">
                        ${(order.receiverDistrict || '').toUpperCase()}${order.receiverDistrict ? ',' : ''} ${(order.receiverCity || order.destination || '').toUpperCase()}${(order.receiverProvince || '').toUpperCase() ? ',' : ''} ${(order.receiverProvince || '').toUpperCase()}
                    </div>
                    <div style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 8px;">
                        <div style="font-size: 10px; font-weight: bold; margin-bottom: 4px;">ISI BARANG:</div>
                        <div style="font-size: 10px; line-height: 1.2;">
                            ${order.items ?
            order.items.map(i => `${i.itemName} (${i.itemType})`).join(', ') :
            `${order.item || 'Paket Logistik'} (${order.itemType || 'Umum'})`
        }
                        </div>
                    </div>
                    <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="background: #000; color: white; font-weight: bold; padding: 2px 8px; border-radius: 4px;">KT</div>
                        <div style="text-align: right; font-size: 10px; color: #555;">
                            ${(order.itemType || 'PAKET').toUpperCase()}
                        </div>
                    </div>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column;">
                    <div style="border-bottom: 2px solid #000; padding: 10px;">
                        <div style="font-size: 24px; font-weight: 900;">
                            ${(() => {
            if (order.items) {
                return order.items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            }
            return order.weight || '1';
        })()} kg
                        </div>
                        <div style="font-size: 12px; font-weight: bold;">
                            ${(() => {
            if (order.items && order.items.length > 0) {
                return `${order.items.length} Barang`;
            }
            return `${order.length || 0}x${order.width || 0}x${order.height || 0} cm`;
        })()}
                        </div>
                        <div style="font-size: 12px; font-weight: bold;">
                            CW: ${(() => {
            let raw = 0;
            if (order.items) {
                const totalVol = order.items.reduce((sum, item) => sum + ((parseFloat(item.length || 0) * parseFloat(item.width || 0) * parseFloat(item.height || 0)) / 6000), 0);
                const totalWeight = order.items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
                raw = Math.max(totalWeight, totalVol);
            } else {
                raw = Math.max(
                    parseFloat(order.weight || 0),
                    (parseFloat(order.length || 0) * parseFloat(order.width || 0) * parseFloat(order.height || 0)) / 6000
                );
            }
            return (raw - Math.floor(raw)) > 0.50 ? Math.ceil(raw) : Math.floor(raw);
        })()} kg
                        </div>
                    </div>
                    <div style="border-bottom: 2px solid #000; padding: 5px 10px;">
                         <div style="font-size: 36px; font-weight: 900; text-align: center;">1/1</div>
                    </div>
                    <div style="flex: 1; padding: 10px;">
                        ${order.discountAmount > 0 ? `
                        <div style="font-size: 10px; color: #ef4444; font-weight: bold; margin-bottom: 2px;">
                            Diskon Loyalty (${order.discountRate}%)
                        </div>
                        <div style="font-size: 11px; color: #ef4444; font-weight: bold; margin-bottom: 5px; border-bottom: 1px dashed #ef4444;">
                            -Rp ${order.discountAmount.toLocaleString()}
                        </div>
                        ` : ''}
                        <div style="font-size: 12px; font-weight: bold;">Total Biaya</div>
                        <div style="font-size: 20px; font-weight: 900;">${order.amount}</div>
                    </div>
                </div>
            </div>
            
            <!-- Terms -->
            <div style="border-bottom: 2px dashed #000; font-size: 8px; padding: 2px 10px; display: flex; justify-content: space-between; color: #555;">
                <span>Syarat & ketentuan berlaku.</span>
                <span>Info lebih lanjut: https://swiftgo.com/sk</span>
            </div>

            <!-- Footer -->
            <div style="display: flex; padding: 10px;">
                <div style="flex: 1.5; padding-right: 10px;">
                    <div style="display: flex; align-items: center; margin-bottom: 5px; gap: 10px;">
                        <div style="background: #333; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; font-style: italic;">
                            Kirim<span style="color: #ef4444;">Aja</span>
                        </div>
                        <div style="background: #333; color: white; padding: 2px 8px; font-size: 10px; font-weight: bold;">
                            ${(order.service || 'REGULER').toUpperCase().substring(0, 8)}
                        </div>
                    </div>
                    <div style="font-size: 18px; font-weight: 900; letter-spacing: 1px;">${order.orderNo}</div>
                    <div style="margin-bottom: 5px;">
                        <svg class="barcode-small"></svg>
                    </div>
                    <div style="font-size: 9px; display: grid; grid-template-columns: 80px 1fr; gap: 2px;">
                        <strong>Pengirim</strong> <span>: ${order.senderName?.toUpperCase().substring(0, 15) || 'PENGIRIM'}</span>
                        <strong>Penerima</strong> <span>: ${order.receiverName?.toUpperCase().substring(0, 15) || 'PENERIMA'}</span>
                        <strong>Kota Tujuan</strong> <span>: ${(order.receiverCity || order.destination || '').toUpperCase()}</span>
                        <strong>Isi Barang</strong> <span>: ${order.items ? order.items.map(i => i.itemName.substring(0, 10)).join(', ') : (order.item || 'PAKET').substring(0, 15)}</span>
                    </div>
                    <div style="font-size: 9px; display: grid; grid-template-columns: 80px 1fr; gap: 2px; margin-top: 5px;">
                        <strong>Dibuat</strong> <span>: ${formatDate(order.date)}</span>
                        <strong>Estimasi</strong> <span>: ${getEstimatedDate(order.date, order.service)}</span>
                    </div>
                </div>

                <div style="flex: 1; padding-left: 10px; border-left: 1px solid #000; font-size: 9px;">
                    ${order.discountAmount > 0 ? `
                    <div style="display: flex; justify-content: space-between; font-size: 8px; color: #ef4444; margin-bottom: 1px;">
                        <span>Diskon (${order.discountRate}%)</span>
                        <span>-Rp ${order.discountAmount.toLocaleString()}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 2px;">
                        <strong>Total Biaya</strong> <strong>${order.amount}</strong>
                    </div>
                    <div style="border-top: 2px solid #000; margin-top: 15px; padding-top: 2px; text-align: right; font-size: 12px; font-weight: bold;">
                        ${(() => {
            if (order.items) {
                return order.items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
            }
            return order.weight || '1';
        })()} kg
                    </div>
                </div>
            </div>
        </div>
    `;

    return receiptContainer;
};

const applyBarcodes = (container, orderNo) => {
    try {
        JsBarcode(container.querySelector('.barcode-main'), orderNo, {
            format: "CODE128",
            lineColor: "#000",
            width: 2,
            height: 50,
            displayValue: false,
            margin: 0
        });

        JsBarcode(container.querySelector('.barcode-small'), orderNo, {
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
};

export const generateReceiptCanvas = async (order) => {
    const container = createReceiptElement(order);
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);
    applyBarcodes(container, order.orderNo);

    try {
        const canvas = await html2canvas(container, {
            scale: 2,
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        return canvas;
    } finally {
        document.body.removeChild(container);
    }
};

export const downloadReceipt = async (order) => {
    try {
        const canvas = await generateReceiptCanvas(order);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [100, 150]
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`SwiftGo-Resi-${order.orderNo}.pdf`);
    } catch (error) {
        console.error('Error downloading receipt:', error);
    }
};

export const printReceipt = async (order) => {
    try {
        const canvas = await generateReceiptCanvas(order);
        const dataUrl = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Receipt - ${order.orderNo}</title>
                    <style>
                        body { margin: 0; display: flex; justify-content: center; align-items: flex-start; }
                        img { width: 100%; max-width: 600px; height: auto; }
                        @page { size: auto; margin: 0; }
                    </style>
                </head>
                <body>
                    <img src="${dataUrl}" onload="window.print(); window.close();" />
                </body>
            </html>
        `);
        printWindow.document.close();
    } catch (error) {
        console.error('Error printing receipt:', error);
    }
};

