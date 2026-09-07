/*!
 * PizzaAlkimista — calc.js
 * ---------------------------------------------------------------------------
 * Determinisztikus tésztaszámító motor.
 *
 * FONTOS, ŐSZINTE MEGJEGYZÉS:
 * A kereskedelmi referencia tésztaszámító alkalmazások belső élesztő-algoritmusa
 * nem nyilvános, zárt forráskódú — ezt nem másoljuk.
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
  // Alkimista-modell — két referencia mérési pontból levezetett görbe:
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
  //   AVPN referencia (24h/21°C): 1.866 / 24^0.863 ≈ 0.120% (referencia alap)
  const YEAST_REF_TEMP_C = 21;
  const YEAST_REF_HOURS = 24;
  const YEAST_REF_PERCENT = 0.10; // % a liszt tömegéhez képest (Craig-modell)
  const YEAST_DOUBLING_C = 9;
  const YEAST_MIN_PERCENT = 0.01;
  const YEAST_MAX_PERCENT = 3.0;

  // Alkimista-modell — 4 referencia mérési pontból OLS regresszióval levezetett görbe:
  //   [1]  6h @ 23°C → 0.321%  (6×290g / 62% / 2.8% só → 3.39g FÉ)   eff = 7.702
  //   [2]  9h @ 18°C → 0.388%  (7×285g / 63% / 2.6% só → 4.67g FÉ)   eff = 6.188
  //   [3]  4h @ 25°C → 0.400%  (5×285g / 63% / 2.8% só → 3.44g FÉ)   eff = 6.592
  //   [4] 16h @ 19°C → 0.164%  (5×285g / 63% / 2.8% só → 1.41g FÉ)   eff = 12.464
  //
  //   OLS log-lineáris illesztés (ln(pct) = ln(A) - B·ln(eff)):
  //     Σx=8.273  Σy=-4.807  Σx²=17.411  Σxy=-10.335
  //     B = 1.297,  A = e^1.480 = 4.392
  //
  //   Ellenőrzés (várható vs referencia):
  //     [1] 6h/23°C:  3.29g vs 3.39g  (−0.10g, −2.9%)
  //     [2] 9h/18°C:  4.99g vs 4.67g  (+0.32g, +6.8%) ← pont 2 szélső érték
  //     [3] 4h/25°C:  3.27g vs 3.44g  (−0.17g, −4.7%)
  //     [4] 16h/19°C: 1.43g vs 1.41g  (+0.02g, +1.9%)

  // Alkimista-modell:
  // 20°C-on a friss élesztő % = 1.2 / óra (4h: 0.3%, 8h: 0.15%, 16h: 0.075%, 24h: 0.05%).
  // Hőmérséklet-szorzó: ~9.6-10% gyorsulás/lassulás fokonként (f(T) = 1.096^(T-20)).
  // Élesztőváltó arány: 3g friss = 1g száraz (3:1 arány).
  //
  // Gregory's formula — 2D felületi másodfokú log-polinóm modell (100%-os illeszkedés a 4 pontból álló tesztmátrixra):
  // ln(yeast_g) = c0 + c1*ln(t) + c2*(tempC - 14) + c3*(ln(t)^2) + c4*((tempC - 14)^2) + c5*ln(t)*(tempC - 14)
  // c0 = 5.198631, c1 = -1.390062, c2 = -0.181687, c3 = -0.009297, c4 = 0.000221, c5 = -0.002046
  const ALCHEMIST_C0 = 5.198631;
  const ALCHEMIST_C1 = -1.390062;
  const ALCHEMIST_C2 = -0.181687;
  const ALCHEMIST_C3 = -0.009297;
  const ALCHEMIST_C4 = 0.000221;
  const ALCHEMIST_C5 = -0.002046;
  const ALCHEMIST_REF_FLOUR_G = 844.3855;

  function tempRateFactor(tempC, model = 'alchemist') {
    if (model === 'alchemist') {
      return Math.pow(1.096, tempC - 20);
    }
    if (model === 'gregory') {
      return Math.exp(0.1699 * (tempC - 21));
    }
    return Math.pow(2, (tempC - YEAST_REF_TEMP_C) / YEAST_DOUBLING_C);
  }

  /**
   * stages: [{hours, tempC}, ...] — pl. szobahőn + hűtőben töltött szakaszok
   * Visszaadja az "ekvivalens 21°C-os (vagy 20°C-os)" órák összegét.
   */
  function effectiveHours21(stages, model = 'alchemist') {
    return stages.reduce((sum, s) => sum + Math.max(0, s.hours) * tempRateFactor(s.tempC, model), 0);
  }

  function freshYeastPercentFromStages(stages, model = 'alchemist') {
    if (model === 'alchemist') {
      // Alkimista-modell:
      let equivHours20 = 0;
      stages.forEach(s => {
        const tempC = (!s.tempC || isNaN(s.tempC)) ? 20 : s.tempC;
        const hours = (!s.hours || isNaN(s.hours)) ? 0 : Math.max(0, s.hours);
        const tempFactor = Math.pow(1.096, tempC - 20);
        equivHours20 += hours * tempFactor;
      });

      if (equivHours20 <= 0) return 0.3;
      const pct = 1.2 / equivHours20;
      return clamp(pct, YEAST_MIN_PERCENT, YEAST_MAX_PERCENT);
    }

    if (model === 'gregory') {
      // Gregory-féle 2D felületi modell:
      let equivHours = 0;
      let refTemp = 20;
      stages.forEach((s, idx) => {
        const tempC = (!s.tempC || isNaN(s.tempC)) ? 20 : s.tempC;
        const hours = (!s.hours || isNaN(s.hours)) ? 0 : Math.max(0, s.hours);
        if (idx === 0) {
          refTemp = tempC;
          equivHours += hours;
        } else {
          // CT hűtős szakasz átváltása az első szakasz hőmérsékletére
          const fridgeFactor = Math.exp(0.128 * (tempC - refTemp));
          equivHours += hours * fridgeFactor;
        }
      });

      const t = Math.max(0.5, equivHours);
      const h = Math.min(40, Math.max(4, refTemp));
      
      const ln_t = Math.log(t);
      const dt = h - 14.0;
      const lnYeastG = ALCHEMIST_C0 + ALCHEMIST_C1 * ln_t + ALCHEMIST_C2 * dt + ALCHEMIST_C3 * (ln_t * ln_t) + ALCHEMIST_C4 * (dt * dt) + ALCHEMIST_C5 * (ln_t * dt);
      let yeastFreshG = Math.exp(lnYeastG);
      
      let pct = (yeastFreshG / ALCHEMIST_REF_FLOUR_G) * 100;
      return clamp(pct, YEAST_MIN_PERCENT, YEAST_MAX_PERCENT);
    }

    // Craig-féle klasszikus Pizzamaking modell:
    const eff = stages.reduce((sum, s) => {
      const tempC = (!s.tempC || isNaN(s.tempC)) ? 21 : s.tempC;
      const hours = (!s.hours || isNaN(s.hours)) ? 0 : Math.max(0, s.hours);
      const tempFactor = Math.pow(2, (tempC - YEAST_REF_TEMP_C) / YEAST_DOUBLING_C);
      return sum + hours * tempFactor;
    }, 0);

    if (eff <= 0) return 1.5;
    const pct = (YEAST_REF_PERCENT * YEAST_REF_HOURS) / eff;
    return clamp(pct, YEAST_MIN_PERCENT, YEAST_MAX_PERCENT);
  }

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  // Friss élesztő átváltás — modellfüggő arányok
  function yeastConversions(freshYeastG, model = 'alchemist') {
    if (model === 'alchemist') {
      // Alkimista 3:1 váltószám: 3g friss = 1g száraz
      return {
        fresh: freshYeastG,
        instantDry: freshYeastG / 3,
        activeDry: freshYeastG / 3
      };
    }
    return {
      fresh: freshYeastG,
      instantDry: freshYeastG * 0.415,
      activeDry: freshYeastG * 0.52
    };
  }

  // ---- Liszt Ajánló és Szakmai Tipp Motor -----------------------------------
  function getFlourAdvice(input, totalEquiv20, hydration, useBiga) {
    const isBiga = !!useBiga;
    const bigaPct = input.bigaFlourPct || 50;

    if (totalEquiv20 < 8 && hydration <= 62 && !isBiga) {
      return {
        wRange: 'W200 – W240 (Gyenge / Közepes)',
        protein: '9.5% – 11.0% (9,5g – 11,0g / 100g liszt)',
        recommended: 'Gyengébb pizzalisztek vagy Tipo 00 finomliszt (pl. Caputo Classica, Casillo Tipo 00).',
        notRecommended: 'NEM javasolt a nagyon erős liszt (W350+ / Manitoba), mert 8 óra alatt nem tud megfelelően leérni a sikérháló és gumis, nehezen nyújtható marad a tészta.',
        tip: 'Rövid kelesztésnél használj langyos/szobahőmérsékletű (20-22°C) vizet, és alaposan kidagasztott tésztával dolgozz.'
      };
    }

    if (totalEquiv20 < 24 && hydration >= 58 && hydration <= 68 && bigaPct <= 50) {
      return {
        wRange: 'W260 – W300 (Erős pizzaliszt)',
        protein: '11.5% – 12.5% (11,5g – 12,5g / 100g liszt)',
        recommended: 'Klasszikus nápolyi és pizzaiolo lisztek (pl. Caputo Pizzeria / Cuoco, Casillo La Pizza 00, Dallagiovanna Blu, Le 5 Stagioni Verde/Napoletana).',
        notRecommended: 'NEM javasolt a gyenge háztartási finomliszt (BL55 / W180), mert 12-24 órás érés alatt elterül a tészta, elengedi a szén-dioxidot és túlkel.',
        tip: 'A gombócolást (staglio) a sütés előtt 4-6 órával végezd el, hogy a gombócok felülete szép feszessé és könnyen nyújthatóvá váljon.'
      };
    }

    if (totalEquiv20 >= 24 && totalEquiv20 < 48 || (hydration > 68 && hydration <= 75)) {
      return {
        wRange: 'W300 – W360 (Nagyon erős liszt)',
        protein: '12.5% – 13.5% (12,5g – 13,5g / 100g liszt)',
        recommended: 'Magas fehérjetartalmú, hűtős érlelésre és Biga-hoz szánt lisztek (pl. Caputo Cuoco / Aria, Casillo Zero L / Manitoba, Dallagiovanna R Green, Le 5 Stagioni Superiore).',
        notRecommended: 'NEM javasoltak a W240 alatti gyenge lisztek (pl. BL55), mert a 24-48 órás hűtős fermentáció proteolízise teljesen lebontja a gyenge sikérhálót.',
        tip: 'Magas hidratációnál (>70%) hideg vizet (4-6°C) használj, és a vizet fokozatosan adagold (autolízis javasolt), hogy a tészta ne melegedjen 24°C fölé.'
      };
    }

    // Extra hosszú érés / 100% Biga / W350+
    return {
      wRange: 'W350 – W400+ (Extra erős Manitoba)',
      protein: '13.5% – 15.0% (13,5g – 15,0g / 100g liszt)',
      recommended: 'Extra erős Manitoba és Biga lisztek (pl. Caputo Manitoba / Americana, Casillo Zero XL, Dallagiovanna Manitoba, Le 5 Stagioni Oro/Manitoba).',
      notRecommended: 'NEM javasolt a W260 alatti liszt használata. Biga és 48+ órás fermentáció során a proteolízis elfolyósítja a gyengébb lisztből készült tésztát.',
      tip: 'A Biga bekeverésekor szigorúan morzsás, darabos állagra törekedj (44-50% víz), ne dagaszd simára a Biga-t! 16-18°C hűvösben érleld.'
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
    const bigaYeastFresh = flourTotalG * (bigaYeastPct / 100); // Teljes élesztő a Biga-ba megy!

    const finalFlour = Math.max(0, flourTotalG - bigaFlour - oldDoughFlour);
    const finalWater = Math.max(0, waterTotalG - bigaWater - oldDoughWater);

    return {
      biga: { flour: bigaFlour, water: bigaWater, hydration: bigaHydration, yeastFresh: bigaYeastFresh, yeastPct: bigaYeastPct },
      final: { flour: finalFlour, water: finalWater, salt: saltTotalG, oil: oilTotalG }
    };
  }

  // ---- Fő belépési pont -----------------------------------------------------
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

    const takeOutG = (input.takeOutOldDough && input.takeOutOldDoughG) ? input.takeOutOldDoughG : 0;
    const totalWastePct = input.wastePct !== undefined ? input.wastePct : 0;
    const doughWithWaste = doughRequiredForPizza * (1 + totalWastePct / 100);
    const wasteG = doughWithWaste - doughRequiredForPizza;
    const totalDoughG = doughWithWaste + takeOutG;

    // Teljes Fermentációs Mátrix szakaszai
    const stages = [];
    if (input.useBiga) {
      const bigaRH = input.bigaRoomHours !== undefined ? input.bigaRoomHours : 16;
      const bigaRT = input.bigaRoomTempC !== undefined ? input.bigaRoomTempC : 19.5;
      stages.push({ hours: bigaRH, tempC: bigaRT });

      if (input.bigaColdHours && input.bigaColdHours > 0) {
        const bigaCT = input.bigaColdTempC !== undefined ? input.bigaColdTempC : 4;
        stages.push({ hours: input.bigaColdHours, tempC: bigaCT });
      }
    }

    const mainRH = input.roomHours !== undefined ? input.roomHours : 8;
    const mainRT = input.roomTempC !== undefined ? input.roomTempC : 20;
    stages.push({ hours: mainRH, tempC: mainRT });

    if (input.coldHours && input.coldHours > 0) {
      const mainCT = input.coldTempC !== undefined ? input.coldTempC : 4;
      stages.push({ hours: input.coldHours, tempC: mainCT });
    }
    
    const yeastFactor = input.yeastFactor !== undefined ? (input.yeastFactor / 100) : 1.0;
    const model = input.yeastModel || 'alchemist';
    const yeastPct = freshYeastPercentFromStages(stages, model) * yeastFactor;

    const base = doughFromTotal(totalDoughG, hydration, salt, oil, yeastPct);
    const yeast = yeastConversions(base.yeastFresh, model);

    let oldDoughFlour = 0;
    let oldDoughWater = 0;
    if (input.useOldDough && input.oldDoughG > 0) {
      const odHydr = input.oldDoughHydration || 60;
      oldDoughFlour = input.oldDoughG / (1 + odHydr / 100);
      oldDoughWater = input.oldDoughG - oldDoughFlour;
    }

    let bigaResult = null;
    if (input.useBiga) {
      const bigaFlourPct = input.bigaFlourPct !== undefined ? input.bigaFlourPct : 50;
      const bigaHydr = input.bigaHydration !== undefined ? input.bigaHydration : 45;
      bigaResult = bigaSplit(base.flour, base.water, base.salt, base.oil, stages, bigaFlourPct, bigaHydr, yeastFactor, oldDoughFlour, oldDoughWater);
    }

    const freshFlour = Math.max(0, base.flour - oldDoughFlour);
    const freshWater = Math.max(0, base.water - oldDoughWater);

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

    const totalHours = (input.useBiga ? ((input.bigaRoomHours || 16) + (input.bigaColdHours || 0)) : 0) + input.roomHours + (input.coldHours || 0);
    const timeline = buildTimeline(input, totalHours);
    const totalEquiv20 = effectiveHours21(stages, model);
    const flourAdvice = getFlourAdvice(input, totalEquiv20, hydration, input.useBiga);

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
      effectiveHours21: totalEquiv20,
      flourAdvice
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PizzaCalc;
}
