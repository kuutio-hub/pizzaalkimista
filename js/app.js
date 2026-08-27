/**
 * PizzaAlkimista — js/app.js
 * 
 * Az alkalmazás kliensoldali logikája, amely vezérli a virtuális számbillentyűzetet,
 * a beállításokat, a precíziós léptetőgombokat és a professzionális magyar szövegezést.
 */
(() => {
  'use strict';

  const fmt = (n, d = 0) => Number(n).toLocaleString('hu-HU', { maximumFractionDigits: d, minimumFractionDigits: d });
  
  // Angolszász (Imperial) mértékegységekre átszámító és formázó segédfüggvények
  const toImperial = (grams, type) => {
    if (!appSettings.useImperial) return '';
    // Liszt: 1 csésze (cup) ≈ 125 g
    if (type === 'flour') {
      const cups = grams / 125;
      return ` (${fmt(cups, 1)} csésze)`;
    }
    // Víz / Folyadék: 1 csésze (cup) ≈ 236 g
    if (type === 'water') {
      const cups = grams / 236;
      return ` (${fmt(cups, 1)} csésze)`;
    }
    // Só: 1 teáskanál (tsp) ≈ 5.7 g
    if (type === 'salt') {
      const tsp = grams / 5.7;
      return ` (${fmt(tsp, 1)} tk)`;
    }
    // Élesztő: 1 teáskanál (tsp) ≈ 3 g szárított / 9 g friss
    if (type === 'yeast') {
      const tsp = grams / 3.0; // száraz alapon
      return ` (${fmt(tsp, 1)} tk)`;
    }
    if (type === 'yeast_fresh') {
      const tsp = grams / 9.0;
      return ` (${fmt(tsp, 1)} tk)`;
    }
    // Olaj: 1 evőkanál (tbsp) ≈ 14 g
    if (type === 'oil') {
      const tbsp = grams / 14;
      return ` (${fmt(tbsp, 1)} ek)`;
    }
    return '';
  };

  const fmtG = (n, type = '') => {
    const impStr = type ? toImperial(n, type) : '';
    return `${fmt(n, 1)} g${impStr}`;
  };

  const fmtG2 = (n, type = '') => {
    const impStr = type ? toImperial(n, type) : '';
    return `${fmt(n, 2)} g${impStr}`;
  };

  // Időtartam formázása 5 perces kerekítéssel: pl. 1.35 óra -> 1ó 20p
  function formatDuration(hours) {
    if (hours <= 0) return 'most';
    let totalMinutes = Math.round(hours * 60);
    // 5 perces kerekítés a receptek olvashatóságáért
    totalMinutes = Math.round(totalMinutes / 5) * 5;
    
    if (totalMinutes < 60) {
      return totalMinutes + 'p';
    }
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}ó` + (m > 0 ? ` ${m}p` : '');
  }

  function parseDuration(str) {
    if (!str) return 0;
    str = str.trim().toLowerCase().replace(/,/g, '.');
    
    const hasO = str.includes('ó');
    const hasP = str.includes('p');
    
    if (hasO || hasP) {
      let hours = 0;
      let minutes = 0;
      
      if (hasO) {
        const parts = str.split('ó');
        hours = parseFloat(parts[0].replace(/[^0-9.]/g, '')) || 0;
        if (parts[1] && parts[1].includes('p')) {
          minutes = parseFloat(parts[1].replace(/[^0-9.]/g, '')) || 0;
        }
      } else if (hasP) {
        minutes = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
      }
      return hours + (minutes / 60);
    }
    return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
  }

  const infoDot = key => `<button type="button" class="info-dot" data-info="${key}">i</button>`;

  // ---------------------------------------------------------------------
  // Nyelvi fordítás (DOM és szövegek)
  // ---------------------------------------------------------------------
  function translateDOM() {
    document.querySelectorAll('[data-str]').forEach(el => {
      const key = el.dataset.str;
      if (PizzaAlkimistaStrings[key]) {
        if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
          el.value = PizzaAlkimistaStrings[key];
        } else {
          el.textContent = PizzaAlkimistaStrings[key];
        }
      }
    });
  }

  // ---------------------------------------------------------------------
  // Globális beállítások (LocalStorage és alapértelmezett állapot)
  // ---------------------------------------------------------------------
  const DEFAULT_SETTINGS = {
    doughFormat: 'egyeni', // 'egyeni' | 'teglia'
    lockNapolyi: false,
    useOil: false, // Alapból OFF
    useBiga: false,
    useOldDoughIn: false, // Külön be és ki opciók
    useOldDoughOut: false,
    useCold: false,
    useSecondBall: false,
    saveHistory: true,
    yeastModel: 'alchemist',
    yeastFactor: 105, // 105% = +5% élesztő korrekció (alapértelmezett)
    wastePct: 3, // 3% = állandó 3% veszteség (alapértelmezett)
    useAutolyse: false,
    autolyseFlourPct: 70,
    autolyseWaterPct: 70,
    useFahrenheit: false,
    useImperial: false,
    useLightMode: true
  };

  let appSettings = { ...DEFAULT_SETTINGS };
  let currentStyle = 'egyeni';

  function loadSettings() {
    const saved = localStorage.getItem('pizza_alkimista_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        appSettings = { ...DEFAULT_SETTINGS, ...parsed };
      } catch (e) {
        appSettings = { ...DEFAULT_SETTINGS };
      }
    }
  }

  function saveSettings() {
    localStorage.setItem('pizza_alkimista_settings', JSON.stringify(appSettings));
  }

  function applySettingsToUI() {
    const val = id => document.getElementById(id);
    const check = (id, state) => {
      const el = val(id);
      if (el) el.checked = !!state;
    };

    if (val('setting-style-select')) val('setting-style-select').value = appSettings.doughFormat;
    if (val('setting-yeast-model')) val('setting-yeast-model').value = appSettings.yeastModel;
    check('setting-lock-napolyi', appSettings.lockNapolyi);
    check('setting-use-oil', appSettings.useOil);
    check('setting-use-biga', appSettings.useBiga);
    check('setting-use-olddough-in', appSettings.useOldDoughIn);
    check('setting-use-olddough-out', appSettings.useOldDoughOut);
    check('setting-use-cold', appSettings.useCold);
    check('setting-use-secondball', appSettings.useSecondBall);
    check('setting-save-history', appSettings.saveHistory);
    check('setting-use-waste', appSettings.useWaste);
    check('setting-use-autolyse', appSettings.useAutolyse);
    check('setting-use-fahrenheit', appSettings.useFahrenheit);
    check('setting-use-imperial', appSettings.useImperial);
    check('setting-use-light-mode', appSettings.useLightMode);

    if (val('setting-waste-pct')) {
      val('setting-waste-pct').value = appSettings.wastePct !== undefined ? appSettings.wastePct : 3;
    }
    
    if (val('yeastFactor')) {
      val('yeastFactor').value = appSettings.yeastFactor !== undefined ? appSettings.yeastFactor : 105;
    }

    const warnEl = document.getElementById('yeast-factor-warn');
    if (warnEl) {
      if (appSettings.yeastFactor !== 100) {
        warnEl.textContent = `(${appSettings.yeastFactor > 100 ? '+' : ''}${appSettings.yeastFactor - 100}%)`;
      } else {
        warnEl.textContent = '(0%)';
      }
    }

    // Fény / Sötét téma kezelése
    if (appSettings.useLightMode) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }

    // Főoldali form felépítése
    currentStyle = appSettings.doughFormat;
    renderFormFields(currentStyle);

    // Feltételes szekciók elrejtése/megjelenítése
    document.getElementById('cold-fields').hidden = !appSettings.useCold;
    document.getElementById('biga-fields').hidden = !appSettings.useBiga;
    document.getElementById('olddough-in-fields').hidden = !appSettings.useOldDoughIn;
    document.getElementById('olddough-out-fields').hidden = !appSettings.useOldDoughOut;

    // Globális stepper bindolás az egész dokumentumra
    initSteppers();
  }

  // ---------------------------------------------------------------------
  // Beállítások Sheet (⚙️) kezelése
  // ---------------------------------------------------------------------
  const settingsBackdrop = document.getElementById('settings-backdrop');
  
  document.getElementById('btn-settings').addEventListener('click', () => {
    settingsBackdrop.classList.add('open');
  });

  document.getElementById('settings-close').addEventListener('click', closeSettings);
  settingsBackdrop.addEventListener('click', e => { if (e.target === settingsBackdrop) closeSettings(); });

  function closeSettings() {
    settingsBackdrop.classList.remove('open');
    appSettings.doughFormat = document.getElementById('setting-style-select').value;
    appSettings.lockNapolyi = document.getElementById('setting-lock-napolyi').checked;
    appSettings.useOil = document.getElementById('setting-use-oil').checked;
    appSettings.useBiga = document.getElementById('setting-use-biga').checked;
    appSettings.useOldDoughIn = document.getElementById('setting-use-olddough-in').checked;
    appSettings.useOldDoughOut = document.getElementById('setting-use-olddough-out').checked;
    appSettings.useCold = document.getElementById('setting-use-cold').checked;
    appSettings.useSecondBall = document.getElementById('setting-use-secondball').checked;
    appSettings.saveHistory = document.getElementById('setting-save-history').checked;
    appSettings.wastePct = parseFloat(document.getElementById('setting-waste-pct')?.value || 3);
    const prevFahr = appSettings.useFahrenheit;
    appSettings.useFahrenheit = document.getElementById('setting-use-fahrenheit')?.checked || false;
    appSettings.useImperial = document.getElementById('setting-use-imperial')?.checked || false;
    appSettings.useLightMode = document.body.classList.contains('light-theme');
    appSettings.yeastModel = document.getElementById('setting-yeast-model')?.value || 'alchemist';
    appSettings.yeastFactor = parseFloat(document.getElementById('yeastFactor')?.value || 105);
    
    saveSettings();
    if (prevFahr !== appSettings.useFahrenheit) {
      applyFahrenheitToForm();
    }
    applySettingsToUI();
    
    // Ha van már eredmény kártya, frissítsük azt is az új mértékegységek miatt
    if (lastResult) {
      renderResult(lastResult);
    }
    
    document.getElementById('result-wrap').hidden = lastResult ? false : true;
  }

  document.getElementById('useBigaCold').addEventListener('change', e => {
    document.getElementById('biga-cold-fields').hidden = !e.target.checked;
  });

  // ---------------------------------------------------------------------
  // Sliderek és Precíziós léptetőgombok live frissítése
  // ---------------------------------------------------------------------
  function updateLabel(input) {
    const out = document.getElementById(input.id + '-val');
    if (!out) return;
    let suffix = '%';
    if (input.id === 'gramPerM2') suffix = ' g/m²';
    else if (input.id.includes('Temp')) suffix = '°C';
    else if (input.id.includes('Hours')) suffix = ' óra';

    if (input.id.includes('Hours')) {
      out.textContent = formatDuration(parseFloat(input.value));
    } else {
      out.textContent = input.value + suffix;
    }
  }

  function initSteppers() {
    document.querySelectorAll('.step-btn').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "true";

      btn.addEventListener('click', e => {
        e.preventDefault();
        const inputId = btn.dataset.inputId;
        if (!inputId) return; // Dinamikus ballGroup-oknál saját kezelő van
        const dir = parseInt(btn.dataset.stepDir, 10);
        const input = document.getElementById(inputId);
        if (!input) return;

        const min = parseFloat(input.min || 0);
        const max = parseFloat(input.max || 100);
        const step = parseFloat(input.step || 1);
        
        let val;
        if (inputId.includes('Hours')) {
          val = parseDuration(input.value);
        } else {
          let valStr = input.value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
          val = parseFloat(valStr);
        }
        if (isNaN(val)) val = min;

        val = val + (dir * step);
        val = Math.round(val / step) * step; // Századpontossági float hiba elkerülése
        if (val < min) val = min;
        if (val > max) val = max;

        input.value = formatInputValue(inputId, val);
        
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  // ---------------------------------------------------------------------
  // Virtuális Számbillentyűzet (Numpad) Kezelése
  // ---------------------------------------------------------------------
  const numpad = document.getElementById('numpad');
  const numpadDisplay = document.getElementById('numpad-display-val');
  const numpadLabel = document.getElementById('numpad-label');
  let numpadTargetInput = null;
  let numpadValue = '';
  let numpadOverwriteMode = false;

  // Formázó segédfüggvény a beviteli mezők értékéhez (mértékegységek megjelenítése a mezőBEN)
  function formatInputValue(id, val) {
    if (val === undefined || val === '') return '';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    
    // Celsius / Fahrenheit
    if (id.includes('Temp')) {
      const unit = appSettings.useFahrenheit ? '°F' : '°C';
      return `${fmt(num, 1)} ${unit}`;
    }
    // Óra (kelesztés)
    if (id.includes('Hours')) {
      return formatDuration(num);
    }
    // % (hidratáció, só, olaj, biga)
    if (id === 'hydration' || id === 'salt' || id === 'oil' || id === 'bigaFlourPct' || id === 'bigaHydration') {
      return `${fmt(num, id === 'salt' ? 1 : 0)}%`;
    }
    // Grammok (súly)
    if (id === 'ballWeightG' || id.includes('Weight')) {
      return `${fmt(num, 0)} g`;
    }
    // Darab (tésztagolyók száma)
    if (id === 'ballCount' || id.includes('Count')) {
      return `${fmt(num, 0)} db`;
    }
    // Gram per négyzetméter (teglia)
    if (id === 'gramPerM2') {
      return `${fmt(num, 0)} g/m²`;
    }
    // Tepsi centiméter
    if (id === 'panLen' || id === 'panWid') {
      return `${fmt(num, 0)} cm`;
    }
    return val;
  }

  function openNumpad(inputEl) {
    numpadTargetInput = inputEl;
    let rawVal;
    if (inputEl.id.includes('Hours')) {
      rawVal = String(Math.round(parseDuration(inputEl.value) * 100) / 100);
    } else {
      rawVal = inputEl.value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    }
    numpadValue = rawVal === '0' ? '' : rawVal;
    numpadOverwriteMode = true; // Új megnyitásnál az első gombnyomás felülírja az értéket
    numpadDisplay.textContent = numpadValue || '0';
    
    const fieldParent = inputEl.closest('.field');
    const labelText = fieldParent ? fieldParent.querySelector('.field-label')?.textContent : '';
    numpadLabel.textContent = labelText ? labelText.replace(/i$/, '').trim() : 'Szám megadása';

    numpad.removeAttribute('hidden');
    numpad.classList.add('open');
    inputEl.classList.add('numpad-active');
  }

  function closeNumpad() {
    numpad.setAttribute('hidden', 'true');
    numpad.classList.remove('open');
    if (numpadTargetInput) {
      numpadTargetInput.classList.remove('numpad-active');
      let rawVal = parseFloat(numpadValue.replace(/,/g, '.').replace(/[^0-9.]/g, ''));
      if (!isNaN(rawVal)) {
        // Korlátozzuk a beírt értéket a mező min/max attribútumai szerint
        const min = parseFloat(numpadTargetInput.min);
        const max = parseFloat(numpadTargetInput.max);
        if (!isNaN(min) && rawVal < min) rawVal = min;
        if (!isNaN(max) && rawVal > max) rawVal = max;

        numpadTargetInput.value = formatInputValue(numpadTargetInput.id, rawVal);
      }
      // Triggereljük az újraszámítást a korlátozott értékkel
      numpadTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
      numpadTargetInput.dispatchEvent(new Event('change', { bubbles: true }));
      numpadTargetInput = null;
    }
  }

  document.getElementById('numpad-close').addEventListener('click', closeNumpad);
  document.getElementById('numpad-ok').addEventListener('click', closeNumpad);

  numpad.querySelector('.numpad-grid').addEventListener('click', e => {
    const btn = e.target.closest('button[data-key]');
    if (!btn || !numpadTargetInput) return;
    const key = btn.dataset.key;
    const isDecimalField = numpadTargetInput && parseFloat(numpadTargetInput.step) === 0.1;

    const isDecimalAllowed = numpadTargetInput && (parseFloat(numpadTargetInput.step) % 1 !== 0 || parseFloat(numpadTargetInput.step) === 0.5 || parseFloat(numpadTargetInput.step) === 0.1);

    if (key === 'back') {
      numpadOverwriteMode = false;
      numpadValue = numpadValue.slice(0, -1);
    } else if (key === '.') {
      if (isDecimalAllowed) {
        if (numpadOverwriteMode) {
          numpadValue = '0.';
          numpadOverwriteMode = false;
        } else if (!numpadValue.includes('.')) {
          numpadValue += numpadValue === '' ? '0.' : '.';
        }
      }
    } else {
      if (numpadOverwriteMode) {
        numpadValue = key;
        numpadOverwriteMode = false;
      } else {
        if (numpadValue.length < 6) {
          numpadValue += key;
        }
      }
    }

    numpadDisplay.textContent = numpadValue || '0';
    if (numpadTargetInput) {
      let rawVal = parseFloat(numpadValue.replace(/,/g, '.').replace(/[^0-9.]/g, ''));
      if (isNaN(rawVal)) rawVal = 0;
      
      // Korlátozzuk a beírt értéket gombnyomásonként is
      const min = parseFloat(numpadTargetInput.min);
      const max = parseFloat(numpadTargetInput.max);
      if (!isNaN(min) && rawVal < min && numpadValue.length >= String(min).length) rawVal = min;
      // Ha a beírt szám nagyobb a megengedettnél, kényszerítsük a maximumot!
      if (!isNaN(max) && rawVal > max) {
        rawVal = max;
        numpadValue = String(max);
        numpadDisplay.textContent = numpadValue;
      }
      
      numpadTargetInput.value = formatInputValue(numpadTargetInput.id, rawVal);
      // Kiváltjuk a live frissítést
      numpadTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
      numpadTargetInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  document.addEventListener('click', e => {
    // text típusú lett az összes readonly mező a mértékegységek miatt
    const input = e.target.closest('input[readonly][type="text"]');
    if (input) {
      e.preventDefault();
      openNumpad(input);
    } else {
      if (!e.target.closest('.numpad') && numpadTargetInput) {
        closeNumpad();
      }
    }
  });

  // ---------------------------------------------------------------------
  // Többféle gombócméret (Dynamic Ball Groups) kezelése
  // ---------------------------------------------------------------------
  let ballGroups = [{ id: 1, count: 4, weight: 280 }];
  let nextBallGroupId = 2;

  function renderBallGroups() {
    const container = document.getElementById('ball-groups-container');
    if (!container) return;

    container.innerHTML = ballGroups.map((g, index) => `
      <div class="row3 ball-group-row" data-id="${g.id}" style="display: grid; grid-template-columns: 1.2fr 1.2fr auto; gap: 0.6rem; align-items: end; margin-bottom: 0.8rem;">
        <div class="field" style="margin-bottom:0;">
          <label class="field-label">${index === 0 ? 'Gombócok száma' : 'További gombócok'}</label>
          <div class="mobile-stepper">
            <button type="button" class="step-btn ball-count-dec" data-id="${g.id}">◀</button>
            <input type="text" class="ball-count-input" id="ballCountRow-${g.id}" min="1" max="30" value="${formatInputValue('ballCount', g.count)}" readonly>
            <button type="button" class="step-btn ball-count-inc" data-id="${g.id}">▶</button>
          </div>
        </div>
        <div class="field" style="margin-bottom:0;">
          <label class="field-label">Súly (g)</label>
          <div class="mobile-stepper">
            <button type="button" class="step-btn ball-weight-dec" data-id="${g.id}">◀</button>
            <input type="text" class="ball-weight-input" id="ballWeightRow-${g.id}" min="150" max="500" step="10" value="${formatInputValue('ballWeightG', g.weight)}" readonly>
            <button type="button" class="step-btn ball-weight-inc" data-id="${g.id}">▶</button>
          </div>
        </div>
        <button type="button" class="icon-btn btn-del-group" style="width: 44px; height: 44px; margin-bottom:0; border-color: var(--danger); color: var(--danger);" ${ballGroups.length === 1 ? 'disabled' : ''}>🗑️</button>
      </div>
    `).join('');

    // Reacting to changes in dynamic fields
    container.querySelectorAll('.ball-group-row').forEach(row => {
      const id = parseInt(row.dataset.id, 10);
      const group = ballGroups.find(g => g.id === id);

      row.querySelector('.ball-count-input').addEventListener('input', e => {
        const cleanedVal = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 1;
        group.count = cleanedVal;
        if (appSettings.saveHistory) {
          lastInput = readInput();
          localStorage.setItem('pizza_alkimista_last_input', JSON.stringify(lastInput));
        }
      });
      row.querySelector('.ball-count-input').addEventListener('change', e => {
        const cleanedVal = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 1;
        group.count = cleanedVal;
        if (appSettings.saveHistory) {
          lastInput = readInput();
          localStorage.setItem('pizza_alkimista_last_input', JSON.stringify(lastInput));
        }
      });
      row.querySelector('.ball-weight-input').addEventListener('input', e => {
        const cleanedVal = parseFloat(e.target.value.replace(/,/g, '.').replace(/[^0-9.]/g, '')) || 280;
        group.weight = cleanedVal;
        if (appSettings.saveHistory) {
          lastInput = readInput();
          localStorage.setItem('pizza_alkimista_last_input', JSON.stringify(lastInput));
        }
      });
      row.querySelector('.ball-weight-input').addEventListener('change', e => {
        const cleanedVal = parseFloat(e.target.value.replace(/,/g, '.').replace(/[^0-9.]/g, '')) || 280;
        group.weight = cleanedVal;
        if (appSettings.saveHistory) {
          lastInput = readInput();
          localStorage.setItem('pizza_alkimista_last_input', JSON.stringify(lastInput));
        }
      });

      // Dinamikus léptetőgombok kattintáskezelője a dynamic ball listában
      row.querySelector('.ball-count-dec').addEventListener('click', e => {
        e.preventDefault();
        const input = row.querySelector('.ball-count-input');
        const currentVal = parseInt(input.value.replace(/[^0-9]/g, ''), 10) || 1;
        let val = Math.max(1, currentVal - 1);
        input.value = formatInputValue('ballCount', val);
        group.count = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      row.querySelector('.ball-count-inc').addEventListener('click', e => {
        e.preventDefault();
        const input = row.querySelector('.ball-count-input');
        const currentVal = parseInt(input.value.replace(/[^0-9]/g, ''), 10) || 1;
        let val = Math.min(30, currentVal + 1);
        input.value = formatInputValue('ballCount', val);
        group.count = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      row.querySelector('.ball-weight-dec').addEventListener('click', e => {
        e.preventDefault();
        const input = row.querySelector('.ball-weight-input');
        const currentVal = parseFloat(input.value.replace(/[^0-9.]/g, '')) || 280;
        let val = Math.max(150, currentVal - 10);
        input.value = formatInputValue('ballWeightG', val);
        group.weight = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      row.querySelector('.ball-weight-inc').addEventListener('click', e => {
        e.preventDefault();
        const input = row.querySelector('.ball-weight-input');
        const currentVal = parseFloat(input.value.replace(/[^0-9.]/g, '')) || 280;
        let val = Math.min(500, currentVal + 10);
        input.value = formatInputValue('ballWeightG', val);
        group.weight = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      row.querySelector('.btn-del-group').addEventListener('click', () => {
        if (ballGroups.length > 1) {
          ballGroups = ballGroups.filter(g => g.id !== id);
          const currentRoomTemp = document.getElementById('roomTempC')?.value;
          const currentRoomHours = document.getElementById('roomHours')?.value;
          renderBallGroups();
          if (currentRoomTemp && document.getElementById('roomTempC')) {
            document.getElementById('roomTempC').value = currentRoomTemp;
          }
          if (currentRoomHours && document.getElementById('roomHours')) {
            document.getElementById('roomHours').value = currentRoomHours;
          }
        }
      });
    });
  }

  // ---------------------------------------------------------------------
  // Form mezők generálása a formátum alapján
  // ---------------------------------------------------------------------
  function renderFormFields(style) {
    const wrap = document.getElementById('form-fields');
    if (!wrap) return;

    // Megőrizzük a jelenlegi beviteli mezők értékeit az újrarajzolás előtt
    const cleanVal = val => {
      if (!val) return undefined;
      const parsed = parseFloat(val.replace(/,/g, '.').replace(/[^0-9.]/g, ''));
      return isNaN(parsed) ? undefined : parsed;
    };
    const prevRoomTemp = document.getElementById('roomTempC')?.value || (lastInput?.roomTempC !== undefined ? (appSettings.useFahrenheit ? cToF(lastInput.roomTempC) : lastInput.roomTempC) : 21.5);
    const prevRoomHours = document.getElementById('roomHours')?.value || (lastInput?.roomHours !== undefined ? lastInput.roomHours : 5);
    const prevHydration = cleanVal(document.getElementById('hydration')?.value);
    const prevSalt = cleanVal(document.getElementById('salt')?.value);
    const prevOil = cleanVal(document.getElementById('oil')?.value);

    if (style === 'egyeni') {
      let ballGroupHtml = '';
      if (appSettings.useSecondBall) {
        ballGroupHtml = `
          <div id="ball-groups-container"></div>
          <button type="button" class="btn btn-ghost btn-sm btn-block" id="btn-add-ball-group" style="margin-top:0.4rem; margin-bottom: 1.2rem;">+ Új méret hozzáadása</button>
        `;
      } else {
        ballGroupHtml = `
          <div class="row2">
            <div class="field">
              <label class="field-label">${PizzaAlkimistaStrings.labelBallCount}</label>
              <div class="mobile-stepper">
                <button type="button" class="step-btn" data-step-dir="-1" data-input-id="ballCount">◀</button>
                <input type="text" id="ballCount" min="1" max="30" value="${formatInputValue('ballCount', 4)}" readonly>
                <button type="button" class="step-btn" data-step-dir="1" data-input-id="ballCount">▶</button>
              </div>
            </div>
            <div class="field">
              <label class="field-label">${PizzaAlkimistaStrings.labelBallWeight}</label>
              <div class="mobile-stepper">
                <button type="button" class="step-btn" data-step-dir="-1" data-input-id="ballWeightG">◀</button>
                <input type="text" id="ballWeightG" min="150" max="500" step="10" value="${formatInputValue('ballWeightG', 280)}" readonly>
                <button type="button" class="step-btn" data-step-dir="1" data-input-id="ballWeightG">▶</button>
              </div>
            </div>
          </div>
        `;
      }

      wrap.innerHTML = ballGroupHtml + `
        <div class="field">
          <label class="field-label">${PizzaAlkimistaStrings.labelHydration} ${infoDot('hydration')}</label>
          <div class="mobile-stepper">
            <button type="button" class="step-btn" data-step-dir="-1" data-input-id="hydration">◀</button>
            <input type="text" id="hydration" min="50" max="85" step="1" value="${formatInputValue('hydration', prevHydration || 64)}" readonly>
            <button type="button" class="step-btn" data-step-dir="1" data-input-id="hydration">▶</button>
          </div>
        </div>

        <div class="row2">
          <div class="field">
            <label class="field-label">${PizzaAlkimistaStrings.labelSalt} ${infoDot('salt')}</label>
            <div class="mobile-stepper">
              <button type="button" class="step-btn" data-step-dir="-1" data-input-id="salt">◀</button>
              <input type="text" id="salt" min="1" max="4" step="0.1" value="${formatInputValue('salt', prevSalt || 3.0)}" readonly>
              <button type="button" class="step-btn" data-step-dir="1" data-input-id="salt">▶</button>
            </div>
          </div>
          <div class="field" id="oil-field-wrapper" ${appSettings.useOil ? '' : 'hidden'}>
            <label class="field-label">${PizzaAlkimistaStrings.labelOil} ${infoDot('oil')}</label>
            <div class="mobile-stepper">
              <button type="button" class="step-btn" data-step-dir="-1" data-input-id="oil">◀</button>
              <input type="text" id="oil" min="0" max="6" step="0.5" value="${formatInputValue('oil', prevOil || 0)}" readonly>
              <button type="button" class="step-btn" data-step-dir="1" data-input-id="oil">▶</button>
            </div>
          </div>
        </div>
      `;

      if (appSettings.useSecondBall) {
        document.getElementById('btn-add-ball-group')?.addEventListener('click', e => {
          e.preventDefault();
          const currentRoomTemp = document.getElementById('roomTempC')?.value;
          const currentRoomHours = document.getElementById('roomHours')?.value;
          
          ballGroups.push({ id: nextBallGroupId++, count: 2, weight: 200 });
          renderBallGroups();
          
          if (currentRoomTemp && document.getElementById('roomTempC')) {
            document.getElementById('roomTempC').value = currentRoomTemp;
            updateLabel(document.getElementById('roomTempC'));
          }
          if (currentRoomHours && document.getElementById('roomHours')) {
            document.getElementById('roomHours').value = currentRoomHours;
            updateLabel(document.getElementById('roomHours'));
          }
          
          document.getElementById('calc-form')?.dispatchEvent(new Event('input', { bubbles: true }));
        });
        renderBallGroups();
      }

      if (appSettings.lockNapolyi) {
        const hyd = document.getElementById('hydration');
        const salt = document.getElementById('salt');
        const oil = document.getElementById('oil');
        if (hyd) { hyd.value = 60; hyd.disabled = true; }
        if (salt) { salt.value = 2.8; }
        if (oil) { oil.value = 0; }
      }
    } else if (style === 'teglia') {
      wrap.innerHTML = `
        <div class="row2">
          <div class="field">
            <label class="field-label">${PizzaAlkimistaStrings.labelPanLen}</label>
            <div class="mobile-stepper">
              <button type="button" class="step-btn" data-step-dir="-1" data-input-id="panLen">◀</button>
              <input type="text" id="panLen" min="10" max="100" value="${formatInputValue('panLen', 40)}" readonly>
              <button type="button" class="step-btn" data-step-dir="1" data-input-id="panLen">▶</button>
            </div>
          </div>
          <div class="field">
            <label class="field-label">${PizzaAlkimistaStrings.labelPanWid}</label>
            <div class="mobile-stepper">
              <button type="button" class="step-btn" data-step-dir="-1" data-input-id="panWid">◀</button>
              <input type="text" id="panWid" min="10" max="100" value="${formatInputValue('panWid', 30)}" readonly>
              <button type="button" class="step-btn" data-step-dir="1" data-input-id="panWid">▶</button>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="field-label">${PizzaAlkimistaStrings.labelGramPerM2} ${infoDot('gramPerM2')}</label>
          <div class="mobile-stepper">
            <button type="button" class="step-btn" data-step-dir="-1" data-input-id="gramPerM2">◀</button>
            <input type="text" id="gramPerM2" min="4000" max="8000" step="100" value="${formatInputValue('gramPerM2', 5500)}" readonly>
            <button type="button" class="step-btn" data-step-dir="1" data-input-id="gramPerM2">▶</button>
          </div>
        </div>
        <div class="field">
          <label class="field-label">${PizzaAlkimistaStrings.labelHydration} ${infoDot('hydration')}</label>
          <div class="mobile-stepper">
            <button type="button" class="step-btn" data-step-dir="-1" data-input-id="hydration">◀</button>
            <input type="text" id="hydration" min="65" max="90" step="1" value="${formatInputValue('hydration', prevHydration || 75)}" readonly>
            <button type="button" class="step-btn" data-step-dir="1" data-input-id="hydration">▶</button>
          </div>
        </div>
        <div class="row2">
          <div class="field">
            <label class="field-label">${PizzaAlkimistaStrings.labelSalt} ${infoDot('salt')}</label>
            <div class="mobile-stepper">
              <button type="button" class="step-btn" data-step-dir="-1" data-input-id="salt">◀</button>
              <input type="text" id="salt" min="1" max="4" step="0.1" value="${formatInputValue('salt', prevSalt || 2.5)}" readonly>
              <button type="button" class="step-btn" data-step-dir="1" data-input-id="salt">▶</button>
            </div>
          </div>
          <div class="field" id="oil-field-wrapper" ${appSettings.useOil ? '' : 'hidden'}>
            <label class="field-label">${PizzaAlkimistaStrings.labelOil} ${infoDot('oil')}</label>
            <div class="mobile-stepper">
              <button type="button" class="step-btn" data-step-dir="-1" data-input-id="oil">◀</button>
              <input type="text" id="oil" min="0" max="6" step="0.5" value="${formatInputValue('oil', prevOil || 3)}" readonly>
              <button type="button" class="step-btn" data-step-dir="1" data-input-id="oil">▶</button>
            </div>
          </div>
        </div>
      `;
    }
    
    // Állítsuk vissza a szobahőmérsékletet és kelesztési időt, ha változtak
    if (prevRoomTemp && document.getElementById('roomTempC')) {
      document.getElementById('roomTempC').value = prevRoomTemp;
      updateLabel(document.getElementById('roomTempC'));
    }
    if (prevRoomHours && document.getElementById('roomHours')) {
      document.getElementById('roomHours').value = prevRoomHours;
      updateLabel(document.getElementById('roomHours'));
    }

    initSteppers();
  }

  // Bind info sheet modals
  const backdrop = document.getElementById('sheet-backdrop');
  function openSheet(title, html) {
    document.getElementById('sheet-title').textContent = title;
    document.getElementById('sheet-body').innerHTML = html;
    backdrop.classList.add('open');
  }
  function closeSheet() { backdrop.classList.remove('open'); }
  document.getElementById('sheet-close').addEventListener('click', closeSheet);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeSheet(); });

  document.addEventListener('click', e => {
    const dot = e.target.closest('.info-dot');
    if (!dot) return;
    const key = dot.dataset.info;
    openSheet(PizzaAlkimistaStrings.settingsBtn, `<p>${PizzaAlkimistaStrings.infoTexts[key] || ''}</p>`);
  });

  // ---------------------------------------------------------------------
  // Számlálás és eredmény megjelenítés
  // ---------------------------------------------------------------------
  let lastResult = null, lastInput = null;

  function readInput() {
    const v = id => {
      const el = document.getElementById(id);
      if (!el) return '';
      if (id.includes('Hours')) {
        return String(parseDuration(el.value));
      }
      // A vesszőt pontra cseréljük, majd megtartjuk a számokat és a tizedespontot
      const valStr = el.value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
      return valStr;
    };
    const checked = id => !!document.getElementById(id)?.checked;
    
    const input = {
      style: currentStyle,
      roomHours: (parseFloat(v('roomHours')) && !isNaN(parseFloat(v('roomHours')))) ? parseFloat(v('roomHours')) : 8,
      roomTempC: appSettings.useFahrenheit ? fToC(parseFloat(v('roomTempC'))) : ((parseFloat(v('roomTempC')) && !isNaN(parseFloat(v('roomTempC')))) ? parseFloat(v('roomTempC')) : 22),
      yeastModel: appSettings.yeastModel || 'alchemist',
      yeastFactor: Math.min(130, Math.max(70, parseFloat(v('yeastFactor') || appSettings.yeastFactor || 100))),
      coldHours: appSettings.useCold ? parseFloat(v('coldHours') || 0) : 0,
      coldTempC: appSettings.useFahrenheit ? fToC(parseFloat(v('coldTempC') || 39)) : parseFloat(v('coldTempC') || 4),
      useBiga: appSettings.useBiga,
      useOldDough: appSettings.useOldDoughIn || appSettings.useOldDoughOut,
      takeOutOldDough: appSettings.useOldDoughOut,
      // Hulladék kompenzáció és élesztő korrekció a beállítások / alapértelmezések szerint
      wastePct: parseFloat(v('setting-waste-pct') !== undefined && v('setting-waste-pct') !== '' ? v('setting-waste-pct') : (appSettings.wastePct !== undefined ? appSettings.wastePct : 3)),
      // Autolízis
      useAutolyse: appSettings.useAutolyse,
      autolyseFlourPct: appSettings.useAutolyse ? (appSettings.autolyseFlourPct || 70) : 0,
      autolyseWaterPct: appSettings.useAutolyse ? (appSettings.autolyseWaterPct || 70) : 0
    };

    if (input.useBiga) {
      input.bigaFlourPct = parseFloat(v('bigaFlourPct') || 50);
      input.bigaHydration = parseFloat(v('bigaHydration') || 45);
      input.bigaRoomHours = parseFloat(v('bigaRoomHours') || 16);
      input.bigaRoomTempC = appSettings.useFahrenheit ? fToC(parseFloat(v('bigaRoomTempC') || 67.1)) : parseFloat(v('bigaRoomTempC') || 19.5);
      input.bigaColdHours = checked('useBigaCold') ? parseFloat(v('bigaColdHours') || 24) : 0;
      input.bigaColdTempC = appSettings.useFahrenheit ? fToC(parseFloat(v('bigaColdTempC') || 41)) : parseFloat(v('bigaColdTempC') || 5);
    }

    if (appSettings.useOldDoughIn) {
      input.oldDoughG = parseFloat(v('oldDoughG') || 100);
      input.oldDoughHydration = parseFloat(v('oldDoughHydration') || 60);
    } else {
      input.oldDoughG = 0;
      input.oldDoughHydration = 0;
    }

    if (input.takeOutOldDough) {
      input.takeOutOldDoughG = parseFloat(v('takeOutOldDoughG') || 150);
    }

    if (currentStyle === 'teglia') {
      const len = parseFloat(v('panLen')), wid = parseFloat(v('panWid'));
      input.panAreaM2 = (len / 100) * (wid / 100);
      input.gramPerM2 = parseFloat(v('gramPerM2'));
      input.hydration = parseFloat(v('hydration'));
      input.salt = parseFloat(v('salt'));
      input.oil = appSettings.useOil ? parseFloat(v('oil') || 0) : 0;
    } else {
      if (appSettings.useSecondBall) {
        input.ballGroups = [];
        const rows = document.querySelectorAll('.ball-group-row');
        rows.forEach(row => {
          const rawCount = row.querySelector('.ball-count-input')?.value.replace(/[^0-9]/g, '') || '1';
          const rawWeight = row.querySelector('.ball-weight-input')?.value.replace(/[^0-9]/g, '') || '280';
          input.ballGroups.push({ count: parseInt(rawCount, 10), weight: parseFloat(rawWeight) });
        });
        // Frissítsük a memóriában lévő tömböt is a biztonság kedvéért
        ballGroups = Array.from(rows).map((row, i) => {
          const rawCount = row.querySelector('.ball-count-input')?.value.replace(/[^0-9]/g, '') || '1';
          const rawWeight = row.querySelector('.ball-weight-input')?.value.replace(/[^0-9]/g, '') || '280';
          return {
            id: parseInt(row.dataset.id, 10) || (i + 1),
            count: parseInt(rawCount, 10),
            weight: parseFloat(rawWeight)
          };
        });
      } else {
        const count = parseInt(v('ballCount'), 10) || 4;
        const weight = parseFloat(v('ballWeightG')) || 280;
        input.ballCount = count;
        input.ballWeightG = weight;
        input.ballGroups = [{ count, weight }];
      }
      input.hydration = parseFloat(v('hydration'));
      const rawSalt = parseFloat(v('salt'));
      input.salt = (!isNaN(rawSalt) && rawSalt >= 0.5 && rawSalt <= 5.0) ? rawSalt : 2.8;
      input.oil = appSettings.useOil ? parseFloat(v('oil') || 0) : 0;
    }
    return input;
  }

  document.getElementById('calc-form').addEventListener('submit', e => {
    e.preventDefault();
    lastInput = readInput();
    if (appSettings.saveHistory) {
      localStorage.setItem('pizza_alkimista_last_input', JSON.stringify(lastInput));
    }
    lastResult = PizzaCalc.calculate(lastInput);
    renderResult(lastResult);
    document.getElementById('result-wrap').hidden = false;
    document.getElementById('result-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Hozzávalók ugrásmentes (fix szélességű) táblázata és élesztő váltás
  const YEAST_TYPES = ['fresh', 'instantDry', 'activeDry'];
  let currentYeastTypeIndex = 0;

  function getActiveYeastLabel(type) {
    if (type === 'instantDry') return PizzaAlkimistaStrings.yeastInstant;
    if (type === 'activeDry') return PizzaAlkimistaStrings.yeastActive;
    return PizzaAlkimistaStrings.yeastFresh;
  }

  function ingredientRows(r, activeYeastType = 'fresh') {
    let rows = '';
    if (r.useOldDough && r.oldDoughG > 0) {
      rows += `<tr class="accent-row"><td>Öregtészta (bevitt)</td><td class="pct"></td><td class="amt">${fmtG(r.oldDoughG, 'flour')}</td></tr>`;
    }
    
    let yeastVal = r.yeast.fresh;
    let activeYeastPct = r.yeastPct;
    let yeastTypeKey = 'yeast_fresh';
    if (activeYeastType === 'instantDry') {
      yeastVal = r.yeast.instantDry;
      activeYeastPct = r.yeastPct * 0.415;
      yeastTypeKey = 'yeast';
    } else if (activeYeastType === 'activeDry') {
      yeastVal = r.yeast.activeDry;
      activeYeastPct = r.yeastPct * 0.52;
      yeastTypeKey = 'yeast';
    }

    rows += `
      <tr><td style="width: 50%;">Friss Liszt</td><td class="pct" style="width: 22%;">100%</td><td class="amt" style="width: 28%;">${fmtG(r.flour, 'flour')}</td></tr>
      <tr><td>Friss Víz</td><td class="pct">${fmt(r.hydration, 0)}%</td><td class="amt">${fmtG(r.water, 'water')}</td></tr>
      <tr><td>Só</td><td class="pct">${fmt(r.salt, 1)}%</td><td class="amt">${fmtG(r.saltG, 'salt')}</td></tr>`;
    
    if (r.oilG > 0) {
      rows += `<tr><td>Olívaolaj</td><td class="pct">${fmt(r.oil, 1)}%</td><td class="amt">${fmtG(r.oilG, 'oil')}</td></tr>`;
    }
    
    rows += `
      <tr style="font-weight:700; color:var(--gold-dark);">
        <td>
          <div style="display:inline-flex; align-items:center; gap:0.4rem;">
            <button type="button" class="yeast-arrow-btn" id="yeast-prev">◀</button>
            <span style="font-size:0.9rem;">${getActiveYeastLabel(activeYeastType)}</span>
            <button type="button" class="yeast-arrow-btn" id="yeast-next">▶</button>
          </div>
        </td>
        <td class="pct">${fmt(activeYeastPct, 2)}%</td>
        <td class="amt">${fmtG2(yeastVal, yeastTypeKey)}</td>
      </tr>`;
    
    if (r.takeOutOldDoughG > 0) {
      rows += `<tr class="accent-row"><td>Kiveendő öregtészta (végén)</td><td></td><td class="amt">${fmtG(r.takeOutOldDoughG, 'flour')}</td></tr>`;
    }
    return rows;
  }

  // Autolízis eredmény megjelenítése
  function renderAutolyseSection(r) {
    const el = document.getElementById('autolyse-result');
    if (!el) return;
    if (r.autolyse) {
      const a = r.autolyse;
      el.hidden = false;
      el.innerHTML = `
        <div class="result-card" style="border-color: var(--accent-dim);">
          <div class="result-title">🌿 Autolízis</div>
          <table class="ing-table">
            <tr><td>Autolízisos liszt</td><td class="pct">${fmt(a.flourPct,0)}%</td><td class="amt">${fmtG(a.flour, 'flour')}</td></tr>
            <tr><td>Autolízisos víz</td><td class="pct">${fmt(a.waterPct,0)}%</td><td class="amt">${fmtG(a.water, 'water')}</td></tr>
            <tr style="opacity:0.7;font-size:.85em;"><td colspan="3">↳ pihentetés után add hozzá a maradék ${fmtG(a.finalFlour, 'flour')} lisztet, ${fmtG(a.finalWater, 'water')} vizet, sót, élesztőt</td></tr>
          </table>
        </div>`;
    } else {
      el.hidden = true;
    }
  }

  // Élesztő pörgető nyilak eseménykezelője eseménydelegálással az ing-table konténeren
  function setupYeastSwitcher() {
    const table = document.getElementById('ing-table');
    if (!table) return;

    table.addEventListener('click', e => {
      const prevBtn = e.target.closest('#yeast-prev');
      const nextBtn = e.target.closest('#yeast-next');
      if (!prevBtn && !nextBtn) return;
      
      e.preventDefault();
      const type = YEAST_TYPES[currentYeastTypeIndex];
      
      if (prevBtn) {
        currentYeastTypeIndex = (currentYeastTypeIndex - 1 + YEAST_TYPES.length) % YEAST_TYPES.length;
      } else if (nextBtn) {
        currentYeastTypeIndex = (currentYeastTypeIndex + 1) % YEAST_TYPES.length;
      }
      
      const newType = YEAST_TYPES[currentYeastTypeIndex];
      if (lastResult) {
        table.innerHTML = ingredientRows(lastResult, newType);
      }
    });
  }

  function renderResult(r) {
    document.getElementById('res-style').textContent = r.style === 'teglia' ? PizzaAlkimistaStrings.settingDoughTray : PizzaAlkimistaStrings.settingDoughBuns;
    document.getElementById('res-total').innerHTML = `${fmt(r.totalDoughG, 0)} g <span>${PizzaAlkimistaStrings.resTotalDough}</span>`;
    
    let meta = '';
    if (r.style === 'teglia') {
      meta = `${fmt(r.panAreaM2, 2)} m² tepsi`;
    } else {
      meta = r.ballGroups.map(g => `${g.count} × ${fmt(g.weight, 0)} g`).join(' + ');
      meta += ' gombóc';
    }
    document.getElementById('res-meta').textContent = `${meta} · ${formatDuration(r.totalHours)} ${PizzaAlkimistaStrings.resTotalHours}`;

    const type = YEAST_TYPES[currentYeastTypeIndex];
    document.getElementById('ing-table').innerHTML = ingredientRows(r, type);

    const bigaCard = document.getElementById('biga-card');
    if (r.biga) {
      bigaCard.hidden = false;
      document.getElementById('biga-table').innerHTML = `
        <tr><td style="width: 55%;">Biga liszt</td><td class="pct" style="width: 20%;">${fmt((r.biga.biga.flour / (r.flour + r.oldDoughFlour)) * 100, 0)}%</td><td class="amt" style="width: 25%;">${fmtG(r.biga.biga.flour, 'flour')}</td></tr>
        <tr><td>Biga víz</td><td class="pct">${r.biga.biga.hydration}%</td><td class="amt">${fmtG(r.biga.biga.water, 'water')}</td></tr>
        <tr><td>Biga élesztő (friss)</td><td class="pct">${fmt(r.biga.biga.yeastPct, 2)}%</td><td class="amt">${fmtG2(r.biga.biga.yeastFresh, 'yeast_fresh')}</td></tr>
        <tr><td>Végső dagasztás liszt</td><td></td><td class="amt">${fmtG(r.biga.final.flour, 'flour')}</td></tr>
        <tr><td>Végső dagasztás víz</td><td></td><td class="amt">${fmtG(r.biga.final.water, 'water')}</td></tr>`;
    } else {
      bigaCard.hidden = true;
    }

    // Az idővonal csak a nyomtatott recepten jelenik meg (printRecipe függvény kezeli)
    renderAutolyseSection(r);
  }

  // ---------------------------------------------------------------------
  // Kelesztési Emlékeztetők & Értesítések (Web Notification & Calendar ICS)
  // ---------------------------------------------------------------------
  function scheduleTimelineNotifications() {
    if (!lastResult || !lastResult.timeline) return;

    if (!("Notification" in window)) {
      exportTimelineToICS(lastResult);
      return;
    }

    if (Notification.permission === "granted") {
      setupScheduledNotifications(lastResult);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setupScheduledNotifications(lastResult);
        } else {
          exportTimelineToICS(lastResult);
        }
      });
    } else {
      exportTimelineToICS(lastResult);
    }
  }

  function setupScheduledNotifications(r) {
    const now = Date.now();
    let count = 0;
    r.timeline.forEach(item => {
      if (item.h > 0) {
        const delayMs = item.h * 3600 * 1000;
        const translationKey = 'timeline' + item.label;
        const desc = PizzaAlkimistaStrings[translationKey] || item.label;
        
        setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification("🍕 PizzaAlkimista Emlékeztető!", {
              body: desc,
              icon: "icons/icon-192.png",
              badge: "icons/icon-32.png"
            });
          }
        }, delayMs);
        count++;
      }
    });

    showToast(`⏰ ${count} db értesítés beidőzítve! Naptár bejegyzés is letöltve.`);
    exportTimelineToICS(r);
  }

  function exportTimelineToICS(r) {
    const startTime = new Date();
    let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//PizzaAlkimista//PWA//HU\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n";

    r.timeline.forEach(item => {
      if (item.h > 0) {
        const eventTime = new Date(startTime.getTime() + item.h * 3600 * 1000);
        const formatICSDate = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const translationKey = 'timeline' + item.label;
        const desc = PizzaAlkimistaStrings[translationKey] || item.label;

        icsContent += "BEGIN:VEVENT\r\n";
        icsContent += `SUMMARY:🍕 PizzaAlkimista: ${item.label}\r\n`;
        icsContent += `DESCRIPTION:${desc.replace(/\n/g, ' ')}\r\n`;
        icsContent += `DTSTART:${formatICSDate(eventTime)}\r\n`;
        icsContent += `DTEND:${formatICSDate(new Date(eventTime.getTime() + 15 * 60 * 1000))}\r\n`;
        icsContent += "STATUS:CONFIRMED\r\n";
        icsContent += "END:VEVENT\r\n";
      }
    });

    icsContent += "END:VCALENDAR\r\n";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pizza_kelesztesi_idovonal.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  document.getElementById('btn-schedule-notifications')?.addEventListener('click', scheduleTimelineNotifications);

  // ---------------------------------------------------------------------
  // Recept mentése és gyűjtemény
  // ---------------------------------------------------------------------
  document.getElementById('btn-save').addEventListener('click', async () => {
    if (!lastResult) return;
    const nameToggle = document.getElementById('toggle-recipe-name');
    const name = (nameToggle && nameToggle.checked)
      ? (document.getElementById('recipe-title-input').value.trim() || "Gregory's Special")
      : "Gregory's Special";
    await PizzaDB.save({ name, input: lastInput, result: lastResult });
    showToast('Recept elmentve ✓');
    renderRecipeList();
  });

  async function renderRecipeList() {
    const listEl = document.getElementById('recipe-list');
    if (!listEl) return;
    const recipes = await PizzaDB.getAll();
    if (!recipes.length) {
      listEl.innerHTML = `<div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.5 4.5 3 1-1.5 2.5-3 4.5-3C19 5 21.5 8.5 19.5 12.5 17 16.65 12 21 12 21z"/></svg>
        <p>Még nincs mentett recepted.<br>Számolj ki egyet a Kalkulátorban!</p>
      </div>`;
      return;
    }
    listEl.innerHTML = recipes.map(rec => `
      <div class="recipe-item" data-id="${rec.id}">
        <div class="thumb"></div>
        <div class="info">
          <h4>${escapeHtml(rec.name)}</h4>
          <div class="sub">${rec.result.styleLabel} · ${fmtG(rec.result.totalDoughG)} · ${new Date(rec.createdAt).toLocaleDateString('hu-HU')}</div>
        </div>
        <div class="actions">
          <button class="icon-btn btn-sm act-load" style="width:34px;height:34px" title="Betöltés">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          <button class="icon-btn btn-sm act-download-pdf" style="width:34px;height:34px" title="PDF Letöltése">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button class="icon-btn btn-sm act-del" style="width:34px;height:34px" title="Törlés">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  const recipeList = document.getElementById('recipe-list');
  if (recipeList) {
    recipeList.addEventListener('click', async e => {
      const item = e.target.closest('.recipe-item');
      if (!item) return;
      const id = item.dataset.id;
      const rec = await PizzaDB.get(id);
      if (e.target.closest('.act-load')) {
        lastInput = rec.input; 
        lastResult = rec.result;
        
        // Visszatöltés a beállítások objektumba
        appSettings.doughFormat = rec.input.style || 'egyeni';
        appSettings.useBiga = !!rec.input.useBiga;
        appSettings.useOldDoughIn = !!(rec.input.oldDoughG > 0);
        appSettings.useOldDoughOut = !!rec.input.takeOutOldDough;
        appSettings.useCold = rec.input.coldHours > 0;
        appSettings.yeastFactor = (rec.input.yeastFactor !== undefined ? rec.input.yeastFactor * 100 : 100);
        appSettings.useOil = rec.input.oil > 0;
        
        // Dynamic ballGroups visszaállítása
        if (rec.input.ballGroups && rec.input.ballGroups.length > 0) {
          ballGroups = rec.input.ballGroups.map((g, i) => ({ id: i + 1, count: g.count, weight: g.weight }));
          nextBallGroupId = ballGroups.length + 1;
        } else {
          ballGroups = [{ id: 1, count: rec.input.ballCount || 4, weight: rec.input.ballWeightG || 280 }];
          nextBallGroupId = 2;
        }

        saveSettings();
        applySettingsToUI();
        
        // Form mezők feltöltése
        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el) { el.value = val; el.dispatchEvent(new Event('input')); }
        };
        setVal('roomHours', lastInput.roomHours);
        setVal('roomTempC', lastInput.roomTempC);
        setVal('yeastFactor', appSettings.yeastFactor);
        if (appSettings.useCold) {
          setVal('coldHours', lastInput.coldHours);
          setVal('coldTempC', lastInput.coldTempC);
        }
        if (appSettings.useBiga) {
          setVal('bigaFlourPct', lastInput.bigaFlourPct || 50);
          setVal('bigaHydration', lastInput.bigaHydration || 45);
          setVal('bigaRoomHours', lastInput.bigaRoomHours || 16);
          setVal('bigaRoomTempC', lastInput.bigaRoomTempC || 18);
          document.getElementById('useBigaCold').checked = lastInput.bigaColdHours > 0;
          document.getElementById('biga-cold-fields').hidden = lastInput.bigaColdHours <= 0;
          if (lastInput.bigaColdHours > 0) {
            setVal('bigaColdHours', lastInput.bigaColdHours);
            setVal('bigaColdTempC', lastInput.bigaColdTempC || 4);
          }
        }
        if (appSettings.useOldDoughIn) {
          setVal('oldDoughG', lastInput.oldDoughG || 100);
          setVal('oldDoughHydration', lastInput.oldDoughHydration || 60);
        }
        if (appSettings.useOldDoughOut) {
          setVal('takeOutOldDoughG', lastInput.takeOutOldDoughG || 150);
        }
        if (lastInput.style === 'teglia') {
          if (lastInput.panAreaM2) {
            const areaCm2 = lastInput.panAreaM2 * 10000;
            const wid = Math.round(Math.sqrt(areaCm2 / 1.333));
            setVal('panLen', Math.round(wid * 1.333));
            setVal('panWid', wid);
          }
          setVal('gramPerM2', lastInput.gramPerM2 || 5500);
          setVal('hydration', lastInput.hydration);
          setVal('salt', lastInput.salt);
          setVal('oil', lastInput.oil);
        } else {
          setVal('hydration', lastInput.hydration);
          setVal('salt', lastInput.salt);
          setVal('oil', lastInput.oil);
        }

        document.getElementById('recipe-title-input').value = rec.name;
        
        switchView('view-calc');
        renderResult(lastResult);
        document.getElementById('result-wrap').hidden = false;
        showToast('Recept betöltve');
      } else if (e.target.closest('.act-download-pdf')) {
        printRecipe(rec.name, rec.result, rec.notes);
      } else if (e.target.closest('.act-del')) {
        if (confirm(`Törlöd a(z) „${rec.name}” receptet?`)) {
          await PizzaDB.remove(id);
          renderRecipeList();
          showToast('Recept törölve');
        }
      }
    });
  }

  document.getElementById('btn-download-pdf')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!lastResult) return;
    const nameToggle = document.getElementById('toggle-recipe-name');
    const name = (nameToggle && nameToggle.checked)
      ? (document.getElementById('recipe-title-input').value.trim() || "Gregory's Special")
      : null;
    printRecipe(name, lastResult, '');
  });

  function printRecipe(name, r, notes) {
    const titleEl = document.getElementById('p-title');
    if (!name || name === "Gregory's Special") {
      titleEl.style.display = 'none';
    } else {
      titleEl.style.display = 'block';
      titleEl.textContent = name;
    }

    const pdfS = PizzaAlkimistaPDFStrings;
    const pi = pdfS.steps;

    let subtitle = '';
    if (r.style === 'teglia') {
      subtitle = `${fmt(r.panAreaM2, 2)} m² ${pdfS.badges.styleTeglia.toLowerCase()}`;
    } else {
      subtitle = r.ballGroups.map(g => `${g.count} × ${fmt(g.weight, 0)} g`).join(' + ') + ' gombóc';
    }
    document.getElementById('p-subtitle').textContent = subtitle;
    document.getElementById('p-date').textContent = new Date().toLocaleDateString('hu-HU');
    document.getElementById('p-footer-date').textContent = 'Készült: ' + new Date().toLocaleString('hu-HU');

    // Kelesztési adatok kibővített kiírása a PDF-re (Szófelhők / Buborékok)
    const inp = r.input || {};
    const roomH = inp.roomHours !== undefined ? inp.roomHours : (r.roomHours || 0);
    const roomT = inp.roomTempC !== undefined ? inp.roomTempC : (r.roomTempC || 22);
    const coldH = inp.coldHours !== undefined ? inp.coldHours : (r.coldHours || 0);
    const coldT = inp.coldTempC !== undefined ? inp.coldTempC : (r.coldTempC || 4);

    let cloudsHtml = '';
    
    // Alap tészta paraméterei szófelhők (Soksok technológiai infóval feltöltve!)
    cloudsHtml += `<div class="p-cloud-row" style="flex-wrap: wrap; justify-content: center; gap: 0.4rem; margin-bottom: 0.8rem;">`;
    
    const styleLabel = r.style === 'teglia' ? pdfS.badges.styleTeglia : pdfS.badges.styleEgyeni;
    cloudsHtml += `<div class="p-cloud-item p-cloud-main-param"><b>Stílus:</b> ${styleLabel}</div>`;
    cloudsHtml += `<div class="p-cloud-item">${pdfS.badges.hydration.replace('{val}', fmt(r.hydration, 0))}</div>`;
    cloudsHtml += `<div class="p-cloud-item">${pdfS.badges.salt.replace('{val}', fmt(r.salt, 1))}</div>`;
    if (r.oil > 0) {
      cloudsHtml += `<div class="p-cloud-item">${pdfS.badges.oil.replace('{val}', fmt(r.oil, 1))}</div>`;
    }
    
    // Liszt ajánlott erőssége és technológiai paraméterek
    let recommendedW = 'W220–260 (Közepes)';
    const totalHours = roomH + coldH;
    if (totalHours > 24) recommendedW = 'W280–320 (Erős)';
    if (totalHours > 48) recommendedW = 'W320+ (Nagyon erős / Manitoba)';
    if (totalHours < 12) recommendedW = 'W180–220 (Gyenge)';
    cloudsHtml += `<div class="p-cloud-item">${pdfS.badges.recommendedFlour.replace('{val}', recommendedW)}</div>`;
    
    // Kompenzációk és modellek
    const modelLabel = inp.yeastModel === 'alchemist' ? 'Alkimista' : 'Craig';
    cloudsHtml += `<div class="p-cloud-item">${pdfS.badges.yeastModel.replace('{val}', modelLabel)}</div>`;
    if (inp.wastePct > 0) {
      cloudsHtml += `<div class="p-cloud-item">${pdfS.badges.wastePct.replace('{val}', inp.wastePct)}</div>`;
    }
    if (inp.yeastFactor !== 100) {
      cloudsHtml += `<div class="p-cloud-item">${pdfS.badges.yeastFactor.replace('{val}', inp.yeastFactor)}</div>`;
    }
    if (r.useAutolyse) {
      cloudsHtml += `<div class="p-cloud-item">${pdfS.badges.autolyse.replace('{val}', r.autolyseFlourPct || 70)}</div>`;
    }
    if (r.useOldDough) {
      cloudsHtml += `<div class="p-cloud-item">${pdfS.badges.oldDough}</div>`;
    }
    cloudsHtml += `</div>`;

    // Érlelési etapok (kapcsolatokkal összekötött buborékokként)
    // 1. szakasz: Biga (ha van)
    if (r.biga) {
      const bRoomH = inp.bigaRoomHours !== undefined ? inp.bigaRoomHours : 16;
      const bRoomT = inp.bigaRoomTempC !== undefined ? inp.bigaRoomTempC : 19.5;
      const bColdH = inp.bigaColdHours !== undefined ? inp.bigaColdHours : 0;
      const bColdT = inp.bigaColdTempC !== undefined ? inp.bigaColdTempC : 5;

      cloudsHtml += `<div class="p-cloud-group-title">${pdfS.badges.bigaPhaseTitle}</div>`;
      cloudsHtml += `<div class="p-cloud-row">`;
      cloudsHtml += `<div class="p-cloud-item">🕒 ${formatDuration(bRoomH)} szobahőn</div>`;
      cloudsHtml += `<div class="p-cloud-item p-cloud-arrow">➔</div>`;
      cloudsHtml += `<div class="p-cloud-item">🌡️ ${bRoomT}°C</div>`;
      
      if (bColdH > 0) {
        cloudsHtml += `<div class="p-cloud-item p-cloud-arrow">➔</div>`;
        cloudsHtml += `<div class="p-cloud-item">❄️ ${formatDuration(bColdH)} hűtőben (${bColdT}°C)</div>`;
      }
      cloudsHtml += `</div>`;
    }

    // 2. szakasz: Fő tészta kelesztés
    const mainPhaseTitle = r.biga ? pdfS.badges.mainPhaseTitleBiga : pdfS.badges.mainPhaseTitleDirect;
    cloudsHtml += `<div class="p-cloud-group-title">${mainPhaseTitle}</div>`;
    cloudsHtml += `<div class="p-cloud-row">`;
    cloudsHtml += `<div class="p-cloud-item">🕒 ${formatDuration(roomH)} szobahőn</div>`;
    cloudsHtml += `<div class="p-cloud-item p-cloud-arrow">➔</div>`;
    cloudsHtml += `<div class="p-cloud-item">🌡️ ${roomT}°C</div>`;
    
    if (coldH > 0) {
      cloudsHtml += `<div class="p-cloud-item p-cloud-arrow">➔</div>`;
      cloudsHtml += `<div class="p-cloud-item">❄️ ${formatDuration(coldH)} hűtőben (${coldT}°C)</div>`;
    }
    cloudsHtml += `</div>`;

    document.getElementById('p-badges').innerHTML = cloudsHtml;

    let ingHtml = `
      <tr><td style="width: 60%;">Friss Liszt</td><td class="amt" style="width: 40%;">${fmtG(r.flour, 'flour')}</td></tr>
      <tr><td>Friss Víz</td><td class="amt">${fmtG(r.water, 'water')}</td></tr>
      <tr><td>Só</td><td class="amt">${fmtG(r.saltG, 'salt')}</td></tr>`;
    if (r.oilG > 0) {
      ingHtml += `<tr><td>Zsiradék</td><td class="amt">${fmtG(r.oilG, 'oil')}</td></tr>`;
    }
    if (r.useOldDough && r.oldDoughG > 0) {
      ingHtml += `<tr style="border-top:1px solid #ccc; font-weight:bold;"><td>Öregtészta (bevitt)</td><td class="amt">${fmtG(r.oldDoughG, 'flour')}</td></tr>`;
    }
    ingHtml += `
      <tr style="border-top:1px solid #ccc;"><td style="font-weight:bold;">Élesztő fajták:</td><td></td></tr>
      <tr><td class="small">— ${PizzaAlkimistaStrings.yeastFresh}</td><td class="amt">${fmtG2(r.yeast.fresh, 'yeast_fresh')}</td></tr>
      <tr><td class="small">— ${PizzaAlkimistaStrings.yeastInstant}</td><td class="amt">${fmtG2(r.yeast.instantDry, 'yeast')}</td></tr>
      <tr><td class="small">— ${PizzaAlkimistaStrings.yeastActive}</td><td class="amt">${fmtG2(r.yeast.activeDry, 'yeast')}</td></tr>`;
    
    if (r.takeOutOldDoughG > 0) {
      ingHtml += `<tr style="border-top:1px dashed #ccc; font-weight:bold;"><td>Kiveendő öregtészta a végén</td><td class="amt">${fmtG(r.takeOutOldDoughG, 'flour')}</td></tr>`;
    }

    document.getElementById('p-ingredients').innerHTML = ingHtml;

    const bigaSection = document.getElementById('p-biga-section');
    if (r.biga) {
      bigaSection.hidden = false;
      document.getElementById('p-biga').innerHTML = `
        <tr><td>Biga liszt</td><td class="amt">${fmtG(r.biga.biga.flour, 'flour')}</td></tr>
        <tr><td>Biga víz</td><td class="amt">${fmtG(r.biga.biga.water, 'water')}</td></tr>
        <tr><td>Biga élesztő (friss)</td><td class="amt">${fmtG2(r.biga.biga.yeastFresh, 'yeast_fresh')}</td></tr>`;
    } else { 
      bigaSection.hidden = true; 
    }

    // Dinamikus, a beállítások alapján testreszabott instrukciók (sablon alapon)
    let steps = [];
    if (r.biga) {
      let bRoomH = inp.bigaRoomHours !== undefined ? inp.bigaRoomHours : 16;
      let bRoomT = inp.bigaRoomTempC !== undefined ? inp.bigaRoomTempC : 19.5;
      let bColdH = inp.bigaColdHours !== undefined ? inp.bigaColdHours : 0;
      let bColdT = inp.bigaColdTempC !== undefined ? inp.bigaColdTempC : 5;

      let coldSuffix = '';
      if (bColdH > 0) {
        coldSuffix = pi.bigaColdSection
          .replace('{bigaColdTemp}', `${bColdT}°C`)
          .replace('{bigaColdHours}', formatDuration(bColdH));
      }
      const bigaPrepText = pi.bigaPrep
        .replace('{bigaFlour}', fmtG(r.biga.biga.flour))
        .replace('{bigaWater}', fmtG(r.biga.biga.water))
        .replace('{bigaYeast}', fmtG2(r.biga.biga.yeastFresh, 'yeast_fresh'))
        .replace('{bigaRoomTemp}', `${bRoomT}°C`)
        .replace('{bigaRoomHours}', formatDuration(bRoomH))
        .replace('{bigaColdSection}', coldSuffix);
      steps.push(bigaPrepText);

      const oilText = r.oilG > 0 ? pi.mixOilText.replace('{oil}', fmtG(r.oilG, 'oil')) : '';
      const oldDoughText = r.useOldDough ? pi.mixOldDoughText.replace('{oldDough}', fmtG(r.oldDoughG, 'flour')) : '';
      
      const mainMixText = pi.mainMix
        .replace('{mixType}', pi.mixTypeBiga)
        .replace('{mixBigaText}', pi.mixBigaText)
        .replace('{flour}', fmtG(r.biga.final.flour, 'flour'))
        .replace('{water}', fmtG(r.biga.final.water, 'water'))
        .replace('{salt}', fmtG(r.saltG, 'salt'))
        .replace('{oil}', oilText)
        .replace('{oldDough}', oldDoughText)
        .replace('{yeast}', '');
      steps.push(mainMixText);
    } else {
      const oilText = r.oilG > 0 ? pi.mixOilText.replace('{oil}', fmtG(r.oilG, 'oil')) : '';
      const oldDoughText = r.useOldDough ? pi.mixOldDoughText.replace('{oldDough}', fmtG(r.oldDoughG, 'flour')) : '';
      const yeastText = pi.mixYeastText
        .replace('{yeastFresh}', fmtG2(r.yeast.fresh, 'yeast_fresh'))
        .replace('{yeastInstant}', fmtG2(r.yeast.instantDry, 'yeast'))
        .replace('{yeastActive}', fmtG2(r.yeast.activeDry, 'yeast'));

      const mainMixText = pi.mainMix
        .replace('{mixType}', pi.mixTypeDirect)
        .replace('{mixBigaText}', '')
        .replace('{flour}', fmtG(r.flour, 'flour'))
        .replace('{water}', fmtG(r.water, 'water'))
        .replace('{salt}', fmtG(r.saltG, 'salt'))
        .replace('{oil}', oilText)
        .replace('{oldDough}', oldDoughText)
        .replace('{yeast}', yeastText);
      steps.push(mainMixText);
    }

    if (r.takeOutOldDoughG > 0) {
      steps.push(pi.oldDoughSave.replace('{weight}', fmtG(r.takeOutOldDoughG, 'flour')));
    }

    const bulkHours = Math.min(1.5, Math.max(0.5, r.totalHours * 0.15));
    steps.push(pi.bulkFerment.replace('{temp}', `${roomT}°C`).replace('{duration}', formatDuration(bulkHours)));
    
    const bunsText = r.style === 'teglia' ? 'tepsi méretre' : r.ballGroups.map(g => `${g.count} db × ${g.weight}g`).join(' + ');
    steps.push(pi.shaping.replace('{buns}', bunsText));

    if (coldH > 0) {
      steps.push(pi.coldFerment.replace('{temp}', `${coldT}°C`).replace('{duration}', formatDuration(coldH)));
      steps.push(pi.warmingUp.replace('{temp}', `${roomT}°C`));
    } else {
      const remainingRoom = Math.max(0, roomH - bulkHours);
      steps.push(pi.roomFerment.replace('{temp}', `${roomT}°C`).replace('{duration}', formatDuration(remainingRoom)));
    }

    if (r.style === 'teglia') {
      steps.push(pi.bakingTeglia);
    } else {
      steps.push(pi.bakingPizza);
    }

    document.getElementById('p-method-list').innerHTML = steps.map(step => `<li>${step}</li>`).join('');
    document.getElementById('p-notes').textContent = notes || '';
    
    // Golyóálló PDF generálás klónozással és inline stílusokkal (kikerüli a CSS cache/specifikációs hibákat)
    const originalPrintRoot = document.getElementById('print-root');
    const clone = originalPrintRoot.cloneNode(true);
    clone.id = 'print-root-temp-clone';
    
    // Alkalmazzuk a megjelenítést és az A4 szélességet inline stílusként a klónon
    clone.style.display = 'block';
    clone.style.visibility = 'visible';
    clone.style.position = 'absolute';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.width = '794px';
    clone.style.background = '#ffffff';
    clone.style.color = '#111113';
    clone.style.zIndex = '-9999';
    clone.style.opacity = '1';
    
    // Kényszerítsük a gyermekeket is láthatónak (kivéve a hidden elemeket)
    const allChildren = clone.querySelectorAll('*');
    allChildren.forEach(child => {
      child.style.visibility = 'visible';
      if (child.hasAttribute('hidden') || child.style.display === 'none') {
        child.style.display = 'none';
      }
    });

    document.body.appendChild(clone);

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = yy + mm + dd;
    const pdfFilename = `PizzaAlkimista recept ${dateStr}.pdf`;

    // Várunk egy kis időt, hogy a böngésző biztosan kirajzolja a klónt a DOM-ban
    setTimeout(() => {
      const opt = {
        margin:       [10, 12, 10, 12],
        filename:     pdfFilename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, scrollX: 0, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(clone).save().then(() => {
        document.body.removeChild(clone);
      }).catch(err => {
        console.error('PDF Generálási hiba:', err);
        document.body.removeChild(clone);
        // Biztonsági fallback nyomtatásra
        window.print();
      });
    }, 150);
  }

  // ---------------------------------------------------------------------
  // Tudástár
  // ---------------------------------------------------------------------
  const WIKI_ICONS = {
    wheat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M8 6l4-2 4 2M8 10l4-2 4 2M8 14l4-2 4 2M8 18l4-2 4 2"/></svg>',
    yeast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1"/><circle cx="14" cy="9" r="1"/><circle cx="12" cy="14" r="1"/></svg>',
    drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2s7 8.5 7 13a7 7 0 0 1-14 0c0-4.5 7-13 7-13z"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    pizza: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 2 20h20L12 2z"/><circle cx="12" cy="14" r="1"/><circle cx="10" cy="17" r="1"/></svg>'
  };

  function renderWikiCats() {
    const catsEl = document.getElementById('wiki-cats');
    if (!catsEl) return;
    catsEl.innerHTML = WIKI_DATA.map(cat => `
      <button class="wiki-cat-btn" data-id="${cat.id}">
        <span class="ic">${WIKI_ICONS[cat.icon] || ''}</span>
        <span><h4>${cat.title}</h4><span class="sub">${cat.summary}</span></span>
      </button>
    `).join('');
  }

  const wikiCats = document.getElementById('wiki-cats');
  if (wikiCats) {
    wikiCats.addEventListener('click', e => {
      const btn = e.target.closest('.wiki-cat-btn');
      if (!btn) return;
      const cat = WIKI_DATA.find(c => c.id === btn.dataset.id);
      document.getElementById('wiki-article-body').innerHTML = `<h2>${cat.title}</h2>${cat.html}`;
      document.getElementById('wiki-index').hidden = true;
      document.getElementById('wiki-article').hidden = false;
    });
  }

  const wikiBack = document.getElementById('wiki-back');
  if (wikiBack) {
    wikiBack.addEventListener('click', () => {
      document.getElementById('wiki-index').hidden = false;
      document.getElementById('wiki-article').hidden = true;
    });
  }

  // ---------------------------------------------------------------------
  // Navigáció & Burger Menü
  // ---------------------------------------------------------------------
  const burgerBackdrop = document.getElementById('burger-menu-backdrop');
  
  function openBurgerMenu() {
    if (burgerBackdrop) burgerBackdrop.classList.add('open');
  }
  function closeBurgerMenu() {
    if (burgerBackdrop) burgerBackdrop.classList.remove('open');
  }

  const btnBurger = document.getElementById('btn-burger');
  if (btnBurger) btnBurger.addEventListener('click', openBurgerMenu);
  
  const btnBurgerClose = document.getElementById('burger-close');
  if (btnBurgerClose) btnBurgerClose.addEventListener('click', closeBurgerMenu);
  if (burgerBackdrop) burgerBackdrop.addEventListener('click', e => { if (e.target === burgerBackdrop) closeBurgerMenu(); });

  function switchView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === id));
    document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.view === id));
    document.querySelectorAll('.burger-nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === id));
    document.querySelectorAll('.desktop-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === id));
    window.scrollTo(0, 0);
  }

  const desktopNav = document.querySelector('.desktop-nav');
  if (desktopNav) {
    desktopNav.addEventListener('click', e => {
      const btn = e.target.closest('button[data-view]');
      if (btn) switchView(btn.dataset.view);
    });
  }

  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) {
    bottomNav.addEventListener('click', e => {
      const btn = e.target.closest('button[data-view]');
      if (btn) switchView(btn.dataset.view);
    });
  }

  const burgerContainer = document.querySelector('.burger-menu-links');
  if (burgerContainer) {
    burgerContainer.addEventListener('click', e => {
      const btn = e.target.closest('button[data-view]');
      if (btn) {
        switchView(btn.dataset.view);
        closeBurgerMenu();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Toast
  // ---------------------------------------------------------------------
  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function loadLastInput() {
    if (!appSettings.saveHistory) return;
    const saved = localStorage.getItem('pizza_alkimista_last_input');
    if (!saved) return;
    try {
      const last = JSON.parse(saved);
      if (!last) return;

      // Sanitáció: ha a tárolt yeastFactor értéke elszabadult (nem 70-130), töröljük az egész lastInput-ot
      if (last.yeastFactor !== undefined) {
        const yf = parseFloat(last.yeastFactor);
        if (isNaN(yf) || yf < 70 || yf > 130) {
          console.warn('PizzaAlkimista: Érvénytelen yeastFactor a localStorage-ban, törlés:', yf);
          localStorage.removeItem('pizza_alkimista_last_input');
          return;
        }
      }
      
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) { 
          let num = parseFloat(val);
          if (!isNaN(num)) {
            const min = parseFloat(el.min);
            const max = parseFloat(el.max);
            if (!isNaN(min) && num < min) num = min;
            if (!isNaN(max) && num > max) num = max;
            val = num;
          }
          el.value = formatInputValue(id, val); 
          el.dispatchEvent(new Event('input', { bubbles: true })); 
        }
      };

      if (last.style) {
        currentStyle = last.style;
        document.querySelectorAll('.style-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.style === last.style);
        });
        document.getElementById('calc-form').className = 'style-' + last.style;
      }
      
      if (last.roomHours !== undefined) setVal('roomHours', last.roomHours);
      if (last.roomTempC !== undefined) setVal('roomTempC', appSettings.useFahrenheit ? cToF(last.roomTempC) : last.roomTempC);
      if (last.yeastFactor !== undefined) {
        // Szigorú val idáció: csak 70-130 közötti érték fogadható el (a select megengedett tartománya)
        const safeYF = parseFloat(last.yeastFactor);
        appSettings.yeastFactor = (isNaN(safeYF) || safeYF < 70 || safeYF > 130) ? 105 : safeYF;
        setVal('yeastFactor', appSettings.yeastFactor);
      }
      if (last.coldHours !== undefined) setVal('coldHours', last.coldHours);
      if (last.coldTempC !== undefined) setVal('coldTempC', appSettings.useFahrenheit ? cToF(last.coldTempC) : last.coldTempC);
      
      if (last.bigaFlourPct !== undefined) setVal('bigaFlourPct', last.bigaFlourPct);
      if (last.bigaHydration !== undefined) setVal('bigaHydration', last.bigaHydration);
      if (last.bigaRoomHours !== undefined) setVal('bigaRoomHours', last.bigaRoomHours);
      if (last.bigaRoomTempC !== undefined) setVal('bigaRoomTempC', appSettings.useFahrenheit ? cToF(last.bigaRoomTempC) : last.bigaRoomTempC);
      if (last.bigaColdHours !== undefined) {
        const useBigaCold = document.getElementById('useBigaCold');
        if (useBigaCold) {
          useBigaCold.checked = last.bigaColdHours > 0;
          useBigaCold.dispatchEvent(new Event('change'));
        }
        setVal('bigaColdHours', last.bigaColdHours);
      }
      if (last.bigaColdTempC !== undefined) setVal('bigaColdTempC', appSettings.useFahrenheit ? cToF(last.bigaColdTempC) : last.bigaColdTempC);

      if (last.oldDoughG !== undefined) setVal('oldDoughG', last.oldDoughG);
      if (last.oldDoughHydration !== undefined) setVal('oldDoughHydration', last.oldDoughHydration);
      if (last.takeOutOldDoughG !== undefined) setVal('takeOutOldDoughG', last.takeOutOldDoughG);

      if (last.style === 'teglia') {
        if (last.panAreaM2) {
          const areaCm2 = last.panAreaM2 * 10000;
          const wid = Math.round(Math.sqrt(areaCm2 / 1.333));
          setVal('panLen', Math.round(wid * 1.333));
          setVal('panWid', wid);
        }
        if (last.gramPerM2 !== undefined) setVal('gramPerM2', last.gramPerM2);
      } else {
        if (last.ballGroups && last.ballGroups.length > 0) {
          ballGroups = last.ballGroups.map((g, i) => ({ id: i + 1, count: g.count, weight: g.weight }));
          nextBallGroupId = ballGroups.length + 1;
        } else if (last.ballCount !== undefined && last.ballWeightG !== undefined) {
          ballGroups = [{ id: 1, count: last.ballCount, weight: last.ballWeightG }];
          nextBallGroupId = 2;
        }
        renderBallGroups();
      }

      if (last.hydration !== undefined) setVal('hydration', last.hydration);
      if (last.salt !== undefined) setVal('salt', last.salt);
      if (last.oil !== undefined) setVal('oil', last.oil);
      
    } catch (e) {
      console.warn("Failed to load last inputs: ", e);
    }
  }

  // ---------------------------------------------------------------------
  // Fahrenheit segédfüggvények
  // ---------------------------------------------------------------------
  function cToF(c) { return Math.round((c * 9/5 + 32) * 10) / 10; }
  function fToC(f) { return Math.round(((f - 32) * 5/9) * 10) / 10; }

  function applyFahrenheitToForm() {
    const isFahr = appSettings.useFahrenheit;
    const tempFields = [
      { id: 'roomTempC', min: isFahr ? 33 : 0.5, max: isFahr ? 113 : 45, step: isFahr ? 1 : 0.5 },
      { id: 'coldTempC', min: isFahr ? 33 : 0.5, max: isFahr ? 68 : 20, step: isFahr ? 1 : 0.5 },
      { id: 'bigaRoomTempC', min: isFahr ? 33 : 0.5, max: isFahr ? 113 : 45, step: isFahr ? 1 : 0.5 },
      { id: 'bigaColdTempC', min: isFahr ? 33 : 0.5, max: isFahr ? 68 : 20, step: isFahr ? 1 : 0.5 }
    ];
    tempFields.forEach(({ id, min, max, step }) => {
      const el = document.getElementById(id);
      if (!el) return;
      
      const isCurrentFahr = el.value.includes('°F');
      const curVal = parseFloat(el.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''));
      
      el.min = min; el.max = max; el.step = step;
      if (!isNaN(curVal)) {
        let valToSet = curVal;
        if (isFahr && !isCurrentFahr) {
          valToSet = cToF(curVal);
        } else if (!isFahr && isCurrentFahr) {
          valToSet = fToC(curVal);
        }
        el.value = formatInputValue(id, valToSet);
        updateLabel(el);
      }
      // Unit label
      const lbl = el.parentElement?.querySelector('.temp-unit');
      if (lbl) lbl.textContent = isFahr ? '°F' : '°C';
    });
  }

  // readInput must convert °F → °C when Fahrenheit mode is on
  const _origReadInput = readInput;

  // ---------------------------------------------------------------------
  // Alkalmazás indítása és inicializálás
  // ---------------------------------------------------------------------
  window.addEventListener('load', () => {
    translateDOM();
    loadSettings();
    applyFahrenheitToForm();
    applySettingsToUI();
    loadLastInput();
    renderWikiCats();
    renderRecipeList();
    setupYeastSwitcher();

    // Form beviteli mezők kezdeti formázása mértékegységekkel
    document.querySelectorAll('#calc-form input[readonly]').forEach(el => {
      let rawVal;
      if (el.id.includes('Hours')) {
        rawVal = parseDuration(el.value);
      } else {
        rawVal = parseFloat(el.value.replace(/,/g, '.').replace(/[^0-9.]/g, ''));
      }
      if (!isNaN(rawVal)) {
        el.value = formatInputValue(el.id, rawVal);
      }
    });

    // Fejléc téma-váltó gomb kezelője
    document.getElementById('btn-theme-toggle')?.addEventListener('click', e => {
      e.preventDefault();
      document.body.classList.toggle('light-theme');
      appSettings.useLightMode = document.body.classList.contains('light-theme');
      saveSettings();
    });

    // Hulladék % slider élő label
    document.getElementById('setting-waste-pct')?.addEventListener('input', function() {
      const lbl = document.getElementById('setting-waste-pct-label');
      if (lbl) lbl.textContent = this.value + '%';
    });
    // Hulladék kapcsoló mutat/rejt slider sort
    document.getElementById('setting-use-waste')?.addEventListener('change', function() {
      const row = document.getElementById('setting-waste-pct-row');
      if (row) row.hidden = !this.checked;
    });

    // Autolízis mezők mutat/rejt
    document.getElementById('setting-use-autolyse')?.addEventListener('change', function() {
      const fields = document.getElementById('setting-autolyse-fields');
      if (fields) fields.style.display = this.checked ? 'block' : 'none';
    });

    document.getElementById('calc-form')?.addEventListener('input', () => {
      lastInput = readInput();
      if (appSettings.saveHistory) {
        localStorage.setItem('pizza_alkimista_last_input', JSON.stringify(lastInput));
      }
      // Live újraszámítás ha már van megjelenített eredmény vagy folyamatosan számolunk
      lastResult = PizzaCalc.calculate(lastInput);
      renderResult(lastResult);
    });

    document.getElementById('toggle-recipe-name')?.addEventListener('change', e => {
      document.getElementById('recipe-name-field-wrapper').hidden = !e.target.checked;
    });
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
