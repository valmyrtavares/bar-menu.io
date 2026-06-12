// src/hooks/useCachedImage.js
import { useEffect, useState } from 'react';
import { getCachedImage, cacheImage, getHotCache } from '../util/imageCache';

export function useCachedImage(id, imageUrl, type = 'thumb') {
  const [prevId, setPrevId] = useState(id);
  // ⚡ Tenta inicializar IMEDIATAMENTE do Hot Cache (RAM) se já estiver lá.
  // Caso contrário, inicia vazio ('') para impedir que o navegador baixe do Firebase até o IndexedDB responder.
  const [src, setSrc] = useState(() => getHotCache(id, type) || '');

  // Se o id mudar, reseta o estado imediatamente na renderização para evitar mostrar a imagem do produto anterior
  if (id !== prevId) {
    setPrevId(id);
    setSrc(getHotCache(id, type) || '');
  }

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // pega a versão local se existir do tipo solicitado
      const finalUrl = await getCachedImage(id, imageUrl, type);
      if (mounted) setSrc(finalUrl);
    };

    if (id && imageUrl) {
      load();
    }

    return () => {
      mounted = false;
    };
  }, [id, imageUrl, type]);

  return src;
}
