/**
 * PizzaAlkimista — js/app.js
 * 
 * Az alkalmazás kliensoldali logikája, amely vezérli a virtuális számbillentyűzetet,
 * a beállításokat, a precíziós léptetőgombokat és a professzionális magyar szövegezést.
 */
(() => {
  'use strict';

  const fmt = (n, d = 0) => Number(n).toLocaleString('hu-HU', { maximumFractionDigits: d, minimumFractionDigits: d });
  const fmtG = n => fmt(n, 1) + ' g';
  const fmtG2 = n => fmt(n, 2) + ' g';

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
    yeastFactor: 100, // 100% = 0% korrekció
    wastePct: 0, // 0% korrekció (alapból +5% beépítve)
    useAutolyse: false,
    autolyseFlourPct: 70,
    autolyseWaterPct: 70,
    useFahrenheit: false
  };

  let appSettings = { ...DEFAULT_SETTINGS };
  let currentStyle = 'egyeni';

  function loadSettings() {
    const saved = localStorage.getItem('pizza_alkimista_settings');
    if (saved) {
      try {
        appSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
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

    if (val('setting-waste-pct')) {
      val('setting-waste-pct').value = appSettings.wastePct !== undefined ? appSettings.wastePct : 0;
    }
    
    if (val('yeastFactor')) {
      val('yeastFactor').value = appSettings.yeastFactor !== undefined ? appSettings.yeastFactor : 100;
    }

    const warnEl = document.getElementById('yeast-factor-warn');
    if (warnEl) {
      if (appSettings.yeastFactor !== 100) {
        warnEl.textContent = `(${appSettings.yeastFactor > 100 ? '+' : ''}${appSettings.yeastFactor - 100}%)`;
      } else {
        warnEl.textContent = '(0%)';
      }
    }

    // Főoldali form felépítése
    currentStyle = appSettings.doughFormat;
    renderFormFields(currentStyle);

    // Feltételes szekciók elrejtése/megjelenítése
    document.getElementById('cold-fields').hidden = !appSettings.useCold;
    document.getElementById('biga-fields').hidden = !appSettings.useBiga;
    document.getElementById('olddough-in-fields').hidden = !appSettings.useOldDoughIn;
    document.getElementById('olddough-out-fields').hidden = !appSettings.useOldDoughOut;

    // Globális range label és stepper bindolás az egész dokumentumra
    bindRangeLabels(document);
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
    appSettings.wastePct = parseFloat(document.getElementById('setting-waste-pct')?.value || 0);
    appSettings.useFahrenheit = document.getElementById('setting-use-fahrenheit')?.checked || false;
    appSettings.yeastModel = document.getElementById('setting-yeast-model')?.value || 'alchemist';
    appSettings.yeastFactor = parseFloat(document.getElementById('yeastFactor')?.value || 100);
    
    saveSettings();
    applySettingsToUI();
    applyFahrenheitToForm();
    
    document.getElementById('result-wrap').hidden = true;
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
        const dir = parseInt(btn.dataset.stepDir, 10);
        const input = document.getElementById(inputId);
        if (!input) return;

        const min = parseFloat(input.min || 0);
        const max = parseFloat(input.max || 100);
        const step = parseFloat(input.step || 1);
        let val = parseFloat(input.value || 0);

        val = val + (dir * step);
        val = Math.round(val / step) * step; // Századpontossági float hiba elkerülése
        if (val < min) val = min;
        if (val > max) val = max;

        input.value = val;
        // Trigger live label updates
        updateLabel(input);
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('change'));
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

  function openNumpad(inputEl) {
    numpadTargetInput = inputEl;
    numpadValue = inputEl.value === '0' ? '' : inputEl.value;
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
      numpadTargetInput = null;
    }
  }

  document.getElementById('numpad-close').addEventListener('click', closeNumpad);
  document.getElementById('numpad-ok').addEventListener('click', closeNumpad);

  numpad.querySelector('.numpad-grid').addEventListener('click', e => {
    const btn = e.target.closest('button[data-key]');
    if (!btn || !numpadTargetInput) return;
    e.preventDefault();

    const isDecimalField = numpadTargetInput && parseFloat(numpadTargetInput.step) === 0.1;

    if (key === 'back') {
      numpadOverwriteMode = false;
      numpadValue = numpadValue.slice(0, -1);
    } else if (key === '.') {
      if (!isDecimalField) {
        if (numpadOverwriteMode) {
          numpadValue = '0.';
          numpadOverwriteMode = false;
        } else if (!numpadValue.includes('.')) {
          numpadValue += numpadValue === '' ? '0.' : '.';
        }
      }
    } else {
      if (isDecimalField) {
        if (numpadOverwriteMode) {
          numpadValue = key + '.0';
          numpadOverwriteMode = false;
        } else {
          // Ha már egy számjegy + .0 áll bent (pl 3.0), és beír egy 5-öst -> 3.5 lesz
          // Ha sorban nyomja pl 2, majd 5: 2.0 -> 2.5
          const digitsOnly = (numpadValue + key).replace(/\D/g, '');
          if (digitsOnly.length === 1) {
            numpadValue = digitsOnly + '.0';
          } else if (digitsOnly.length >= 2) {
            const integerPart = digitsOnly.slice(0, -1);
            const decimalPart = digitsOnly.slice(-1);
            numpadValue = `${integerPart}.${decimalPart}`;
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
    }

    numpadDisplay.textContent = numpadValue || '0';
    numpadTargetInput.value = numpadValue || '0';
    
    // Live update dynamic state/recalculation trigger events
    numpadTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
    numpadTargetInput.dispatchEvent(new Event('change', { bubbles: true }));
  });

  document.addEventListener('click', e => {
    const input = e.target.closest('input[readonly][type="number"]');
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
      <div class="row3 ball-group-row" data-id="${g.id}" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.6rem; align-items: end; margin-bottom: 0.8rem;">
        <div class="field" style="margin-bottom:0;">
          <label class="field-label">${index === 0 ? 'Gombócok száma' : 'További gombócok'}</label>
          <input type="number" class="ball-count-input" min="1" max="30" value="${g.count}" readonly>
        </div>
        <div class="field" style="margin-bottom:0;">
          <label class="field-label">Súly (g)</label>
          <input type="number" class="ball-weight-input" min="150" max="500" step="10" value="${g.weight}" readonly>
        </div>
        <button type="button" class="icon-btn btn-del-group" style="width: 44px; height: 44px; margin-bottom:0; border-color: var(--danger); color: var(--danger);" ${ballGroups.length === 1 ? 'disabled' : ''}>🗑️</button>
      </div>
    `).join('');

    // Reacting to changes in dynamic fields
    container.querySelectorAll('.ball-group-row').forEach(row => {
      const id = parseInt(row.dataset.id, 10);
      const group = ballGroups.find(g => g.id === id);

      row.querySelector('.ball-count-input').addEventListener('change', e => {
        group.count = parseInt(e.target.value, 10) || 1;
      });
      row.querySelector('.ball-weight-input').addEventListener('change', e => {
        group.weight = parseFloat(e.target.value) || 280;
      });

      row.querySelector('.btn-del-group').addEventListener('click', () => {
        if (ballGroups.length > 1) {
          ballGroups = ballGroups.filter(g => g.id !== id);
          renderBallGroups();
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

    if (style === 'egyeni') {
      if (appSettings.useSecondBall) {
        wrap.innerHTML = `
          <div id="ball-groups-container"></div>
          <button type="button" class="btn btn-ghost btn-sm btn-block" id="btn-add-ball-group" style="margin-top:0.4rem; margin-bottom: 1.2rem;">+ Új méret hozzáadása</button>
        `;
        document.getElementById('btn-add-ball-group').addEventListener('click', e => {
          e.preventDefault();
          ballGroups.push({ id: nextBallGroupId++, count: 2, weight: 200 });
          renderBallGroups();
        });
        renderBallGroups();
      } else {
        wrap.innerHTML = `
          <div class="row2">
            <div class="field">
              <label class="field-label">${PizzaAlkimistaStrings.labelBallCount}</label>
              <input type="number" id="ballCount" min="1" max="30" value="4" readonly>
            </div>
            <div class="field">
              <label class="field-label">${PizzaAlkimistaStrings.labelBallWeight}</label>
              <input type="number" id="ballWeightG" min="150" max="500" step="10" value="280" readonly>
            </div>
          </div>
        `;
      }

      wrap.innerHTML += `
        <div class="field">
          <label class="field-label">${PizzaAlkimistaStrings.labelHydration} ${infoDot('hydration')}</label>
          <div class="range-row mobile-stepper">
            <button type="button" class="step-btn" data-step-dir="-1" data-input-id="hydration">-</button>
            <input type="range" id="hydration" min="50" max="85" step="1" value="65">
            <button type="button" class="step-btn" data-step-dir="1" data-input-id="hydration">+</button>
            <span class="range-value" id="hydration-val">65%</span>
          </div>
        </div>

        <div class="row2">
          <div class="field">
            <label class="field-label">${PizzaAlkimistaStrings.labelSalt} ${infoDot('salt')}</label>
            <input type="number" id="salt" min="1" max="4" step="0.1" value="3.0" readonly>
          </div>
          <div class="field" id="oil-field-wrapper" ${appSettings.useOil ? '' : 'hidden'}>
            <label class="field-label">${PizzaAlkimistaStrings.labelOil} ${infoDot('oil')}</label>
            <input type="number" id="oil" min="0" max="6" step="0.5" value="0" readonly>
          </div>
        </div>
      `;

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
            <input type="number" id="panLen" min="10" max="100" value="40" readonly>
          </div>
          <div class="field">
            <label class="field-label">${PizzaAlkimistaStrings.labelPanWid}</label>
            <input type="number" id="panWid" min="10" max="100" value="30" readonly>
          </div>
        </div>
        <div class="field">
          <label class="field-label">${PizzaAlkimistaStrings.labelGramPerM2} ${infoDot('gramPerM2')}</label>
          <div class="range-row mobile-stepper">
            <button type="button" class="step-btn" data-step-dir="-1" data-input-id="gramPerM2">-</button>
            <input type="range" id="gramPerM2" min="4000" max="8000" step="100" value="5500">
            <button type="button" class="step-btn" data-step-dir="1" data-input-id="gramPerM2">+</button>
            <span class="range-value" id="gramPerM2-val">5500 g/m²</span>
          </div>
        </div>
        <div class="field">
          <label class="field-label">${PizzaAlkimistaStrings.labelHydration} ${infoDot('hydration')}</label>
          <div class="range-row mobile-stepper">
            <button type="button" class="step-btn" data-step-dir="-1" data-input-id="hydration">-</button>
            <input type="range" id="hydration" min="65" max="90" step="1" value="75">
            <button type="button" class="step-btn" data-step-dir="1" data-input-id="hydration">+</button>
            <span class="range-value" id="hydration-val">75%</span>
          </div>
        </div>
        <div class="row2">
          <div class="field">
            <label class="field-label">${PizzaAlkimistaStrings.labelSalt} ${infoDot('salt')}</label>
            <input type="number" id="salt" min="1" max="4" step="0.1" value="2.5" readonly>
          </div>
          <div class="field" id="oil-field-wrapper" ${appSettings.useOil ? '' : 'hidden'}>
            <label class="field-label">${PizzaAlkimistaStrings.labelOil} ${infoDot('oil')}</label>
            <input type="number" id="oil" min="0" max="6" step="0.5" value="3" readonly>
          </div>
        </div>
      `;
    }
    
    bindRangeLabels(wrap);
    initSteppers();
  }

  function bindRangeLabels(scope) {
    scope.querySelectorAll('input[type=range]').forEach(r => {
      updateLabel(r);
      // Megszüntetjük a duplikált eseményfigyelőket
      r.removeEventListener('input', r._liveUpdate);
      r._liveUpdate = () => updateLabel(r);
      r.addEventListener('input', r._liveUpdate);
    });
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
    const v = id => document.getElementById(id)?.value;
    const checked = id => !!document.getElementById(id)?.checked;
    
    const input = {
      style: currentStyle,
      roomHours: parseFloat(v('roomHours')),
      roomTempC: appSettings.useFahrenheit ? fToC(parseFloat(v('roomTempC'))) : parseFloat(v('roomTempC')),
      yeastModel: appSettings.yeastModel || 'alchemist',
      yeastFactor: parseFloat(v('yeastFactor') || 100) / 100,
      coldHours: appSettings.useCold ? parseFloat(v('coldHours') || 0) : 0,
      coldTempC: appSettings.useFahrenheit ? fToC(parseFloat(v('coldTempC') || 39)) : parseFloat(v('coldTempC') || 4),
      useBiga: appSettings.useBiga,
      useOldDough: appSettings.useOldDoughIn || appSettings.useOldDoughOut,
      takeOutOldDough: appSettings.useOldDoughOut,
      // Hulladék kompenzáció
      wastePct: appSettings.useWaste ? (appSettings.wastePct || 5) : 0,
      // Autolízis
      useAutolyse: appSettings.useAutolyse,
      autolyseFlourPct: appSettings.useAutolyse ? (appSettings.autolyseFlourPct || 70) : 0,
      autolyseWaterPct: appSettings.useAutolyse ? (appSettings.autolyseWaterPct || 70) : 0
    };

    if (input.useBiga) {
      input.bigaFlourPct = parseFloat(v('bigaFlourPct') || 50);
      input.bigaHydration = parseFloat(v('bigaHydration') || 45);
      input.bigaRoomHours = parseFloat(v('bigaRoomHours') || 16);
      input.bigaRoomTempC = parseFloat(v('bigaRoomTempC') || 18);
      input.bigaColdHours = checked('useBigaCold') ? parseFloat(v('bigaColdHours') || 24) : 0;
      input.bigaColdTempC = parseFloat(v('bigaColdTempC') || 4);
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
        input.ballGroups = ballGroups.map(g => ({ count: g.count, weight: g.weight }));
      } else {
        const count = parseInt(v('ballCount'), 10) || 4;
        const weight = parseFloat(v('ballWeightG')) || 280;
        input.ballGroups = [{ count, weight }];
      }
      input.hydration = parseFloat(v('hydration'));
      input.salt = parseFloat(v('salt'));
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
      rows += `<tr class="accent-row"><td>Öregtészta (bevitt)</td><td class="pct"></td><td class="amt">${fmtG(r.oldDoughG)}</td></tr>`;
    }
    
    let yeastVal = r.yeast.fresh;
    if (activeYeastType === 'instantDry') yeastVal = r.yeast.instantDry;
    else if (activeYeastType === 'activeDry') yeastVal = r.yeast.activeDry;

    rows += `
      <tr><td style="width: 55%;">Friss Liszt</td><td class="pct" style="width: 20%;">100%</td><td class="amt" style="width: 25%;">${fmtG(r.flour)}</td></tr>
      <tr><td>Friss Víz</td><td class="pct">${fmt(r.hydration, 0)}%</td><td class="amt">${fmtG(r.water)}</td></tr>
      <tr><td>Só</td><td class="pct">${fmt(r.salt, 1)}%</td><td class="amt">${fmtG(r.saltG)}</td></tr>`;
    
    if (r.oilG > 0) {
      rows += `<tr><td>Olívaolaj</td><td class="pct">${fmt(r.oil, 1)}%</td><td class="amt">${fmtG(r.oilG)}</td></tr>`;
    }
    
    rows += `
      <tr style="font-weight:700; color:var(--gold-dark);">
        <td>${getActiveYeastLabel(activeYeastType)}</td>
        <td class="pct">${fmt(r.yeastPct, 2)}%</td>
        <td class="amt">${fmtG2(yeastVal)}</td>
      </tr>`;
    
    if (r.takeOutOldDoughG > 0) {
      rows += `<tr class="accent-row"><td>Kiveendő öregtészta (végén)</td><td></td><td class="amt">${fmtG(r.takeOutOldDoughG)}</td></tr>`;
    }
    if (r.wasteG > 0) {
      rows += `<tr style="opacity:0.6; font-size:0.8em;"><td>↳ ebből veszteség-pótlás</td><td class="pct">${fmt(r.wastePct,0)}%</td><td class="amt">+${fmtG(r.wasteG)}</td></tr>`;
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
            <tr><td>Autolízisos liszt</td><td class="pct">${fmt(a.flourPct,0)}%</td><td class="amt">${fmtG(a.flour)}</td></tr>
            <tr><td>Autolízisos víz</td><td class="pct">${fmt(a.waterPct,0)}%</td><td class="amt">${fmtG(a.water)}</td></tr>
            <tr style="opacity:0.7;font-size:.85em;"><td colspan="3">↳ pihentetés után add hozzá a maradék ${fmtG(a.finalFlour)} lisztet, ${fmtG(a.finalWater)} vizet, sót, élesztőt</td></tr>
          </table>
        </div>`;
    } else {
      el.hidden = true;
    }
  }

  // Élesztő pörgető nyilak eseménykezelője
  function setupYeastSwitcher() {
    const label = document.getElementById('yeast-active-display');
    
    const updateYeastView = () => {
      const type = YEAST_TYPES[currentYeastTypeIndex];
      label.textContent = getActiveYeastLabel(type);
      if (lastResult) {
        document.getElementById('ing-table').innerHTML = ingredientRows(lastResult, type);
      }
    };

    document.getElementById('yeast-prev').onclick = (e) => {
      e.preventDefault();
      currentYeastTypeIndex = (currentYeastTypeIndex - 1 + YEAST_TYPES.length) % YEAST_TYPES.length;
      updateYeastView();
    };

    document.getElementById('yeast-next').onclick = (e) => {
      e.preventDefault();
      currentYeastTypeIndex = (currentYeastTypeIndex + 1) % YEAST_TYPES.length;
      updateYeastView();
    };
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
    document.getElementById('yeast-active-display').textContent = getActiveYeastLabel(type);
    document.getElementById('ing-table').innerHTML = ingredientRows(r, type);

    const bigaCard = document.getElementById('biga-card');
    if (r.biga) {
      bigaCard.hidden = false;
      document.getElementById('biga-table').innerHTML = `
        <tr><td style="width: 55%;">Biga liszt</td><td class="pct" style="width: 20%;">${fmt((r.biga.biga.flour / (r.flour + r.oldDoughFlour)) * 100, 0)}%</td><td class="amt" style="width: 25%;">${fmtG(r.biga.biga.flour)}</td></tr>
        <tr><td>Biga víz</td><td class="pct">${r.biga.biga.hydration}%</td><td class="amt">${fmtG(r.biga.biga.water)}</td></tr>
        <tr><td>Biga élesztő (friss)</td><td class="pct">${fmt(r.biga.biga.yeastPct, 2)}%</td><td class="amt">${fmtG(r.biga.biga.yeastFresh)}</td></tr>
        <tr><td>Végső dagasztás liszt</td><td></td><td class="amt">${fmtG(r.biga.final.flour)}</td></tr>
        <tr><td>Végső dagasztás víz</td><td></td><td class="amt">${fmtG(r.biga.final.water)}</td></tr>`;
    } else {
      bigaCard.hidden = true;
    }

    let timelineHtml = '';
    for (let i = 0; i < r.timeline.length; i++) {
      const item = r.timeline[i];
      const prevItem = i > 0 ? r.timeline[i - 1] : null;
      const translationKey = 'timeline' + item.label;
      const desc = PizzaAlkimistaStrings[translationKey] || item.label;
      
      let timeLabel = '';
      if (item.h === 0) {
        timeLabel = 'Kezdet (0p)';
      } else {
        const diffHours = item.h - (prevItem ? prevItem.h : 0);
        const durationStr = formatDuration(diffHours);
        if (i === r.timeline.length - 1) {
          timeLabel = `További ${durationStr} után (Összesen: ${formatDuration(item.h)})`;
        } else {
          timeLabel = `${durationStr} kelesztés után`;
        }
      }
      timelineHtml += `<li><span class="t">${timeLabel}</span><span class="dot"></span> ${desc}</li>`;
    }
    document.getElementById('res-timeline').innerHTML = timelineHtml;
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
          <button class="icon-btn btn-sm act-print" style="width:34px;height:34px" title="Nyomtatás">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
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
      } else if (e.target.closest('.act-print')) {
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

  // ---------------------------------------------------------------------
  // Nyomtatás közvetlen indítása (Mindenféle megerősítő párbeszéd nélkül)
  // ---------------------------------------------------------------------
  document.getElementById('btn-print').addEventListener('click', (e) => {
    e.preventDefault();
    if (!lastResult) return;
    const nameToggle = document.getElementById('toggle-recipe-name');
    const name = (nameToggle && nameToggle.checked)
      ? (document.getElementById('recipe-title-input').value.trim() || "Gregory's Special")
      : null;
    printRecipe(name, lastResult, '');
  });

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

    let subtitle = '';
    if (r.style === 'teglia') {
      subtitle = `${fmt(r.panAreaM2, 2)} m² tepsis pizza`;
    } else {
      subtitle = r.ballGroups.map(g => `${g.count} × ${fmt(g.weight, 0)} g`).join(' + ');
      subtitle += ' gombóc — PizzaAlkimista Receptúra';
    }
    document.getElementById('p-subtitle').textContent = subtitle;
    document.getElementById('p-date').textContent = new Date().toLocaleDateString('hu-HU');
    document.getElementById('p-footer-date').textContent = 'Készült: ' + new Date().toLocaleString('hu-HU');

    // Kelesztési adatok kibővített kiírása a PDF-re
    const inp = r.input || {};
    const roomH = inp.roomHours !== undefined ? inp.roomHours : (r.roomHours || 0);
    const roomT = inp.roomTempC !== undefined ? inp.roomTempC : (r.roomTempC || 22);
    const coldH = inp.coldHours !== undefined ? inp.coldHours : (r.coldHours || 0);
    const coldT = inp.coldTempC !== undefined ? inp.coldTempC : (r.coldTempC || 4);

    let badgesHtml = `
      <span class="p-badge">${fmt(r.hydration,0)}% hidratáció</span>
      <span class="p-badge">${fmt(r.salt,1)}% só</span>`;
    if (r.oil > 0) {
      badgesHtml += `<span class="p-badge">${fmt(r.oil,1)}% zsiradék</span>`;
    }
    badgesHtml += `<span class="p-badge">Szobahőn: ${formatDuration(roomH)} (${roomT}°C)</span>`;
    if (coldH > 0) {
      badgesHtml += `<span class="p-badge">Hűtőben: ${formatDuration(coldH)} (${coldT}°C)</span>`;
    }
    document.getElementById('p-badges').innerHTML = badgesHtml;

    let ingHtml = `
      <tr><td style="width: 60%;">Friss Liszt</td><td class="amt" style="width: 40%;">${fmtG(r.flour)}</td></tr>
      <tr><td>Friss Víz</td><td class="amt">${fmtG(r.water)}</td></tr>
      <tr><td>Só</td><td class="amt">${fmtG(r.saltG)}</td></tr>`;
    if (r.oilG > 0) {
      ingHtml += `<tr><td>Zsiradék</td><td class="amt">${fmtG(r.oilG)}</td></tr>`;
    }
    if (r.useOldDough && r.oldDoughG > 0) {
      ingHtml += `<tr style="border-top:1px solid #ccc; font-weight:bold;"><td>Öregtészta (bevitt)</td><td class="amt">${fmtG(r.oldDoughG)}</td></tr>`;
    }
    ingHtml += `
      <tr style="border-top:1px solid #ccc;"><td style="font-weight:bold;">Élesztő fajták:</td><td></td></tr>
      <tr><td class="small">— ${PizzaAlkimistaStrings.yeastFresh}</td><td class="amt">${fmtG(r.yeast.fresh)}</td></tr>
      <tr><td class="small">— ${PizzaAlkimistaStrings.yeastInstant}</td><td class="amt">${fmtG(r.yeast.instantDry)}</td></tr>
      <tr><td class="small">— ${PizzaAlkimistaStrings.yeastActive}</td><td class="amt">${fmtG(r.yeast.activeDry)}</td></tr>`;
    
    if (r.takeOutOldDoughG > 0) {
      ingHtml += `<tr style="border-top:1px dashed #ccc; font-weight:bold;"><td>Kiveendő öregtészta a végén</td><td class="amt">${fmtG(r.takeOutOldDoughG)}</td></tr>`;
    }

    document.getElementById('p-ingredients').innerHTML = ingHtml;
    
    let printTimelineHtml = '';
    for (let i = 0; i < r.timeline.length; i++) {
      const item = r.timeline[i];
      const prevItem = i > 0 ? r.timeline[i - 1] : null;
      const translationKey = 'timeline' + item.label;
      const desc = PizzaAlkimistaStrings[translationKey] || item.label;
      
      let timeLabel = '';
      if (item.h === 0) {
        timeLabel = 'Kezdet (0p)';
      } else {
        const diffHours = item.h - (prevItem ? prevItem.h : 0);
        const durationStr = formatDuration(diffHours);
        if (i === r.timeline.length - 1) {
          timeLabel = `További ${durationStr} után (Összesen: ${formatDuration(item.h)})`;
        } else {
          timeLabel = `${durationStr} kelesztés után`;
        }
      }
      printTimelineHtml += `<li><span class="t">${timeLabel}</span> ${desc}</li>`;
    }
    document.getElementById('p-timeline').innerHTML = printTimelineHtml;

    const bigaSection = document.getElementById('p-biga-section');
    if (r.biga) {
      bigaSection.hidden = false;
      document.getElementById('p-biga').innerHTML = `
        <tr><td>Biga liszt</td><td class="amt">${fmtG(r.biga.biga.flour)}</td></tr>
        <tr><td>Biga víz</td><td class="amt">${fmtG(r.biga.biga.water)}</td></tr>
        <tr><td>Biga élesztő (friss)</td><td class="amt">${fmtG(r.biga.biga.yeastFresh)}</td></tr>`;
    } else { 
      bigaSection.hidden = true; 
    }

    // Dinamikus, a beállítások alapján testreszabott instrukciók (hülyebiztos, konkrét grammokkal és időkkel)
    let steps = [];
    if (r.biga) {
      steps.push(`<b>Biga előkészítése</b>: Mérj ki ${fmtG(r.biga.biga.flour)} lisztet, ${fmtG(r.biga.biga.water)} vizet és ${fmtG(r.biga.biga.yeastFresh)} friss élesztőt. Keverd össze lazán, darabosra. Takard le és keleszd szobahőmérsékleten (${inp.bigaRoomTempC || 18}°C) ${formatDuration(inp.bigaRoomHours || 16)} ideig${inp.bigaColdHours > 0 ? ` + hűtőszekrényben (${inp.bigaColdTempC || 4}°C) ${formatDuration(inp.bigaColdHours)} ideig` : ''}.`);
      steps.push(`<b>Fő dagasztás</b>: Tépkedd apró darabokra a megérett bigát. Add hozzá a fő lisztet (${fmtG(r.biga.final.flour)}), vizet (${fmtG(r.biga.final.water)}), sót (${fmtG(r.saltG)})${r.oilG > 0 ? `, zsiradékot (${fmtG(r.oilG)})` : ''}${r.useOldDough ? ` és a bevinni kívánt öregtésztát (${fmtG(r.oldDoughG)})` : ''}. Dagassz sima, rugalmas tésztát.`);
    } else {
      steps.push(`<b>Dagasztás</b>: Keverd össze és dolgozd össze alaposan a lisztet (${fmtG(r.flour)}), vizet (${fmtG(r.water)}), sót (${fmtG(r.saltG)})${r.oilG > 0 ? `, zsiradékot (${fmtG(r.oilG)})` : ''}${r.useOldDough ? ` és az öregtésztát (${fmtG(r.oldDoughG)})` : ''}. Az élesztő mennyisége Friss: ${fmtG(r.yeast.fresh)} (vagy Instant: ${fmtG(r.yeast.instantDry)}, vagy Aktív száraz: ${fmtG(r.yeast.activeDry)}). Dagassz addig, amíg szép sima és feszes tésztát kapsz.`);
    }

    if (r.takeOutOldDoughG > 0) {
      steps.push(`<b>Öregtészta elmentése (KI)</b>: A dagasztás végeztével azonnal mérj ki belőle ${fmtG(r.takeOutOldDoughG)} tésztát, tedd jól záródó edénybe és tedd a hűtőbe a következő sütéshez.`);
    }

    const bulkHours = Math.min(1.5, Math.max(0.5, r.totalHours * 0.15));
    steps.push(`<b>Tömbös előkelesztés (Massa)</b>: Takard le a tésztát és hagyd szobahőmérsékleten (${roomT}°C) pihenni ${formatDuration(bulkHours)} ideig, hogy a gluténszerkezet ellazuljon.`);
    
    steps.push(`<b>Gombócolás</b>: Vágd a tésztát a kívánt darabokra (${r.style === 'teglia' ? 'tepsi méretre' : r.ballGroups.map(g => `${g.count} db × ${g.weight}g`).join(' + ')}), formázz belőlük feszes felületű tésztagolyókat.`);

    if (coldH > 0) {
      steps.push(`<b>Hideg kelesztés (hűtő)</b>: Helyezd a golyókat kelesztőedénybe, és keleszd a hűtőben (${coldT}°C) ${formatDuration(coldH)} ideig.`);
      steps.push(`<b>Sütés előtti bemelegítés</b>: A hűtőből kivéve hagyd a gombócokat szobahőmérsékleten (${roomT}°C) kelni további 2 órán át, hogy elérjék a megfelelő sütési hőmérsékletet és nyújthatóságot.`);
    } else {
      const remainingRoom = Math.max(0, roomH - bulkHours);
      steps.push(`<b>Készre kelesztés szobahőn</b>: Hagyd a gombócokat kelesztőedényben szobahőmérsékleten (${roomT}°C) kelni további ${formatDuration(remainingRoom)} ideig.`);
    }

    const isTeglia = r.style === 'teglia';
    steps.push(`<b>Sütés</b>: ${isTeglia ? 'Olajozott tepsiben finoman terítsd szét a tésztát a szélekig, előnyújtsd, feltétezd és sütőben/kemencében süsd készre.' : 'Nyújtsd ki a tésztagolyót kézzel (a szélén a levegőbuborékokat megtartva), tetszőlegesen feltétezd és a lehető legmagasabb hőfokon süsd készre.'}`);

    document.getElementById('p-method-list').innerHTML = steps.map(step => `<li>${step}</li>`).join('');
    document.getElementById('p-notes').textContent = notes || '';
    
    // Mobil böngészőknél a DOM frissülés megvárása a nyomtatási párbeszédablak megnyitása előtt
    setTimeout(() => {
      window.print();
    }, 100);
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
      
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) { el.value = val; el.dispatchEvent(new Event('input')); }
      };

      if (last.style) {
        currentStyle = last.style;
        document.querySelectorAll('.style-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.style === last.style);
        });
        document.getElementById('calc-form').className = 'style-' + last.style;
      }
      
      if (last.roomHours !== undefined) setVal('roomHours', last.roomHours);
      if (last.roomTempC !== undefined) setVal('roomTempC', last.roomTempC);
      if (last.yeastFactor !== undefined) {
        appSettings.yeastFactor = last.yeastFactor * 100;
        setVal('yeastFactor', appSettings.yeastFactor);
      }
      if (last.coldHours !== undefined) setVal('coldHours', last.coldHours);
      if (last.coldTempC !== undefined) setVal('coldTempC', last.coldTempC);
      
      if (last.bigaFlourPct !== undefined) setVal('bigaFlourPct', last.bigaFlourPct);
      if (last.bigaHydration !== undefined) setVal('bigaHydration', last.bigaHydration);
      if (last.bigaRoomHours !== undefined) setVal('bigaRoomHours', last.bigaRoomHours);
      if (last.bigaRoomTempC !== undefined) setVal('bigaRoomTempC', last.bigaRoomTempC);
      if (last.bigaColdHours !== undefined) {
        const useBigaCold = document.getElementById('useBigaCold');
        if (useBigaCold) {
          useBigaCold.checked = last.bigaColdHours > 0;
          useBigaCold.dispatchEvent(new Event('change'));
        }
        setVal('bigaColdHours', last.bigaColdHours);
      }
      if (last.bigaColdTempC !== undefined) setVal('bigaColdTempC', last.bigaColdTempC);

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
      { id: 'roomTempC', min: isFahr ? 50 : 16, max: isFahr ? 105 : 40, step: isFahr ? 1 : 0.5 },
      { id: 'coldTempC', min: isFahr ? 35 : 2, max: isFahr ? 68 : 20, step: isFahr ? 1 : 0.5 },
      { id: 'bigaRoomTempC', min: isFahr ? 50 : 16, max: isFahr ? 105 : 40, step: isFahr ? 1 : 0.5 },
      { id: 'bigaColdTempC', min: isFahr ? 35 : 2, max: isFahr ? 68 : 20, step: isFahr ? 1 : 0.5 }
    ];
    tempFields.forEach(({ id, min, max, step }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const curVal = parseFloat(el.value);
      el.min = min; el.max = max; el.step = step;
      if (!isNaN(curVal)) {
        el.value = isFahr ? cToF(curVal) : fToC(curVal);
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
    applySettingsToUI();
    loadLastInput();
    renderWikiCats();
    renderRecipeList();
    setupYeastSwitcher();

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

    document.getElementById('toggle-recipe-name')?.addEventListener('change', e => {
      document.getElementById('recipe-name-field-wrapper').hidden = !e.target.checked;
    });
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
