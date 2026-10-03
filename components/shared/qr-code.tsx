import { qrPath } from "@/lib/qr-path";

/**
 * A QR code drawn as one SVG path (JIKU-217): crisp at any size, printable,
 * and rendered on the server or the client from the same [qrPath].
 */
export function QrCode({
  value,
  quiet = 2,
  label,
  className,
}: {
  value: string;
  quiet?: number;
  label?: string;
  className?: string;
}) {
  const qr = qrPath(value, quiet);
  return (
    <svg
      viewBox={`0 0 ${qr.size} ${qr.size}`}
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
    >
      <rect width={qr.size} height={qr.size} fill="#fff" />
      <path d={qr.path} fill="#000" />
    </svg>
  );
}
