// utils/imageCache.js
import localforage from 'localforage';

/**
 * Cria versões otimizadas (Thumb e Full) da imagem e salva no IndexedDB
 */
export async function cacheImage(id, imageUrl) {
  try {
    const thumbKey = `thumb-${id}`;
    const fullKey = `full-${id}`;

    const hasThumb = await localforage.getItem(thumbKey);
    const hasFull = await localforage.getItem(fullKey);

    if (hasThumb && hasFull) return;

    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    // 1. Gera Thumbnail (Pequena e Leve)
    if (!hasThumb) {
      await generateAndSave(id, bitmap, 300, 0.5, 'thumb');
    }

    // 2. Gera Full (Alta Resolução)
    if (!hasFull) {
      await generateAndSave(id, bitmap, 1024, 0.75, 'full');
    }

    bitmap.close();
  } catch (err) {
    console.error(`Erro ao cachear imagem ${id}:`, err);
  }
}

async function generateAndSave(id, bitmap, maxWidth, quality, type) {
  let newWidth = bitmap.width;
  let newHeight = bitmap.height;

  if (bitmap.width > maxWidth) {
    newWidth = maxWidth;
    newHeight = Math.round((bitmap.height * maxWidth) / bitmap.width);
  }

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);

  const optimizedBlob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/webp', quality)
  );

  await localforage.setItem(`${type}-${id}`, optimizedBlob);
}

/**
 * Pre-carrega todas as imagens das coleções no IndexedDB
 */
export async function precacheAllImages(db) {
  if (!db) return;
  console.log('🚀 Iniciando pré-carregamento dual-res...');

  try {
    const { getDocs, collection } = await import('firebase/firestore');
    const [catSnap, dishSnap] = await Promise.all([
      getDocs(collection(db, 'category')),
      getDocs(collection(db, 'dishes')),
    ]);

    const allItems = [
      ...catSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      ...dishSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    ];

    for (const item of allItems) {
      if (item.image) {
        await cacheImage(item.id, item.image);
      }
    }
    console.log('✅ Pré-carregamento concluído!');
  } catch (err) {
    console.error('Erro no pre-cache global:', err);
  }
}

/**
 * Retorna uma URL de objeto para a imagem cacheada (Thumb ou Full)
 */
export async function getCachedImage(id, imageUrl, type = 'thumb') {
  const cached = await localforage.getItem(`${type}-${id}`);
  if (cached) {
    return URL.createObjectURL(cached);
  }
  return imageUrl;
}

/**
 * Retorna verdadeiro apenas quando as imagens de uma lista de itens estão no cache local
 * Útil para garantir que uma lista seja exibida toda de uma vez.
 */
export async function ensureImagesInCache(items, type = 'thumb') {
  const promises = items.map(async (item) => {
    if (!item.image) return true;
    const cached = await localforage.getItem(`${type}-${item.id}`);
    if (cached) return true;
    
    // Se não está no cache, tenta baixar rapidinho
    await cacheImage(item.id, item.image);
    return true;
  });

  return Promise.all(promises);
}
