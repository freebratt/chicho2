



'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn, Download } from 'lucide-react';

interface ImageGalleryItem {
  id: string;
  url: string;
  popis: string;
  cisloKroku: number;
}

interface ImageGalleryProps {
  images: ImageGalleryItem[];
  navodNazov: string;
}

// Hook for automatic image optimization
const useImageOptimization = (imageUrl: string) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number; aspectRatio: number } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      setDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio
      });
      setIsLoaded(true);
      console.log('Image optimized:', { width: img.naturalWidth, height: img.naturalHeight, aspectRatio });
    };
    img.onerror = () => {
      console.error('Failed to load image for optimization:', imageUrl);
      setIsLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  return { dimensions, isLoaded };
};

// Component for optimized image display
const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  popis: string;
  cisloKroku: number;
  onClick: () => void;
}> = ({ src, alt, popis, cisloKroku, onClick }) => {
  const { dimensions, isLoaded } = useImageOptimization(src);
  const imageRef = useRef<HTMLImageElement>(null);

  // Calculate optimal display properties
  const getOptimalDisplayProps = () => {
    if (!dimensions) {
      return {
        height: 'h-64 sm:h-80 lg:h-96',
        objectFit: 'object-contain' as const,
        objectPosition: 'object-center' as const
      };
    }

    const { aspectRatio } = dimensions;
    
    // For very wide images (panoramic), use moderate height
    if (aspectRatio > 2.5) {
      return {
        height: 'h-52 sm:h-64 lg:h-72',
        objectFit: 'object-contain' as const,
        objectPosition: 'object-center' as const
      };
    }
    
    // For very tall images (portrait), use taller height
    if (aspectRatio < 0.7) {
      return {
        height: 'h-72 sm:h-80 lg:h-96',
        objectFit: 'object-contain' as const,
        objectPosition: 'object-center' as const
      };
    }
    
    // For square-ish images
    if (aspectRatio >= 0.7 && aspectRatio <= 1.4) {
      return {
        height: 'h-64 sm:h-80 lg:h-96',
        objectFit: 'object-contain' as const,
        objectPosition: 'object-center' as const
      };
    }
    
    // For moderately wide images
    return {
      height: 'h-60 sm:h-72 lg:h-80',
      objectFit: 'object-contain' as const,
      objectPosition: 'object-center' as const
    };
  };

  const displayProps = getOptimalDisplayProps();

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative">
        <div className={`w-full ${displayProps.height} bg-gray-100 flex items-center justify-center overflow-hidden`}>
          {!isLoaded && (
            <div className="animate-pulse bg-gray-200 w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-sm">Načítava sa...</span>
            </div>
          )}
          <img 
            ref={imageRef}
            src={src} 
            alt={alt}
            className={`w-full h-full ${displayProps.objectFit} ${displayProps.objectPosition} group-hover:scale-105 transition-transform duration-200 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
            style={{
              transition: 'opacity 0.3s ease-in-out, transform 0.2s ease-in-out'
            }}
          />
        </div>
        <div className="absolute top-1 left-1 bg-chicho-red text-white rounded-full w-6 h-6 flex items-center justify-center font-russo font-bold text-xs shadow-lg">
          {cisloKroku}
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <ZoomIn 
            size={24} 
            className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg" 
          />
        </div>
      </div>
      
      {/* Enhanced text display area with better visibility */}
      <div className="p-3 lg:p-4 bg-white">
        <div className="min-h-[3rem] flex items-start">
          <p className="text-sm font-inter text-gray-800 leading-tight font-medium">
            <span className="inline-block bg-chicho-red text-white px-2 py-1 rounded text-xs font-russo font-bold mr-2 mb-1">
              Krok {cisloKroku}
            </span>
            <span className="text-gray-900 block sm:inline">{popis}</span>
          </p>
        </div>
        
        {/* Visual indicator for image optimization */}
        {dimensions && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {dimensions.aspectRatio > 2.5 ? '📐 Panoráma' : 
                 dimensions.aspectRatio < 0.7 ? '📱 Portrét' : 
                 '🖼️ Optimalizované'}
              </span>
              <span className="text-chicho-red">Kliknite pre detail</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, navodNazov }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  console.log('ImageGallery loaded with', images.length, 'images - Auto-optimization enabled');

  // Sort images by step number (cisloKroku) in ascending order
  const sortedImages = [...images].sort((a, b) => a.cisloKroku - b.cisloKroku);
  console.log('Sorted images by step number:', sortedImages.map(img => ({ step: img.cisloKroku, desc: img.popis })));

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || selectedImageIndex === null) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedImageIndex]);

  const handleImageClick = (index: number) => {
    console.log('Opening image gallery at index:', index);
    setSelectedImageIndex(index);
    setIsOpen(true);
  };

  const handleClose = () => {
    console.log('Closing image gallery');
    setIsOpen(false);
    setSelectedImageIndex(null);
  };

  const handlePrevious = () => {
    if (selectedImageIndex === null) return;
    const newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : sortedImages.length - 1;
    console.log('Navigate to previous image:', newIndex);
    setSelectedImageIndex(newIndex);
  };

  const handleNext = () => {
    if (selectedImageIndex === null) return;
    const newIndex = selectedImageIndex < sortedImages.length - 1 ? selectedImageIndex + 1 : 0;
    console.log('Navigate to next image:', newIndex);
    setSelectedImageIndex(newIndex);
  };

  const handleDownload = () => {
    if (selectedImageIndex === null) return;
    const image = sortedImages[selectedImageIndex];
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `${navodNazov}-krok-${image.cisloKroku}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('Downloaded image:', image.popis);
  };

  const currentImage = selectedImageIndex !== null ? sortedImages[selectedImageIndex] : null;

  // Debug log current image data
  console.log('Current image:', currentImage);
  if (currentImage) {
    console.log('Current image description:', currentImage.popis);
    console.log('Current image step:', currentImage.cisloKroku);
  }

  return (
    <>
      {/* Optimized Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {sortedImages.map((obrazok, index) => (
          <OptimizedImage
            key={obrazok.id}
            src={obrazok.url}
            alt={obrazok.popis}
            popis={obrazok.popis}
            cisloKroku={obrazok.cisloKroku}
            onClick={() => handleImageClick(index)}
          />
        ))}
      </div>

      {/* Image Gallery Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 z-10 bg-white/95 backdrop-blur-sm border-b p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-russo text-chicho-red text-lg">
                {navodNazov} - Fotky ({selectedImageIndex !== null ? selectedImageIndex + 1 : 0} z {sortedImages.length})
              </DialogTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="h-8"
                >
                  <Download size={14} className="mr-1" />
                  Stiahnuť
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="h-8"
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {currentImage && (
            <>
              {/* Main Image Area - Takes remaining space */}
              <div className="relative flex-1 min-h-0 flex items-center justify-center p-4 bg-gray-50">
                {/* Navigation Buttons */}
                {sortedImages.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white h-12 w-12 rounded-full p-0"
                    >
                      <ChevronLeft size={20} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white h-12 w-12 rounded-full p-0"
                    >
                      <ChevronRight size={20} />
                    </Button>
                  </>
                )}

                {/* Image Container */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={currentImage.url}
                    alt={currentImage.popis}
                    className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-lg"
                  />
                  <div className="absolute top-2 left-2 bg-chicho-red text-white rounded-full w-8 h-8 flex items-center justify-center font-russo font-bold text-sm">
                    {currentImage.cisloKroku}
                  </div>
                </div>
              </div>

              {/* Enhanced Image Info Footer - Fixed at bottom */}
              <div className="flex-shrink-0 bg-white/98 backdrop-blur-sm border-t p-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <p className="font-inter text-base text-gray-900 font-medium leading-relaxed">
                        <span className="inline-block bg-chicho-red text-white px-2 py-1 rounded text-sm font-russo font-bold mr-2">
                          Krok {currentImage.cisloKroku}
                        </span>
                        {currentImage.popis}
                      </p>
                    </div>
                  </div>
                  
                  {/* Thumbnail Navigation */}
                  {sortedImages.length > 1 && (
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
                      {sortedImages.map((img, index) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                            index === selectedImageIndex
                              ? 'border-chicho-red ring-2 ring-chicho-red/20'
                              : 'border-gray-200 hover:border-chicho-red/50'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.popis}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Help Text */}
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800 text-center font-inter">
          <strong>💡 Automatická optimalizácia:</strong> Obrázky sú automaticky optimalizované pre najlepšie zobrazenie textu
        </p>
        <p className="text-xs text-blue-600 text-center mt-1 font-inter">
          <strong>Tip:</strong> Kliknite na fotografiu pre väčšie zobrazenie • Šípky na klávesnici pre navigáciu
        </p>
      </div>
    </>
  );
};

export default ImageGallery;





