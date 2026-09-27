import type { VerificationLimits } from "./schema";

const IMAGE_TYPES = ["image/jpeg", "image/png"];
/** Longest side, in pixels, a photographed document is scaled down to before re-encoding. */
const START_EDGE = 2400;
const START_QUALITY = 0.85;
const ATTEMPTS = 6;

export type PreparedDocuments =
  | { ok: true; files: File[] }
  | { ok: false; reason: "tooManyFiles" | "fileType" | "fileTooLarge" };

/**
 * Makes the chosen files fit the backend's limits before they leave the
 * browser: a phone photo of an ID card easily weighs 5 MB, so an image over the
 * limit is scaled down and re-encoded as JPEG until it fits. A PDF cannot be
 * shrunk here, so an oversized one is refused with a message instead.
 */
export async function prepareDocuments(files: File[], limits: VerificationLimits): Promise<PreparedDocuments> {
  if (files.length > limits.maxFiles) return { ok: false, reason: "tooManyFiles" };
  const prepared: File[] = [];
  for (const file of files) {
    if (file.type === "application/pdf") {
      if (file.size > limits.maxFileBytes) return { ok: false, reason: "fileTooLarge" };
      prepared.push(file);
      continue;
    }
    if (!IMAGE_TYPES.includes(file.type)) return { ok: false, reason: "fileType" };
    if (file.size <= limits.maxFileBytes) {
      prepared.push(file);
      continue;
    }
    const compressed = await compressImage(file, limits.maxFileBytes);
    if (!compressed) return { ok: false, reason: "fileTooLarge" };
    prepared.push(compressed);
  }
  return { ok: true, files: prepared };
}

async function compressImage(file: File, maxBytes: number): Promise<File | null> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return null;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return null;
  let edge = Math.min(START_EDGE, Math.max(bitmap.width, bitmap.height));
  let quality = START_QUALITY;
  try {
    for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
      const scale = edge / Math.max(bitmap.width, bitmap.height);
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= maxBytes) {
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
      }
      edge = Math.round(edge * 0.8);
      quality = Math.max(0.5, quality - 0.1);
    }
    return null;
  } finally {
    bitmap.close();
  }
}
