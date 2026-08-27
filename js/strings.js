/**
 * PizzaAlkimista — js/strings.js
 * 
 * Ez a fájl tartalmazza az alkalmazás összes magyar nyelvű szövegét, feliratát, magyarázatát
 * és a Tudástár tartalmát. Ezt a fájlt szabadon szerkesztheti a felhasználó a saját stílusára.
 */
const PizzaAlkimistaStrings = {
  // Brand
  brandName: 'PizzaAlkimista',
  brandSubtitle: 'A tökéletes tészta tudománya',

  // Főcímek és leírások
  mainHeading: '',
  leadText: 'Határozd meg az arányokat és az időrendet. Az alkímiai képlet minden sütésnél tökéletesen reprodukálható eredményt ad.',

  // Beállítások gomb és fejléc
  settingsBtn: 'Beállítások',
  settingsTitle: 'Alkimista Beállítások',
  settingsIntro: 'Kapcsold be a kívánt technológiai modulokat a tésztarecept testreszabásához.',

  // Beállítások mezők
  settingDoughType: 'Tészta formátuma',
  settingDoughBuns: 'Normál (kerek pizza)',
  settingDoughTray: 'Tepsis pizza',
  settingLockNapolyi: 'Nápolyi stílusú pizza értékek rögzítése (60% hidr., 2.8% só, 0% olaj)',
  settingUseOil: 'Zsiradék használata',
  settingUseBiga: 'Biga előtészta alkalmazása',
  settingUseOldDoughIn: 'Öregtészta hozzáadása',
  settingUseOldDoughOut: 'Öregtészta kivétele',
  settingUseCold: 'Alacsony hőmérsékletű fermentáció',
  settingUseSecondBall: 'Többféle buciméret engedélyezése',
  settingSaveHistory: 'Legutóbbi értékek megjegyzése',
  settingYeastFactor: 'Élesztő mennyiség korrekció (%)',

  // Mező feliratok (Főoldal)
  labelBallCount: 'Gombócok száma',
  labelBallWeight: 'Súly (g)',
  labelBallCount2: 'További bucik száma',
  labelBallWeight2: 'További bucik súlya (g)',
  labelPanLen: 'Tepsi hossza (cm)',
  labelPanWid: 'Tepsi szélessége (cm)',
  labelGramPerM2: 'Tésztamennyiség (g/m²)',
  labelHydration: 'Hidratáció',
  labelSalt: 'Só',
  labelOil: 'Zsiradék',
  labelRoomHours: 'Szobahőmérsékletű kelesztés (óra)',
  labelRoomTemp: 'Szoba hőmérséklete (°C)',
  labelColdHours: 'Hűtőszekrényben töltött idő (óra)',
  labelColdTemp: 'Hűtőszekrény hőmérséklete (°C)',

  // Biga részletes beállítások
  labelBigaFlourPct: 'Biga aránya (% a teljes lisztből)',
  labelBigaHydration: 'Biga hidratációja (%)',
  labelBigaRoomHours: 'Biga szobahőmérsékletű kelesztése (óra)',
  labelBigaRoomTemp: 'Biga kelesztési hőmérséklete (°C)',
  labelBigaUseCold: 'Biga hűtőszekrényben is érik',
  labelBigaColdHours: 'Biga hűtőszekrényben töltött ideje (óra)',
  labelBigaColdTemp: 'Biga hűtőszekrény hőmérséklete (°C)',

  // Öregtészta részletes beállítások
  labelOldDoughG: 'Öregtészta mennyisége (g)',
  labelOldDoughHydration: 'Öregtészta hidratációja (%)',
  labelTakeOutOldDoughG: 'Kiveendő öregtészta mennyisége (g)',

  // Gombok és műveletek
  btnCalculate: 'Recept kiszámítása',
  btnSave: 'Mentés a gyűjteménybe',
  btnPrint: 'Nyomtatás / PDF mentés',
  btnInstall: 'Telepítés kezdőképernyőre',
  btnBackToWiki: '← Vissza a Tudástárhoz',

  // Élesztő típusok (rövid és tisztázott feliratok)
  yeastFresh: 'Friss élesztő',
  yeastInstant: 'Instant szárított élesztő',
  yeastActive: 'Aktív szárított élesztő',

  // Info szövegek (Magyarázatok)
  infoTexts: {
    roomHours: 'A tészta szobahőmérsékleten történő kelesztési szakasza a dagasztástól a formázásig vagy a sütésig. Hatással van a gluténszerkezet és az ízek fejlődésére.',
    roomTemp: 'A kelesztőhelyiség valós, mért hőmérséklete. A magasabb hőmérséklet gyorsítja az élesztőgombák aktivitását, így kevesebb élesztő szükséges.',
    cold: 'Alacsony hőmérsékleten történő lassított fermentáció. Hosszabb idő alatt komplexebb ízek és jobb tésztaszerkezet alakul ki.',
    biga: '[Biga] Előtészta, amely növeli a tészta szilárdságát, aromagazdagságát és javítja a bélzet szerkezetét. Saját kelesztési idővel rendelkezik.',
    hydration: 'A folyadék (víz) tömegaránya a liszt teljes tömegéhez képest, százalékban. A magasabb hidratáció nyitottabb bélzetet eredményez, de nehezebben kezelhető.',
    salt: 'A só mennyisége a liszt tömegéhez viszonyítva. Ízesíti a tésztát, szabályozza az élesztő működését és erősíti a gluténhálót.',
    oil: 'Zsiradék (olívaolaj vagy sertészsír) hozzáadása a tésztához. Lágyítja a tésztaszerkezetet, javítja a nyújthatóságot és ropogósabbá teszi a héjat.',
    ballCount: 'A készíteni kívánt pizzatészták (bucik) száma.',
    ballWeight: 'Egy darab tésztagolyó tömege grammban. Egy normál pizzához 250–280 gramm ajánlott.',
    panArea: 'A sütőtepsi belső felülete (hosszúság szorozva szélességgel).',
    gramPerM2: 'Négyzetméterenkénti tésztatömeg, ami meghatározza a tepsis pizza vastagságát és jellegét.',
    yeastFactor: 'Az élesztő arányának százalékos korrekciója. Ha egyéni preferenciád alapján csökkenteni vagy növelni szeretnéd az alapértelmezett élesztőmennyiséget.',
    oldDough: 'Egy korábbi dagasztásból félretett, már beérett tészta. Természetes savakat, mély ízeket biztosít és javítja a tészta eltarthatóságát.'
  },

  // Eredmények feliratai
  resHeadingIngredients: 'Hozzávalók',
  resHeadingBiga: 'Biga előtészta összetétele',
  resHeadingTimeline: 'Technológiai Idővonal',
  resTotalDough: 'összes tészta',
  resTotalHours: 'óra kelesztés összesen',

  // Idővonal lépések
  timelineDagasztas: '',
  timelineBigaStart: 'Biga előkészítése: A liszt, víz és élesztő csomómentes összekeverése, majd az előérlelés megkezdése.',
  timelineBigaMix: 'Biga belekeverése: Az előtészta hozzáadása a fő dagasztáshoz a többi összetevővel együtt.',
  timelinePoolishStart: 'Poolish előkészítése: Liszt és víz 1:1 arányú bekeverése élesztővel (híg előtészta).',
  timelinePoolishMix: 'Poolish belekeverése: Az érett poolish hozzáadása a fő dagasztáshoz.',
  timelineGombocolas: 'Bucizás: A tészta porciózása és golyók formázása.',
  timelineHutoBe: 'Hűtőszekrénybe helyezés: Hideg kelesztési fázis megkezdése.',
  timelineHutoKi: 'Hűtőszekrényből kivétel: Sütés előtti 2 órás szobahőmérsékletű bemelegedés.',
  timelineSutes: 'Nyújtás és sütés: Formázás, feltétezés és sütés high-heat hőfokon.',

  // Felugró üzenetek (Toasts) és dialógusok
  toastSaved: 'Recept elmentve ✓',
  toastLoaded: 'Recept betöltve',
  toastDeleted: 'Recept törölve',
  toastNotificationsScheduled: '⏰ {count} db értesítés beidőzítve! Naptár bejegyzés is letöltve.',
  confirmDeleteRecipe: 'Törlöd a(z) „{name}” receptet?',
  notificationTitle: '🍕 PizzaAlkimista Emlékeztető!',
  emptyStateText: 'Még nincs mentett recepted.<br>Számolj ki egyet a Kalkulátorban!',

  // Hozzávalók nevei (Kalkuláció eredmény és Nyomtatás)
  ingFreshFlour: 'Liszt',
  ingFreshWater: 'Víz',
  ingSalt: 'Só',
  ingOliveOil: 'Olívaolaj',
  ingTakeOutOldDough: 'Kiveendő öregtészta (végén)',
  ingAutolyseFlour: 'Autolízisos liszt',
  ingAutolyseWater: 'Autolízisos víz',
  ingBigaFlour: 'Biga liszt',
  ingBigaWater: 'Biga víz',
  ingBigaYeastFresh: 'Biga élesztő (friss)',
  ingFinalFlour: 'Végső dagasztás liszt',
  ingFinalWater: 'Végső dagasztás víz'
};
