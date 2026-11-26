/**
 * Pure client-side PDF-1.4 Statement Generator (zero heavy dependencies).
 * Produces a valid multi-page binary PDF Blob matching ledger balances & UTR metadata.
 */

export interface StatementRowInput {
  date: string;
  reference: string;
  utr?: string | null;
  type: string;
  category: string;
  counterparty: string;
  amount: number;
  fee?: number;
  gst?: number;
  status: string;
}

export interface AccountStatementInput {
  holderName: string;
  upiId: string;
  walletMasked: string;
  tier: string;
  kycStatus: string;
  closingBalance: number;
  openingBalance: number;
  totalCredits: number;
  totalDebits: number;
  generatedAtIso: string;
  rows: StatementRowInput[];
}

function escapePdfText(input: string): string {
  return input
    .replace(/[^\x20-\x7E]/g, (ch) => (ch === '₹' ? 'INR ' : '-'))
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function formatAsciiInr(value: number): string {
  const num = Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `INR ${num}`;
}

export function buildStatementLines(input: AccountStatementInput): string[] {
  const lines: string[] = [
    'CASH FINTECH WALLET - OFFICIAL STATEMENT (SIMULATION - NO REAL MONEY)',
    '========================================================================',
    `Account Holder : ${input.holderName}`,
    `UPI Handle     : ${input.upiId}`,
    `Wallet Account : ${input.walletMasked}  |  Tier: ${input.tier.toUpperCase()}  |  KYC: ${input.kycStatus.toUpperCase()}`,
    `Generated At   : ${new Date(input.generatedAtIso).toLocaleString('en-IN')}`,
    '------------------------------------------------------------------------',
    `Opening Balance : ${formatAsciiInr(input.openingBalance)}`,
    `Total Credits   : +${formatAsciiInr(input.totalCredits)}`,
    `Total Debits    : -${formatAsciiInr(input.totalDebits)}`,
    `Closing Balance : ${formatAsciiInr(input.closingBalance)} (Reconciled with Double-Entry Ledger)`,
    '------------------------------------------------------------------------',
    'DATE        | REF / UTR            | TYPE   | CAT          | COUNTERPARTY         | AMOUNT',
    '------------------------------------------------------------------------',
  ];

  for (const r of input.rows) {
    const dt = new Date(r.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
    const refPart = (r.utr || r.reference || '').slice(0, 20).padEnd(20);
    const typePart = r.type.toUpperCase().slice(0, 6).padEnd(6);
    const catPart = r.category.slice(0, 12).padEnd(12);
    const cpPart = r.counterparty.slice(0, 20).padEnd(20);
    const sign = r.type === 'credit' || r.type === 'transfer_in' ? '+' : '-';
    const amtStr = `${sign}${formatAsciiInr(r.amount)}`;
    const feeSuffix =
      (r.fee || 0) + (r.gst || 0) > 0
        ? ` (Fee+GST ${formatAsciiInr((r.fee || 0) + (r.gst || 0))})`
        : '';
    const statusSuffix = r.status === 'reversed' ? ' [REVERSED]' : '';
    lines.push(`${dt.padEnd(11)} | ${refPart} | ${typePart} | ${catPart} | ${cpPart} | ${amtStr}${feeSuffix}${statusSuffix}`);
  }

  lines.push('------------------------------------------------------------------------');
  lines.push('End of Statement. Simulated ledger for educational & testing verification.');
  return lines;
}

export function generatePdfBytesFromLines(lines: string[]): Uint8Array {
  const linesPerPage = 48;
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) pages.push(['Empty Statement']);

  const objects: string[] = [];
  // Object 1: Catalog, Object 2: Pages (placeholder filled later), Object 3: Courier Font
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push(''); // 2 0 obj placeholder
  objects.push('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n');

  const pageObjNums: number[] = [];
  for (let p = 0; p < pages.length; p++) {
    const contentObjNum = objects.length + 1;
    const pageObjNum = contentObjNum + 1;
    pageObjNums.push(pageObjNum);

    const streamLines = ['BT', '/F1 8.5 Tf', '36 756 Td', '14 TL'];
    pages[p].forEach((line, idx) => {
      const safe = escapePdfText(line);
      if (idx === 0) {
        streamLines.push(`(${safe}) Tj`);
      } else {
        streamLines.push(`T* (${safe}) Tj`);
      }
    });
    streamLines.push('ET');
    const stream = streamLines.join('\n');

    objects.push(
      `${contentObjNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`
    );
    objects.push(
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`
    );
  }

  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageObjNums.length} >>\nendobj\n`;

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const encoder = new TextEncoder();
  return encoder.encode(pdf);
}

export function downloadAccountStatementPdf(input: AccountStatementInput, filename: string): void {
  const bytes = generatePdfBytesFromLines(buildStatementLines(input));
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
