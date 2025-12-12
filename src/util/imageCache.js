// utils/imageCache.js
import localforage from 'localforage';

export async function cacheImage(id, imageUrl) {
  try {
    const cached = await localforage.getItem(`image-${id}`);
    if (cached) return; // já está no cache

    // 1. Baixar a imagem original
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // 2. Transformar Blob em Image
    const bitmap = await createImageBitmap(blob);

    // ⬇️ DEFINA AQUI a largura máxima desejada
    const MAX_WIDTH = 400;

    let newWidth = bitmap.width;
    let newHeight = bitmap.height;

    if (bitmap.width > MAX_WIDTH) {
      newWidth = MAX_WIDTH;
      newHeight = Math.round((bitmap.height * MAX_WIDTH) / bitmap.width);
    }

    // 3. Criar canvas reduzido
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);

    // 4. Converter para WebP (muito mais leve)
    const optimizedBlob = await new Promise((resolve) =>
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/webp', // formato final
        0.75 // qualidade 75%
      )
    );

    // 5. Salvar no cache
    await localforage.setItem(`image-${id}`, optimizedBlob);
  } catch (err) {
    console.error('Erro ao cachear imagem:', err);
  }
}

export async function getCachedImage(id, imageUrl) {
  const cached = await localforage.getItem(`image-${id}`);

  if (cached) {
    return URL.createObjectURL(cached);
  }

  // primeira vez → usa a URL remota mesmo
  return imageUrl;
}
