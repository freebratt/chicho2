export interface VyrobnyNavod {
  id: string;
  nazov: string;
  slug: string;
  typPrace: string[];
  produkt: string[];
  potrebneNaradie: NavodPolozka[];
  postupPrace: NavodKrok[];
  naCoSiDatPozor: NavodPolozka[];
  casteChyby: NavodPolozka[];
  pdfPriloha?: string;
  obrazky?: NavodObrazok[];
  videoUrl?: string;
  attachmentId?: string; // Convex attachment ID (deprecated - use attachments)
  attachmentFilename?: string; // For display (deprecated - use attachments)
  attachments?: Array<{ id: string; filename: string }>; // Multiple attachments support
  vytvorene: Date;
  aktualizovane: Date;
}

export interface NavodKrok {
  id: string;
  cislo: number;
  popis: string;
}

export interface NavodPolozka {
  id: string;
  popis: string;
}

export interface NavodObrazok {
  id: string;
  url: string;
  cisloKroku: number;
  popis: string;
}

export interface Skolenie {
  id: string;
  nazov: string;
  pozicia: string[];
  material: string;
  test?: string;
  bodovania?: number;
  vytvorene: Date;
}

export interface Pozicia {
  id: string;
  nazov: string;
  popis: string;
  potrebneSkoleinia: string[];
  obrazok?: string;
}

export interface Chyba {
  id: string;
  nazov: string;
  popis: string;
  kritickost: 1 | 2 | 3 | 4 | 5;
  suvisiayciNavod?: string;
  riesenie?: string;
  foto?: string;
  vytvorene: Date;
}

export interface Tag {
  id: string;
  nazov: string;
  typ: 'typ-prace' | 'produkt' | 'pozicia';
  farba: string;
}

export interface FilterState {
  search: string;
  typPrace: string[];
  produkt: string[];
}

export interface Uzivatel {
  id: string;
  meno: string;
  email: string;
  hesloHash: string;
  uroven: 'admin' | 'pracovnik';
  vytvoreny: Date;
  poslednePohlasenie?: Date;
  historiaAktivit: UzivatelAktivita[];
  celkoveNavstevy: number;
}

export interface UzivatelAktivita {
  id: string;
  typ: 'prihlasenie' | 'navsteva-navodu' | 'vytvorenie-pripomienky' | 'export-pdf' | 'qr-generovanie';
  cas: Date;
  popis: string;
  navodId?: string; // pre návštevy návodov
  dodatocneData?: any; // pre ľubovoľné dodatočné informácie
}

export interface Pripomienka {
  id: string;
  navodId: string;
  uzivatelId: string;
  sprava: string;
  cisloKroku?: number;
  stav: 'nevybavena' | 'vybavena';
  vytvorena: Date;
  vybavena?: Date;
}

export interface NavodNavsteva {
  id: string;
  navodId: string;
  uzivatelId: string;
  cas: Date;
  uzivatelMeno: string; // cached for easier display
  uzivatelEmail: string; // cached for easier display
  navodNazov: string; // cached for easier display
}

export interface AuthState {
  isAuthenticated: boolean;
  user: Uzivatel | null;
}

