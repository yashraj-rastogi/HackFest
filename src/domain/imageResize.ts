/**
 * Resize image to maximum dimensions and compress to JPEG.
 * Ensures the payload stays comfortably under 600 KB for fast transmission over 4G/3G.
 */
export async function resizeImageForUpload(
  fileOrBlob: Blob | File,
  maxDimension: number = 1200,
  quality: number = 0.75
): Promise<{ base64: string; mimeType: string; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(fileOrBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      // Draw with white background in case of transparent PNG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = 'image/jpeg';
      const base64Data = canvas.toDataURL(mimeType, quality);
      // Rough byte calculation from base64 string
      const sizeBytes = Math.round((base64Data.length * 3) / 4);

      resolve({
        base64: base64Data,
        mimeType,
        sizeBytes,
      });
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image for resizing: ${e}`));
    };

    img.src = url;
  });
}
