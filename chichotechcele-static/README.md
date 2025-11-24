# CHICHO - Statická HTML/PHP verzia

Výrobný a školiaci portál CHICHO v statickej HTML/CSS/JS + PHP verzii pre FTP hosting.

## 📋 Požiadavky

- **Web server**: Apache alebo Nginx
- **PHP**: 7.4 alebo vyššie
- **PDO SQLite extension**: Musí byť povolená
- **mod_rewrite**: Povolený (pre Apache)

## 🚀 Inštalácia

### 1. Upload na FTP

Nahrajte všetky súbory na váš FTP server do hlavného adresára (napr. `public_html` alebo `www`).

### 2. Nastavte oprávnenia

```bash
chmod 755 includes/
chmod 755 api/
chmod 777 data/  # Databázový priečinok musí byť zapisovateľný
```

### 3. Spustite seed skript

Otvorte v prehliadači: `http://vasa-domena.sk/seed.php`

Tento skript vytvorí databázu a naplní ju dátami.

### 4. Odstráňte seed.php

Po úspešnom seedovaní z bezpečnostných dôvodov odstráňte súbor:
```bash
rm seed.php
```

## 🔐 Prihlasovacie údaje

Po seedovaní môžete použiť:

**Admin účet:**
- Email: `admin@chicho.tech`
- Heslo: `Chicho123`

**Pracovník:**
- Email: `jan.pracovnik@chicho.tech`
- Heslo: `Chicho123`

## 📁 Štruktúra projektu

```
chichotechcele-static/
├── index.html              # Prihlásenie
├── navody.html            # Zoznam návodov
├── navod.html             # Detail návodu
├── admin/
│   └── index.html         # Admin dashboard
├── api/
│   ├── auth.php           # Autentifikácia
│   └── navody.php         # API pre návody
├── includes/
│   ├── config.php         # Konfigurácia
│   ├── db.php             # Databázový wrapper
│   └── session.php        # Session management
├── data/
│   └── chicho.db          # SQLite databáza (vytvorí sa automaticky)
├── .htaccess              # Apache konfigurácia
└── seed.php               # Seed skript (odstráňte po použití!)
```

## 🛠️ Technológie

- **Frontend**: HTML5, Tailwind CSS (CDN), Vanilla JavaScript
- **Backend**: PHP 7.4+
- **Databáza**: SQLite 3
- **Knižnice**: 
  - jsPDF (PDF export)
  - QRCode.js (QR kódy)

## ⚙️ Konfigurácia

Všetky nastavenia sú v súbore `includes/config.php`:

```php
define('DB_PATH', __DIR__ . '/../data/chicho.db');
define('SESSION_LIFETIME', 3600 * 24); // 24 hodín
define('PASSWORD_SALT', 'chicho_2025_secure_salt');
```

## 🔒 Bezpečnosť

1. **Po seedovaní odstráňte `seed.php`**
2. Zmeňte `PASSWORD_SALT` v `includes/config.php`
3. Databázový priečinok `data/` je chránený cez `.htaccess`
4. Session tokens sú bezpečne uložené
5. SQL injection ochrana cez prepared statements

## 📝 Funkcie

✅ Prihlásenie/odhlásenie
✅ Zoznam návodov s tagmi
✅ Detail návodu s krokmi
✅ PDF export
✅ QR kódy
✅ Admin dashboard
✅ Responzívny dizajn
✅ Slovenské prostredie

## 🐛 Troubleshooting

### Chyba: "Database connection failed"
- Skontrolujte, či má priečinok `data/` oprávnenia 777
- Overte, že PDO SQLite extension je povolená v PHP

### Chyba: "500 Internal Server Error"
- Skontrolujte`.htaccess` - možno nie je podporovaný
- Overte PHP error log pre detaily

### Session nefunguje
- Overte, že PHP má povolené cookies
- Skontrolujte session storage v PHP konfigurácii

## 📞 Podpora

Pre viac informácií kontaktujte administrátora.

---

© 2025 CHICHO s.r.o. - Všetky práva vyhradené
