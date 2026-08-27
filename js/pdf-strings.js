/**
 * PizzaAlkimista — js/pdf-strings.js
 * A nyomtatott / PDF receptlapokon megjelenő szövegek vázai.
 * A behelyettesített adatok (hőmérsékletek, grammok, idők) automatikusan változnak a beállítások szerint.
 */
const PizzaAlkimistaPDFStrings = {
  title: 'PizzaAlkimista — Recept',
  methodTitle: 'Elkészítési Útmutató',
  notesLabel: 'Saját jegyzetek',
  footer: 'PizzaAlkimista — A tökéletes tészta tudománya',

  // Szófelhő / Badge feliratok
  badges: {
    styleTeglia: 'Tepsis (Teglia Romana)',
    styleEgyeni: 'Kerek pizza',
    hydration: '💧 Hidratáció: {val}%',
    salt: '🧂 Só: {val}%',
    oil: '🌻 Zsiradék: {val}%',
    yeastModel: 'Modell: {val}',
    wastePct: 'Veszteségkorrekció: +{val}%',
    yeastFactor: 'Élesztőfaktor: {val}%',
    autolyse: 'Autolízis: Aktív ({val}% liszt)',
    oldDough: 'Öregtészta (Pasta Riportata): Igen',
    recommendedFlour: 'Ajánlott liszt: {val}',

    // Szakasz csoport címek
    bigaPhaseTitle: '1. Fázis: Biga Előtészta érlelése',
    mainPhaseTitleBiga: '2. Fázis: Fő tészta kelesztése',
    mainPhaseTitleDirect: 'Fermentációs Szakaszok'
  },

  // Elkészítési útmutató lépések (Template-ek)
  steps: {
    // Biga előkészítő lépés (Csak ha van Biga)
    bigaPrep: '<b>Biga előkészítése</b>: Keverj össze {bigaFlour} lisztet, {bigaWater} vizet és {bigaYeast} friss élesztőt. Keverd össze lazán, darabosra (nem homogénre). Takard le, és keleszd kontrollált környezetben ({bigaRoomTemp}) {bigaRoomHours} ideig{bigaColdSection}.',
    bigaColdSection: ' + hűtőszekrényben ({bigaColdTemp}) {bigaColdHours} ideig',

    // Fő dagasztás (Biga és Direkt tészta esetén is)
    mainMix: '<b>{mixType}</b>: {mixBigaText}Keverd össze és dolgozd össze alaposan a lisztet ({flour}), vizet ({water}), sót ({salt}){oil}{oldDough}{yeast}. Dagassz sima, szakadásmentes tésztát.',

    // Dinamikusan beillesztett rész-szövegek a mainMix lépéshez
    mixTypeBiga: 'Fő dagasztás',
    mixTypeDirect: 'Dagasztás',
    mixBigaText: 'Tépkedd apró darabokra a megérett bigát. Add hozzá a fő ',
    mixOilText: ', zsiradékot ({oil})',
    mixOldDoughText: ' és az öregtésztát ({oldDough})',
    mixYeastText: '. Az élesztő mennyisége: {yeastFresh} Friss (vagy {yeastInstant} Instant, vagy {yeastActive} Aktív szárított)',

    // Öregtészta KI mentés (Csak ha be van kapcsolva a levétel)
    oldDoughSave: '<b>Öregtészta elmentése</b>: A dagasztás végeztével azonnal mérj ki belőle {weight} tésztát, tedd jól záródó edénybe, majd hűtőszekrénybe a következő dagasztáshoz.',

    // Előkelesztés
    bulkFerment: '<b>Előkelesztés</b>: Takard le a tésztát és hagyd szobahőmérsékleten ({temp}) pihenni {duration} ideig, hogy a gluténszerkezet ellazuljon és a fermentációs gázok elinduljanak.',

    // Gombócolás
    shaping: '<b>Porciózás és előformázás</b>: Vágd a tésztát a kívánt darabokra ({buns}), formázz belőlük feszes felületű, szabályos tésztagolyókat.',

    // Hideg kelesztés (Csak ha van hűtő használva)
    coldFerment: '<b>Hideg érlelés</b>: Helyezd a gombócokat kelesztőedénybe, és keleszd a hűtőben ({temp}) {duration} ideig.',

    // Akklimatizáció hűtő után (Csak ha van hűtő használva)
    warmingUp: '<b>Sütés előtti akklimatizáció</b>: A hűtőből kivéve hagyd a gombócokat szobahőmérsékleten ({temp}) kelni további 2 órán át, hogy elérjék a megfelelő sütési hőmérsékletet és optimális nyújthatóságot.',

    // Szobahős kelesztés (Ha nincs hűtő)
    roomFerment: '<b>Készre kelesztés szobahőn</b>: Hagyd a gombócokat kelesztőedényben szobahőmérsékleten ({temp}) kelni további {duration} ideig.',

    // Sütési stílusok
    bakingTeglia: '<b>Sütés</b>: Olajozott tepsiben finoman terítsd szét a tésztát a szélekig, feltétezd ízlés szerint, majd magas hőfokú sütőben süsd készre.',
    bakingPizza: '<b>Nyújtás és Sütés</b>: Nyújtsd ki a tésztagolyót kézzel, hagyományos olasz technikával (a szélén a levegős peremet, a cornicione-t megtartva), tetszőlegesen feltétezd, és a lehető legmagasabb hőfokon (kemencében vagy pizzakövön) süsd készre.'
  }
};
