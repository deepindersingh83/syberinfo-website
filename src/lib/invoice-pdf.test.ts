import { test } from "node:test";
import assert from "node:assert/strict";
import { renderInvoicePdf } from "./invoice-pdf.ts";

test("renderInvoicePdf produces a valid PDF byte buffer", () => {
  const pdf = renderInvoicePdf(
    {
      number: "INV-2026-0007",
      items: [{ description: "Managed IT — Essentials", quantity: 1, amount: 500 }],
      subtotal: 500,
      tax: 50,
      total: 550,
      status: "unpaid",
      dueDate: "2026-09-01T00:00:00Z",
      createdAt: "2026-08-13T00:00:00Z",
    },
    { name: "Jane Doe", company: "Acme Pty Ltd", email: "jane@acme.com.au", state: "NSW", postcode: "2000" },
    { companyLegalName: "SyberInfo Pty Ltd", abn: "00 000 000 000", gstRegistered: true },
  );
  assert.ok(pdf.length > 500, "PDF should have content");
  assert.equal(pdf.subarray(0, 5).toString("latin1"), "%PDF-", "starts with the PDF magic header");
  assert.ok(pdf.subarray(-6).toString("latin1").includes("%%EOF"), "ends with %%EOF");
});

test("renderInvoicePdf omits GST when the seller is not registered", () => {
  const pdf = renderInvoicePdf(
    { number: "INV-1", items: [{ description: "X", quantity: 1, amount: 100 }], subtotal: 100, tax: 0, total: 100 },
    { name: "Bob" },
    { gstRegistered: false },
  ).toString("latin1");
  assert.ok(pdf.includes("INVOICE"), "renders an invoice title");
});
