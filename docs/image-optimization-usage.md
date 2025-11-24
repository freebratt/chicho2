# Príručka pre používanie optimalizácie obrázkov

## Prehľad

CHICHO portál obsahuje pokročilý systém automatickej optimalizácie obrázkov, ktorý zabezpečuje optimálne zobrazenie všetkých obrázkov s dôrazom na viditeľnosť textu pod obrázkami.

## 🎯 Hlavné výhody

- **Automatická optimalizácia**: Všetky obrázky sa automaticky optimalizujú na základe ich pomeru strán
- **Zaručená viditeľnosť textu**: Text pod obrázkami je vždy čitateľný
- **Responzívny dizajn**: Optimalizácia funguje na všetkých zariadeniach
- **Vizuálne indikátory**: Používatelia vidia, že obrázky sú optimalizované
- **Výkonnosť**: Inteligentné načítavanie a cache-ovanie

## 🔧 Komponenty a nástroje

### 1. OptimizedImage komponent

Hlavný komponent pre zobrazenie optimalizovaných obrázkov:

```tsx
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
  src="https://example.com/image.jpg"
  alt="Popis obrázka"
  showOptimizationIndicator={true}
  containerClassName="rounded-lg"
  onLoad={(dimensions) => {
    console.log('Image loaded:', dimensions);
  }}
/>
```

**Props:**
- `src`: URL obrázka
- `alt`: Alt text pre accessibility
- `className`: CSS triedy pre img element
- `containerClassName`: CSS triedy pre kontajner
- `showOptimizationIndicator`: Zobrazenie indikátora optimalizácie
- `onLoad`: Callback po načítaní obrázka

### 2. AutoImageOptimizer komponent

Automaticky optimalizuje všetky obrázky v aplikácii:

```tsx
import AutoImageOptimizer from '@/components/AutoImageOptimizer';

<AutoImageOptimizer 
  enableGlobalOptimization={true}
  showReport={false}
/>
```

**Props:**
- `enableGlobalOptimization`: Povolenie globálnej optimalizácie
- `showReport`: Zobrazenie reportu optimalizácie

### 3. Hooks pre optimalizáciu

#### useImageOptimization

```tsx
import { useImageOptimization } from '@/hooks/use-image-optimization';

const { isLoaded, optimization, dimensions, optimizeImage } = useImageOptimization();

// Optimalizácia konkrétneho obrázka
await optimizeImage('https://example.com/image.jpg');
```

#### useBatchImageOptimization

```tsx
import { useBatchImageOptimization } from '@/hooks/use-image-optimization';

const { optimizeBatch, getResult, isOptimizing, progress } = useBatchImageOptimization();

// Optimalizácia viacerých obrázkov naraz
await optimizeBatch([
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg'
]);
```

## 📐 Typy optimalizácie

### 1. Panoráma (pomer strán > 2.5)
- **Príklad**: 1000x300px (pomer 3.33)
- **Optimalizácia**: Kratšia výška (100px)
- **Použitie**: Široké fotografie, bannery
- **Ikona**: 📐

### 2. Portrét (pomer strán < 0.7)
- **Príklad**: 300x500px (pomer 0.6)
- **Optimalizácia**: Vyššia výška (200px), fokus na vrch
- **Použitie**: Portréty, mobilné screenshoty
- **Ikona**: 📱

### 3. Štvorec (pomer strán 0.7-1.4)
- **Príklad**: 400x400px (pomer 1.0)
- **Optimalizácia**: Štandardná výška (160px)
- **Použitie**: Štandardné fotografie
- **Ikona**: ⬜

### 4. Široký (pomer strán 1.4-2.5)
- **Príklad**: 600x300px (pomer 2.0)
- **Optimalizácia**: Mierne kratšia výška (140px)
- **Použitie**: Široké fotografie
- **Ikona**: 🖼️

## 🛠️ Utility funkcie

### loadImageDimensions

```tsx
import { loadImageDimensions } from '@/lib/image-optimization';

const dimensions = await loadImageDimensions('https://example.com/image.jpg');
console.log(dimensions); // { width: 800, height: 600, aspectRatio: 1.33 }
```

### getOptimalDisplaySettings

```tsx
import { getOptimalDisplaySettings } from '@/lib/image-optimization';

const settings = getOptimalDisplaySettings(1.5); // aspect ratio
console.log(settings);
// {
//   height: '140px',
//   objectFit: 'cover',
//   objectPosition: 'center',
//   type: 'wide',
//   description: 'Široký obrázok - mierne kratšia výška'
// }
```

### optimizeAllNavodImages

```tsx
import { optimizeAllNavodImages } from '@/lib/image-auto-optimizer';
import { loadNavody } from '@/lib/storage';

const navody = loadNavody();
const report = await optimizeAllNavodImages(navody);
console.log(report);
// {
//   totalImages: 10,
//   optimizedImages: 9,
//   failedImages: 1,
//   optimizationResults: [...]
// }
```

## 📱 Implementácia v komponentoch

### V ImageGallery komponente

```tsx
// components/ImageGallery.tsx
{images.map((obrazok, index) => (
  <OptimizedImage
    key={obrazok.id}
    src={obrazok.url}
    alt={obrazok.popis}
    showOptimizationIndicator={true}
    onClick={() => handleImageClick(index)}
  />
))}
```

### V admin rozhraní

```tsx
// app/admin/page.tsx
{uploadedImages.map((image) => (
  <div key={image.id} className="border border-gray-200 rounded-lg p-3">
    <OptimizedImage
      src={image.url}
      alt={image.popis}
      showOptimizationIndicator={true}
      containerClassName="rounded overflow-hidden"
      onLoad={(dimensions) => {
        console.log('Admin image optimized:', {
          id: image.id,
          dimensions,
          description: image.popis
        });
      }}
    />
  </div>
))}
```

## 🎨 Vizuálne indikátory

### Indikátor optimalizácie
- Zobrazuje sa v pravom hornom rohu obrázka
- Obsahuje ikonu a typ optimalizácie (napr. "📐 Panoráma")
- Povolenie cez `showOptimizationIndicator={true}`

### Indikátor viditeľnosti textu
- Zobrazuje sa v ľavom dolnom rohu
- Obsahuje "✅ Text optimalizovaný"
- Garantuje, že text pod obrázkom je viditeľný

## 🔍 Debugging a monitoring

### Console logy

Systém automaticky loguje všetky optimalizácie:

```
🔄 Optimizing image: https://example.com/image.jpg...
✅ Image optimized: { dimensions: {...}, type: 'wide' }
📊 Batch optimization complete: { total: 5, optimized: 4, failed: 1 }
```

### Chybové stavy

```tsx
const { error, isOptimizing } = useImageOptimization();

if (error) {
  console.error('Optimization failed:', error);
}
```

## 🚀 Best practices

### 1. Používajte OptimizedImage všade
```tsx
// ✅ Správne
<OptimizedImage src={imageUrl} alt="Description" />

// ❌ Nesprávne
<img src={imageUrl} alt="Description" />
```

### 2. Povoľte indikátory v development móde
```tsx
<OptimizedImage 
  src={imageUrl} 
  alt="Description"
  showOptimizationIndicator={process.env.NODE_ENV === 'development'}
/>
```

### 3. Používajte onLoad callback pre monitoring
```tsx
<OptimizedImage 
  src={imageUrl} 
  alt="Description"
  onLoad={(dimensions) => {
    // Track optimization metrics
    analytics.track('image_optimized', {
      aspectRatio: dimensions.aspectRatio,
      width: dimensions.width,
      height: dimensions.height
    });
  }}
/>
```

### 4. Batch optimalizácia pre veľké množstvá obrázkov
```tsx
// Pre admin rozhranie s veľkým množstvom obrázkov
const { optimizeBatch, progress } = useBatchImageOptimization();

useEffect(() => {
  const imageUrls = images.map(img => img.url);
  optimizeBatch(imageUrls);
}, [images]);
```

## 🔧 Konfigurácia

### Prispôsobenie optimalizačných pravidiel

```tsx
// lib/image-optimization.ts
export const getOptimalDisplaySettings = (aspectRatio: number): OptimizationResult => {
  // Prispôsobte pravidlá podľa potrieb
  if (aspectRatio > 3.0) { // Ešte širšie panorámy
    return {
      height: '80px', // Ešte kratšia výška
      objectFit: 'cover',
      objectPosition: 'center',
      type: 'ultra-wide',
      description: 'Ultra široký obrázok'
    };
  }
  // ... ostatné pravidlá
};
```

### Globálne nastavenia

```tsx
// app/layout.tsx
<AutoImageOptimizer 
  enableGlobalOptimization={true}
  showReport={process.env.NODE_ENV === 'development'}
/>
```

## 📊 Metriky a reporting

### Získanie reportu optimalizácie

```tsx
const report = await optimizeAllNavodImages(navody);

console.log(`Úspešnosť: ${Math.round((report.optimizedImages / report.totalImages) * 100)}%`);
console.log(`Optimalizované: ${report.optimizedImages}/${report.totalImages}`);
console.log(`Neúspešné: ${report.failedImages}`);
```

### Monitoring výkonu

```tsx
const startTime = performance.now();
await optimizeImage(imageUrl);
const endTime = performance.now();
console.log(`Optimalizácia trvala: ${endTime - startTime}ms`);
```

## 🐛 Riešenie problémov

### Obrázok sa nenačíta
- Skontrolujte URL obrázka
- Overte CORS nastavenia
- Skontrolujte network tab v dev tools

### Optimalizácia zlyhá
- Skontrolujte formát obrázka (podporované: JPG, PNG, WebP)
- Overte, že obrázok nie je poškodený
- Skontrolujte console pre chybové hlášky

### Pomalé načítavanie
- Použite batch optimalizáciu pre viacero obrázkov
- Implementujte lazy loading
- Zvážte použitie WebP formátu

## 📚 Ďalšie zdroje

- [Image Optimization Guide](./image-optimization-guide.md)
- [OptimizedImage Example](../examples/optimized-navod-card-example.tsx)
- [API Documentation](./api-documentation.md)