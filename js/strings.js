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
  leadText: 'Határozd meg az arányokat és a kelesztés fázisait. Az alkímiai képlet minden sütésnél tökéletesen reprodukálható eredményt ad.',

  // Beállítások gomb és fejléc
  settingsBtn: 'Beállítások',
  settingsTitle: 'Alkimista Beállítások',
  settingsIntro: 'Kapcsold be a kívánt technológiai modulokat a tésztarecept testreszabásához.',

  // Beállítások mezők
  settingDoughType: 'Tészta formátuma',
  settingDoughBuns: 'Normál (kerek pizza)',
  settingDoughTray: 'Tepsis pizza',
  settingLockNapolyi: 'Nápolyi stílusú értékek rögzítése (60% hidr., 2.8% só, 0% olaj)',
  settingUseOil: 'Zsiradék használata',
  settingUseBiga: 'Biga előtészta alkalmazása',
  settingUseOldDoughIn: 'Öregtészta hozzáadása (BE)',
  settingUseOldDoughOut: 'Öregtészta kivétele (KI)',
  settingUseCold: 'Alacsony hőmérsékletű fermentáció',
  settingUseSecondBall: 'Többféle gombócméret engedélyezése',
  settingSaveHistory: 'Legutóbbi értékek megjegyzése',
  settingYeastFactor: 'Élesztő mennyiség korrekciója (%)',

  // Mező feliratok (Főoldal)
  labelBallCount: 'Tésztagolyók száma',
  labelBallWeight: 'Tésztagolyó súlya (g)',
  labelBallCount2: 'További tésztagolyók száma',
  labelBallWeight2: 'További tésztagolyó súlya (g)',
  labelPanLen: 'Tepsi hossza (cm)',
  labelPanWid: 'Tepsi szélessége (cm)',
  labelGramPerM2: 'Tésztamennyiség (g/m²)',
  labelHydration: 'Hidratáció (%)',
  labelSalt: 'Só (%)',
  labelOil: 'Zsiradék (%)',
  labelRoomHours: 'Szobahőmérsékletű kelesztés (óra)',
  labelRoomTemp: 'Szoba hőmérséklete (°C)',
  labelColdHours: 'Hűtőszekrényben töltött idő (óra)',
  labelColdTemp: 'Hűtőszekrény hőmérséklete (°C)',

  // Biga részletes beállítások
  labelBigaFlourPct: 'Biga lisztaránya (% a teljes lisztből)',
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
    roomHours: '[TA - Temperatura Ambiente] A tészta szobahőmérsékleten történő kelesztési szakasza a dagasztástól a formázásig vagy a sütésig. Hatással van a gluténszerkezet és az ízek fejlődésére.',
    roomTemp: '[TA] A kelesztőhelyiség valós, mért hőmérséklete. A magasabb hőmérséklet gyorsítja az élesztőgombák aktivitását, így kevesebb élesztő (Lievito) szükséges.',
    cold: '[TC - Temperatura Controllata] Alacsony hőmérsékleten (hűtőszekrényben) történő lassított fermentáció. Hosszabb idő alatt komplexebb ízek és jobb tésztaszerkezet alakul ki.',
    biga: '[Biga] Hagyományos olasz előtészta, amely növeli a tészta szilárdságát, aromagazdagságát és javítja a bélzet szerkezetét. Saját kelesztési idővel rendelkezik.',
    hydration: '[Idratazione] A folyadék (víz) tömegaránya a liszt teljes tömegéhez képest, százalékban. A magasabb hidratáció nyitottabb bélzetet eredményez, de nehezebben kezelhető.',
    salt: '[Sale] A só mennyisége a liszt tömegéhez viszonyítva. Ízesíti a tésztát, szabályozza az élesztő működését és erősíti a gluténhálót.',
    oil: '[Olio / Strutto] Zsiradék (olívaolaj vagy sertészsír) hozzáadása a tésztához. Lágyítja a tésztaszerkezetet, javítja a nyújthatóságot és ropogósabbá teszi a héjat.',
    ballCount: 'A készíteni kívánt pizzatészták (golyók) száma.',
    ballWeight: 'Egy darab tésztagolyó tömege grammban. Egy normál nápolyi pizzához 250–280 gramm ajánlott.',
    panArea: 'A sütőtepsi belső felülete (hosszúság szorozva szélességgel).',
    gramPerM2: 'Négyzetméterenkénti tésztatömeg, ami meghatározza a tepsis pizza vastagságát és jellegét.',
    yeastFactor: 'Az élesztő arányának százalékos korrekciója. Ha egyéni preferenciád alapján csökkenteni vagy növelni szeretnéd az alapértelmezett élesztőmennyiséget.',
    oldDough: '[Pasta Riporto] Egy korábbi dagasztásból félretett, már beérett tészta. Természetes savakat, mély ízeket biztosít és javítja a tészta eltarthatóságát.'
  },

  // Eredmények feliratai
  resHeadingIngredients: 'Hozzávalók',
  resHeadingBiga: 'Biga előtészta összetétele',
  resHeadingTimeline: 'Technológiai Idővonal',
  resTotalDough: 'összes tészta',
  resTotalHours: 'óra kelesztés összesen',

  // Nyomtatási feliratok
  printTitle: 'PizzaAlkimista — Recept kártya',
  printMethodTitle: 'Elkészítési Útmutató',
  printNotesLabel: 'Saját jegyzetek',
  printFooter: 'PizzaAlkimista — A tökéletes tészta tudománya',

  // Idővonal lépések
  timelineDagasztas: 'Dagasztás',
  timelineBigaStart: 'Biga előkészítése: A liszt, víz és élesztő csomómentes összekeverése, majd az előérlelés megkezdése.',
  timelineBigaMix: 'Biga belekeverése: Az előtészta hozzáadása a fő dagasztáshoz a többi összetevővel együtt.',
  timelineGombocolas: 'Gombócolás: A tészta egyenlő részekre osztása és a tésztagolyók formázása.',
  timelineHutoBe: 'Hűtőszekrénybe helyezés: Az alacsony hőmérsékletű fermentáció megkezdése a lassú érés érdekében.',
  timelineHutoKi: 'Hűtőszekrényből kivétel: A tészta szobahőmérsékletre melegítése a sütés előtti nyújthatóságért.',
  timelineTakeOutOld: 'Öregtészta kivétele: A megadott mennyiségű tészta elkülönítése és hűtőbe tétele a következő sütéshez.',
  timelineSutes: 'Nyújtás és sütés: A tészta óvatos formázása és magas hőmérsékleten történő kisütése.',

  // Elkészítési útmutató szövege (Nyomtatólapra)
  methodSteps: {
    standard: [
      '1. DAGASZTÁS: Keverd össze a friss lisztet a sóval (és ha használsz, olajjal). Add hozzá a vizet és az élesztőt, majd dagassz addig, amíg sima, rugalmas tésztát nem kapsz.',
      '2. PIHENTETÉS: Takard le a tésztát egy nedves konyharuhával vagy tálkával, és hagyd szobahőmérsékleten pihenni a megadott ideig (érlelés első fázisa).',
      '3. GOMBÓCOLÁS: Oszd el a tésztát a megadott súlyú golyókra. Formázd őket gömbölyűre, ügyelve arra, hogy a felületük feszüljön (gombócolás).',
      '4. KÉSZRE KELESZTÉS: Helyezd a golyókat kelesztődobozba, és hagyd őket megkelni a sütésig (ha van hűtős fázis, tedd a hűtőbe, majd sütés előtt 2 órával vedd ki).'
    ],
    biga: [
      '1. BIGA ELKÉSZÍTÉSE: Keverd össze a biga lisztjét, vizét és az élesztőt lazán (ne dagassz homogénné, maradjon darabos). Hagyd érni a beállított ideig és hőmérsékleten.',
      '2. FŐ DAGASZTÁS: Tépkedd a megérett bigát apró darabokra. Add hozzá a fő dagasztás lisztjét, sóját, (olaját) és a maradék vizet. Dagassz belőle sima tésztát.',
      '3. GOMBÓCOLÁS ÉS SÜTÉS: Formázz tésztagolyókat a megadott súlyban, majd keleszd őket készre a sütés előtti szakaszig.'
    ],
    oldDough: [
      '1. ÖREGTÉSZTA BEKEVERÉSE: A dagasztás kezdetén a liszthez és vízhez add hozzá az öregtésztát is apró darabokban, majd az élesztővel együtt dagaszd össze.',
      '2. ÖREGTÉSZTA KIVÉTELE: A dagasztás befejeztével, még mielőtt a tészta kelni kezdene, vágd le és mérd ki a kiveendő öregtészta mennyiségét. Tedd jól záródó edényben a hűtőbe a következő sütésig.',
      '3. FOLYTATÁS: A megmaradt tésztát kelesztődobozban hagyd megkelni a sütés előtti szakaszig.'
    ]
  }
};
