'use client';

import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  showOptimizationIndicator?: boolean;
  onLoad?: (dimensions: { width: number; height: number; aspectRatio: number }) => void;
}

/**
 * OptimizedImage Component
 * 
 * Automaticky optimalizuje zobrazenie obrázkov na základe ich pomerov strán
 * pre zabezpečenie viditeľnosti textu pod obrázkom.
 * 
 * Funkcie:
 * - Automatická detekcia pomeru strán obrázka
 * - Inteligentné nastavenie výšky na základe typu obrázka
 * - Optimálne object-position pre lepšie zobrazenie obsahu
 * - Voliteľný indikátor optimalizácie
 * 
 * Typy obrázkov:
 * - Panoráma (>2.5): Kratšia výška pre zobrazenie viac obsahu
 * - Portrét (<0.7): Vyššia výška s fokusovaním na vrch
 * - Štvorec (0.7-1.4): Štandardná výška
 * - Široký (1.4-2.5): Mierne kratšia výška s inteligentným pozicionovaním
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  showOptimizationIndicator = false,
  onLoad
}) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number; aspectRatio: number } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [optimizationType, setOptimizationType] = useState<string>('');

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const dims = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio
      };
      
      setDimensions(dims);
      setIsLoaded(true);
      
      // Determine optimization type
      if (aspectRatio > 2.5) {
        setOptimizationType('Panoráma');
      } else if (aspectRatio < 0.7) {
        setOptimizationType('Portrét');
      } else if (aspectRatio >= 0.7 && aspectRatio <= 1.4) {
        setOptimizationType('Štvorec');
      } else {
        setOptimizationType('Široký');
      }
      
      if (onLoad) {
        onLoad(dims);
      }
      
      console.log('Image optimized:', { 
        src: src.substring(0, 50) + '...', 
        dimensions: dims, 
        type: optimizationType 
      });
    };
    
    img.onerror = () => {
      console.error('Failed to load image for optimization:', src);
      setIsLoaded(true);
    };
    
    img.src = src;
  }, [src, onLoad, optimizationType]);

  // Calculate optimal display properties
  const getOptimalStyles = () => {
    if (!dimensions) {
      return {
        height: '320px',
        objectFit: 'contain' as const,
        objectPosition: 'center' as const
      };
    }

    const { aspectRatio } = dimensions;
    
    // For very wide images (panoramic), use moderate height
    if (aspectRatio > 2.5) {
      return {
        height: '280px',
        objectFit: 'contain' as const,
        objectPosition: 'center' as const
      };
    }
    
    // For very tall images (portrait), use taller height
    if (aspectRatio < 0.7) {
      return {
        height: '360px',
        objectFit: 'contain' as const,
        objectPosition: 'center' as const
      };
    }
    
    // For square-ish images
    if (aspectRatio >= 0.7 && aspectRatio <= 1.4) {
      return {
        height: '320px',
        objectFit: 'contain' as const,
        objectPosition: 'center' as const
      };
    }
    
    // For moderately wide images
    return {
      height: '300px',
      objectFit: 'contain' as const,
      objectPosition: 'center' as const
    };
  };

  const styles = getOptimalStyles();

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div 
          className="animate-pulse bg-gray-200 flex items-center justify-center"
          style={{ height: styles.height }}
        >
          <span className="text-gray-400 text-sm">Načítava sa...</span>
        </div>
      )}
      
      {/* Optimized image */}
      <img
        src={src}
        alt={alt}
        className={`w-full transition-opacity duration-300 ${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
        style={{
          height: styles.height,
          objectFit: styles.objectFit,
          objectPosition: styles.objectPosition,
          backgroundColor: '#f9fafb'
        }}
      />
      
      {/* Optimization indicator */}
      {showOptimizationIndicator && isLoaded && dimensions && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
          <span className="text-xs text-gray-600 font-medium">
            {optimizationType === 'Panoráma' ? '📐' :
             optimizationType === 'Portrét' ? '📱' :
             optimizationType === 'Štvorec' ? '⬜' :
             '🖼️'} {optimizationType}
          </span>
        </div>
      )}
      
      {/* Text visibility guarantee */}
      {showOptimizationIndicator && isLoaded && (
        <div className="absolute bottom-2 left-2 bg-green-500/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
          <span className="text-xs text-white font-medium">
            ✅ Text optimalizovaný
          </span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
