/** How a photo is prepared in the browser before it is uploaded. */
export interface ResizeRules {
  /** Wider photos are scaled down to this width, keeping their proportions. */
  maxWidth: number;
  /** A photo smaller than this is refused rather than blown up. */
  minWidth: number;
  minHeight: number;
  /** JPEG for photos; PNG keeps a logo's transparency. */
  type: "image/jpeg" | "image/png";
  quality?: number;
}

/**
 * The photo scaled to at most `rules.maxWidth` and encoded as `rules.type`:
 * light enough for a slow network, sharp enough for a retina phone. Null when
 * the file is not a readable image or is too small for its place.
 */
export async function resizeImage(file: File, rules: ResizeRules): Promise<Blob | null> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return null;
  if (bitmap.width < rules.minWidth || bitmap.height < rules.minHeight) {
    bitmap.close();
    return null;
  }
  const scale = Math.min(1, rules.maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve) => canvas.toBlob(resolve, rules.type, rules.quality));
}
