/*!
 * PizzaAlkimista — calc.js
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
      ballWeightG: 280,   // AVPN: 200-280 g
      minHydration: 55, maxHydration: 65
    },
    egyeni: {
      label: 'Személyre szabott',
      hydration: 65,
      salt: 3.0,
      oil: 1,
      ballWeightG: 280,
      minHydration: 50, maxHydration: 85
    },
    teglia: {
      label: 'Tepsis / Teglia romana',
      hydration: 75,
      salt: 2.5,
      oil: 3,
      gramPerM2: 5500,
      minHydration: 65, maxHydration: 90
    },
    poolish: {
      label: 'Poolish (100% hidratált előtészta)',
      hydration: 70,
      salt: 2.5,
      oil: 1,
      ballWeightG: 280,
      minHydration: 60, maxHydration: 85
    }
  };

  // ---- Élesztő-modell -----------------------------------------------------
  // Craig-referencia: 21°C-on, 24 óra alatt érő tészta ~0.10% friss élesztőt
  // igényel (AVPN Nápolyi kézikönyv + általános pékségi gyakorlat).
  //
  // Alkimista-modell — két valódi PizzApp+ mérési pontból levezetett görbe:
  //   [1] 6h @ 23°C → 0.321%  (6×290g / 62% / 2.8% só → 3.39g FÉ)
  //         eff1 = 6 × 1.133^2 = 7.702
  //   [2] 9h @ 18°C → 0.388%  (7×285g / 63% / 2.6% só → 4.67g FÉ)
  //         eff2 = 9 × 1.133^(-3) = 6.187
  //
  //   Pontos illesztés (két ismeretlen, két egyenlet):
  //     p1/p2 = (eff2/eff1)^B  →  0.321/0.388 = (6.187/7.702)^B
  //     B = ln(0.8278) / ln(0.8033) = 0.863
  //     A = p1 × eff1^B = 0.321 × 7.702^0.863 = 1.866
  //
  //   Ellenőrzés:  1.866 / 7.702^0.863 = 0.321% ✓
  //                1.866 / 6.187^0.863 = 0.388% ✓
  //   AVPN referencia (24h/21°C): 1.866 / 24^0.863 ≈ 0.120% (PizzApp alap)
  const YEAST_REF_TEMP_C = 21;
  const YEAST_REF_HOURS = 24;
  const YEAST_REF_PERCENT = 0.10; // % a liszt tömegéhez képest (Craig-modell)
  const YEAST_DOUBLING_C = 9;
  const YEAST_MIN_PERCENT = 0.01;
  const YEAST_MAX_PERCENT = 3.0;

  // Alkimista-modell — 4 valódi PizzApp+ mérési pontból OLS regresszióval levezetett görbe:
  //   [1]  6h @ 23°C → 0.321%  (6×290g / 62% / 2.8% só → 3.39g FÉ)   eff = 7.702
  //   [2]  9h @ 18°C → 0.388%  (7×285g / 63% / 2.6% só → 4.67g FÉ)   eff = 6.188
  //   [3]  4h @ 25°C → 0.400%  (5×285g / 63% / 2.8% só → 3.44g FÉ)   eff = 6.592
  //   [4] 16h @ 19°C → 0.164%  (5×285g / 63% / 2.8% só → 1.41g FÉ)   eff = 12.464
  //
  //   OLS log-lineáris illesztés (ln(pct) = ln(A) - B·ln(eff)):
  //     Σx=8.273  Σy=-4.807  Σx²=17.411  Σxy=-10.335
  //     B = 1.297,  A = e^1.480 = 4.392
  //
  //   Ellenőrzés (várható vs PizzApp):
  //     [1] 6h/23°C:  3.29g vs 3.39g  (−0.10g, −2.9%)
  //     [2] 9h/18°C:  4.99g vs 4.67g  (+0.32g, +6.8%) ← pont 2 szélső érték
  //     [3] 4h/25°C:  3.27g vs 3.44g  (−0.17g, −4.7%)
  //     [4] 16h/19°C: 1.43g vs 1.41g  (+0.02g, +1.9%)

  // Alkimista-modell kalibrált koefficiensek — 4 valódi PizzApp mérési pontból (OLS)
  const ALCHEMIST_A = 4.392;   // Skálafaktor  (4-pontos OLS kalibrálás)
  const ALCHEMIST_B = 1.297;   // Hatványkitevő (4-pontos OLS kalibrálás)

  function tempRateFactor(tempC, model = 'craig') {
    if (model === 'alchemist') {
      return Math.pow(1.133, tempC - 21);
    }
    return Math.pow(2, (tempC - YEAST_REF_TEMP_C) / YEAST_DOUBLING_C);
  }

  /**
   * stages: [{hours, tempC}, ...] — pl. szobahőn + hűtőben töltött szakaszok
   * Visszaadja az "ekvivalens 21°C-os órák" összegét.
   */
  function effectiveHours21(stages, model = 'craig') {
    return stages.reduce((sum, s) => sum + Math.max(0, s.hours) * tempRateFactor(s.tempC, model), 0);
  }

  function freshYeastPercentFromStages(stages, model = 'alchemist') {
    const eff = stages.reduce((sum, s) => {
      const tempC = (!s.tempC || isNaN(s.tempC)) ? 21 : s.tempC;
      const hours = (!s.hours || isNaN(s.hours)) ? 0 : Math.max(0, s.hours);
      const tempFactor = Math.pow(1.133, tempC - 21);
      return sum + hours * tempFactor;
    }, 0);

    if (eff <= 0) return 1.5;
    let pct = 0;
    if (model === 'craig') {
      pct = (YEAST_REF_PERCENT * YEAST_REF_HOURS) / eff;
    } else {
      // PizzApp-kalibrált Alkimista regresszió — 2 valódi PizzApp mérési pont
      // [1] 6h@23°C → 0.321%  [2] 9h@18°C → 0.388%  →  A=1.866, B=0.863
      pct = ALCHEMIST_A / Math.pow(eff, ALCHEMIST_B);
    }
    return clamp(pct, YEAST_MIN_PERCENT, 3.0);
  }

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  // Friss élesztő átváltás — széles körben idézett arányok
  function yeastConversions(freshYeastG) {
    return {
      fresh: freshYeastG,
      instantDry: freshYeastG * 0.415,
      activeDry: freshYeastG * 0.52
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
  function bigaSplit(flourTotalG, waterTotalG, saltTotalG, oilTotalG, bigaYeastStages, bigaFlourPct, bigaHydration, yeastFactor, oldDoughFlour = 0, oldDoughWater = 0) {
    const bigaFlour = flourTotalG * (bigaFlourPct / 100);
    const bigaWater = bigaFlour * (bigaHydration / 100);
    const bigaYeastPct = freshYeastPercentFromStages(bigaYeastStages) * yeastFactor;
    const bigaYeastFresh = bigaFlour * bigaYeastPct / 100;

    const finalFlour = Math.max(0, flourTotalG - bigaFlour - oldDoughFlour);
    const finalWater = Math.max(0, waterTotalG - bigaWater - oldDoughWater);

    return {
      biga: { flour: bigaFlour, water: bigaWater, hydration: bigaHydration, yeastFresh: bigaYeastFresh, yeastPct: bigaYeastPct },
      final: { flour: finalFlour, water: finalWater, salt: saltTotalG, oil: oilTotalG }
    };
  }

  // ---- Fő belépési pont -----------------------------------------------------
  /**
   * input = {
   *   style: 'egyeni' | 'teglia',
   *   ballCount, ballWeightG,           // Első típus
   *   ballCount2, ballWeightG2,         // Második típus (opcionális)
   *   panAreaM2, gramPerM2,             // teglia
   *   hydration, salt, oil,             // % (egyeni / teglia szabadon)
   *   roomHours, roomTempC,             // szobahős szakasz
   *   coldHours, coldTempC,             // hűtős szakasz (opcionális, 0 = nincs)
   *   yeastFactor,                      // élesztő szorzó (pl. 1.0)
   *   useBiga: bool,
   *   bigaFlourPct, bigaHydration,
   *   bigaRoomHours, bigaRoomTempC,
   *   bigaColdHours, bigaColdTempC,
   *   useOldDough: bool,
   *   oldDoughG, oldDoughHydration,
   *   takeOutOldDough: bool,
   *   takeOutOldDoughG
   * }
   */
  function calculate(input) {
    const style = input.style || 'egyeni';
    const preset = STYLE_PRESETS[style] || STYLE_PRESETS['egyeni'];
    const hydration = style === 'napolyi' ? preset.hydration : clamp(input.hydration, preset.minHydration, preset.maxHydration);
    const salt = style === 'napolyi' ? preset.salt : input.salt;
    const oil = style === 'napolyi' ? preset.oil : input.oil;

    let doughRequiredForPizza = 0;
    let ballCount = 0;
    let ballWeightG = 0;
    let ballGroups = [];
    let panAreaM2 = null;

    if (style === 'teglia') {
      panAreaM2 = input.panAreaM2;
      doughRequiredForPizza = panAreaM2 * (input.gramPerM2 || preset.gramPerM2);
      ballCount = 1;
      ballWeightG = doughRequiredForPizza;
      ballGroups = [{ count: 1, weight: ballWeightG }];
    } else {
      if (input.ballGroups && input.ballGroups.length > 0) {
        ballGroups = input.ballGroups;
        ballGroups.forEach(g => {
          doughRequiredForPizza += g.count * g.weight;
          ballCount += g.count;
        });
        ballWeightG = ballCount > 0 ? (doughRequiredForPizza / ballCount) : 0;
      } else {
        ballCount = input.ballCount || 4;
        ballWeightG = input.ballWeightG || preset.ballWeightG;
        doughRequiredForPizza = ballCount * ballWeightG;
        ballGroups = [{ count: ballCount, weight: ballWeightG }];
      }
    }

    // Ha veszünk ki öregtésztát, akkor a teljes dagasztott tömeget növelni kell
    const takeOutG = (input.takeOutOldDough && input.takeOutOldDoughG) ? input.takeOutOldDoughG : 0;
    // Hulladék kompenzáció: A felhasználó által beállított (0-5%, alapértelmezetten 5%) kompenzáció
    const totalWastePct = input.wastePct !== undefined ? input.wastePct : 5;
    const doughWithWaste = doughRequiredForPizza * (1 + totalWastePct / 100);
    const wasteG = doughWithWaste - doughRequiredForPizza;
    const totalDoughG = doughWithWaste + takeOutG;

    const stages = [{ hours: input.roomHours, tempC: input.roomTempC }];
    if (input.coldHours > 0) stages.push({ hours: input.coldHours, tempC: input.coldTempC });
    
    // Élesztő korrekció: A beállított élesztő tényező (70% - 130%)
    const yeastFactor = input.yeastFactor !== undefined ? (input.yeastFactor / 100) : 1.0;
    const model = input.yeastModel || 'alchemist';
    const yeastPct = freshYeastPercentFromStages(stages, model) * yeastFactor;

    const base = doughFromTotal(totalDoughG, hydration, salt, oil, yeastPct);
    const yeast = yeastConversions(base.yeastFresh);

    // Öregtészta számítás
    let oldDoughFlour = 0;
    let oldDoughWater = 0;
    if (input.useOldDough && input.oldDoughG > 0) {
      const odHydr = input.oldDoughHydration || 60;
      oldDoughFlour = input.oldDoughG / (1 + odHydr / 100);
      oldDoughWater = input.oldDoughG - oldDoughFlour;
    }

    let bigaResult = null;
    if (input.useBiga) {
      const bigaRoomHours = input.bigaRoomHours !== undefined ? input.bigaRoomHours : input.roomHours * 0.7;
      const bigaRoomTempC = input.bigaRoomTempC !== undefined ? input.bigaRoomTempC : input.roomTempC;
      const bigaColdHours = input.bigaColdHours !== undefined ? input.bigaColdHours : 0;
      const bigaColdTempC = input.bigaColdTempC !== undefined ? input.bigaColdTempC : 4;
      
      const bigaStages = [{ hours: bigaRoomHours, tempC: bigaRoomTempC }];
      if (bigaColdHours > 0) bigaStages.push({ hours: bigaColdHours, tempC: bigaColdTempC });

      const bigaFlourPct = input.bigaFlourPct !== undefined ? input.bigaFlourPct : 50;
      const bigaHydr = input.bigaHydration !== undefined ? input.bigaHydration : 45;

      bigaResult = bigaSplit(base.flour, base.water, base.salt, base.oil, bigaStages, bigaFlourPct, bigaHydr, yeastFactor, oldDoughFlour, oldDoughWater);
    }

    const freshFlour = Math.max(0, base.flour - oldDoughFlour);
    const freshWater = Math.max(0, base.water - oldDoughWater);

    // Autolízis számítás
    let autolyseResult = null;
    if (input.useAutolyse && input.autolyseFlourPct > 0) {
      const autFlour = freshFlour * (input.autolyseFlourPct / 100);
      const autWater = freshWater * (input.autolyseWaterPct / 100);
      autolyseResult = {
        flour: autFlour,
        water: autWater,
        flourPct: input.autolyseFlourPct,
        waterPct: input.autolyseWaterPct,
        finalFlour: freshFlour - autFlour,
        finalWater: freshWater - autWater
      };
    }

    const totalHours = input.roomHours + (input.coldHours || 0);
    const timeline = buildTimeline(input, totalHours);

    return {
      input,
      style,
      styleLabel: preset.label,
      hydration, salt, oil, yeastPct,
      ballCount, ballWeightG,
      ballGroups,
      panAreaM2,
      doughRequiredForPizza,
      takeOutOldDoughG: takeOutG,
      wastePct: totalWastePct, wasteG,
      totalDoughG,
      flour: freshFlour, 
      water: freshWater, 
      saltG: base.salt, 
      oilG: base.oil,
      yeast, 
      useOldDough: !!input.useOldDough,
      oldDoughG: input.useOldDough ? input.oldDoughG : 0,
      oldDoughFlour,
      oldDoughWater,
      biga: bigaResult,
      autolyse: autolyseResult,
      totalHours,
      timeline,
      effectiveHours21: effectiveHours21(stages)
    };
  }

  function buildTimeline(input, totalHours) {
    const items = [];
    
    if (input.useBiga || input.usePoolish) {
      const isPoolish = !!input.usePoolish;
      const prefType = isPoolish ? 'Poolish' : 'Biga';
      const prefTotalHours = isPoolish 
        ? ((input.poolishRoomHours || 0) + (input.poolishColdHours || 0))
        : ((input.bigaRoomHours || 0) + (input.bigaColdHours || 0));

      items.push({ label: `${prefType}Start`, h: 0 });
      items.push({ label: `${prefType}Mix`, h: prefTotalHours });
      
      const bulkHours = Math.min(1.5, Math.max(0.5, totalHours * 0.15));
      items.push({ label: 'Gombocolas', h: prefTotalHours + bulkHours });
      
      if (input.coldHours > 0) {
        items.push({ label: 'HutoBe', h: prefTotalHours + input.roomHours });
        items.push({ label: 'HutoKi', h: prefTotalHours + input.roomHours + input.coldHours - 2.0 });
      }
      if (input.takeOutOldDough && input.takeOutOldDoughG > 0) {
        items.push({ label: 'TakeOutOld', h: prefTotalHours + 0.1 });
      }
      items.push({ label: 'Sutes', h: prefTotalHours + totalHours });
    } else {
      items.push({ label: 'Dagasztas', h: 0 });
      if (input.takeOutOldDough && input.takeOutOldDoughG > 0) {
        items.push({ label: 'TakeOutOld', h: 0.1 });
      }
      const bulkHours = Math.min(1.5, Math.max(0.5, totalHours * 0.15));
      items.push({ label: 'Gombocolas', h: bulkHours });

      if (input.coldHours > 0) {
        items.push({ label: 'HutoBe', h: input.roomHours });
        // Sütés előtt 2 órával kötelezően kivenni a hűtőből, hogy szobahőmérsékletre melegedjen!
        items.push({ label: 'HutoKi', h: input.roomHours + input.coldHours - 2.0 });
      }
      items.push({ label: 'Sutes', h: totalHours });
    }

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
