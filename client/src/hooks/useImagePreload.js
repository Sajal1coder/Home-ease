// hooks/useImagePreload.js
import { useEffect } from 'react';

export const useImagePreload = (imageSrc) => {
  useEffect(() => {
    if (!imageSrc) return;

    // Create a link element for preloading
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageSrc;
    link.fetchPriority = 'high';
    
    // Add to document head
    document.head.appendChild(link);
    
    // Cleanup function
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [imageSrc]);
};

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export default useImagePreload;
