/*!
 * PizzaAlkimista — wiki-data.js
 * A Tudástár tartalma. Minden szöveg az AVPN
 * és kapcsolódó pékségi/pizzaiolo szakirodalom alapján összefoglalva.
 */
const WIKI_DATA = [
  {
    id: 'pekszazalek',
    title: 'Pékszázalék (Baker\'s percentage)',
    icon: 'book',
    summary: 'Anyaghányad-számítás a liszt tömegéhez viszonyítva',
    html: `
      <p>A <strong>pékszázalék</strong> (az angol „baker's percentage” tükörfordítása) egy olyan arányosítási módszer, amely segítségével a liszt tömegéhez (mint 100%-os alapértékhez) viszonyítva határozzuk meg a többi összetevő (víz, só, élesztő, olaj) tömegét.</p>
      <h3>Miért hasznos a pékszázalék?</h3>
      <ul>
        <li><strong>Skálázhatóság:</strong> Ránézésre megmondhatod a tészta jellegét és típusát, függetlenül a készítendő tésztagolyók számától.</li>
        <li><strong>Pontos kiszámíthatóság:</strong> Bármelyik összetevő tömegéből visszaszámolható az összes többi elem tömege.</li>
        <li><strong>Receptleírás:</strong> Mennyiségtől függetlenül, univerzálisan leírhatóak a receptek.</li>
      </ul>
      <h3>A pékszázalék képlete</h3>
      <p><em>Összetevő súlya %-ban = (Összetevő súlya / Teljes lisztmennyiség) × 100</em></p>
      <table>
        <tr><th>Összetevő</th><th>Tömeg (g)</th><th>Pékszázalék (%)</th></tr>
        <tr><td>Liszt (Összesen)</td><td>1000 g</td><td>100%</td></tr>
        <tr><td>Víz (Hidratáció)</td><td>650 g (ml)</td><td>65%</td></tr>
        <tr><td>Só</td><td>28 g</td><td>2.8%</td></tr>
        <tr><td>Friss Élesztő</td><td>1.5 g</td><td>0.15%</td></tr>
        <tr><td>Olívaolaj (opcionális)</td><td>10 g</td><td>1.0%</td></tr>
      </table>
      <p>Ha többféle lisztet használsz a receptben (pl. 00-s liszt + Semola vagy BL80), a lisztek együttes tömege képezi a 100%-os alapot!</p>
    `
  },
  {
    id: 'lisztek',
    title: 'Lisztek, W-érték és Alveográf',
    icon: 'wheat',
    summary: 'Magyar és olasz jelölésrendszer, fehérjetartalom, Chopin-Alveográf, W-érték iránytű',
    html: `
      <p>A liszt kiválasztása határozza meg leginkább a pizzatészta szerkezetét, nyújthatóságát és sütési jellegét.</p>
      
      <h3>Mi nem a liszt W-értéke?</h3>
      <ul>
        <li>Nem csupán a fehérjetartalom!</li>
        <li>Nem csupán a gluténtartalom!</li>
        <li>Nem utal a szemcseméretre!</li>
        <li>Nem utal a korpatartalomra!</li>
      </ul>
      
      <h3>Mi a W-érték és az Alveográf?</h3>
      <p>A liszt W-értékét a <strong>Chopin Alveográf</strong> nevű laboratóriumi műszerrel mérik (a tésztából fújt buborék ellenállását rögzítve):</p>
      <ul>
        <li><strong>P (Stabilitás):</strong> A tészta stabilitása és nyújtással szembeni ellenállása (szívósság).</li>
        <li><strong>L (Nyújthatóság):</strong> A tésztabuborék szakadásáig mért görbehossz.</li>
        <li><strong>P/L arány:</strong> A stabilitás és nyújthatóság aránya. <strong>Optimális tartomány: 0.4 – 0.7 között.</strong> (0.4 alatt a tészta terülős és elengedi a szén-dioxidot; 0.7 felett túlságosan szívós, gumis).</li>
        <li><strong>W (Deformációs munka):</strong> A buborék felfújásához szükséges energia. A magasabb W-érték erősebb sikérhálót és magasabb vízfelvételt jelent.</li>
      </ul>

      <h3>Liszt W-érték Iránytű</h3>
      <table>
        <tr><th>Kategória</th><th>W-érték</th><th>Fehérje</th><th>Vízfelvétel</th><th>Direkt Szobahő</th><th>Direkt Hűtő</th><th>Indirekt Hűtő</th></tr>
        <tr><td>Gyenge liszt</td><td>~W200</td><td>8 – 11 g</td><td>55 – 60%</td><td>2 – 6 óra</td><td>–</td><td>–</td></tr>
        <tr><td>Közepesen erős</td><td>~W250</td><td>10 – 13 g</td><td>58 – 63%</td><td>10 – 16 óra</td><td>24 – 36 óra</td><td>–</td></tr>
        <tr><td>Erős liszt</td><td>~W300</td><td>10 – 13 g</td><td>60 – 65%</td><td>12 – 18 óra</td><td>24 – 48 óra</td><td>24 – 48 óra</td></tr>
        <tr><td>Igen erős liszt</td><td>~W350</td><td>12.5 – 15 g</td><td>65 – 75%</td><td>–</td><td>–</td><td>36 – 72 óra</td></tr>
        <tr><td>Extra erős</td><td>W400+</td><td>13.5 – 17 g</td><td>70%+</td><td>–</td><td>–</td><td>48 – 120 óra</td></tr>
      </table>

      <h3>Olasz Liszttípusok (Grano tenero vs. Grano duro)</h3>
      <ul>
        <li><strong>Grano tenero (Puha búza):</strong> Fehér, hintőporszerű lisztek pizzához, kenyérhez.</li>
        <li><strong>Grano duro (Kemény / Durumbúza):</strong> Sárgás színű, szemcsésebb őrlemény (Semola, Semola Rimacinata). Nyújthatósága kisebb, de aromagazdag.</li>
        <li><strong>Tipo 00:</strong> Legfinomabb őrlésű, szinte korpamentes magbelső. Minimum 9% fehérje.</li>
        <li><strong>Tipo 0:</strong> Közel 70%-os kinyerési ráta. Minimum 11% fehérje. Sokoldalú pizzaliszt.</li>
        <li><strong>Tipo 1 és Tipo 2:</strong> Korpásabb, sötétebb, félbarna lisztek. Minimum 12% fehérje.</li>
        <li><strong>Farina Manitoba:</strong> Észak-amerikai keménybúzából őrölt, extra erős (W300+) liszt más lisztek javításához.</li>
      </ul>

      <h3>Ismert Olasz Malmok Lisztjeinek W-értékei</h3>
      <ul>
        <li><strong>Mulino Caputo:</strong> Classica (W220-240), 100% Grani Italiani (W250-270), Pizzeria / Cuoco (W300-320), Aria (W300-320), A metro (W310-330), Americana (W360-380).</li>
        <li><strong>Dallagiovanna:</strong> NobilGrano Blu (W290), LaNapoletana (W310), R Green (W340), Manitoba (W390).</li>
        <li><strong>Le 5 Stagioni:</strong> Classica (W200), Verde (W280), Napoletana (W300), Superiore (W330), Oro (W390), Manitoba (W410).</li>
        <li><strong>Molino Casillo:</strong> Tipo 00 (W200), La Pizza 00 (W260), Aroma Tipo 1 / La 8 (W280-300), Zero L / Manitoba (W340-350), Zero XL (W380).</li>
      </ul>
    `
  },
  {
    id: 'eleszto',
    title: 'Élesztő és Élesztő-modellek',
    icon: 'yeast',
    summary: 'Alkimista, Gregory\'s és Craig formula, élesztőátváltás (3:1 arány) és mérési trükk',
    html: `
      <p>Az élesztő adagolása a hőmérséklet, a kelesztési idő és a liszt hidratációjának függvénye.</p>
      
      <h3>Az Alkalmazás Élesztő-modelljei</h3>
      <ul>
        <li><strong>Alkimista formula:</strong> A $20^\circ\text{C}$-os referencia alapegyenleten ($p = \frac{1.2}{h}$) és $1.096^{(T-20)}$ hőmérséklet-szorzón alapuló modell. Hosszabb kelesztésnél kíméletesebb élesztőmennyiséget ad a kényelmes emészthetőségért.</li>
        <li><strong>Gregory's formula:</strong> 2D felületi másodfokú log-polinóm regressziós görbe (hajszálpontos illeszkedés mérési tesztmátrixra).</li>
        <li><strong>Craig formula:</strong> A klasszikus Pizzamaking szakmai referencia modell.</li>
      </ul>

      <h3>Élesztő-átváltás</h3>
      <p>A receptjeinkben a friss és a száraz (instant vagy aktív) élesztő váltószáma <strong>3 az 1-hez</strong>:</p>
      <p><em>3 g friss élesztő = 1 g instant / száraz élesztő (száraz = friss / 3)</em></p>

      <h3>Vizes élesztőadagolási trükk ékszermérleg nélkül</h3>
      <p>Ha nincs milligramm pontosságú ékszermérleged, de $0.5\text{ g}$ vagy $0.75\text{ g}$ élesztőt kell kimérned:</p>
      <ol>
        <li>Mérj ki <strong>10 g friss élesztőt</strong> a sima konyhai mérlegen.</li>
        <li>Oldd fel pontosan <strong>100 ml szobahőmérsékletű vízben</strong>.</li>
        <li><strong>10 ml oldat = 1 g friss élesztő!</strong> ($1\text{ ml oldat} = 0.1\text{ g}$ friss élesztő).</li>
        <li>Egy mérőpohárral vagy injekciós fecskendővel hajszálpontosan kimérheted a kívánt adagot!</li>
      </ol>
    `
  },
  {
    id: 'erleles-vs-kelesztes',
    title: 'Érlelés vs. Kelesztés és Glutén-emésztés',
    icon: 'book',
    summary: 'Amilolízis, proteolízis, gliadin oldódása, NCGS vs. Cöliákia',
    html: `
      <h3>A Kelesztés és az Érlelés Különbsége</h3>
      <dl>
        <dt><strong>Kelesztés (Fermentáció, erjedés):</strong></dt>
        <dd>A folyamat, amely során a tészta térfogata növekszik. Az élesztőgombák egyszerű cukrokat fogyasztva szén-dioxidot és alkoholt termelnek. A gázbuborékok megnövelik a tésztát.</dd>
        
        <dt><strong>Érlelés (Érés):</strong></dt>
        <dd>Enzimatikus bontófolyamatok összessége, amelyekhez nem szükséges élesztő (csak víz és liszt):
          <ul>
            <li><strong>Amilolízis:</strong> Az amiláz enzimek a keményítőt egyszerű cukrokká bontják. (Ezeket eszik meg az élesztők).</li>
            <li><strong>Proteolízis:</strong> A proteáz enzimek a glutént alkotó nagy fehérjemolekulákat bontják kisebb láncokra.</li>
            <li><strong>Lipolízis:</strong> Zsírbontási folyamatok.</li>
          </ul>
        </dd>
      </dl>

      <h3>Hogyan függ össze a Glutén, a Gliadin és az Érlelés?</h3>
      <p>A glutén két fő fehérjéből áll: <strong>gliadinból</strong> és <strong>gluteninből</strong>.</p>
      <ul>
        <li>A gluténérzékenység tüneteit főként a <strong>gliadin</strong> váltja ki.</li>
        <li>A gliadin vízben nem oldódik, de <strong>alkoholban igen</strong>!</li>
        <li>Az élesztős fermentáció során szén-dioxid mellett <strong>alkohol</strong> is termelődik, amely oldja a gliadint.</li>
        <li>A hosszú érlelés során a proteolízis és az alkoholos bontás "előemészti" a tésztát a szervezetünk számára.</li>
      </ul>

      <h3>NCGS vs. Cöliákia</h3>
      <ul>
        <li><strong>Cöliákia (Autoimmun betegség):</strong> Semmilyen körülmények között <strong>NEM fogyaszthat glutént</strong>. A hosszan érlelt vagy kovászos tészta sem lesz gluténmentes!</li>
        <li><strong>NCGS (Nem cöliákiás gluténérzékenység):</strong> A hosszan érlelt, előemésztett tészták lényegesen kevésbé terhelik a gyomrot és a bélrendszert, így jelentősen enyhíthetik a panaszokat.</li>
      </ul>
    `
  },
  {
    id: 'hidratacio',
    title: 'Hidratáció, só, olaj',
    icon: 'drop',
    summary: 'Mennyi víz, só és olaj kell a tésztába?',
    html: `
      <h3>Hidratáció</h3>
      <p>A hidratáció a víz tömege a liszt tömegéhez viszonyítva, százalékban. Minél magasabb, annál lazább, buborékosabb, nehezebben kezelhető a tészta — de annál levegősebb, könnyebben emészthető péksütemény-szerű pereme is lesz.</p>
      <ul>
        <li><strong>55–62%</strong> — könnyen kezelhető, kezdőknek ajánlott, klasszikus nápolyi tartomány alja.</li>
        <li><strong>62–70%</strong> — a legtöbb otthoni pizzasütő számára ideális kompromisszum.</li>
        <li><strong>70–85%</strong> — teglia / pan pizza tartomány, ehhez már gyakorlat és erős liszt kell.</li>
      </ul>
      <h3>Só</h3>
      <p>A só nemcsak ízesít: lassítja az élesztő munkáját és erősíti a gluténhálót. Tipikus tartomány 2,5–3% a liszt tömegéhez képest. Ennél lényegesen kevesebb íztelen, ennél lényegesen több pedig visszafogja a kelést.</p>
      <h3>Olaj</h3>
      <p>A hagyományos nápolyi receptben nincs olaj. Római és tepsis stílusnál viszont gyakori 1–4% olívaolaj hozzáadása — puhábbá, ropogósabbá teszi a tésztát, és segít a tepsiben való eloszlatásban.</p>
    `
  },
  {
    id: 'fogalmak',
    title: 'Fermentációs fogalomtár',
    icon: 'book',
    summary: 'Biga, poolish, autolízis és társaik',
    html: `
      <dl>
        <dt><strong>Direkt tészta</strong></dt><dd>Minden hozzávalót egyszerre dagasztunk össze, egyetlen kelesztési szakasszal.</dd>
        <dt><strong>Indirekt tészta / előtészta</strong></dt><dd>A liszt és a víz egy részéből (esetleg kevés élesztővel) előbb egy érett előtésztát készítünk, és csak ezután dagasztjuk be a végleges tésztát. Íz- és szerkezetgazdagabb eredményt ad.</dd>
        <dt><strong>Biga</strong></dt><dd>Kemény, alacsony hidratációjú (~44–50%) olasz előtészta, amely a teljes liszt 20%-ától egészen 100%-áig terjedhet. Jellemzően 16–18 órán át érlelik hűvös szobahőn (18–20°C) és/vagy hűtőszekrényben (4°C). A Biga-hoz mindig erős (min. W300+) Manitoba liszt javasolt, mert az enzimatikus proteolízis miatt a gyengébb lisztek gluténhálója elfolyósodna. Bekeveréskor szigorúan morzsás, darabos maradjon — ne dagaszd készre!</dd>
        <dt><strong>Poolish</strong></dt><dd>Folyékony, 100%-os hidratációjú előtészta (azonos tömegű liszt és víz), francia eredetű, enyhébb savasságot ad, mint a biga.</dd>
        <dt><strong>Autolízis</strong></dt><dd>A liszt és a víz rövid (20–60 perces) pihentetése élesztő és só nélkül, dagasztás előtt — a liszt megszívja magát vízzel, könnyebb lesz a gluténfejlesztés.</dd>
        <dt><strong>Bulizás (massa)</strong></dt><dd>Az együtt kelesztett tésztatömeg gombócokra osztása, mielőtt azok külön-külön folytatnák az érést.</dd>
        <dt><strong>Hidegkelesztés</strong></dt><dd>A tészta (vagy a gombócok) hűtőben, jellemzően 3–5°C-on történő, lassított erjedése — 24–72 óra is lehet, mélyebb ízt és jobb emészthetőséget eredményez.</dd>
        <dt><strong>Tésztahőmérséklet (DTE)</strong></dt><dd>A dagasztás után mért céltésztahőmérséklet, amit a vízhőmérséklet finomhangolásával lehet beállítani — meghatározza a kelesztés kiszámíthatóságát.</dd>
      </dl>
    `
  },
  {
    id: 'stilusok',
    title: 'Pizzastílusok',
    icon: 'pizza',
    summary: 'Nápolyi, római, teglia — mi a különbség?',
    html: `
      <h3>Nápolyi (Verace / AVPN)</h3>
      <p>Az Associazione Verace Pizza Napoletana specifikációja szerint: puha, vékony közép, magas, léggel teli, foltos („leopárdmintás”) perem. 55–65% hidratáció, kizárólag friss élesztő a hagyományos verzióban, 8–24 órás kelesztés, nagyon magas hőmérsékletű (400°C+) kemencében, 60–90 másodperc alatt sül készre.</p>
      <h3>Római — Tondo (kerek, ropogós)</h3>
      <p>Vékonyabb, ropogósabb, mint a nápolyi — gyakran tartalmaz némi olívaolajat és hosszabb, akár 48–72 órás hidegkelesztést kap.</p>
      <h3>Teglia romana / tepsis pizza</h3>
      <p>Magas hidratációjú (70–85%), tepsiben sült, hosszú kelesztésű, nagyon levegős belsejű, ropogós aljú pizza. Négyzetméterenkénti tésztatömeggel számolják, nem darabszám szerint — a köztudott „Bonci-szabály” szerint a tepsi cm²-ét egy 0,5–0,6-os szorzóval kell megszorozni, ami kb. 5000–6000 g/m²-nek felel meg.</p>
      <h3>New York style</h3>
      <p>Nagy, hajtogatható szeletek, közepes hidratáció (60–65%), gyakran kevés cukor és olaj a receptben, otthoni sütőben is jól működik.</p>
    `
  },
  {
    id: 'alkalmazas',
    title: 'Alkalmazás használata',
    icon: 'book',
    summary: 'Mit tud az app? Adatkezelés és működés',
    html: `
      <h3>Mit tud ez az app?</h3>
      <p>A PizzaAlkimista egy offline, böngészőből futtatható pizzatészta-kalkulátor. Segítségével hajszálpontosan kiszámíthatod a liszt, víz, só, élesztő és opcionális olaj mennyiségét.</p>
      <p><strong>Főbb funkciók:</strong></p>
      <ul>
        <li>Háromféle élesztőmodell: Alkimista formula, Gregory's formula és Craig formula</li>
        <li>Biga előtészta és öregtészta (Pasta Riportata) kezelése</li>
        <li>Hideg fermentáció (hűtős érlelés) órák és hőmérséklet szerinti integrációja</li>
        <li>Többféle gombócméret egyidejű hozzáadása</li>
        <li>Hulladék (veszteség) kompenzáció és élesztő-korrekció</li>
        <li>Kedvencek mentése és professzionális, nyomtatható A4-es PDF receptlap</li>
      </ul>
      <h3>Adatkezelés és adatvédelem</h3>
      <p>Nincs szerver, nincs nyomkövetés, nincs adatgyűjtés. Minden mentett recept és beállítás kizárólag a böngésződ saját offline IndexedDB és LocalStorage tárolójában marad. Az app internetkapcsolat nélkül is 100%-ban működőképes.</p>
    `
  }
];
