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

      // Keep PNG format only if it actually has transparency
      let mimeType = 'image/jpeg';
      let ext = 'jpg';
      if (file.type === 'image/png') {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) { mimeType = 'image/png'; ext = 'png'; break; }
        }
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), { type: mimeType }));
        },
        mimeType,
        quality
      );
    };

    img.src = url;
  });
}
