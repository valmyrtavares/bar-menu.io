// src/hooks/useCachedImage.js
import { useEffect, useState } from 'react';
import { getCachedImage, cacheImage } from '../util/imageCache';

export function useCachedImage(id, imageUrl) {
  const [src, setSrc] = useState(imageUrl); // fallback inicial

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // já tenta cachear em paralelo
      cacheImage(id, imageUrl);

      // pega a versão local se existir
      const finalUrl = await getCachedImage(id, imageUrl);

      if (mounted) setSrc(finalUrl);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id, imageUrl]);

  return src;
}
