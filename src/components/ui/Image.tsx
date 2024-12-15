import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import { getValidImageUrl } from '../../utils/images';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  showLoadingIndicator?: boolean;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  fallback = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
  className = '',
  showLoadingIndicator = true,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(getValidImageUrl(src, fallback));
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const validSrc = getValidImageUrl(src, fallback);
    setCurrentSrc(validSrc);
    setIsLoading(true);
    setHasError(false);

    const img = new window.Image();
    img.src = validSrc;

    img.onload = () => {
      setIsLoading(false);
    };

    img.onerror = () => {
      if (validSrc !== fallback) {
        setCurrentSrc(fallback);
        const fallbackImg = new window.Image();
        fallbackImg.src = fallback;
        
        fallbackImg.onload = () => {
          setIsLoading(false);
        };
        
        fallbackImg.onerror = () => {
          setHasError(true);
          setIsLoading(false);
        };
      } else {
        setHasError(true);
        setIsLoading(false);
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback]);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="flex flex-col items-center p-4">
          <ImageOff className="h-8 w-8 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">Imagen no disponible</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        {...props}
      />

      {isLoading && showLoadingIndicator && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};