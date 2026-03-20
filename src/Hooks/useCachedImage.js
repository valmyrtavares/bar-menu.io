// src/hooks/useCachedImage.js
import { useEffect, useState } from 'react';
import { getCachedImage, cacheImage } from '../util/imageCache';

export function useCachedImage(id, imageUrl, type = 'thumb') {
  const [src, setSrc] = useState(imageUrl);

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
