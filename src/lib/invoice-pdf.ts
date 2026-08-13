import { PdfPage, buildPdf } from "./pdf.ts";

/**
 * Render an Australian GST **Tax Invoice** as a branded, one-page PDF.
 * Complies with the ATO's tax-invoice requirements: the words "Tax Invoice",
 * the seller's identity + ABN, invoice date + number, a description of items,
 * and the GST amount (shown separately). Falls back gracefully when optional
 * fields are missing.
 */

export type InvoiceItem = { description?: string; quantity?: number; amount?: number };
export type InvoiceData = {
  number?: string;
  items?: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  status?: string;
  dueDate?: string | null;
  paidDate?: string | null;
  createdAt?: string | null;
};
export type CustomerData = {
  name?: string;
  company?: string;
  email?: string;
  abn?: string;
  addressLine1?: string;
  addressLine2?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  country?: string;
};
export type SellerData = {
  companyLegalName?: string;
  abn?: string;
  addressLines?: string;
  gstRegistered?: boolean;
  email?: string;
};

const INDIGO: [number, number, number] = [0.369, 0.357, 1]; // #5E5BFF
const INK = "0.09";
const MUTED = "0.42";

const aud = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number(n) || 0);
const date = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export function renderInvoicePdf(invoice: InvoiceData, customer: CustomerData, seller: SellerData): Buffer {
  const p = new PdfPage();
  const L = 48; // left margin
  const R = p.width - 48; // right edge
  const gstReg = seller.gstRegistered !== false;

  // ---- Header band -------------------------------------------------------
  p.rect(0, 0, p.width, 6, INDIGO);
  p.text(L, 64, "SyberInfo", 22, "HB", INK);
  p.text(L, 82, seller.companyLegalName || "SyberInfo Pty Ltd", 9, "H", MUTED);
  const sellerLines = (seller.addressLines || "").split(/\r?\n/).filter(Boolean);
  let sy = 96;
  for (const ln of sellerLines.slice(0, 3)) {
    p.text(L, sy, ln, 9, "H", MUTED);
    sy += 12;
  }
  if (seller.abn) p.text(L, sy, `ABN ${seller.abn}`, 9, "H", MUTED);
  if (seller.email) p.text(L, sy + 12, seller.email, 9, "H", MUTED);

  // ---- Title + meta (right) ---------------------------------------------
  p.textRight(R, 60, gstReg ? "TAX INVOICE" : "INVOICE", 20, "HB", INK);
  p.textRight(R, 84, `Invoice  ${invoice.number || "—"}`, 10, "HB", INK);
  p.textRight(R, 100, `Issued   ${date(invoice.createdAt)}`, 9, "H", MUTED);
  p.textRight(R, 114, `Due      ${date(invoice.dueDate)}`, 9, "H", MUTED);
  const status = String(invoice.status || "unpaid").toUpperCase();
  p.textRight(R, 132, status, 11, "HB", status === "PAID" ? "0.2" : INK);

  // ---- Bill-to -----------------------------------------------------------
  let by = 168;
  p.text(L, by, "BILL TO", 8, "HB", MUTED);
  by += 16;
  const billName = customer.company || customer.name || customer.email || "Customer";
  p.text(L, by, billName, 11, "HB", INK);
  by += 14;
  if (customer.company && customer.name) {
    p.text(L, by, customer.name, 9, "H", MUTED);
    by += 12;
  }
  const addr = [
    customer.addressLine1,
    customer.addressLine2,
    [customer.suburb, customer.state, customer.postcode].filter(Boolean).join(" "),
    customer.country,
  ].filter(Boolean) as string[];
  for (const ln of addr) {
    p.text(L, by, ln, 9, "H", MUTED);
    by += 12;
  }
  if (customer.abn) {
    p.text(L, by, `ABN ${customer.abn}`, 9, "H", MUTED);
    by += 12;
  }
  if (customer.email) p.text(L, by, customer.email, 9, "H", MUTED);

  // ---- Line-item table ---------------------------------------------------
  let ty = 250;
  const cQty = R - 210;
  const cUnit = R - 120;
  p.rect(L, ty - 12, R - L, 22, [0.96, 0.96, 0.99]);
  p.text(L + 8, ty + 3, "Description", 9, "HB", INK);
  p.textRight(cQty + 24, ty + 3, "Qty", 9, "HB", INK);
  p.textRight(cUnit + 40, ty + 3, "Amount (ex GST)", 9, "HB", INK);
  p.textRight(R - 8, ty + 3, "Total", 9, "HB", INK);
  ty += 26;

  const items = invoice.items?.length ? invoice.items : [{ description: "Services", quantity: 1, amount: invoice.subtotal }];
  for (const it of items) {
    const qty = Number(it.quantity) || 1;
    const amount = Number(it.amount) || 0;
    const unit = qty ? amount / qty : amount;
    p.text(L + 8, ty, it.description || "—", 10, "H", INK);
    p.textRight(cQty + 24, ty, String(qty), 10, "H", INK);
    p.textRight(cUnit + 40, ty, aud(unit), 10, "H", INK);
    p.textRight(R - 8, ty, aud(amount), 10, "H", INK);
    ty += 18;
    p.line(L, ty - 4, R, ty - 4, 0.4, "0.88");
  }

  // ---- Totals ------------------------------------------------------------
  ty += 12;
  const tLabelR = R - 110;
  const subtotal = Number(invoice.subtotal) || 0;
  const tax = Number(invoice.tax) || 0;
  const total = Number(invoice.total) || subtotal + tax;
  p.textRight(tLabelR, ty, "Subtotal", 10, "H", MUTED);
  p.textRight(R - 8, ty, aud(subtotal), 10, "H", INK);
  ty += 16;
  if (gstReg) {
    p.textRight(tLabelR, ty, "GST (10%)", 10, "H", MUTED);
    p.textRight(R - 8, ty, aud(tax), 10, "H", INK);
    ty += 16;
  }
  p.line(tLabelR - 30, ty, R - 8, ty, 0.6, "0.6");
  ty += 14;
  p.textRight(tLabelR, ty, "Total (AUD)", 12, "HB", INK);
  p.textRight(R - 8, ty, aud(total), 12, "HB", INK);
  if (invoice.status === "paid") {
    ty += 20;
    p.textRight(R - 8, ty, `Paid ${date(invoice.paidDate)} — thank you`, 9, "H", "0.2");
  }

  // ---- Footer ------------------------------------------------------------
  const fy = p.height - 60;
  p.line(L, fy, R, fy, 0.5, "0.85");
  if (!gstReg) p.text(L, fy + 14, "Not registered for GST — no GST has been charged.", 8, "H", MUTED);
  p.text(L, fy + (gstReg ? 14 : 26), "Thank you for your business. Payment is due by the date shown above.", 8, "H", MUTED);
  p.textRight(R, fy + 14, "SyberInfo — Managed IT, Cloud & Cybersecurity", 8, "H", MUTED);

  return buildPdf([p]);
}
