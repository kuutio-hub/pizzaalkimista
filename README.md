# PizzaAlkimista 🍕

Privát, magyar nyelvű, offline-képes pizzatészta-kalkulátor és technológiai tudástár (PWA).

## Főbb funkciók

- **Precíziós kalkulátor**: Nápolyi, tepsis (Teglia romana) és egyedi receptek kiszámítása.
- **Fejlett fermentáció**: Biga, Poolish és Öregtészta (Pasta Riporto) integráció.
- **Idővonal & Értesítések**: Szobahőmérsékletű és hűtős kelesztési fázisok pontos időzítése, Web Notification és `.ics` naptár export támogatással.
- **Nyomtatható Receptlap**: Elegáns A4 PDF / nyomtatási nézet.
- **Adatvédelem**: 100% offline működés, az adatok és receptek kizárólag a böngésző IndexedDB tárolójában élnek.

## Fájlstruktúra

```
index.html           — Alkalmazás felület és nézetek
manifest.webmanifest — PWA beállítások
sw.js                — Offline Service Worker cache
timeline_rules.json  — Testreszabható kelesztési szabályok
css/style.css        — Alkalmazás stílusok és responzív elrendezés
css/print.css        — A4 nyomtatási és PDF sablon
js/calc.js           — Tészta- és fermentációs számítási motor
js/db.js             — IndexedDB tároló a mentett receptekhez
js/wiki-data.js       — Tudástár adatai
js/app.js             — UI logika és navigáció
```

## Helyi futtatás

```bash
python3 serve.py
```

## Licenc

Privát, személyes projekt.

