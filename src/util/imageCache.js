// src/utils/imageCache.js
import localforage from 'localforage';

export async function cacheImage(id, imageUrl) {
  try {
    const cached = await localforage.getItem(`image-${id}`);
    if (cached) return; // já está no cache

    const response = await fetch(imageUrl);
    const blob = await response.blob();

    await localforage.setItem(`image-${id}`, blob);
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
