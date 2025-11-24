// localStorage persistence system for CHICHO portal
import { VyrobnyNavod, Tag, Uzivatel, Pripomienka, NavodNavsteva } from './types';

const STORAGE_KEYS = {
  NAVODY: 'chicho_navody',
  TAGY: 'chicho_tagy', 
  UZIVATELIA: 'chicho_uzivatelia',
  PRIPOMIENKY: 'chicho_pripomienky',
  NAVSTEVY: 'chicho_navstevy'
} as const;

// Initialize from imported data
export const initializeStorage = () => {
  console.log('🔄 Initializing localStorage system...');
  
  // Import initial data only if localStorage is empty
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem(STORAGE_KEYS.NAVODY)) {
      const { vyrobneNavody } = require('./data');
      localStorage.setItem(STORAGE_KEYS.NAVODY, JSON.stringify(vyrobneNavody));
      console.log('✅ Initialized návody in localStorage');
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.TAGY)) {
      const { tagy } = require('./data'); 
      localStorage.setItem(STORAGE_KEYS.TAGY, JSON.stringify(tagy));
      console.log('✅ Initialized tagy in localStorage');
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.UZIVATELIA)) {
      const { uzivatelia } = require('./data');
      localStorage.setItem(STORAGE_KEYS.UZIVATELIA, JSON.stringify(uzivatelia));
      console.log('✅ Initialized uzivatelia in localStorage');
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.PRIPOMIENKY)) {
      const { pripomienky } = require('./data');
      localStorage.setItem(STORAGE_KEYS.PRIPOMIENKY, JSON.stringify(pripomienky)); 
      console.log('✅ Initialized pripomienky in localStorage');
    }
  }
};

// Generic storage functions
export const loadFromStorage = <T>(key: string, defaultValue: T[] = []): T[] => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((item: any) => {
      if (item.vytvorene) item.vytvorene = new Date(item.vytvorene);
      if (item.aktualizovane) item.aktualizovane = new Date(item.aktualizovane);
      if (item.vytvoreny) item.vytvoreny = new Date(item.vytvoreny);
      if (item.vytvorena) item.vytvorena = new Date(item.vytvorena);
      if (item.vybavena) item.vybavena = new Date(item.vybavena);
      return item;
    });
  } catch (error) {
    console.error(`❌ Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, data: T[]): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`💾 Successfully saved ${data.length} items to ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving ${key} to storage:`, error);
    return false;
  }
};

// Specific data loaders
export const loadNavody = (): VyrobnyNavod[] => {
  return loadFromStorage<VyrobnyNavod>(STORAGE_KEYS.NAVODY);
};

export const saveNavody = (navody: VyrobnyNavod[]): boolean => {
  return saveToStorage(STORAGE_KEYS.NAVODY, navody);
};

export const loadTagy = (): Tag[] => {
  return loadFromStorage<Tag>(STORAGE_KEYS.TAGY);
};

export const saveTagy = (tagy: Tag[]): boolean => {
  return saveToStorage(STORAGE_KEYS.TAGY, tagy);
};

export const loadUzivatelia = (): Uzivatel[] => {
  return loadFromStorage<Uzivatel>(STORAGE_KEYS.UZIVATELIA);
};

export const saveUzivatelia = (uzivatelia: Uzivatel[]): boolean => {
  return saveToStorage(STORAGE_KEYS.UZIVATELIA, uzivatelia);
};

export const loadPripomienky = (): Pripomienka[] => {
  return loadFromStorage<Pripomienka>(STORAGE_KEYS.PRIPOMIENKY);
};

export const savePripomienky = (pripomienky: Pripomienka[]): boolean => {
  return saveToStorage(STORAGE_KEYS.PRIPOMIENKY, pripomienky);
};

export const loadNavstevy = (): NavodNavsteva[] => {
  return loadFromStorage<NavodNavsteva>(STORAGE_KEYS.NAVSTEVY);
};

export const saveNavstevy = (navstevy: NavodNavsteva[]): boolean => {
  return saveToStorage(STORAGE_KEYS.NAVSTEVY, navstevy);
};

// Function to record a visit to a navod
export const recordNavodVisit = (
  navodId: string,
  uzivatelId: string,
  uzivatelMeno: string,
  uzivatelEmail: string,
  navodNazov: string
): boolean => {
  try {
    console.log('📊 Recording visit:', { navodId, uzivatelId, uzivatelMeno });
    
    const navstevy = loadNavstevy();
    const novaNavsteva: NavodNavsteva = {
      id: generateId('visit'),
      navodId,
      uzivatelId,
      cas: new Date(),
      uzivatelMeno,
      uzivatelEmail,
      navodNazov
    };
    
    navstevy.push(novaNavsteva);
    
    // Keep only last 1000 visits to prevent localStorage overflow
    if (navstevy.length > 1000) {
      navstevy.splice(0, navstevy.length - 1000);
    }
    
    // Also add to user's activity history
    recordUserActivity(uzivatelId, 'navsteva-navodu', `Návšteva návodu: ${navodNazov}`, navodId);
    
    return saveNavstevy(navstevy);
  } catch (error) {
    console.error('❌ Error recording visit:', error);
    return false;
  }
};

// Function to record user activity
export const recordUserActivity = (
  uzivatelId: string,
  typ: 'prihlasenie' | 'navsteva-navodu' | 'vytvorenie-pripomienky' | 'export-pdf' | 'qr-generovanie',
  popis: string,
  navodId?: string
): boolean => {
  try {
    console.log('👤 Recording user activity:', { uzivatelId, typ, popis });
    
    const uzivatelia = loadUzivatelia();
    const uzivatel = uzivatelia.find(u => u.id === uzivatelId);
    
    if (!uzivatel) {
      console.error('User not found:', uzivatelId);
      return false;
    }
    
    // Ensure historiaAktivit exists (initialize if undefined)
    if (!uzivatel.historiaAktivit) {
      uzivatel.historiaAktivit = [];
    }
    
    // Add new activity to user's history
    const novaAktivita = {
      id: generateId('aktivita'),
      typ,
      cas: new Date(),
      popis,
      ...(navodId && { navodId })
    };
    
    uzivatel.historiaAktivit.push(novaAktivita);
    
    // Keep only last 50 activities per user
    if (uzivatel.historiaAktivit.length > 50) {
      uzivatel.historiaAktivit = uzivatel.historiaAktivit.slice(-50);
    }
    
    // Update total visits count if it's a visit
    if (typ === 'navsteva-navodu') {
      // Ensure celkoveNavstevy exists (initialize if undefined)
      if (typeof uzivatel.celkoveNavstevy !== 'number') {
        uzivatel.celkoveNavstevy = 0;
      }
      uzivatel.celkoveNavstevy += 1;
    }
    
    return saveUzivatelia(uzivatelia);
  } catch (error) {
    console.error('❌ Error recording user activity:', error);
    return false;
  }
};

// Function to record user login
export const recordUserLogin = (uzivatelId: string): boolean => {
  return recordUserActivity(uzivatelId, 'prihlasenie', 'Úspešné prihlásenie do systému');
};

// Get user activity history
export const getUserActivityHistory = (uzivatelId: string, limit: number = 20) => {
  const uzivatelia = loadUzivatelia();
  const uzivatel = uzivatelia.find(u => u.id === uzivatelId);
  
  if (!uzivatel) {
    return [];
  }
  
  return (uzivatel.historiaAktivit || [])
    .sort((a, b) => new Date(b.cas).getTime() - new Date(a.cas).getTime())
    .slice(0, limit);
};

// Get visits for a specific navod
export const getNavodVisits = (navodId: string): NavodNavsteva[] => {
  const navstevy = loadNavstevy();
  return navstevy
    .filter(navsteva => navsteva.navodId === navodId)
    .sort((a, b) => new Date(b.cas).getTime() - new Date(a.cas).getTime());
};

// Get all visits with statistics
export const getAllVisitsWithStats = () => {
  const navstevy = loadNavstevy();
  const navody = loadNavody();
  
  // Group visits by navod
  const visitsByNavod: { [navodId: string]: NavodNavsteva[] } = {};
  navstevy.forEach(navsteva => {
    if (!visitsByNavod[navsteva.navodId]) {
      visitsByNavod[navsteva.navodId] = [];
    }
    visitsByNavod[navsteva.navodId].push(navsteva);
  });
  
  // Create statistics
  return navody.map(navod => ({
    navod,
    navstevy: visitsByNavod[navod.id] || [],
    pocetNavstev: visitsByNavod[navod.id]?.length || 0,
    poslednaNavsteva: visitsByNavod[navod.id]?.[0]?.cas,
    unikatniUzivatelia: Array.from(new Set(visitsByNavod[navod.id]?.map(n => n.uzivatelId) || [])).length
  }));
};

// Utility functions for ID generation
export const generateId = (prefix: string = 'item'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateSlug = (nazov: string): string => {
  return nazov
    .toLowerCase()
    .replace(/[áä]/g, 'a')
    .replace(/[éě]/g, 'e') 
    .replace(/[íì]/g, 'i')
    .replace(/[óô]/g, 'o')
    .replace(/[úù]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[ľ]/g, 'l')
    .replace(/[ň]/g, 'n')
    .replace(/[ř]/g, 'r')
    .replace(/[š]/g, 's')
    .replace(/[ť]/g, 't')
    .replace(/[ž]/g, 'z')
    .replace(/[č]/g, 'c')
    .replace(/[ď]/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Success/Error notification system
export const showNotification = (
  message: string, 
  type: 'success' | 'error' | 'info' = 'info',
  duration: number = 4000
): void => {
  if (typeof window === 'undefined') return;

  const notification = document.createElement('div');
  
  const colors = {
    success: 'background:#16a34a;',
    error: 'background:#dc2626;', 
    info: 'background:#2563eb;'
  };
  
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };
  
  notification.innerHTML = `${icons[type]} ${message}`;
  notification.style.cssText = `
    position:fixed;
    top:20px;
    right:20px;
    ${colors[type]}
    color:white;
    padding:12px 20px;
    border-radius:8px;
    z-index:1000;
    font-family:Inter,sans-serif;
    font-size:14px;
    box-shadow:0 4px 12px rgba(0,0,0,0.15);
    max-width:350px;
    word-wrap:break-word;
    line-height:1.4;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add CSS animation
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, duration);
};

// Clear all storage (useful for reset/debug)
export const clearAllStorage = (): void => {
  if (typeof window !== 'undefined') {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ All CHICHO storage cleared');
  }
};

// Export storage keys for use in components
export { STORAGE_KEYS };

export function getAllAvailableTags(): { typPrace: string[], produkt: string[] } {
  const navody = loadNavody();
  console.log('🏷️ Collecting all available tags from navody:', navody.length);
  
  const allTypPrace = new Set<string>();
  const allProdukt = new Set<string>();
  
  navody.forEach(navod => {
    navod.typPrace.forEach(typ => allTypPrace.add(typ));
    navod.produkt.forEach(produkt => allProdukt.add(produkt));
  });
  
  const result = {
    typPrace: Array.from(allTypPrace).sort(),
    produkt: Array.from(allProdukt).sort()
  };
  
  console.log('🏷️ Available tags:', result);
  return result;
}

// Function to update user passwords in localStorage (for password resets)
export const updateAllUserPasswords = (newPassword: string): boolean => {
  try {
    console.log('🔄 Updating all user passwords in localStorage...');
    
    // Simple hash function (duplicated here to avoid circular imports)
    const simpleHash = (password: string): string => {
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash.toString(16);
    }
    const users = loadUzivatelia();
    const newPasswordHash = simpleHash(newPassword);
    
    // Update password hash for all users
    users.forEach(user => {
      user.hesloHash = newPasswordHash;
      console.log(`🔒 Updated password for user: ${user.email}`);
    });
    
    const success = saveUzivatelia(users);
    if (success) {
      console.log('✅ All user passwords updated successfully');
    } else {
      console.log('❌ Failed to save updated user passwords');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error updating user passwords:', error);
    return false;
  }
};