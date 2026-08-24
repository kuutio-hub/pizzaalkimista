# PizzaAlkimista 🍕

Privát, magyar nyelvű, offline-képes pizzatészta-kalkulátor PWA. Tiszta vanilla JS/HTML/CSS — semmilyen build-lépés vagy csomagkezelő nem kell hozzá, egyből GitHub Pages-re tölthető.

## Gyors indítás — GitHub Pages

1. Hozz létre egy **privát** (vagy publikus, ha nem baj) GitHub repót, pl. `pizzaalkimista`.
2. Töltsd fel ennek a mappának a teljes tartalmát a repó gyökerébe.
3. Repó → **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` / `(root)` → Save.
4. Pár perc múlva elérhető lesz: `https://<felhasznalonev>.github.io/pizzaalkimista/`
5. Nyisd meg telefonon, majd:
   - **iOS Safari:** Megosztás → „Kezdőképernyőhöz adás”
   - **Android Chrome:** ⋮ menü → „Telepítés”

Helyi teszteléshez bármilyen statikus szerver jó, pl.:
```bash
python3 serve.py
```
(A `file://` megnyitás NEM működik jól, mert a Service Worker és az IndexedDB is HTTP(S) kontextust igényel.)

## Fájlstruktúra

```
index.html          — app shell, 4 nézet (Kalkulátor / Receptjeim / Tudástár / Infó)
manifest.webmanifest — PWA metaadatok
sw.js                — offline cache (app shell, cache-first)
css/style.css        — design tokenek, minden komponens stílusa
css/print.css        — A4 nyomtatási sablon
js/calc.js           — determinisztikus tésztaszámító motor (nincs benne DOM-kód)
js/db.js             — IndexedDB wrapper a mentett receptekhez
js/wiki-data.js       — Tudástár tartalma (liszt, élesztő, fogalmak, stílusok)
js/app.js             — UI-logika, navigáció, nyomtatás, PWA-telepítés
icons/                — SVG logó + generált PNG méretek
```

## A számítási logikáról — őszintén

A kereskedelmi PizzApp+ (iOS/Android) élesztő-algoritmusa zárt forráskódú, nem publikus — ezt technikailag nem lehet byte-pontosan lemásolni, és nem is etikus úgy tenni, mintha az lenne. Amit ehelyett kapsz: egy **teljesen dokumentált, nyilvános pékségi szakirodalomra épülő, önmagában 100%-ig konzisztens** modell (AVPN nápolyi specifikáció, baker's percentage rendszer, Q10-szerű hőmérséklet-függő élesztőaktivitás, Bonci tepsis-szabálya). Ugyanazok a bemenetek **mindig** ugyanazt az eredményt adják — ez a gyakorlatban ugyanazt a célt szolgálja (kiszámíthatóság, reprodukálhatóság), amit kértél. A pontos képletet a `js/calc.js` fájl tetején lévő kommentek és a Tudástár → Fogalomtár cikk írja le.

## Adatkezelés

Nincs backend, nincs analytics, nincs fiók. A mentett receptek kizárólag a böngésző IndexedDB tárolójában élnek, az adott eszközön.

## További fejlesztési javaslatok

Fontossági sorrendben, a jelenlegi alapokra épülve:

1. **Fotó a receptekhez** — a mentett recept kártyájához egy telefonon készült kép csatolása (base64-ként IndexedDB-be mentve), hogy vizuálisan is megkülönböztethesd a próbálkozásaidat.
2. **Napló / jegyzet mód** — minden elkészített pizzához rövid utólagos értékelés (1–5 csillag, "mit csinálnék másképp"), így idővel saját, személyre szabott tudásbázis épül.
3. **Feltét-kalkulátor** — szósz, sajt és feltétmennyiség javaslat a tésztaterület alapján, hasonló logikával mint a tésztaszámító.
4. **Magasság feletti (tengerszint feletti) korrekció** — a légnyomás hatása a kelesztési időre, opcionális GPS-alapú vagy manuális bevitellel.
5. **Többféle liszt keverése** — ha 2 lisztet keversz (pl. 70% „00” + 30% BL80), a kalkulátor számolja ki az arányos mennyiségeket és a becsült effektív W-értéket.
6. **Sütési időzítő widget** — kemence-hőmérséklet + stílus alapján ajánlott sütési idő, konyhai időzítő integrációval (Web Notifications API).
7. **Megosztás QR-kóddal** — egy recept exportálása tömörített URL-paraméterként, hogy egy másik telepített PizzaAlkimista-példányba be lehessen tölteni anélkül, hogy fiók vagy szerver kellene.
8. **Sötét/világos téma kapcsoló kézzel** — jelenleg csak a rendszerbeállítást követi (`prefers-color-scheme`), egy kézi kapcsoló kényelmesebb lehet.
9. **Egységváltás** — opcionális uncia/font mértékegység, ha nemzetközi recepteket is be szeretnél másolni.
10. **Widget / gyorsparancs** — iOS Shortcuts vagy Android widget, ami egy tárolt recepthez egyetlen érintéssel visszaviszi a hozzávalókat.

## Licenc / felhasználás

Ez a te privát, személyes projekted — szabadon módosítható, nincs benne semmilyen harmadik féltől származó védett kód vagy márkajelzés.
