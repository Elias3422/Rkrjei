# IPTV Reseller Panel

Kostenloses IPTV Reseller Panel mit Node.js, Express und lowdb.

## Installation

```bash
npm install
node server.js
```

## Nutzung

- Registriere dich als Benutzer
- Setze in `db.json` den Admin-User manuell (role: "admin")
- Melde dich als Admin an und lade M3U-Dateien hoch
- Benutzer können sich anmelden und ihr Dashboard sehen

---

## Hinweise

- Daten werden in `db.json` gespeichert
- M3U-Dateien liegen im `uploads/` Ordner
- `.gitignore` schützt sensible Daten und Ordner
