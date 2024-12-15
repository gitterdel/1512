export const DEFAULT_PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=80'
];

export const validateImageUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

export const getValidImageUrl = (url: string | undefined, fallback: string): string => {
  if (!url || !validateImageUrl(url)) {
    return fallback;
  }
  return optimizeImageUrl(url);
};

export const optimizeImageUrl = (url: string, width = 800, quality = 80): string => {
  if (!validateImageUrl(url)) return url;
  
  try {
    const urlObj = new URL(url);
    
    // Optimización para Unsplash
    if (urlObj.hostname.includes('unsplash.com')) {
      return `${url}${url.includes('?') ? '&' : '?'}auto=format&fit=crop&w=${width}&q=${quality}`;
    }
    
    return url;
  } catch {
    return url;
  }
};