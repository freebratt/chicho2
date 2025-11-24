/**
 * Image Optimization Utilities
 * 
 * Súbor obsahuje utility funkcie pre automatickú optimalizáciu zobrazenia obrázkov
 * s cieľom zabezpečiť viditeľnosť textu pod obrázkami.
 */

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface OptimizationResult {
  height: string;
  objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition: string;
  type: 'panorama' | 'portrait' | 'square' | 'wide' | 'standard';
  description: string;
}

/**
 * Načíta rozmery obrázka z URL
 */
export const loadImageDimensions = (src: string): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const dimensions: ImageDimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      };
      resolve(dimensions);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });
};

/**
 * Určí optimálne nastavenia zobrazenia na základe pomeru strán obrázka
 */
export const getOptimalDisplaySettings = (aspectRatio: number): OptimizationResult => {
  // Panoráma - veľmi široké obrázky (>2.5) - zvýšená výška pre lepšiu viditeľnosť textu
  if (aspectRatio > 2.5) {
    return {
      height: '180px', // Zvýšené z 100px
      objectFit: 'cover',
      objectPosition: 'center',
      type: 'panorama',
      description: 'Panorámový obrázok - optimalizovaná výška pre zobrazenie textu'
    };
  }
  
  // Portrét - veľmi vysoké obrázky (<0.7) - mierne zvýšená výška
  if (aspectRatio < 0.7) {
    return {
      height: '280px', // Zvýšené z 200px
      objectFit: 'cover',
      objectPosition: 'top',
      type: 'portrait',
      description: 'Portrétový obrázok - vyššia výška s fokusovaním na vrch'
    };
  }
  
  // Štvorec - približne štvorcové obrázky (0.7-1.4) - zvýšená štandardná výška
  if (aspectRatio >= 0.7 && aspectRatio <= 1.4) {
    return {
      height: '220px', // Zvýšené z 160px
      objectFit: 'cover',
      objectPosition: 'center',
      type: 'square',
      description: 'Štvorcový obrázok - optimalizovaná výška pre text'
    };
  }
  
  // Široký - mierne široké obrázky (1.4-2.5) - zvýšená výška
  if (aspectRatio > 1.4 && aspectRatio <= 2.5) {
    return {
      height: '200px', // Zvýšené z 140px
      objectFit: 'cover',
      objectPosition: 'center',
      type: 'wide',
      description: 'Široký obrázok - optimalizovaná výška pre text'
    };
  }
  
  // Štandardný fallback - zvýšená výška
  return {
    height: '220px', // Zvýšené z 160px
    objectFit: 'cover',
    objectPosition: 'center',
    type: 'standard',
    description: 'Štandardný obrázok - optimalizovaná výška'
  };
};

/**
 * Vráti CSS triedy pre Tailwind na základe typu optimalizácie
 */
export const getTailwindClasses = (optimizationType: OptimizationResult['type']): string => {
  const baseClasses = 'w-full object-cover transition-all duration-200';
  
  switch (optimizationType) {
    case 'panorama':
      return `${baseClasses} h-24 sm:h-32`;
    case 'portrait':
      return `${baseClasses} h-48 sm:h-56`;
    case 'square':
      return `${baseClasses} h-40 sm:h-48`;
    case 'wide':
      return `${baseClasses} h-36 sm:h-44`;
    default:
      return `${baseClasses} h-40 sm:h-48`;
  }
};

/**
 * Vráti emoji ikonu pre typ obrázka
 */
export const getImageTypeIcon = (type: OptimizationResult['type']): string => {
  switch (type) {
    case 'panorama':
      return '📐';
    case 'portrait':
      return '📱';
    case 'square':
      return '⬜';
    case 'wide':
      return '🖼️';
    default:
      return '🖼️';
  }
};

/**
 * Vráti slovenský názov typu obrázka
 */
export const getImageTypeName = (type: OptimizationResult['type']): string => {
  switch (type) {
    case 'panorama':
      return 'Panoráma';
    case 'portrait':
      return 'Portrét';
    case 'square':
      return 'Štvorec';
    case 'wide':
      return 'Široký';
    default:
      return 'Štandardný';
  }
};

/**
 * Optimalizuje obrázok pre zobrazenie v admin rozhraní
 */
export const optimizeForAdmin = (aspectRatio: number) => {
  const settings = getOptimalDisplaySettings(aspectRatio);
  
  return {
    ...settings,
    // V admin rozhraní používame väčšie výšky pre lepšiu editáciu a viditeľnosť textu
    height: settings.type === 'panorama' ? '200px' : // Zvýšené z 120px
            settings.type === 'portrait' ? '300px' :  // Zvýšené z 220px
            settings.type === 'square' ? '240px' :    // Zvýšené z 180px
            settings.type === 'wide' ? '220px' :      // Zvýšené z 160px
            '240px' // Zvýšené z 180px
  };
};

/**
 * Optimalizuje obrázok pre zobrazenie v galérii
 */
export const optimizeForGallery = (aspectRatio: number) => {
  const settings = getOptimalDisplaySettings(aspectRatio);
  
  return {
    ...settings,
    // V galérii používame konzistentnejšie a väčšie výšky pre lepšiu viditeľnosť textu
    height: settings.type === 'panorama' ? '180px' : // Zvýšené z 96px
            settings.type === 'portrait' ? '280px' :  // Zvýšené z 192px
            '220px' // Zvýšené z 160px - štandardná výška pre square, wide a standard
  };
};

/**
 * Validuje, či je obrázok vhodný pre optimalizáciu
 */
export const validateImageForOptimization = (dimensions: ImageDimensions): {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
} => {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Kontrola minimálnych rozmerov
  if (dimensions.width < 200 || dimensions.height < 200) {
    warnings.push('Obrázok má veľmi malé rozmery (menej ako 200px)');
    recommendations.push('Použite obrázok s rozmermi aspoň 400x400px');
  }
  
  // Kontrola extrémnych pomerov strán
  if (dimensions.aspectRatio > 5) {
    warnings.push('Obrázok je extrémne široký');
    recommendations.push('Zvážte orezanie obrázka na rozumnejší pomer strán');
  }
  
  if (dimensions.aspectRatio < 0.2) {
    warnings.push('Obrázok je extrémne vysoký');
    recommendations.push('Zvážte orezanie obrázka na rozumnejší pomer strán');
  }
  
  // Kontrola optimálnych rozmerov
  if (dimensions.width > 2000 || dimensions.height > 2000) {
    recommendations.push('Obrázok je veľký - zvážte kompresiu pre rýchlejšie načítanie');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations
  };
};

/**
 * Generuje CSS štýly pre inline použitie
 */
export const generateInlineStyles = (aspectRatio: number): React.CSSProperties => {
  const settings = getOptimalDisplaySettings(aspectRatio);
  
  return {
    height: settings.height,
    objectFit: settings.objectFit,
    objectPosition: settings.objectPosition,
    backgroundColor: '#f9fafb',
    transition: 'all 0.2s ease-in-out'
  };
};

/**
 * Hook pre React komponenty na optimalizáciu obrázkov
 */
export const useImageOptimization = (src: string) => {
  const [dimensions, setDimensions] = React.useState<ImageDimensions | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    if (!src) return;
    
    loadImageDimensions(src)
      .then((dims) => {
        setDimensions(dims);
        setIsLoaded(true);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoaded(true);
      });
  }, [src]);
  
  const optimizationResult = dimensions ? getOptimalDisplaySettings(dimensions.aspectRatio) : null;
  
  return {
    dimensions,
    isLoaded,
    error,
    optimization: optimizationResult,
    styles: dimensions ? generateInlineStyles(dimensions.aspectRatio) : {},
    validation: dimensions ? validateImageForOptimization(dimensions) : null
  };
};

// Re-export React for the hook
import React from 'react';
