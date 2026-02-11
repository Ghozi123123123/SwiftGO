import { jsPDF } from 'jspdf';

export const downloadShippingReport = (orders) => {
    // Create new PDF document (portrait, mm, A4)
    const doc = new jsPDF();

    // -- Header Section --
    const title = 'Laporan Rekap Pengiriman SwiftGO';
    const subtitle = 'Kirim Cepat, Sampai Tepat';
    const printDate = `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

    doc.setTextColor(196, 30, 30); // Primary Red color
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text(title, 14, 20);

    doc.setTextColor(100, 100, 100); // Grey color
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(subtitle, 14, 26);

    doc.setTextColor(0, 0, 0); // Black
    doc.setFontSize(10);
    doc.text(printDate, 14, 34);

    // -- Summary Section --
    const totalRevenue = orders.reduce((sum, order) => {
        if (order.status === 'Dibatalkan') return sum;
        return sum + (parseInt(order.amount.replace(/[^0-9]/g, '')) || 0);
    }, 0);
    const totalOrders = orders.length;
    const successOrders = orders.filter(o => o.status === 'Selesai').length;
    const processOrders = orders.filter(o => o.status === 'Proses').length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const cancelOrders = orders.filter(o => o.status === 'Dibatalkan').length;

    // Draw summary box
    doc.setFillColor(249, 250, 251); // Light grey bg
    doc.setDrawColor(229, 231, 235); // Border color
    doc.roundedRect(14, 40, 182, 35, 3, 3, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);

    // Column 1
    doc.setFont(undefined, 'bold');
    doc.text('Total Pesanan:', 20, 50);
    doc.setFont(undefined, 'normal');
    doc.text(`${totalOrders} Paket`, 60, 50);

    doc.setFont(undefined, 'bold');
    doc.text('Total Pendapatan:', 20, 58);
    doc.setFont(undefined, 'normal');
    // Using a simple formatter for currency
    doc.text(`Rp ${totalRevenue.toLocaleString('id-ID')}`, 60, 58);

    // Column 2
    doc.setFont(undefined, 'bold');
    doc.text('Rincian Status:', 110, 50);
    doc.setFont(undefined, 'normal');
    doc.text(`• Selesai: ${successOrders}`, 110, 56);
    doc.text(`• Proses: ${processOrders}`, 110, 62);
    doc.text(`• Pending: ${pendingOrders}`, 150, 56);
    doc.text(`• Dibatalkan: ${cancelOrders}`, 150, 62);


    // -- Table Section --
    let y = 90;

    // Table Headers
    const headers = ['No', 'Tanggal', 'Resi', 'Nama', 'Layanan', 'Status', 'Biaya'];
    const colX = [14, 25, 55, 85, 115, 145, 175];

    // Draw initial header
    drawTableHeader(doc, y, headers, colX);
    y += 10;

    // Table Content
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date desc

    sortedOrders.forEach((order, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
            drawTableHeader(doc, y, headers, colX);
            y += 10;
        }

        const date = order.date.split(' ').slice(0, 2).join(' '); // "12 Feb"
        const amount = parseInt(order.amount.replace(/[^0-9]/g, '')) || 0;
        const nama = order.receiverName.split(' ')[0].substring(0, 10); // First name only

        doc.text(`${index + 1}`, colX[0], y);
        doc.text(date, colX[1], y);
        doc.text(order.orderNo, colX[2], y);
        doc.text(nama, colX[3], y); // Using receiver first name as Nama/Identity

        doc.text(order.service || '-', colX[4], y);

        // Status color coding (simple text adjustment here, PDF doesn't support complex CSS)
        doc.text(order.status, colX[5], y);

        doc.text(`Rp ${amount.toLocaleString('id-ID')}`, colX[6], y);

        // Light gray line separator
        doc.setDrawColor(229, 231, 235);
        doc.line(14, y + 3, 196, y + 3);

        y += 8;
    });

    // Footer page numbering
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Halaman ${i} dari ${pageCount}`, 196, 290, { align: 'right' });
    }

    doc.save(`Laporan-SwiftGo-${new Date().toISOString().slice(0, 10)}.pdf`);
};

function drawTableHeader(doc, y, headers, colX) {
    doc.setFillColor(243, 244, 246); // header bg
    doc.rect(14, y - 6, 182, 8, 'F');
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);

    headers.forEach((h, i) => {
        doc.text(h, colX[i], y);
    });

    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
}
