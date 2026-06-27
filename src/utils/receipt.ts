import jsPDF from 'jspdf';

export function generateReceipt(order: any) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('BAMBEH ELECTRONIC RECEIPT', 20, 20);
  doc.setFontSize(12);
  doc.text(`Order ID: ${order.id}`, 20, 30);
  doc.text(`Amount: ${order.amount} XAF`, 20, 40);
  doc.text(`Date: ${order.date}`, 20, 50);
  doc.save(`Bambeh_Receipt_${order.id}.pdf`);
}
