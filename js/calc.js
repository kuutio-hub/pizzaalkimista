/*!
 * PizzaTárcsa — calc.js
 * ---------------------------------------------------------------------------
 * Determinisztikus tésztaszámító motor.
 *
 * FONTOS, ŐSZINTE MEGJEGYZÉS:
 * A kereskedelmi PizzApp+ (iOS/Android) belső élesztő-algoritmusa nem
 * nyilvános, zárt forráskódú — ezt NEM másoljuk (nem is tudnánk).
 * Ehelyett egy önmagában 100%-ig konzisztens, dokumentált, publikus
 * pékségi/pizzaiolo szakirodalomra (AVPN Nápolyi specifikáció, "baker's
 * percentage" rendszer, Q10-szerű élesztő-aktivitási hőfokgörbe) épülő
 * modellt használunk. Ugyanazok a bemenetek MINDIG ugyanazt az eredményt
 * adják — ez a lényegi elvárás (reprodukálhatóság), és ez garantált.
 *
 * Minden függvény tiszta (pure): nincs Math.random, nincs Date.now a
 * számításban, csak a paraméterektől függ.
 * ---------------------------------------------------------------------------
 */
const PizzaCalc = (() => {

  // ---- Alap konstansok (forrás: AVPN Nápolyi kézikönyv + általános
  // pékségi gyakorlat, ld. Tudástár) --------------------------------------
  const STYLE_PRESETS = {
    napolyi: {
      label: 'Nápolyi (Verace)',
      hydration: 60,     // %
      salt: 2.8,          // %
      oil: 0,              // %
      ballWeightG: 260,   // AVPN: 200-280 g
      minHydration: 55, maxHydration: 65
    },
    egyeni: {
      label: 'Személyre szabott',
      hydration: 65,
      salt: 2.6,
      oil: 1,
      ballWeightG: 260,
      minHydration: 50, maxHydration: 85
    },
    teglia: {
      label: 'Tepsis / Teglia romana',
      hydration: 75,
      salt: 2.5,
      oil: 3,
      // Forrás: Gabriele Bonci (Pizzarium) közismert szabálya — a tepsi
      // területét (cm²) egy 0,5-0,6 közötti szorzóval kell beszorozni, hogy
      // megkapjuk a szükséges tésztát grammban. Ez m²-re vetítve kb.
      // 5000-6000 g/m². Vékonyabb, ropogósabb tésztához kevesebb (~4000),
      // magasabb, focaccia-szerűhöz több (~7000-8000) is lehet.
      gramPerM2: 5500,
      minHydration: 65, maxHydration: 90
    }
  };

  // ---- Élesztő-modell -----------------------------------------------------
  // Referencia: 21°C-on, 24 óra alatt érő tészta ~0.10% friss élesztőt
  // igényel (több publikus tábla — pl. Pizzaalkímia, Stadler Made — is
  // ezt a nagyságrendet adja meg). A hőmérséklet hatását egy Q10-szerű
  // exponenciális szorzóval modellezzük: az élesztő aktivitása kb.
  // megduplázódik minden +9°C-nál (durva, de publikált közelítés).
  const YEAST_REF_TEMP_C = 21;
  const YEAST_REF_HOURS = 24;
  const YEAST_REF_PERCENT = 0.10; // % a liszt tömegéhez képest
  const YEAST_DOUBLING_C = 9;
  const YEAST_MIN_PERCENT = 0.01;
  const YEAST_MAX_PERCENT = 3.0;

  function tempRateFactor(tempC) {
    return Math.pow(2, (tempC - YEAST_REF_TEMP_C) / YEAST_DOUBLING_C);
  }

  /**
   * stages: [{hours, tempC}, ...] — pl. szobahőn + hűtőben töltött szakaszok
   * Visszaadja az "ekvivalens 21°C-os órák" összegét.
   */
  function effectiveHours21(stages) {
    return stages.reduce((sum, s) => sum + Math.max(0, s.hours) * tempRateFactor(s.tempC), 0);
  }

  function freshYeastPercentFromStages(stages) {
    const eff = effectiveHours21(stages);
    if (eff <= 0) return YEAST_MAX_PERCENT;
    const pct = YEAST_REF_PERCENT * YEAST_REF_HOURS / eff;
    return clamp(pct, YEAST_MIN_PERCENT, YEAST_MAX_PERCENT);
  }

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  // Friss élesztő átváltás — széles körben idézett arányok
  function yeastConversions(freshG) {
    return {
      fresh: freshG,
      instantDry: freshG / 3,
      activeDry: freshG / 2
    };
  }

  // ---- Tészta tömeg-matematika (baker's percentage) -----------------------
  /**
   * totalDoughG: a végső, kész tészta teljes tömege (liszt+víz+só+olaj+élesztő)
   * hydrationPct, saltPct, oilPct, yeastPct: a liszt %-ában
   */
  function doughFromTotal(totalDoughG, hydrationPct, saltPct, oilPct, yeastPct) {
    const denom = 1 + hydrationPct / 100 + saltPct / 100 + oilPct / 100 + yeastPct / 100;
    const flour = totalDoughG / denom;
    return {
      flour,
      water: flour * hydrationPct / 100,
      salt: flour * saltPct / 100,
      oil: flour * oilPct / 100,
      yeastFresh: flour * yeastPct / 100,
      totalDoughG
    };
  }

  // ---- Biga (előtészta) split ---------------------------------------------
  // Klasszikus arány: a liszt ~50%-a megy a bigába, ~45% hidratációval,
  // a maradék liszt+víz+só+olaj a "rinfresco" (végső dagasztás) fázisban.
  function bigaSplit(flourTotalG, waterTotalG, saltTotalG, oilTotalG, bigaYeastStages) {
    const bigaFlour = flourTotalG * 0.5;
    const bigaHydration = 45;
    const bigaWater = bigaFlour * bigaHydration / 100;
    const bigaYeastPct = freshYeastPercentFromStages(bigaYeastStages);
    const bigaYeastFresh = bigaFlour * bigaYeastPct / 100;

    const finalFlour = flourTotalG - bigaFlour;
    const finalWater = waterTotalG - bigaWater;

    return {
      biga: { flour: bigaFlour, water: bigaWater, hydration: bigaHydration, yeastFresh: bigaYeastFresh, yeastPct: bigaYeastPct },
      final: { flour: finalFlour, water: finalWater, salt: saltTotalG, oil: oilTotalG }
    };
  }

  // ---- Fő belépési pont -----------------------------------------------------
  /**
   * input = {
   *   style: 'napolyi' | 'egyeni' | 'teglia',
   *   ballCount, ballWeightG,           // napolyi / egyeni
   *   panAreaM2, gramPerM2,             // teglia
   *   hydration, salt, oil,             // % (egyeni / teglia szabadon; napolyi fix)
   *   roomHours, roomTempC,             // szobahős szakasz
   *   coldHours, coldTempC,             // hűtős szakasz (opcionális, 0 = nincs)
   *   useBiga: bool
   * }
   */
  function calculate(input) {
    const preset = STYLE_PRESETS[input.style];
    const hydration = input.style === 'napolyi' ? preset.hydration : clamp(input.hydration, preset.minHydration, preset.maxHydration);
    const salt = input.style === 'napolyi' ? preset.salt : input.salt;
    const oil = input.style === 'napolyi' ? preset.oil : input.oil;

    let totalDoughG, ballWeightG, ballCount, panAreaM2 = null;
    if (input.style === 'teglia') {
      panAreaM2 = input.panAreaM2;
      totalDoughG = panAreaM2 * (input.gramPerM2 || preset.gramPerM2);
      ballCount = 1;
      ballWeightG = totalDoughG;
    } else {
      ballWeightG = input.ballWeightG || preset.ballWeightG;
      ballCount = input.ballCount;
      totalDoughG = ballWeightG * ballCount;
    }

    const stages = [{ hours: input.roomHours, tempC: input.roomTempC }];
    if (input.coldHours > 0) stages.push({ hours: input.coldHours, tempC: input.coldTempC });
    const yeastPct = freshYeastPercentFromStages(stages);

    const base = doughFromTotal(totalDoughG, hydration, salt, oil, yeastPct);
    const yeast = yeastConversions(base.yeastFresh);

    let bigaResult = null;
    if (input.useBiga) {
      // A biga hosszabb, hidegebb szakaszt kap: a megadott hűtős/szobahős
      // idő 70%-át bigaérlelésnek tekintjük, konzervatív becslésként.
      const bigaStages = stages.map(s => ({ hours: s.hours * 0.7, tempC: s.tempC }));
      bigaResult = bigaSplit(base.flour, base.water, base.salt, base.oil, bigaStages);
    }

    const totalHours = input.roomHours + (input.coldHours || 0);
    const timeline = buildTimeline(input, totalHours);

    return {
      style: input.style,
      styleLabel: preset.label,
      hydration, salt, oil, yeastPct,
      ballCount, ballWeightG, panAreaM2,
      totalDoughG,
      flour: base.flour, water: base.water, saltG: base.salt, oilG: base.oil,
      yeast, // {fresh, instantDry, activeDry}
      biga: bigaResult,
      totalHours,
      timeline,
      effectiveHours21: effectiveHours21(stages)
    };
  }

  function buildTimeline(input, totalHours) {
    const items = [{ label: 'Dagasztás', h: 0 }];
    if (input.useBiga) items.push({ label: 'Biga elkészítése (érlelés kezdete)', h: 0 });
    items.push({ label: 'Gombócformázás (bulizás)', h: Math.max(0.5, input.roomHours * 0.15) });
    if (input.coldHours > 0) {
      items.push({ label: 'Hűtőbe tétel', h: input.roomHours });
      items.push({ label: 'Kivétel a hűtőből, szobahőre melegítés', h: input.roomHours + input.coldHours - 1.5 });
    }
    items.push({ label: 'Nyújtás és sütés', h: totalHours });
    return items.sort((a, b) => a.h - b.h);
  }

  return {
    STYLE_PRESETS,
    calculate,
    tempRateFactor,
    effectiveHours21,
    freshYeastPercentFromStages,
    yeastConversions,
    clamp
  };
})();
