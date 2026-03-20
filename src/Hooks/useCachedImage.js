// src/hooks/useCachedImage.js
import { useEffect, useState } from 'react';
import { getCachedImage, cacheImage, getHotCache } from '../util/imageCache';

export function useCachedImage(id, imageUrl, type = 'thumb') {
  // ⚡ Tenta inicializar IMEDIATAMENTE do Hot Cache (RAM) se já estiver lá
  const [src, setSrc] = useState(() => getHotCache(id, type) || imageUrl);

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
