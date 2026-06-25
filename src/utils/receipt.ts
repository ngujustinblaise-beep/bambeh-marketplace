import jsPDF from 'jspdf';

export interface ReceiptData {
  reference: string;
  amount: number;
  userEmail?: string;
  description?: string;
  date?: string;
}

export function generateReceipt(data: ReceiptData) {
  const doc = new jsPDF();

  const date = data.date ?? new Date().toLocaleString();

  doc.setFontSize(18);
  doc.text("Bambeh Marketplace", 20, 20);

  doc.setFontSize(12);
  doc.text("Official Payment Receipt", 20, 30);

  doc.text("Reference: " + data.reference, 20, 45);
  doc.text("Amount: " + data.amount.toLocaleString() + " XAF", 20, 55);
  doc.text("Date: " + date, 20, 65);

  if (data.userEmail) {
    doc.text("User: " + data.userEmail, 20, 75);
  }

  if (data.description) {
    doc.text("Description: " + data.description, 20, 85);
  }

  doc.save("Bambeh_Receipt_" + data.reference + ".pdf");
}


