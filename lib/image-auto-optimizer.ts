/**
 * Automatic Image Optimizer
 * 
 * Utility na automatickú optimalizáciu všetkých obrázkov v aplikácii.
 * Zabezpečuje, že všetky obrázky sú optimalizované pre najlepšie zobrazenie textu.
 */

import { loadImageDimensions, getOptimalDisplaySettings, OptimizationResult } from './image-optimization';

export interface ImageOptimizationReport {
  totalImages: number;
  optimizedImages: number;
  failedImages: number;
  optimizationResults: Array<{
    src: string;
    success: boolean;
    optimization?: OptimizationResult;
    error?: string;
  }>;
}

/**
 * Automaticky optimalizuje všetky obrázky v danom zozname
 */
export const optimizeImageBatch = async (imageSources: string[]): Promise<ImageOptimizationReport> => {
  console.log('🔄 Starting batch image optimization for', imageSources.length, 'images');
  
  const report: ImageOptimizationReport = {
    totalImages: imageSources.length,
    optimizedImages: 0,
    failedImages: 0,
    optimizationResults: []
  };

  for (const src of imageSources) {
    try {
      console.log('📐 Optimizing image:', src.substring(0, 50) + '...');
      
      const dimensions = await loadImageDimensions(src);
      const optimization = getOptimalDisplaySettings(dimensions.aspectRatio);
      
      report.optimizedImages++;
      report.optimizationResults.push({
        src,
        success: true,
        optimization
      });
      
      console.log('✅ Image optimized:', {
        src: src.substring(0, 50) + '...',
        type: optimization.type,
        height: optimization.height
      });
      
    } catch (error) {
      console.error('❌ Failed to optimize image:', src, error);
      
      report.failedImages++;
      report.optimizationResults.push({
        src,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  console.log('📊 Batch optimization complete:', {
    total: report.totalImages,
    optimized: report.optimizedImages,
    failed: report.failedImages,
    successRate: `${Math.round((report.optimizedImages / report.totalImages) * 100)}%`
  });

  return report;
};

/**
 * Extrahuje všetky obrázky z návodov a optimalizuje ich
 */
export const optimizeAllNavodImages = async (navody: any[]): Promise<ImageOptimizationReport> => {
  console.log('🔍 Extracting images from', navody.length, 'navody');
  
  const allImageSources: string[] = [];
  
  navody.forEach(navod => {
    if (navod.obrazky && Array.isArray(navod.obrazky)) {
      navod.obrazky.forEach((obrazok: any) => {
        if (obrazok.url) {
          allImageSources.push(obrazok.url);
        }
      });
    }
  });

  console.log('📷 Found', allImageSources.length, 'images to optimize');
  
  if (allImageSources.length === 0) {
    console.log('ℹ️ No images found to optimize');
    return {
      totalImages: 0,
      optimizedImages: 0,
      failedImages: 0,
      optimizationResults: []
    };
  }

  return await optimizeImageBatch(allImageSources);
};

/**
 * Vytvorí CSS pravidlá pre optimalizované obrázky
 */
export const generateOptimizedImageCSS = (optimizationResults: ImageOptimizationReport['optimizationResults']): string => {
  let css = '/* Auto-generated optimized image styles */\n';
  
  optimizationResults.forEach((result, index) => {
    if (result.success && result.optimization) {
      const className = `optimized-image-${index}`;
      css += `
.${className} {
  height: ${result.optimization.height};
  object-fit: ${result.optimization.objectFit};
  object-position: ${result.optimization.objectPosition};
  transition: all 0.2s ease-in-out;
}

.${className}:hover {
  transform: scale(1.02);
}
`;
    }
  });

  return css;
};

/**
 * Aplikuje optimalizáciu na všetky img elementy na stránke
 */
export const applyOptimizationToExistingImages = async (): Promise<void> => {
  console.log('🔧 Applying optimization to existing images on page');
  
  const images = document.querySelectorAll('img[src]');
  console.log('🖼️ Found', images.length, 'images on page');
  
  for (const img of Array.from(images)) {
    const imgElement = img as HTMLImageElement;
    const src = imgElement.src;
    
    // Skip QR codes, logos, and other special images
    if (src.includes('data:image') || 
        imgElement.alt?.includes('QR') ||
        imgElement.alt?.includes('Logo') ||
        imgElement.alt?.includes('CHICHO') ||
        src.includes('logo.png') ||
        imgElement.closest('[data-macaly*="logo"]') ||
        imgElement.parentElement?.querySelector('.chicho-text')) {
      console.log('⏭️ Skipping logo/special image:', src.substring(0, 50) + '...');
      continue;
    }
    
    try {
      const dimensions = await loadImageDimensions(src);
      const optimization = getOptimalDisplaySettings(dimensions.aspectRatio);
      
      // Apply optimization styles
      imgElement.style.height = optimization.height;
      imgElement.style.objectFit = optimization.objectFit;
      imgElement.style.objectPosition = optimization.objectPosition;
      imgElement.style.transition = 'all 0.2s ease-in-out';
      
      // Add optimization indicator
      if (!imgElement.parentElement?.querySelector('.optimization-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'optimization-indicator absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm';
        indicator.innerHTML = `<span class="text-xs text-gray-600 font-medium">🖼️ Optimalizované</span>`;
        
        if (imgElement.parentElement) {
          imgElement.parentElement.style.position = 'relative';
          imgElement.parentElement.appendChild(indicator);
        }
      }
      
      console.log('✅ Applied optimization to image:', src.substring(0, 50) + '...');
      
    } catch (error) {
      console.warn('⚠️ Could not optimize image:', src, error);
    }
  }
  
  console.log('🎉 Finished applying optimization to existing images');
};

/**
 * Inicializuje automatickú optimalizáciu pre celú aplikáciu
 */
export const initializeAutoOptimization = async (): Promise<void> => {
  console.log('🚀 Initializing automatic image optimization');
  
  // Apply to existing images
  await applyOptimizationToExistingImages();
  
  // Set up observer for new images
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const images = element.querySelectorAll ? element.querySelectorAll('img[src]') : [];
          
          images.forEach(async (img) => {
            const imgElement = img as HTMLImageElement;
            const src = imgElement.src;
            
            // Skip QR codes, logos, and other special images
            if (src && !src.includes('data:image') && 
                !imgElement.alt?.includes('QR') &&
                !imgElement.alt?.includes('Logo') &&
                !imgElement.alt?.includes('CHICHO') &&
                !src.includes('logo.png') &&
                !imgElement.closest('[data-macaly*="logo"]') &&
                !imgElement.parentElement?.querySelector('.chicho-text')) {
              try {
                const dimensions = await loadImageDimensions(src);
                const optimization = getOptimalDisplaySettings(dimensions.aspectRatio);
                
                imgElement.style.height = optimization.height;
                imgElement.style.objectFit = optimization.objectFit;
                imgElement.style.objectPosition = optimization.objectPosition;
                imgElement.style.transition = 'all 0.2s ease-in-out';
                
                console.log('✅ Auto-optimized new image:', src.substring(0, 50) + '...');
              } catch (error) {
                console.warn('⚠️ Could not auto-optimize new image:', src, error);
              }
            } else {
              console.log('⏭️ Skipping logo/special new image:', src?.substring(0, 50) + '...');
            }
          });
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('👀 Image optimization observer started');
};

