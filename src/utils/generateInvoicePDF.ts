import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePDF = (order: any, customer: any) => {
  const doc = new jsPDF();

  doc.text('USHOP - Invoice', 14, 20);
  doc.setFontSize(12);
  doc.text(`Invoice No: ${order.invoice_no}`, 14, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
  doc.text(`Customer: ${customer.customer_name}`, 14, 42);
  doc.text(`Email: ${customer.customer_email}`, 14, 48);

  doc.autoTable({
    startY: 60,
    head: [['Product', 'Qty', 'Size', 'Amount']],
    body: [
      [order.product_title, order.qty, order.size, `₦${order.due_amount}`],
    ],
  });

  doc.text('Bank Account Info:', 14, doc.lastAutoTable.finalY + 10);
  doc.text('- GTBank: 0001234567 (USHOP LTD)', 14, doc.lastAutoTable.finalY + 16);
  doc.text('- Zenith: 2001234567 (USHOP LTD)', 14, doc.lastAutoTable.finalY + 22);

  doc.save(`Invoice_${order.invoice_no}.pdf`);
};
