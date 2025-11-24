/**
 * Príklad použitia optimalizácie obrázkov v NavodCard komponente
 * 
 * Tento súbor ukazuje, ako by sa dala implementovať optimalizácia obrázkov
 * v NavodCard komponente, ak by zobrazovala náhľadové obrázky návodov.
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Eye, Download, QrCode } from 'lucide-react';
import { VyrobnyNavod } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import OptimizedImage from '@/components/OptimizedImage';
import { useImageOptimization } from '@/lib/image-optimization';
import { tagy } from '@/lib/data';

interface OptimizedNavodCardProps {
  navod: VyrobnyNavod;
  showThumbnail?: boolean; // Nová prop pre zobrazenie náhľadového obrázka
}

export default function OptimizedNavodCard({ navod, showThumbnail = false }: OptimizedNavodCardProps) {
  console.log('Rendering OptimizedNavodCard for:', navod.nazov);
  const router = useRouter();

  // Získaj prvý obrázok ako náhľad (ak existuje)
  const thumbnailImage = navod.obrazky && navod.obrazky.length > 0 ? navod.obrazky[0] : null;
  
  // Použij hook pre optimalizáciu náhľadového obrázka
  const { dimensions, optimization, isLoaded } = useImageOptimization(
    thumbnailImage?.url || ''
  );

  const getTagColor = (tagNazov: string) => {
    const tag = tagy.find(t => t.nazov === tagNazov);
    return tag ? tag.farba : '#3B82F6';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const exportToPDF = async () => {
    // PDF export logika (skrátená pre príklad)
    console.log('Exporting PDF for:', navod.nazov);
  };

  const handleTagClick = (tagNazov: string, tagTyp: 'typ-prace' | 'produkt') => {
    console.log('Tag clicked:', tagNazov, tagTyp);
    if (tagTyp === 'typ-prace') {
      router.push(`/navody?typ=${encodeURIComponent(tagNazov)}`);
    } else {
      router.push(`/navody?produkt=${encodeURIComponent(tagNazov)}`);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200" 
      data-macaly={`navod-card-${navod.id}`}
    >
      {/* Optimalizovaný náhľadový obrázok */}
      {showThumbnail && thumbnailImage && (
        <div className="relative">
          <OptimizedImage
            src={thumbnailImage.url}
            alt={thumbnailImage.popis}
            containerClassName="rounded-t-lg overflow-hidden"
            showOptimizationIndicator={false} // V produkčnom kóde by bolo false
          />
          
          {/* Overlay s informáciami o obrázku */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-2 left-2 text-white text-xs">
              <span className="bg-chicho-red px-2 py-1 rounded text-xs font-bold">
                Krok {thumbnailImage.cisloKroku}
              </span>
            </div>
            
            {/* Optimalizačné informácie (len pre demo) */}
            {optimization && (
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-xs text-gray-700">
                  {optimization.type === 'panorama' ? '📐 Panoráma' :
                   optimization.type === 'portrait' ? '📱 Portrét' :
                   optimization.type === 'square' ? '⬜ Štvorec' :
                   '🖼️ Široký'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-russo text-base text-chicho-dark mb-2 leading-tight" data-macaly={`navod-title-${navod.id}`}>
            {navod.nazov}
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {navod.typPrace.map((typ) => (
              <Badge 
                key={typ}
                variant="outline"
                className="cursor-pointer hover:scale-105 transition-transform font-inter text-xs px-2 py-0.5"
                style={{ borderColor: getTagColor(typ), color: getTagColor(typ) }}
                onClick={() => handleTagClick(typ, 'typ-prace')}
              >
                {typ}
              </Badge>
            ))}
            {navod.produkt.map((produkt) => (
              <Badge 
                key={produkt}
                variant="outline"
                className="cursor-pointer hover:scale-105 transition-transform font-inter text-xs px-2 py-0.5"
                style={{ borderColor: getTagColor(produkt), color: getTagColor(produkt) }}
                onClick={() => handleTagClick(produkt, 'produkt')}
              >
                {produkt}
              </Badge>
            ))}
          </div>
        </div>

        {/* Preview krokov */}
        <div className="mb-3">
          <p className="text-gray-600 text-xs font-inter line-clamp-2 leading-relaxed">
            {navod.postupPrace.length > 0 ? navod.postupPrace[0].popis : 'Bez popisu'}
          </p>
        </div>

        {/* Stats s informáciami o obrázkoch */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>{formatDate(navod.aktualizovane)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-chicho-red font-medium">
              {navod.postupPrace.length} krokov
            </div>
            {navod.obrazky && navod.obrazky.length > 0 && (
              <div className="text-xs text-blue-600 font-medium">
                📷 {navod.obrazky.length} foto{navod.obrazky.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Optimalizačné informácie (len pre demo účely) */}
        {showThumbnail && thumbnailImage && dimensions && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-800">
              <div className="font-semibold mb-1">🔍 Optimalizačné informácie:</div>
              <div>Rozmery: {dimensions.width}×{dimensions.height}px</div>
              <div>Pomer strán: {dimensions.aspectRatio.toFixed(2)}</div>
              {optimization && (
                <div>Typ: {optimization.description}</div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link 
            href={`/navody/${navod.slug}`}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-chicho-red text-white rounded-md hover:bg-red-700 transition-colors font-inter font-medium text-sm"
          >
            <Eye size={14} />
            <span>Zobraziť</span>
          </Link>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="p-1.5 h-7 w-7"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                exportToPDF();
              }}
              title="Exportovať PDF"
            >
              <Download size={12} />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="p-1.5 h-7 w-7"
                  onClick={(e) => {
                    console.log('QR button clicked for:', navod.nazov);
                    e.stopPropagation();
                  }}
                  title="Zobraziť QR kód"
                >
                  <QrCode size={12} />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-russo text-chicho-red">QR kód pre návod</DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center py-6">
                  <QRCodeGenerator 
                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}/navody/${navod.slug}`}
                    size={200}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Naskenujte QR kód pre rýchly prístup k návodu na mobilnom zariadení
                </p>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Príklad použitia v zozname návodov:
 * 
 * ```tsx
 * import OptimizedNavodCard from './OptimizedNavodCard';
 * 
 * function NavodyList({ navody }: { navody: VyrobnyNavod[] }) {
 *   return (
 *     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 *       {navody.map((navod) => (
 *         <OptimizedNavodCard 
 *           key={navod.id} 
 *           navod={navod} 
 *           showThumbnail={true} // Zobrazí optimalizovaný náhľadový obrázok
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * Výhody tejto implementácie:
 * 1. Automatická optimalizácia náhľadových obrázkov
 * 2. Vizuálne indikátory typu optimalizácie
 * 3. Responzívne zobrazenie
 * 4. Zachovaná funkčnosť pôvodného komponentu
 * 5. Voliteľné zobrazenie náhľadov
 */