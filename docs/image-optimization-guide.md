# Príručka pre optimalizáciu obrázkov

## Prehľad

CHICHO portál obsahuje pokročilý systém automatickej optimalizácie obrázkov, ktorý zabezpečuje, že text pod obrázkami je vždy viditeľný a dobre čitateľný. Systém automaticky detekuje pomer strán obrázka a prispôsobuje jeho zobrazenie.

## Problém, ktorý riešime

**Pred optimalizáciou:**
- Obrázky mali pevnú výšku (`h-32 object-cover`)
- Text pod obrázkami sa často nezobrazoval správne
- Dôležité časti obrázkov sa orezávali
- Nekonzistentné zobrazenie rôznych typov obrázkov

**Po optimalizácii:**
- Automatická detekcia pomeru strán
- Inteligentné nastavenie výšky na základe typu obrázka
- Zaručená viditeľnosť textu pod obrázkom
- Vizuálne indikátory pre používateľov

## Typy obrázkov a ich optimalizácia

### 1. Panoráma (pomer strán > 2.5)
- **Príklad:** 1000x300px (pomer 3.33)
- **Optimalizácia:** Kratšia výška (100px) pre zobrazenie viac obsahu
- **Použitie:** Široké fotografie, bannery, krajinky
- **Ikona:** 📐

### 2. Portrét (pomer strán < 0.7)
- **Príklad:** 300x500px (pomer 0.6)
- **Optimalizácia:** Vyššia výška (200px) s fokusovaním na vrch
- **Použitie:** Portréty, mobilné screenshoty, vysoké diagramy
- **Ikona:** 📱

### 3. Štvorec (pomer strán 0.7-1.4)
- **Príklad:** 400x400px (pomer 1.0)
- **Optimalizácia:** Štandardná výška (160px)
- **Použitie:** Loga, ikony, štvorcové fotografie
- **Ikona:** ⬜

### 4. Široký (pomer strán 1.4-2.5)
- **Príklad:** 800x400px (pomer 2.0)
- **Optimalizácia:** Mierne kratšia výška (140px)
- **Použitie:** Štandardné fotografie, diagramy
- **Ikona:** 🖼️

## Implementácia

### 1. Použitie OptimizedImage komponentu

```tsx
import OptimizedImage from '@/components/OptimizedImage';

// Základné použitie
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Popis obrázka"
/>

// S indikátormi optimalizácie
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Popis obrázka"
  showOptimizationIndicator={true}
  onLoad={(dimensions) => console.log('Loaded:', dimensions)}
/>
```

### 2. Použitie utility funkcií

```tsx
import { 
  loadImageDimensions, 
  getOptimalDisplaySettings,
  useImageOptimization 
} from '@/lib/image-optimization';

// V React komponente
const { dimensions, optimization, styles } = useImageOptimization(imageUrl);

// Manuálne načítanie rozmerov
const dimensions = await loadImageDimensions('/path/to/image.jpg');
const settings = getOptimalDisplaySettings(dimensions.aspectRatio);
```

### 3. Implementácia v existujúcich komponentoch

```tsx
// Pred optimalizáciou
<img 
  src={image.url} 
  alt={image.popis}
  className="w-full h-32 object-cover"
/>

// Po optimalizácii
<img 
  src={image.url} 
  alt={image.popis}
  className="w-full object-contain max-h-48"
  onLoad={(e) => {
    const img = e.target as HTMLImageElement;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    
    if (aspectRatio > 2.5) {
      img.style.maxHeight = '100px';
    } else if (aspectRatio < 0.7) {
      img.style.maxHeight = '200px';
    } else {
      img.style.maxHeight = '150px';
    }
  }}
/>
```

## Kde je optimalizácia implementovaná

### 1. ImageGallery komponent
- **Súbor:** `components/ImageGallery.tsx`
- **Funkcia:** Zobrazenie obrázkov v detaile návodu
- **Optimalizácia:** Automatická detekcia a prispôsobenie výšky

### 2. Admin rozhranie
- **Súbor:** `app/admin/page.tsx`
- **Funkcia:** Upload a správa obrázkov
- **Optimalizácia:** Inteligentné zobrazenie s indikátormi

### 3. OptimizedImage komponent
- **Súbor:** `components/OptimizedImage.tsx`
- **Funkcia:** Univerzálny komponent pre optimalizované obrázky
- **Optimalizácia:** Kompletná automatizácia s indikátormi

## Technické detaily

### Algoritmus optimalizácie

1. **Načítanie obrázka:** Použitie `Image()` objektu pre získanie prirodzených rozmerov
2. **Výpočet pomeru strán:** `aspectRatio = width / height`
3. **Klasifikácia typu:** Na základe pomeru strán
4. **Aplikácia nastavení:** Výška, object-fit, object-position
5. **Zobrazenie indikátorov:** Voliteľné vizuálne indikátory

### Performance optimalizácie

- **Lazy loading:** Obrázky sa načítavaju len keď sú potrebné
- **Caching:** Rozmery sa cachujú pre opakované použitie
- **Progresívne načítanie:** Placeholder počas načítavania
- **Error handling:** Graceful fallback pri chybách

## Testovanie

### Manuálne testovanie

1. **Nahrajte rôzne typy obrázkov:**
   - Panorámu (napr. 1200x300)
   - Portrét (napr. 300x600)
   - Štvorec (napr. 400x400)
   - Široký (napr. 800x400)

2. **Skontrolujte zobrazenie:**
   - Text pod obrázkom je viditeľný
   - Obrázok nie je príliš orezaný
   - Indikátory sa zobrazujú správne

3. **Testujte responzívnosť:**
   - Desktop zobrazenie
   - Tablet zobrazenie
   - Mobilné zobrazenie

### Automatické testovanie

```tsx
// Príklad testu
import { getOptimalDisplaySettings } from '@/lib/image-optimization';

describe('Image Optimization', () => {
  test('should optimize panoramic images', () => {
    const result = getOptimalDisplaySettings(3.0);
    expect(result.type).toBe('panorama');
    expect(result.height).toBe('100px');
  });
  
  test('should optimize portrait images', () => {
    const result = getOptimalDisplaySettings(0.5);
    expect(result.type).toBe('portrait');
    expect(result.height).toBe('200px');
  });
});
```

## Najlepšie praktiky

### Pre vývojárov

1. **Vždy použite optimalizáciu** pre nové obrázky
2. **Testujte s rôznymi pomermi strán** počas vývoja
3. **Používajte indikátory** v admin rozhraní
4. **Implementujte error handling** pre chybné obrázky

### Pre používateľov

1. **Nahrajte kvalitné obrázky** (min. 400x400px)
2. **Vyhýbajte sa extrémnym pomerom strán** (>5:1 alebo <1:5)
3. **Používajte popisné alt texty** pre lepšiu dostupnosť
4. **Komprimujte veľké obrázky** pre rýchlejšie načítanie

## Riešenie problémov

### Časté problémy

**Obrázok sa nezobrazuje správne:**
- Skontrolujte URL obrázka
- Overte CORS nastavenia
- Skontrolujte formát súboru

**Text nie je viditeľný:**
- Skontrolujte CSS z-index
- Overte farby pozadia
- Skontrolujte responsive breakpointy

**Pomalé načítanie:**
- Komprimujte obrázky
- Použite moderné formáty (WebP, AVIF)
- Implementujte lazy loading

### Debug informácie

Optimalizácia loguje informácie do konzoly:

```
Image optimized: {
  src: "/path/to/image.jpg",
  dimensions: { width: 800, height: 400, aspectRatio: 2.0 },
  type: "wide"
}
```

## Budúce vylepšenia

1. **WebP/AVIF podpora:** Automatická konverzia formátov
2. **Responsive images:** Rôzne veľkosti pre rôzne zariadenia
3. **AI optimalizácia:** Inteligentné orezávanie obsahu
4. **Batch processing:** Hromadná optimalizácia existujúcich obrázkov

## Záver

Systém automatickej optimalizácie obrázkov výrazne zlepšuje používateľskú skúsenosť tým, že zabezpečuje konzistentné a čitateľné zobrazenie obsahu. Implementácia je jednoduchá a flexibilná, umožňuje ľahké rozšírenie a prispôsobenie podľa potrieb.