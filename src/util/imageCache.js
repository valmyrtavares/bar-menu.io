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

    // ⬇️ DEFINA AQUI a largura máxima desejada (Aumentado para Totem)
    const MAX_WIDTH = 1024;

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
    
    // Libera memória
    URL.revokeObjectURL(bitmap);
  } catch (err) {
    console.error(`Erro ao cachear imagem ${id}:`, err);
  }
}

/**
 * Pre-carrega todas as imagens das coleções de Pratos e Categorias no IndexedDB
 */
export async function precacheAllImages(db) {
  if (!db) return;
  console.log('🚀 Iniciando pré-carregamento de imagens...');
  
  try {
    const { getDocs, collection } = await import('firebase/firestore');
    
    // 1. Buscar Categorias
    const catSnap = await getDocs(collection(db, 'category'));
    const categories = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // 2. Buscar Pratos
    const dishSnap = await getDocs(collection(db, 'dishes'));
    const dishes = dishSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const allItems = [...categories, ...dishes];
    
    // Processar em pequenos lotes para não travar o navegador
    for (const item of allItems) {
      if (item.image) {
        // Verifica se já existe antes de tentar baixar
        const cached = await localforage.getItem(`image-${item.id}`);
        if (!cached) {
          console.log(`Pre-cache: ${item.title || item.name}`);
          await cacheImage(item.id, item.image);
        }
      }
    }
    
    console.log('✅ Pré-carregamento concluído!');
  } catch (err) {
    console.error('Erro no pre-cache global:', err);
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
