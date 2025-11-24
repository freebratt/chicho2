# CHICHO - Výrobný a školiaci portál (README)

A high-level summary of CHICHO to help an AI agent quickly assess relevance and capabilities.

## 🧭 Core identity
CHICHO is a domain-specific portal that streamlines creation, management, and access to manufacturing guides, trainings, and admin workflows with AI assistance.

## 🪄 Kľúčové schopnosti
- Návody a školenia – jednotný zdroj s verzovaním a exportom obsahu
- Admin rozhranie – AI-assisted workflows and streamlined content management
- PDF export, QR kódy – jednoduché zdieľanie a prístup na mobilných zariadeniach
- Plná slovenčina a diakritika – používateľsky prívetivé prostredie
- Responzívny dizajn – dostupné na desktop, tablet a mobil
- Bezpečnosť a používateľské pohodlie – Remember Me a vhodné bezpečnostné poznámky
- Novinka: Automatická optimizácia zobrazenia obrázkov pod textom – zaručená čitateľnosť a lepšia vizuálna skúsenosť
- Notifikácie a pripomienky pre administrátorov – prehľadné riadenie spätnej väzby

## 🧩 Nová funkcia: Automatická optimizácia obrázkov (image optimization)
- Čo to robí: Zabezpečuje, aby text pod obrázkami bol vždy viditeľný a obrázky boli zobrazené s vhodnou veľkosťou a pozíciou, bez orezania dôležitých častí obsahu.
- Prečo je užitočné: Obrázky často obsahujú kontext alebo doplnkové informácie pod nimi. Fixné výšky a jednoduché orezanie môžu viesť k strate textu. Dynamická optimalizácia prispieva k čitateľnosti a lepšiemu zážitku používateľa.
- Všeobecný spôsob fungovania:
  - Rozlišuje pomer strán obrázka a podľa toho navrhuje vhodnú výšku a pozíciu obsahu (napr. object-position).
  - Detekuje typ zobrazovania a vizuálne indikátory označujúce, že obrázok bol optimalizovaný.
  - Poskytuje užívateľské vizuálne indikátory a záruky čitateľnosti pod obrázkom.
- Vizuálne indikátory a UX:
  - Oznámenie v rohu obrázka s textom “Optimalizované”.
  - Pod obrázkom badge a meta informácie o kroku a popise.
  - Jasná informácia o tom, či obrázok predstavuje panorámu, portrét alebo štandardnú konfiguráciu.
- Poznámka: Táto časť poskytuje vysokú úroveň poriadku; detaily implementácie sú interné.

## 🗺️ Prehľad obsahu a používanie (v skratke)
- Návody a školenia: jednotný zdroj s možnosťou exportu do PDF
- Admin: jednoduché riadenie obsahu s AI asistentom a inboxom pre pripomienky
- Bezpečnosť a lokalizácia: Remember Me, lokálne úložiská a slovenské prostredie
- Novinka: automatická optimalizácia obrázkov – text pod obrázkami je vždy viditeľný a vizuálne indikovaný
- Vizuálne indikácie optimalizácie a UX prvky zamerané na čitateľnosť textu pod obrázkami

## 🧭 Architektúra v stručnosti (vysoká úroveň)
- OptimizedImage komponent: zobrazuje obrázky s dynamickou optorizáciou na základe pomeru strán, zabezpečuje vhodnú výšku a pozíciu obsahu, a môže zobrazovať indikátor optimezácie.
- AutoImageOptimizer: centralizuje automaticú optimalizáciu existujúcich obrázkov (vrátane navigačných obrázkov Návodov) a voliteľne spúšťa globálnu optimalizáciu vo všetkých stránkach.
- Image-like utilitné funkcie a hooky: poskytujú jednoduché API na lokálne optimalizácie jednotlivých obrázkov alebo dávkovú optimalizáciu, vrátane spätnej väzby a indikácií stavu.
- Kontext použitia: optimalizácia sa aplikuje na obrázky v návodoch, v editovacích dialógach a v administračnom rozhraní; zaručuje konzistentný vizuálny štandard naprieč aplikáciou.
- Vizuálne indikátory: pre užívateľov a administrátorov je jasne viditeľné, ktoré obrázky sú optimalizované a čo bolo upravené (panoráma/portrét/široký/štvorec).

## 🧩 Esencia a účel
- Čo projekt robí: poskytuje systematický rámec na správu výrobých návodov a školení s dôrazom na čitateľnosť, prístupnosť a administratívnu efektivitu, doplnený o automatickú optimalizáciu obrázkov.
- Prečo je to dôležité: zlepšená čitateľnosť a konzistentné zobrazenie obrázkov zvyšujú použiteľnosť návodov, znižujú potrebu manuálnych zásahov a zlepšujú administratívnu efektivitu.

## ♻️ Dôraz na textovú čitateľnosť pod obrázkami
- Obrázky s doplňujúcim obsahom sú dynamicky prispôsobované tak, aby text pod nimi zostal čitateľný aj pri rozsiahlejšom obsahu.
- Implementácia obsahuje vizuálne indikátory a textové potvrdenia o tom, že text zostáva čitateľný.

## 🧰 Poznámky pre používateľov a administrátorov
- Nové optimačné funkcie sú navrhnuté tak, aby zlepšili vizuálnu skúsenosť a administratívnu efektivitu bez zbytočných technických detailov.
- Dokumentácia v README je určená na rýchlu orientáciu pre AI agenta, aby bolo jasné, či je projekt relevantný pre danú úlohu.
- Žiadne technické inštrukcie, inštalácia ani kódové príklady nie sú súčasťou tohto dokumentu.

## 🧭 Zhrnutie prínosov
- Zlepšená čitateľnosť a vizuálna konzistencia naprieč materiálmi a navigáciami.
- Jednoduchšia správa obrázkov pre administrátora a rýchlejšia spätná väzba.
- Automatizovaná optimalizácia pre výkonné a udržateľné zobrazenie obsahu.

© 2025 CHICHO s.r.o. | Vytvorené cez Macaly