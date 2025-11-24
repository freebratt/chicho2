
import { VyrobnyNavod, Skolenie, Pozicia, Chyba, Tag, Uzivatel, Pripomienka } from './types';

export const tagy: Tag[] = [
  // Typ práce
  { id: 'vrtanie', nazov: 'vrtanie', typ: 'typ-prace', farba: '#3B82F6' },
  { id: 'frezovanie', nazov: 'frézovanie', typ: 'typ-prace', farba: '#10B981' },
  { id: 'montaz', nazov: 'montáž', typ: 'typ-prace', farba: '#F59E0B' },
  { id: 'kontrola', nazov: 'kontrola', typ: 'typ-prace', farba: '#EF4444' },
  { id: 'balenie', nazov: 'balenie', typ: 'typ-prace', farba: '#8B5CF6' },
  { id: 'jebacka', nazov: 'jebacka', typ: 'typ-prace', farba: '#EC4899' },
  
  // Produkt
  { id: 'okno', nazov: 'okno', typ: 'produkt', farba: '#06B6D4' },
  { id: 'dvere', nazov: 'dvere', typ: 'produkt', farba: '#84CC16' },
  { id: 'HS portál', nazov: 'HS portál', typ: 'produkt', farba: '#F97316' },
  { id: 'ram', nazov: 'rám', typ: 'produkt', farba: '#EC4899' },
  { id: 'geno', nazov: 'geno', typ: 'produkt', farba: '#06B6D4' }
];

export const vyrobneNavody: VyrobnyNavod[] = [
  {
    id: '1',
    nazov: 'Vŕtanie diery na kľučku – okno',
    slug: 'vrtanie-diery-na-klucku-okno',
    typPrace: ['vrtanie'],
    produkt: ['okno'],
    potrebneNaradie: [
      { id: '1', popis: 'Vŕtačka s vrtákom 68mm' },
      { id: '2', popis: 'Šablóna na označenie' },
      { id: '3', popis: 'Ceruzka na označenie' }
    ],
    postupPrace: [
      { id: '1', cislo: 1, popis: 'Pripravte si potrebné náradie: vŕtačku, vrták 68mm, šablónu na označenie' },
      { id: '2', cislo: 2, popis: 'Označte správnu stranu krídla podľa typu kľučky (ľava/pravá)' },
      { id: '3', cislo: 3, popis: 'Nastavte šablónu vo výške 1050mm od spodku krídla' },
      { id: '4', cislo: 4, popis: 'Označte stred diery pomocou šablóny a ceruzky' },
      { id: '5', cislo: 5, popis: 'Nasaďte vrták 68mm do vŕtačky a skontrolujte jeho pevnosť' },
      { id: '6', cislo: 6, popis: 'Začnite vŕtať pomaly na nízkych otáčkach' },
      { id: '7', cislo: 7, popis: 'Udržujte vŕtačku kolmo na povrch krídla' },
      { id: '8', cislo: 8, popis: 'Dokončite vŕtanie a očistite dieru od pilín' }
    ],
    naCoSiDatPozor: [
      { id: '1', popis: 'Vždy skontrolujte správnu stranu krídla pred vŕtaním' },
      { id: '2', popis: 'Výška šablóny musí byť presne 1050mm od spodku' },
      { id: '3', popis: 'Vrták musí byť ostrý a v dobrom stave' },
      { id: '4', popis: 'Vŕtanie vykonávajte na nízkych otáčkach' },
      { id: '5', popis: 'Udržujte vŕtačku kolmo na povrch' },
      { id: '6', popis: 'Po vŕtaní očistite dieru od všetkých pilín' }
    ],
    casteChyby: [
      { id: '1', popis: 'Zvolená nesprávna strana krídla' },
      { id: '2', popis: 'Nesprávna výška šablóny' },
      { id: '3', popis: 'Zle nastavená vŕtačka - vysoké otáčky' },
      { id: '4', popis: 'Vrták nie je kolmo na povrch' },
      { id: '5', popis: 'Neočistená diera po vŕtaní' }
    ],
    obrazky: [
      {
        id: '1',
        url: 'https://images.pexels.com/photos/5691660/pexels-photo-5691660.jpeg',
        cisloKroku: 1,
        popis: 'Označenie miesta frézovanie na profile'
      },
      {
        id: '2',
        url: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg',
        cisloKroku: 3,
        popis: 'Frézovanie drážky v správnom smere'
      }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    vytvorene: new Date('2025-07-25'),
    aktualizovane: new Date('2025-07-25')
  },
  {
    id: '2',
    nazov: 'Montáž dvere - kompletný postup',
    slug: 'montaz-dvere-kompletny-postup',
    typPrace: ['montaz'],
    produkt: ['dvere'],
    potrebneNaradie: [
      { id: '1', popis: 'Skrutkovač s bitmi Torx' },
      { id: '2', popis: 'Meter a vodováha' },
      { id: '3', popis: 'Tesniaca pena' },
      { id: '4', popis: 'Kliny na vyrovnanie' }
    ],
    postupPrace: [
      { id: '1', cislo: 1, popis: 'Skontrolujte rozmer otvoru a pripravenosť rámu' },
      { id: '2', cislo: 2, popis: 'Umiestnite dverné krídlo do rámu' },
      { id: '3', cislo: 3, popis: 'Vyrovnajte pomocou klinov a skontrolujte vodováhou' },
      { id: '4', cislo: 4, popis: 'Pripevnite prvé skrutky v hornej časti rámu' },
      { id: '5', cislo: 5, popis: 'Skontrolujte funkčnosť otvárania a zatvárania' },
      { id: '6', cislo: 6, popis: 'Dotiahnite všetky skrutky podľa predpisu' },
      { id: '7', cislo: 7, popis: 'Aplikujte tesniace peny do medzier' }
    ],
    naCoSiDatPozor: [
      { id: '1', popis: 'Skontrolujte rozmery otvoru pred začatím montáže' },
      { id: '2', popis: 'Dvere musia byť presne vyrovnané vo všetkých smeroch' },
      { id: '3', popis: 'Nedotiahnite skrutky príliš silno - môže sa poškodiť rám' },
      { id: '4', popis: 'Tesniaca pena sa rozťahuje, neaplikujte príliš veľa' }
    ],
    casteChyby: [
      { id: '1', popis: 'Nevyrovnané dvere - nesprávne otváranie' },
      { id: '2', popis: 'Pretiahnuté skrutky - poškodený rám' },
      { id: '3', popis: 'Príliš veľa tesniace peny - deformácia rámu' }
    ],
    obrazky: [],
    vytvorene: new Date('2025-07-20'),
    aktualizovane: new Date('2025-07-22')
  },
  {
    id: '3',
    nazov: 'Frézovanie drážky pre HS portál',
    slug: 'frezovanie-drazky-hs-portal',
    typPrace: ['frezovanie'],
    produkt: ['HS portál'],
    potrebneNaradie: [
      { id: '1', popis: 'Ručná fréza s vodítkom' },
      { id: '2', popis: 'Frézovací nôž 12mm' },
      { id: '3', popis: 'Šablóna pre HS systém' },
      { id: '4', popis: 'Ochranné pomôcky' }
    ],
    postupPrace: [
      { id: '1', cislo: 1, popis: 'Pripravte profil a označte miesta frézovanie' },
      { id: '2', cislo: 2, popis: 'Nastavte hĺbku frézy podľa šablóny HS systému' },
      { id: '3', cislo: 3, popis: 'Začnite frézovať opatrne v smere proti otáčaniu' },
      { id: '4', cislo: 4, popis: 'Udržujte konštantnú rýchlosť frézovanie' },
      { id: '5', cislo: 5, popis: 'Skontrolujte rozmer drážky kalibrom' },
      { id: '6', cislo: 6, popis: 'Očistite drážku od pilín a triesok' }
    ],
    naCoSiDatPozor: [
      { id: '1', popis: 'Vždy používajte ochranné pomôcky pri frézovaní' },
      { id: '2', popis: 'Frézujte v správnom smere - proti otáčaniu frézy' },
      { id: '3', popis: 'Skontrolujte ostrotu frézy pred použitím' },
      { id: '4', popis: 'Neponáhľajte sa - kvalita je dôležitejšia ako rýchlosť' }
    ],
    casteChyby: [
      { id: '1', popis: 'Frézovanie v nesprávnom smere - nebezpečie' },
      { id: '2', popis: 'Príliš hlboká drážka - zoslabenie profilu' },
      { id: '3', popis: 'Neočistené piliny - problémy pri montáži' }
    ],
    obrazky: [],
    vytvorene: new Date('2025-07-18'),
    aktualizovane: new Date('2025-07-18')
  },
  {
    id: '4',
    nazov: 'Kontrola kvality okno pred balením',
    slug: 'kontrola-kvality-okno-pred-balenim',
    typPrace: ['kontrola'],
    produkt: ['okno'],
    potrebneNaradie: [
      { id: '1', popis: 'Kontrolný list kvality' },
      { id: '2', popis: 'Meter a uhloměr' },
      { id: '3', popis: 'Tester funkčnosti kľučiek' },
      { id: '4', popis: 'Lupa pre detailnú kontrolu' }
    ],
    postupPrace: [
      { id: '1', cislo: 1, popis: 'Skontrolujte kompletnosť všetkých komponentov' },
      { id: '2', cislo: 2, popis: 'Zmerajte rozmer rámu a porovnajte s objednávkou' },
      { id: '3', cislo: 3, popis: 'Otestujte funkčnosť všetkých kľučiek a zatváraní' },
      { id: '4', cislo: 4, popis: 'Skontrolujte kvalitu povrchu a farebného prevedenie' },
      { id: '5', cislo: 5, popis: 'Overte správnosť zasklenia a tesnení' },
      { id: '6', cislo: 6, popis: 'Vyplňte kontrolný protokol s výsledkami' }
    ],
    naCoSiDatPozor: [
      { id: '1', popis: 'Skontrolujte každý detail podľa kontrolného zoznamu' },
      { id: '2', popis: 'Pri chybách ihneď zastavte proces a informujte vedúceho' },
      { id: '3', popis: 'Nezabúdajte na kontrolu tesnení - kritické pre funkčnosť' }
    ],
    casteChyby: [
      { id: '1', popis: 'Prehliadnutá chyba v zasklení' },
      { id: '2', popis: 'Nefunkčná kľučka odhalená až u zákazníka' },
      { id: '3', popis: 'Neúplný kontrolný protokol' }
    ],
    obrazky: [],
    vytvorene: new Date('2025-07-15'),
    aktualizovane: new Date('2025-07-16')
  },
  {
    id: '5',
    nazov: 'Balenie okien pre prepravu',
    slug: 'balenie-okien-pre-prepravu',
    typPrace: ['balenie'],
    produkt: ['okno'],
    potrebneNaradie: [
      { id: '1', popis: 'Ochranná fólia a lepenka' },
      { id: '2', popis: 'Rohové chrániče' },
      { id: '3', popis: 'Páska na balenie' },
      { id: '4', popis: 'Étikety s informáciami o objednávke' }
    ],
    postupPrace: [
      { id: '1', cislo: 1, popis: 'Pripravte všetky baliace materiály' },
      { id: '2', cislo: 2, popis: 'Obaľte sklenené plochy ochrannou fóliou' },
      { id: '3', cislo: 3, popis: 'Aplikujte rohové chrániče na všetky hrany' },
      { id: '4', cislo: 4, popis: 'Zabaľte celé okno do ochrannej lepenky' },
      { id: '5', cislo: 5, popis: 'Pripevnite étiketu s údajmi o objednávke' },
      { id: '6', cislo: 6, popis: 'Umiestnite zabalené okno na prepravu stojak' }
    ],
    naCoSiDatPozor: [
      { id: '1', popis: 'Venujte zvláštnu pozornosť skleným plochám' },
      { id: '2', popis: 'Rohové chrániče musia byť na všetkých rohoch' },
      { id: '3', popis: 'Étiketa musí byť čitateľná a obsahovať všetky údaje' }
    ],
    casteChyby: [
      { id: '1', popis: 'Poškodenie skla kvôli nedostatočnej ochrane' },
      { id: '2', popis: 'Chýbajúca alebo nesprávna étiketa' },
      { id: '3', popis: 'Poškodenie rohov pri manipulácii' }
    ],
    obrazky: [],
    vytvorene: new Date('2025-07-12'),
    aktualizovane: new Date('2025-07-14')
  },
  {
    id: '6',
    nazov: 'Špeciální postup jebacka pre geno systém',
    slug: 'specialni-postup-jebacka-geno-system',
    typPrace: ['jebacka'],
    produkt: ['geno'],
    potrebneNaradie: [
      { id: '1', popis: 'Špecialné náradie pre geno systém' },
      { id: '2', popis: 'Kalibračné meradlá' },
      { id: '3', popis: 'Ochranné rukavice' }
    ],
    postupPrace: [
      { id: '1', cislo: 1, popis: 'Pripravte geno komponenty podľa špecifikácie' },
      { id: '2', cislo: 2, popis: 'Nastavte presné parametre jebacka procesu' },
      { id: '3', cislo: 3, popis: 'Vykonajte kalibráciu pred začatím práce' },
      { id: '4', cislo: 4, popis: 'Spustite jebacka procedúru postupne' },
      { id: '5', cislo: 5, popis: 'Monitorujte všetky parametre počas procesu' },
      { id: '6', cislo: 6, popis: 'Vykonajte finálnu kontrolu geno systému' }
    ],
    naCoSiDatPozor: [
      { id: '1', popis: 'Dodržujte presné parametre pre geno systém' },
      { id: '2', popis: 'Nevykonávajte jebacka bez kalibrácie' },
      { id: '3', popis: 'Používajte ochranné pomôcky počas celého procesu' }
    ],
    casteChyby: [
      { id: '1', popis: 'Nesprávna kalibrácia jebacka zariadenia' },
      { id: '2', popis: 'Chýbajúca kontrola geno komponentov' },
      { id: '3', popis: 'Nedodržanie bezpečnostných predpisov' }
    ],
    obrazky: [],
    vytvorene: new Date('2025-07-10'),
    aktualizovane: new Date('2025-07-11')
  }
];

export const skolenia: Skolenie[] = [
  {
    id: '1',
    nazov: 'Základy vŕtania pre montážnikov',
    pozicia: ['montaznik', 'asistent-montaznika'],
    material: `
      Základné techniky vŕtania v dreve a hliníku:
      - Výber správneho vrtáku podľa materiálu
      - Nastavenie otáčok vŕtačky
      - Technika držania vŕtačky
      - Bezpečnostné pravidlá
      - Údržba náradia
    `,
    test: '/test/vrtanie-zaklady',
    bodovania: 100,
    vytvorene: new Date('2025-01-10')
  }
];

export const pozicie: Pozicia[] = [
  {
    id: '1',
    nazov: 'Montážnik okien a dverí',
    popis: 'Zodpovedný za montáž okien, dverí a portálov podľa technických výkresov',
    potrebneSkoleinia: ['1']
  },
  {
    id: '2',
    nazov: 'Asistent montážnika',
    popis: 'Pomocník pri montáži, príprava materiálu a náradia',
    potrebneSkoleinia: ['1']
  }
];

export const chyby: Chyba[] = [
  {
    id: '1',
    nazov: 'Nesprávne umiestnenie kľučky',
    popis: 'Kľučka bola namontovaná na nesprávnej strane alebo vo nesprávnej výške',
    kritickost: 4,
    suvisiayciNavod: '1',
    riesenie: 'Demontáž kľučky, oprava dier tmeleím, nové vŕtanie podľa šablóny',
    vytvorene: new Date('2025-01-16')
  }
];

// Simple hash function matching auth.ts
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// Mock users data - now with properly hashed passwords
export const uzivatelia: Uzivatel[] = [
  {
    id: 'user_1',
    meno: 'Admin User',
    email: 'admin@chicho.tech',
    hesloHash: simpleHash('Chicho123'), // Hashed version of 'Chicho123'
    uroven: 'admin',
    vytvoreny: new Date('2025-01-01'),
    historiaAktivit: [
      {
        id: 'aktivita_1',
        typ: 'prihlasenie',
        cas: new Date('2025-07-29T09:00:00'),
        popis: 'Prihlásenie do systému'
      },
      {
        id: 'aktivita_2',
        typ: 'navsteva-navodu',
        cas: new Date('2025-07-29T09:15:00'),
        popis: 'Návšteva návodu: Vŕtanie dier',
        navodId: 'navod_1'
      }
    ],
    celkoveNavstevy: 15
  },
  {
    id: 'user_2',
    meno: 'Ján Pracovník',
    email: 'jan.pracovnik@chicho.tech',
    hesloHash: simpleHash('Chicho123'), // Hashed version of 'Chicho123'
    uroven: 'pracovnik',
    vytvoreny: new Date('2025-01-15'),
    historiaAktivit: [
      {
        id: 'aktivita_3',
        typ: 'prihlasenie',
        cas: new Date('2025-07-28T08:30:00'),
        popis: 'Prihlásenie do systému'
      },
      {
        id: 'aktivita_4',
        typ: 'navsteva-navodu',
        cas: new Date('2025-07-28T08:45:00'),
        popis: 'Návšteva návodu: Vŕtanie dier',
        navodId: 'navod_1'
      },
      {
        id: 'aktivita_5',
        typ: 'vytvorenie-pripomienky',
        cas: new Date('2025-07-25T10:00:00'),
        popis: 'Vytvorenie pripomienky k návodu',
        navodId: 'navod_1'
      }
    ],
    celkoveNavstevy: 8
  },
  {
    id: 'user_3',
    meno: 'Peter Svoboda',
    email: 'peter.svoboda@chicho.tech',
    hesloHash: simpleHash('Chicho123'), // Hashed version of 'Chicho123'
    uroven: 'pracovnik',
    vytvoreny: new Date('2025-01-20'),
    historiaAktivit: [
      {
        id: 'aktivita_6',
        typ: 'prihlasenie',
        cas: new Date('2025-07-27T07:45:00'),
        popis: 'Prihlásenie do systému'
      },
      {
        id: 'aktivita_7',
        typ: 'export-pdf',
        cas: new Date('2025-07-27T08:15:00'),
        popis: 'Export PDF: Vŕtanie dier',
        navodId: 'navod_1'
      }
    ],
    celkoveNavstevy: 5
  }
];

// Mock pripomienky data
export const pripomienky: Pripomienka[] = [
  {
    id: 'pripomienka_1',
    uzivatelId: 'user_2',
    navodId: 'navod_1',
    sprava: 'Krok č. 3 by sa mal upresiť - nie je jasné, ako presne nastaviť vŕtačku.',
    cisloKroku: 3,
    vytvorena: new Date('2025-07-25'),
    stav: 'nevybavena'
  },
  {
    id: 'pripomienka_2',
    uzivatelId: 'user_3',
    navodId: 'navod_1',
    sprava: 'Chýba upozornenie na bezpečnosť pri práci so vŕtačkou.',
    cisloKroku: 1,
    vytvorena: new Date('2025-07-24'),
    stav: 'vybavena'
  }
];
