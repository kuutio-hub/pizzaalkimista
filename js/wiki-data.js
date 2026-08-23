/*!
 * PizzaTárcsa — wiki-data.js
 * A Tudástár tartalma. Minden szöveg saját megfogalmazás, nyilvános
 * pékségi/pizzaiolo szakirodalom (AVPN, Pizzaalkímia, Stadler Made stb.)
 * alapján összefoglalva — nem szó szerinti átvétel.
 */
const WIKI_DATA = [
  {
    id: 'lisztek',
    title: 'Lisztek',
    icon: 'wheat',
    summary: 'Magyar és olasz jelölésrendszer, fehérjetartalom, W-érték',
    html: `
      <p>A liszt kiválasztása a legtöbb pizzareceptnél nagyobb hatással van a végeredményre, mint bármelyik másik hozzávaló. Két dolog számít igazán: <strong>mennyi fehérje (sikér) van benne</strong>, és <strong>milyen finomra őrölték</strong>.</p>
      <h3>Magyar jelölés (BL, BF, réteslejsz)</h3>
      <p>A hazai lisztek betű-szám kombinációval vannak jelölve: a betű a gabonát és az őrlés típusát, a szám a hamutartalmat (nagyjából a korpa arányát) mutatja. A BL55 sima finomliszt alacsony, 9–11% körüli fehérjetartalommal — kalácshoz, palacsintához kiváló, pizzához önmagában gyakran gyenge, mert a tészta könnyen szakad, nem tartja a formáját. A BL80 kenyérliszt már erősebb sikérhálót képez, rugalmasabb, jobban bírja a nyújtást.</p>
      <h3>Olasz jelölés (00, 0, 1) és a W-érték</h3>
      <p>Az olasz rendszer a „00”, „0”, „1” jelöléssel az <em>őrlés finomságát</em> írja le (a „00” a legfinomabb, szinte korpamentes), nem a fehérjetartalmat. A liszt erősségét külön, a <strong>W-értékkel</strong> adják meg — ez azt mutatja meg, mennyi energiát bír el a tészta nyújtás közben, mielőtt elszakadna.</p>
      <table>
        <tr><th>W-érték</th><th>Jellemző fehérjetartalom</th><th>Ajánlott felhasználás</th></tr>
        <tr><td>W180–220</td><td>~9–10,5%</td><td>Gyors, rövid kelesztésű tészták</td></tr>
        <tr><td>W220–260</td><td>~10,5–12%</td><td>Nápolyi pizza, 8–24 órás kelesztés</td></tr>
        <tr><td>W260–320</td><td>~12–13,5%</td><td>Hosszú (24–72 órás) hidegkelesztés, teglia</td></tr>
        <tr><td>W320+</td><td>13,5%+</td><td>Manitoba jellegű, nagyon hosszú érlelésű vagy magas hidratációjú tészták</td></tr>
      </table>
      <p>Minél tovább kelesztesz (különösen hidegen), annál erősebb — magasabb W-értékű — lisztre van szükség, hogy a tészta ne essen szét a hosszú fermentáció alatt.</p>
      <h3>Melyik stílushoz melyik liszt?</h3>
      <ul>
        <li><strong>Nápolyi:</strong> „00”-ás liszt, 11,5–13% fehérje, W260 körül.</li>
        <li><strong>Római (tondo, ropogós):</strong> alacsonyabb fehérje (10–11,5%) is működik, mert nem a rugalmasság, hanem a ropogósság a cél.</li>
        <li><strong>Teglia / tepsis:</strong> erős liszt kell (12–13%+), mert a magas hidratáció és a hosszú kelesztés komoly gluténhálót igényel.</li>
        <li><strong>Otthoni sütő (max. 250–280°C):</strong> érdemes „00”-ás és BL80 vagy erős liszt keverékét használni, mert a hosszabb sütési idő jobban kiszárítja a tésztát, mint egy 450°C-os kemence.</li>
      </ul>
    `
  },
  {
    id: 'eleszto',
    title: 'Élesztő',
    icon: 'yeast',
    summary: 'Friss, aktív szárított, instant — és a hőmérséklet hatása',
    html: `
      <p>Háromféle kereskedelmi forgalomban kapható élesztővel találkozhatsz, és bármelyiket használhatod, ha figyelsz az átváltásra.</p>
      <table>
        <tr><th>Típus</th><th>Jellemző</th><th>Átváltás frissre</th></tr>
        <tr><td>Friss (kocka) élesztő</td><td>Nedves, hűtve tárolandó, rövid szavatosság</td><td>1× (referencia)</td></tr>
        <tr><td>Aktív szárított élesztő</td><td>Vízben feloldva aktiválandó felhasználás előtt</td><td>friss mennyiség ≈ fele</td></tr>
        <tr><td>Instant (gyors) szárított élesztő</td><td>Közvetlenül a liszthez keverhető</td><td>friss mennyiség ≈ harmada</td></tr>
      </table>
      <p>Ez az alkalmazás mindig a <strong>friss élesztő</strong> mennyiségét számolja ki elsőként, ebből vezeti le a szárított változatokat — ezért lesz konzisztens az eredmény, függetlenül attól, melyik élesztőtípust szereted használni.</p>
      <h3>Miért kell kevesebb élesztő, ha hosszabb ideig vagy hidegebben kelesztesz?</h3>
      <p>Az élesztő anyagcseréje hőmérsékletfüggő: melegben gyorsan, hidegben lassan dolgozik. Ha sok időt adsz a tésztának, kevesebb élesztő is elég ugyanahhoz a kelettséghez — sőt, a hosszabb, lassabb erjedés mélyebb, összetettebb ízt is eredményez, mert a tésztában lévő enzimek és a tejsavbaktériumok is több időt kapnak dolgozni.</p>
      <p>A számítás emögötti logikáját (a hőmérséklet-szorzót és a referenciaértéket) a Kalkulátor „i” infógombjai mindenhol megmutatják, ahol felhasználjuk.</p>
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
        <dt><strong>Biga</strong></dt><dd>Kemény, alacsony hidratációjú (~45–50%) olasz előtészta, jellemzően 12–24 órán át érlelve, hűvösebb helyen. Erős, strukturált gluténhálót ad a végső tésztának.</dd>
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
  }
];
