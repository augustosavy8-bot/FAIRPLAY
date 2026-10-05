const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function compressImage(file, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, 1);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      // Con transparencia (recortes PNG/WebP) se exporta en WebP, que mantiene el alfa y pesa mucho menos que PNG.
      // Si el navegador no sabe codificar WebP, toBlob devuelve PNG y se respeta ese tipo.
      let mimeType = 'image/jpeg';
      let q = quality;
      if (file.type === 'image/png' || file.type === 'image/webp') {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) { mimeType = 'image/webp'; q = 0.85; break; }
        }
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const ext = EXT[blob.type] || 'jpg';
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), { type: blob.type }));
        },
        mimeType,
        q
      );
    };

    img.src = url;
  });
}
