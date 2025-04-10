import { Bank, Order } from '@/types';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import QRCode from 'qrcode';

const convertImageToBase64 = (url: string): Promise<string> =>
  fetch(url)
    .then(res => res.blob())
    .then(blob => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    }));

export const generateInvoicePDF = async (order: Order, banks: Bank[]) => {
  const doc = new jsPDF();
  let y = 20;

  // ====== HEADER ======
  doc.setFillColor('#f2f2f2');
  doc.rect(0, 0, 210, 30, 'F'); // Full width header
  doc.setFontSize(18);
  doc.setTextColor('#333');
  doc.text('USHOP - Invoice', 14, y);
  doc.setFontSize(12);
  doc.setTextColor('#555');
  doc.text(`Invoice No: ${order.invoice_no}`, 150, y);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, y + 6);
  y += 20;

  // ====== CUSTOMER INFO ======
  doc.setTextColor('#000');
  doc.text(`Customer: ${order.customers?.customer_name || 'N/A'}`, 14, y);
  doc.text(`Email: ${order.customers?.customer_email || 'N/A'}`, 14, y + 6);
  y += 16;

  // ====== ORDER TABLE ======
  autoTable(doc, {
    startY: y,
    head: [['Customer', 'Qty', 'Size', 'Amount']],
    body: [
      [order.customers?.customer_name || 'N/A', order.qty, order.size, `₦${order.due_amount}`],
    ],
  });

  y = doc.lastAutoTable.finalY + 10;

  // ====== BANK DETAILS ======
  doc.setFontSize(14);
  doc.setTextColor('#222');
  doc.text('Bank Account Info:', 14, y);
  y += 8;

  for (const bank of banks) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Bank logo
    if (bank.logo_url) {
      try {
        const logo = await convertImageToBase64(bank.logo_url);
        doc.addImage(logo, 'PNG', 14, y, 20, 20);
      } catch (err) {
        console.error("Error loading bank logo:", err);
      }
    }

    doc.setFontSize(12);
    doc.setTextColor('#000');
    doc.text(`${bank.bank_name}`, 36, y + 5);
    doc.text(`Account No: ${bank.account_number}`, 36, y + 11);
    doc.text(`Account Name: ${bank.account_name}`, 36, y + 17);

    // QR Code (if payment URL available)
    if (bank.payment_url) {
      try {
        const qr = await QRCode.toDataURL(bank.payment_url);
        doc.addImage(qr, 'PNG', 150, y, 40, 40);
      } catch (err) {
        console.error("Error generating QR code:", err);
      }
    }

    y += 42;
  }

  // ====== FOOTER ======
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(200);
  doc.line(10, pageHeight - 20, 200, pageHeight - 20);
  doc.setFontSize(10);
  doc.setTextColor('#888');
  doc.text('Thank you for shopping with USHOP!', 14, pageHeight - 10);

  // ====== SAVE ======
  doc.save(`Invoice_${order.invoice_no}.pdf`);
};
