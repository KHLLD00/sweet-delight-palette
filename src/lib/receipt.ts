// Branded order receipt generator.
// Renders an actual PNG ticket from the live order data using Canvas 2D —
// this is NOT a screenshot of the page. Height is fully dynamic so it can
// hold 1 item or 30 items without truncating anything.

export type ReceiptLine = { label: string; price: number };

export type ReceiptData = {
  orderNumber: number;
  dateTime: Date;
  name: string;
  phone: string;
  fulfilment: "Pickup" | "Delivery";
  address?: string | undefined;
  neededBy?: string | undefined;
  lines: ReceiptLine[];
  cakeRequest?: string | undefined;
  notes?: string | undefined;
  subtotal: number;
  total: number;
};

const PINK = "#EC1E8C";
const PINK_SOFT = "rgba(236,30,140,0.28)";
const INK = "#3B1F1A";
const INK_SOFT = "#7A5A50";
const CREAM = "#FFFFFF";

const W = 640; // logical width, before device-pixel scaling
const PAD = 40;
const CONTENT_W = W - PAD * 2;
const EXPORT_SCALE = 2; // crisper PNG for sharing/printing

const fmt = (n: number) => "₦" + n.toLocaleString();

function fmtDateTime(d: Date) {
  const date = d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

async function ensureFontsReady() {
  try {
    const anyDoc = document as Document & { fonts?: FontFaceSet };
    if (anyDoc.fonts) {
      await Promise.all([
        anyDoc.fonts.load("600 20px Fraunces"),
        anyDoc.fonts.load("500 14px Fraunces"),
        anyDoc.fonts.load("400 14px 'Work Sans'"),
        anyDoc.fonts.load("500 14px 'Work Sans'"),
        anyDoc.fonts.load("600 14px 'Work Sans'"),
      ]);
      await anyDoc.fonts.ready;
    }
  } catch {
    // Fall back silently to system fonts if font loading isn't supported.
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function scallopRow(ctx: CanvasRenderingContext2D, y: number, color: string, direction: 1 | -1) {
  const r = 9;
  ctx.fillStyle = color;
  for (let x = -r; x < W + r; x += r * 2) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2 * direction);
    ctx.fill();
  }
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function dashedDivider(ctx: CanvasRenderingContext2D, y: number) {
  ctx.save();
  ctx.strokeStyle = PINK_SOFT;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  ctx.restore();
}

/**
 * Generates the receipt as a PNG blob. Measures content first (in an
 * off-DOM context) so the canvas can be sized to fit any order length,
 * then draws once at the final height.
 */
export async function generateReceiptPng(data: ReceiptData, logoSrc: string): Promise<Blob> {
  await ensureFontsReady();
  const logo = await loadImage(logoSrc);

  // --- Measuring pass (uses a throwaway context; canvas size is irrelevant here) ---
  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d")!;

  const HEADER_H = 210;
  let y = HEADER_H + 34;

  mctx.font = "600 15px Fraunces, serif";
  y += 46; // order number + date row

  y += 18; // spacing before customer block
  mctx.font = "500 15px 'Work Sans', sans-serif";
  y += 26; // name
  y += 26; // phone
  y += 30; // fulfilment badge row
  if (data.fulfilment === "Delivery" && data.address) {
    mctx.font = "400 14px 'Work Sans', sans-serif";
    const addrLines = wrapText(mctx, data.address, CONTENT_W - 120);
    y += 22 + addrLines.length * 19;
  }
  if (data.neededBy) y += 24;

  y += 26; // divider + "Your Order" heading

  mctx.font = "500 14.5px 'Work Sans', sans-serif";
  data.lines.forEach((l) => {
    const lbl = wrapText(mctx, l.label, CONTENT_W - 110);
    y += 8 + lbl.length * 20;
  });
  if (!data.lines.length) y += 28;

  let cakeLines: string[] = [];
  if (data.cakeRequest) {
    mctx.font = "400 13.5px 'Work Sans', sans-serif";
    cakeLines = wrapText(mctx, data.cakeRequest, CONTENT_W - 20);
    y += 34 + cakeLines.length * 18;
  }

  let noteLines: string[] = [];
  if (data.notes) {
    mctx.font = "400 13.5px 'Work Sans', sans-serif";
    noteLines = wrapText(mctx, data.notes, CONTENT_W - 20);
    y += 30 + noteLines.length * 18;
  }

  y += 26; // divider before totals
  y += 30; // subtotal
  if (data.fulfilment === "Delivery") y += 26; // delivery fee note
  y += 46; // total row
  y += 96; // footer block

  const TOTAL_H = Math.ceil(y) + 24;

  // --- Draw pass ---
  const canvas = document.createElement("canvas");
  canvas.width = W * EXPORT_SCALE;
  canvas.height = TOTAL_H * EXPORT_SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);
  ctx.textBaseline = "alphabetic";

  // Card background
  ctx.fillStyle = CREAM;
  roundRectPath(ctx, 0, 0, W, TOTAL_H, 22);
  ctx.fill();

  // Header band
  ctx.save();
  roundRectPath(ctx, 0, 0, W, TOTAL_H, 22);
  ctx.clip();
  ctx.fillStyle = PINK;
  ctx.fillRect(0, 0, W, HEADER_H - 9);
  scallopRow(ctx, HEADER_H - 9, CREAM, 1);
  ctx.restore();

  // Logo (clipped to circle)
  const logoD = 84;
  const logoX = W / 2;
  const logoY = 44 + logoD / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoD / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.clip();
  ctx.drawImage(logo, logoX - logoD / 2, logoY - logoD / 2, logoD, logoD);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = CREAM;
  ctx.font = "600 21px Fraunces, serif";
  ctx.fillText("Ease Cakes & Pastries", W / 2, HEADER_H - 46);
  ctx.font = "400 13px 'Work Sans', sans-serif";
  ctx.globalAlpha = 0.92;
  ctx.fillText("Cakes & pastries, made with ease", W / 2, HEADER_H - 26);
  ctx.globalAlpha = 1;

  // Content
  ctx.textAlign = "left";
  let cy = HEADER_H + 34;

  ctx.fillStyle = PINK;
  ctx.font = "600 16px Fraunces, serif";
  ctx.fillText(`Order #${data.orderNumber}`, PAD, cy);
  ctx.textAlign = "right";
  ctx.fillStyle = INK_SOFT;
  ctx.font = "400 12.5px 'Work Sans', sans-serif";
  ctx.fillText(fmtDateTime(data.dateTime), W - PAD, cy);
  ctx.textAlign = "left";
  cy += 46;

  const label = (text: string, yy: number) => {
    ctx.fillStyle = INK_SOFT;
    ctx.font = "500 10.5px 'Work Sans', sans-serif";
    ctx.save();
    ctx.textAlign = "left";
    ctx.fillText(text.toUpperCase(), PAD, yy);
    ctx.restore();
  };

  cy += 4;
  label("Customer", cy);
  cy += 20;
  ctx.fillStyle = INK;
  ctx.font = "500 15px 'Work Sans', sans-serif";
  ctx.fillText(data.name, PAD, cy);
  cy += 26;
  ctx.font = "400 14px 'Work Sans', sans-serif";
  ctx.fillText(data.phone, PAD, cy);
  cy += 30;

  // Fulfilment pill
  const pillLabel = data.fulfilment === "Delivery" ? "DELIVERY" : "PICKUP";
  ctx.font = "600 11px 'Work Sans', sans-serif";
  const pillW = ctx.measureText(pillLabel).width + 26;
  ctx.fillStyle = PINK;
  roundRectPath(ctx, PAD, cy - 15, pillW, 24, 12);
  ctx.fill();
  ctx.fillStyle = CREAM;
  ctx.textAlign = "center";
  ctx.fillText(pillLabel, PAD + pillW / 2, cy + 1);
  ctx.textAlign = "left";

  if (data.neededBy) {
    ctx.fillStyle = INK_SOFT;
    ctx.font = "400 12.5px 'Work Sans', sans-serif";
    ctx.fillText(`Needed by ${data.neededBy}`, PAD + pillW + 14, cy + 1);
  }
  cy += 20;

  if (data.fulfilment === "Delivery" && data.address) {
    cy += 14;
    ctx.fillStyle = INK;
    ctx.font = "400 13.5px 'Work Sans', sans-serif";
    const addrLines = wrapText(ctx, data.address, CONTENT_W - 20);
    addrLines.forEach((line) => {
      ctx.fillText(line, PAD, cy);
      cy += 19;
    });
  }

  cy += 18;
  dashedDivider(ctx, cy);
  cy += 26;

  ctx.fillStyle = INK;
  ctx.font = "600 14px Fraunces, serif";
  ctx.fillText("Your Order", PAD, cy);
  cy += 22;

  if (data.lines.length) {
    ctx.font = "500 14.5px 'Work Sans', sans-serif";
    data.lines.forEach((l) => {
      const lblLines = wrapText(ctx, l.label, CONTENT_W - 110);
      ctx.fillStyle = INK;
      ctx.textAlign = "left";
      lblLines.forEach((ln, i) => {
        ctx.fillText(ln, PAD, cy + i * 20);
      });
      ctx.textAlign = "right";
      ctx.fillStyle = PINK;
      ctx.fillText(fmt(l.price), W - PAD, cy);
      ctx.textAlign = "left";
      cy += 8 + lblLines.length * 20;
    });
  } else {
    ctx.fillStyle = INK_SOFT;
    ctx.font = "italic 13.5px 'Work Sans', sans-serif";
    ctx.fillText("No pastries — custom cake order only.", PAD, cy);
    cy += 28;
  }

  if (data.cakeRequest) {
    cy += 18;
    ctx.fillStyle = INK;
    ctx.font = "500 13.5px 'Work Sans', sans-serif";
    ctx.fillText("Custom Cake Request", PAD, cy);
    cy += 20;
    ctx.fillStyle = INK_SOFT;
    ctx.font = "400 13.5px 'Work Sans', sans-serif";
    wrapText(ctx, data.cakeRequest, CONTENT_W - 20).forEach((line) => {
      ctx.fillText(line, PAD, cy);
      cy += 18;
    });
  }

  if (data.notes) {
    cy += 16;
    ctx.fillStyle = INK;
    ctx.font = "500 13px 'Work Sans', sans-serif";
    ctx.fillText("Notes", PAD, cy);
    cy += 18;
    ctx.fillStyle = INK_SOFT;
    ctx.font = "400 13px 'Work Sans', sans-serif";
    wrapText(ctx, data.notes, CONTENT_W - 20).forEach((line) => {
      ctx.fillText(line, PAD, cy);
      cy += 18;
    });
  }

  cy += 18;
  dashedDivider(ctx, cy);
  cy += 30;

  ctx.textAlign = "left";
  ctx.fillStyle = INK_SOFT;
  ctx.font = "400 13.5px 'Work Sans', sans-serif";
  ctx.fillText("Pastry Subtotal", PAD, cy);
  ctx.textAlign = "right";
  ctx.fillStyle = INK;
  ctx.font = "500 13.5px 'Work Sans', sans-serif";
  ctx.fillText(fmt(data.subtotal), W - PAD, cy);
  ctx.textAlign = "left";

  if (data.fulfilment === "Delivery") {
    cy += 26;
    ctx.fillStyle = INK_SOFT;
    ctx.font = "italic 12.5px 'Work Sans', sans-serif";
    ctx.fillText("Delivery Fee — confirmed on WhatsApp", PAD, cy);
  }

  cy += 20;
  ctx.strokeStyle = PINK_SOFT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, cy);
  ctx.lineTo(W - PAD, cy);
  ctx.stroke();
  cy += 34;

  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = "600 17px Fraunces, serif";
  ctx.fillText("Total", PAD, cy);
  ctx.textAlign = "right";
  ctx.fillStyle = PINK;
  ctx.font = "600 19px Fraunces, serif";
  ctx.fillText(fmt(data.total), W - PAD, cy);
  ctx.textAlign = "left";

  // Footer band
  const footerY = TOTAL_H - 96;
  scallopRow(ctx, footerY, PINK, -1);
  ctx.save();
  roundRectPath(ctx, 0, 0, W, TOTAL_H, 22);
  ctx.clip();
  ctx.fillStyle = PINK;
  ctx.fillRect(0, footerY, W, TOTAL_H - footerY);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = CREAM;
  ctx.font = "500 13px 'Work Sans', sans-serif";
  ctx.fillText("Lokoja, Kogi State · WhatsApp/Call 0902 834 1259", W / 2, footerY + 38);
  ctx.font = "400 11.5px 'Work Sans', sans-serif";
  ctx.globalAlpha = 0.9;
  ctx.fillText("Orders need 24–48 hrs notice · Payment confirms order", W / 2, footerY + 60);
  ctx.globalAlpha = 1;
  ctx.font = "italic 11px 'Caveat', cursive";
  ctx.fillText("Thank you for choosing Ease Cakes!", W / 2, footerY + 82);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not export receipt image"))), "image/png", 1);
  });
}

/** Persisted, incrementing order number (per-device). */
export function getNextOrderNumber(): number {
  const KEY = "ec-order-seq";
  try {
    const current = parseInt(localStorage.getItem(KEY) ?? "1000", 10);
    const next = Number.isFinite(current) && current >= 1000 ? current + 1 : 1000;
    localStorage.setItem(KEY, String(next));
    return next;
  } catch {
    // localStorage unavailable (e.g. private mode) — fall back to a
    // timestamp-derived number so it's still unique-ish for this order.
    return 1000 + (Date.now() % 9000);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
