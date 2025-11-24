'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadImageDimensions, getOptimalDisplaySettings, OptimizationResult } from '@/lib/image-optimization';

export interface UseImageOptimizationResult {
  isLoaded: boolean;
  isOptimizing: boolean;
  optimization: OptimizationResult | null;
  dimensions: { width: number; height: number; aspectRatio: number } | null;
  error: string | null;
  optimizeImage: (src: string) => Promise<void>;
}

/**
 * Hook pre optimalizáciu obrázkov
 * 
 * Poskytuje jednoduchý spôsob optimalizácie obrázkov v React komponentoch.
 * Automaticky detekuje rozmery obrázka a aplikuje optimálne nastavenia zobrazenia.
 */
export const useImageOptimization = (initialSrc?: string): UseImageOptimizationResult => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number; aspectRatio: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const optimizeImage = useCallback(async (src: string) => {
    if (!src) {
      setError('No image source provided');
      return;
    }

    console.log('🔄 Optimizing image:', src.substring(0, 50) + '...');
    setIsOptimizing(true);
    setError(null);
    setIsLoaded(false);

    try {
      // Load image dimensions
      const imageDimensions = await loadImageDimensions(src);
      setDimensions(imageDimensions);

      // Get optimal display settings
      const optimizationResult = getOptimalDisplaySettings(imageDimensions.aspectRatio);
      setOptimization(optimizationResult);

      setIsLoaded(true);
      
      console.log('✅ Image optimization complete:', {
        src: src.substring(0, 50) + '...',
        dimensions: imageDimensions,
        optimization: optimizationResult
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown optimization error';
      setError(errorMessage);
      console.error('❌ Image optimization failed:', src, err);
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  // Auto-optimize if initial src is provided
  useEffect(() => {
    if (initialSrc) {
      optimizeImage(initialSrc);
    }
  }, [initialSrc, optimizeImage]);

  return {
    isLoaded,
    isOptimizing,
    optimization,
    dimensions,
    error,
    optimizeImage
  };
};

/**
 * Hook pre batch optimalizáciu viacerých obrázkov
 */
export const useBatchImageOptimization = () => {
  const [results, setResults] = useState<Map<string, UseImageOptimizationResult>>(new Map());
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  const optimizeBatch = useCallback(async (imageSources: string[]) => {
    console.log('🔄 Starting batch optimization for', imageSources.length, 'images');
    setIsOptimizing(true);
    setProgress({ completed: 0, total: imageSources.length });
    
    const newResults = new Map<string, UseImageOptimizationResult>();

    for (let i = 0; i < imageSources.length; i++) {
      const src = imageSources[i];
      
      try {
        const dimensions = await loadImageDimensions(src);
        const optimization = getOptimalDisplaySettings(dimensions.aspectRatio);
        
        newResults.set(src, {
          isLoaded: true,
          isOptimizing: false,
          optimization,
          dimensions,
          error: null,
          optimizeImage: async () => {} // Not used in batch mode
        });

        console.log(`✅ Batch optimization ${i + 1}/${imageSources.length}:`, src.substring(0, 50) + '...');
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        newResults.set(src, {
          isLoaded: false,
          isOptimizing: false,
          optimization: null,
          dimensions: null,
          error: errorMessage,
          optimizeImage: async () => {}
        });

        console.error(`❌ Batch optimization failed ${i + 1}/${imageSources.length}:`, src, error);
      }
      
      setProgress({ completed: i + 1, total: imageSources.length });
    }

    setResults(newResults);
    setIsOptimizing(false);
    
    console.log('🎉 Batch optimization complete:', {
      total: imageSources.length,
      successful: Array.from(newResults.values()).filter(r => r.isLoaded).length,
      failed: Array.from(newResults.values()).filter(r => r.error).length
    });
    
  }, []);

  const getResult = useCallback((src: string): UseImageOptimizationResult | null => {
    return results.get(src) || null;
  }, [results]);

  const clearResults = useCallback(() => {
    setResults(new Map());
    setProgress({ completed: 0, total: 0 });
  }, []);

  return {
    optimizeBatch,
    getResult,
    clearResults,
    isOptimizing,
    progress,
    totalResults: results.size
  };
};

/**
 * Hook pre real-time optimalizáciu obrázkov na stránke
 */
export const usePageImageOptimization = () => {
  const [optimizedCount, setOptimizedCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const startOptimization = useCallback(() => {
    console.log('🚀 Starting page-wide image optimization');
    setIsActive(true);
    setOptimizedCount(0);

    const optimizeExistingImages = async () => {
      const images = document.querySelectorAll('img[src]:not([data-optimized])');
      console.log('🖼️ Found', images.length, 'images to optimize');

      let count = 0;
      
      for (const img of Array.from(images)) {
        const imgElement = img as HTMLImageElement;
        const src = imgElement.src;

        // Skip QR codes and data URLs
        if (src.includes('data:image') || imgElement.alt?.includes('QR')) {
          continue;
        }

        try {
          const dimensions = await loadImageDimensions(src);
          const optimization = getOptimalDisplaySettings(dimensions.aspectRatio);

          // Apply optimization
          imgElement.style.height = optimization.height;
          imgElement.style.objectFit = optimization.objectFit;
          imgElement.style.objectPosition = optimization.objectPosition;
          imgElement.style.transition = 'all 0.2s ease-in-out';
          imgElement.setAttribute('data-optimized', 'true');

          count++;
          setOptimizedCount(count);
          
          console.log('✅ Optimized page image:', src.substring(0, 50) + '...');
          
        } catch (error) {
          console.warn('⚠️ Could not optimize page image:', src, error);
        }
      }

      console.log('🎉 Page optimization complete:', count, 'images optimized');
    };

    optimizeExistingImages();
  }, []);

  const stopOptimization = useCallback(() => {
    setIsActive(false);
    console.log('⏹️ Page image optimization stopped');
  }, []);

  return {
    startOptimization,
    stopOptimization,
    optimizedCount,
    isActive
  };
};