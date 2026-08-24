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

  function freshYeastPercentFromStages(stages, model = 'craig') {
    const eff = effectiveHours21(stages, model);
    if (eff <= 0) return YEAST_MAX_PERCENT;
    let pct = 0;
    if (model === 'alchemist') {
      // Normált Alkimista élesztőgörbe (21°C / 24h = ~0.08-0.10% friss élesztő)
      pct = 2.25 / Math.pow(eff, 1.08);
    } else {
      // Craig-féle klasszikus képlet (21°C / 24h = 0.10% friss élesztő)
      pct = (YEAST_REF_PERCENT * YEAST_REF_HOURS) / eff;
    }
    return clamp(pct, YEAST_MIN_PERCENT, YEAST_MAX_PERCENT);
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
    // Hulladék kompenzáció: Alapból 5% beépítve + a felhasználó által választott (0-5%) korrekció
    const totalWastePct = 5 + (input.wastePct || 0);
    const doughWithWaste = doughRequiredForPizza * (1 + totalWastePct / 100);
    const wasteG = doughWithWaste - doughRequiredForPizza;
    const totalDoughG = doughWithWaste + takeOutG;

    const stages = [{ hours: input.roomHours, tempC: input.roomTempC }];
    if (input.coldHours > 0) stages.push({ hours: input.coldHours, tempC: input.coldTempC });
    
    // Élesztő korrekció: Alapból +5% beépítve (1.05-ös szorzó) * a beállított élesztő tényező (70% - 130%)
    const rawYeastFactor = input.yeastFactor !== undefined ? (input.yeastFactor / 100) : 1.0;
    const yeastFactor = 1.05 * rawYeastFactor;
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
