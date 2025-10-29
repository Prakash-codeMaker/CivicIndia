// Simple average hash implementation for duplicate detection
export const averageHash = async (blob: Blob) => {
  const img = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(8, 8);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to create canvas context');
  ctx.drawImage(img, 0, 0, 8, 8);
  const data = ctx.getImageData(0, 0, 8, 8).data;
  let total = 0;
  const lum: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum.push(l);
    total += l;
  }
  const avg = total / lum.length;
  let hash = '';
  for (const v of lum) {
    hash += (v > avg) ? '1' : '0';
  }
  return hash;
};

export const hammingDistance = (a: string, b: string) => {
  if (a.length !== b.length) return Infinity;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
};

export const readExif = async (file: File) => {
  try {
    // Dynamic import avoids build-time failure when dependency isn't installed.
    const mod = await import('exifr');
    const exif = await (mod && mod.parse ? mod.parse(file, { gps: true, tiff: true }) : {});
    return exif || {};
  } catch (e) {
    // If exifr isn't installed or parse fails, return empty object and warn.
    // This keeps the app running while encouraging installing the optional dependency.
    // eslint-disable-next-line no-console
    console.warn('exifr not available or failed to parse EXIF:', e);
    return {};
  }
};

// A naive Error Level Analysis (ELA): resave at lower quality and compare
export const computeELA = async (file: File) => {
  try {
    const imgBitmap = await createImageBitmap(file);
    const canvas = new OffscreenCanvas(imgBitmap.width, imgBitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(imgBitmap, 0, 0);
    // Export at lower quality
    const blobLow: Blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
    const imgLow = await createImageBitmap(blobLow);
    const canvas2 = new OffscreenCanvas(imgBitmap.width, imgBitmap.height);
    const ctx2 = canvas2.getContext('2d');
    if (!ctx2) return null;
    ctx2.drawImage(imgLow, 0, 0);
    const d1 = ctx.getImageData(0, 0, imgBitmap.width, imgBitmap.height).data;
    const d2 = ctx2.getImageData(0, 0, imgBitmap.width, imgBitmap.height).data;
    let totalDiff = 0;
    for (let i = 0; i < d1.length; i += 4) {
      const r = Math.abs(d1[i] - d2[i]);
      const g = Math.abs(d1[i+1] - d2[i+1]);
      const b = Math.abs(d1[i+2] - d2[i+2]);
      totalDiff += (r+g+b)/3;
    }
    const avgDiff = totalDiff / (d1.length/4);
    return { avgDiff };
  } catch (e) {
    console.warn('ELA failed', e);
    return null;
  }
};

export default {
  averageHash,
  hammingDistance,
  readExif,
  computeELA,
};
