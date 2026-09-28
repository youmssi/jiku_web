import QRCode from "qrcode";

/**
 * A QR code as one SVG path in module units, with a two-module quiet zone.
 * Pure and synchronous, so it draws in a server component and in the card
 * image renderer alike.
 */
export function qrPath(text: string): { size: number; path: string } {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const count = qr.modules.size;
  const quiet = 2;
  let path = "";
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.modules.get(row, col)) path += `M${col + quiet} ${row + quiet}h1v1h-1z`;
    }
  }
  return { size: count + quiet * 2, path };
}
