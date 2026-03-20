// utils/imageCache.js
import localforage from 'localforage';

// 🚀 Hot Cache: Blobs pré-carregados na memória RAM para acesso INSTANTÂNEO
const hotCache = new Map();

export function getHotCache(id, type) {
  return hotCache.get(`${type}-${id}`);
}

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

    // 1. Gera Thumbnail (Pequena e Leve) - Reduzido para 250px para Totem lento
    if (!hasThumb) {
      await generateAndSave(id, bitmap, 250, 0.4, 'thumb');
    }

    // 2. Gera Full (Alta Resolução)
    if (!hasFull) {
      await generateAndSave(id, bitmap, 1024, 0.7, 'full');
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
  console.log('🚀 Iniciando pré-carregamento total...');

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
  const key = `${type}-${id}`;
  
  // 1. Tenta Hot Cache (Memória) -> INSTANTÂNEO
  if (hotCache.has(key)) {
    return hotCache.get(key);
  }

  // 2. Tenta Cold Cache (IndexedDB) -> ASYNC
  const cached = await localforage.getItem(key);
  if (cached) {
    const url = URL.createObjectURL(cached);
    hotCache.set(key, url); // Sobe para o Hot Cache
    return url;
  }

  return imageUrl;
}

/**
 * GARANTE que as imagens estejam no Hot Cache (RAM) antes de retornar.
 * Isso permite que o React renderize tudo de uma vez sem flickering.
 */
export async function ensureImagesInCache(items, type = 'thumb') {
  const promises = items.map(async (item) => {
    if (!item.image) return;
    const key = `${type}-${item.id}`;
    
    if (hotCache.has(key)) return;

    let blob = await localforage.getItem(key);
    
    if (!blob) {
      // Se não está no IndexedDB, força o cacheamento agora
      await cacheImage(item.id, item.image);
      blob = await localforage.getItem(key);
    }

    if (blob) {
      const url = URL.createObjectURL(blob);
      hotCache.set(key, url);
    }
  });

  await Promise.all(promises);
}
