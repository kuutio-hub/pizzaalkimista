/*!
 * PizzaTárcsa — app.js
 * Vanilla JS, semmilyen build-lépés nem kell hozzá.
 */
(() => {
  'use strict';

  // ---------------------------------------------------------------------
  // Segéd: számformázás magyar tizedesponttal
  // ---------------------------------------------------------------------
  const fmt = (n, d = 0) => Number(n).toLocaleString('hu-HU', { maximumFractionDigits: d, minimumFractionDigits: d });
  const fmtG = n => (n >= 1000 ? fmt(n / 1000, 2) + ' kg' : fmt(n, 1) + ' g');

  // ---------------------------------------------------------------------
  // Info-szövegek az "i" gombokhoz — a determinisztikus képlet dokumentációja
  // ---------------------------------------------------------------------
  const INFO_TEXTS = {
    roomHours: 'Az a szakasz, amíg a tészta szobahőmérsékleten kel, mielőtt (ha van) hűtőbe kerülne, vagy egyenesen sütésig. Ez határozza meg, mikor kell dagasztanod ahhoz, hogy időben elkészülj.',
    roomTemp: 'A konyhád tényleges hőmérséklete — nem a receptkönyvi „szobahőmérséklet”, hanem amit te mérsz. Melegebb helyiségben az élesztő gyorsabban dolgozik, ezért kevesebb kell belőle.',
    cold: 'Ha bekapcsolod, a tészta egy részét (vagy a gombócokat) hűtőben, lassítva érleled tovább. A hosszabb, hidegebb erjedés mélyebb ízt ad, és kevesebb élesztőt igényel.',
    biga: 'A biga egy kemény, alacsony hidratációjú (45%) olasz előtészta, amit külön dagasztunk és érlelünk, mielőtt a végső tésztába kerülne. Erősebb szerkezetet és összetettebb ízt ad — haladóknak ajánlott.',
    hydration: 'A víz tömege a liszt tömegéhez viszonyítva, százalékban. Magasabb hidratáció = levegősebb, de nehezebben kezelhető tészta.',
    salt: 'A só a liszt tömegéhez viszonyított %-ban. Ízesít, és lassítja/erősíti a tésztaszerkezetet. Tipikus tartomány: 2,5–3%.',
    oil: 'Olívaolaj a liszt %-ában. A hagyományos nápolyi receptben nincs, római/tepsis stílusnál gyakori 1–4%.',
    ballCount: 'Hány külön tésztagombócot szeretnél formázni — jellemzően ennyi pizzát fogsz sütni belőle.',
    ballWeight: 'Egy tésztagombóc tömege grammban. 250–280 g egy szokásos, 28–32 cm-es nápolyi pizzához.',
    panArea: 'A tepsi belső területe négyzetméterben (hossz × szélesség). Egy 30×40 cm-es tepsi kb. 0,12 m².',
    gramPerM2: 'Négyzetméterenkénti tésztatömeg — Gabriele Bonci híres tepsis-szabálya alapján (tepsi cm²-e × 0,5–0,6). Vékonyabb, ropogósabb tepsis pizzához kevesebb (kb. 4000–4500 g/m²), magasabb, levegősebb, focaccia-szerű belsőhöz több (kb. 6500–8000 g/m²).'
  };

  function infoDot(key) {
    return `<button type="button" class="info-dot" data-info="${key}">i</button>`;
  }

  // ---------------------------------------------------------------------
  // Kalkulátor mezők stílusonként
  // ---------------------------------------------------------------------
  function renderFormFields(style) {
    const wrap = document.getElementById('form-fields');
    if (style === 'napolyi') {
      wrap.innerHTML = `
        <div class="row2">
          <div class="field">
            <label class="field-label">Gombócok száma ${infoDot('ballCount')}</label>
            <input type="number" id="ballCount" min="1" max="30" value="4">
          </div>
          <div class="field">
            <label class="field-label">Gombóc súlya (g) ${infoDot('ballWeight')}</label>
            <input type="number" id="ballWeightG" min="150" max="400" step="10" value="260">
          </div>
        </div>
        <p class="hint">A hidratáció (60%) és a só (2,8%) az AVPN nápolyi specifikáció szerint fixen van beállítva.</p>
      `;
    } else if (style === 'egyeni') {
      wrap.innerHTML = `
        <div class="row2">
          <div class="field">
            <label class="field-label">Gombócok száma ${infoDot('ballCount')}</label>
            <input type="number" id="ballCount" min="1" max="30" value="4">
          </div>
          <div class="field">
            <label class="field-label">Gombóc súlya (g) ${infoDot('ballWeight')}</label>
            <input type="number" id="ballWeightG" min="150" max="500" step="10" value="260">
          </div>
        </div>
        <div class="field">
          <label class="field-label">Hidratáció ${infoDot('hydration')}</label>
          <div class="range-row"><input type="range" id="hydration" min="50" max="85" step="1" value="65"><span class="range-value" id="hydration-val">65%</span></div>
        </div>
        <div class="row2">
          <div class="field">
            <label class="field-label">Só (%) ${infoDot('salt')}</label>
            <input type="number" id="salt" min="1" max="4" step="0.1" value="2.6">
          </div>
          <div class="field">
            <label class="field-label">Olaj (%) ${infoDot('oil')}</label>
            <input type="number" id="oil" min="0" max="6" step="0.5" value="1">
          </div>
        </div>
      `;
    } else if (style === 'teglia') {
      wrap.innerHTML = `
        <div class="row2">
          <div class="field">
            <label class="field-label">Tepsi hossza (cm)</label>
            <input type="number" id="panLen" min="10" max="100" value="40">
          </div>
          <div class="field">
            <label class="field-label">Tepsi szélessége (cm)</label>
            <input type="number" id="panWid" min="10" max="100" value="30">
          </div>
        </div>
        <div class="field">
          <label class="field-label">Tésztamennyiség (g/m²) ${infoDot('gramPerM2')}</label>
          <div class="range-row"><input type="range" id="gramPerM2" min="4000" max="8000" step="100" value="5500"><span class="range-value" id="gramPerM2-val">5500 g/m²</span></div>
        </div>
        <div class="field">
          <label class="field-label">Hidratáció ${infoDot('hydration')}</label>
          <div class="range-row"><input type="range" id="hydration" min="65" max="90" step="1" value="75"><span class="range-value" id="hydration-val">75%</span></div>
        </div>
        <div class="row2">
          <div class="field">
            <label class="field-label">Só (%) ${infoDot('salt')}</label>
            <input type="number" id="salt" min="1" max="4" step="0.1" value="2.5">
          </div>
          <div class="field">
            <label class="field-label">Olaj (%) ${infoDot('oil')}</label>
            <input type="number" id="oil" min="0" max="6" step="0.5" value="3">
          </div>
        </div>
      `;
    }
    bindRangeLabels(wrap);
  }

  function bindRangeLabels(scope) {
    scope.querySelectorAll('input[type=range]').forEach(r => {
      const out = document.getElementById(r.id + '-val');
      if (!out) return;
      const suffix = r.id === 'gramPerM2' ? ' g/m²' : (r.id.includes('Temp') ? '°C' : (r.id.includes('Hours') ? ' óra' : '%'));
      const update = () => out.textContent = r.value + suffix;
      r.addEventListener('input', update);
      update();
    });
  }

  // ---------------------------------------------------------------------
  // Stílusváltó szegmens
  // ---------------------------------------------------------------------
  let currentStyle = 'napolyi';
  document.getElementById('style-select').addEventListener('click', e => {
    const btn = e.target.closest('button[data-style]');
    if (!btn) return;
    document.querySelectorAll('#style-select button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentStyle = btn.dataset.style;
    renderFormFields(currentStyle);
    document.getElementById('result-wrap').hidden = true;
  });
  renderFormFields(currentStyle);
  bindRangeLabels(document.getElementById('calc-form'));

  document.getElementById('useCold').addEventListener('change', e => {
    document.getElementById('cold-fields').hidden = !e.target.checked;
  });

  // ---------------------------------------------------------------------
  // Info sheet (általános modal)
  // ---------------------------------------------------------------------
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
    openSheet('Mit jelent ez?', `<p>${INFO_TEXTS[key] || ''}</p>`);
  });

  // ---------------------------------------------------------------------
  // Kalkuláció
  // ---------------------------------------------------------------------
  let lastResult = null, lastInput = null;

  function readInput() {
    const v = id => document.getElementById(id)?.value;
    const input = {
      style: currentStyle,
      roomHours: parseFloat(v('roomHours')),
      roomTempC: parseFloat(v('roomTempC')),
      coldHours: document.getElementById('useCold').checked ? parseFloat(v('coldHours')) : 0,
      coldTempC: parseFloat(v('coldTempC') || 4),
      useBiga: document.getElementById('useBiga').checked
    };
    if (currentStyle === 'teglia') {
      const len = parseFloat(v('panLen')), wid = parseFloat(v('panWid'));
      input.panAreaM2 = (len / 100) * (wid / 100);
      input.gramPerM2 = parseFloat(v('gramPerM2'));
      input.hydration = parseFloat(v('hydration'));
      input.salt = parseFloat(v('salt'));
      input.oil = parseFloat(v('oil'));
    } else {
      input.ballCount = parseInt(v('ballCount'), 10);
      input.ballWeightG = parseFloat(v('ballWeightG'));
      if (currentStyle === 'egyeni') {
        input.hydration = parseFloat(v('hydration'));
        input.salt = parseFloat(v('salt'));
        input.oil = parseFloat(v('oil'));
      }
    }
    return input;
  }

  document.getElementById('calc-form').addEventListener('submit', e => {
    e.preventDefault();
    lastInput = readInput();
    lastResult = PizzaCalc.calculate(lastInput);
    renderResult(lastResult);
    document.getElementById('result-wrap').hidden = false;
    document.getElementById('result-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function ingredientRows(r) {
    let rows = `
      <tr><td>Liszt</td><td class="pct">100%</td><td class="amt">${fmtG(r.flour)}</td></tr>
      <tr><td>Víz</td><td class="pct">${fmt(r.hydration, 0)}%</td><td class="amt">${fmtG(r.water)}</td></tr>
      <tr><td>Só</td><td class="pct">${fmt(r.salt, 1)}%</td><td class="amt">${fmtG(r.saltG)}</td></tr>`;
    if (r.oil > 0) rows += `<tr><td>Olívaolaj</td><td class="pct">${fmt(r.oil, 1)}%</td><td class="amt">${fmtG(r.oilG)}</td></tr>`;
    rows += `
      <tr><td>Élesztő — friss</td><td class="pct">${fmt(r.yeastPct, 2)}%</td><td class="amt">${fmtG(r.yeast.fresh)}</td></tr>
      <tr><td class="small">— instant szárított</td><td></td><td class="amt small">${fmtG(r.yeast.instantDry)}</td></tr>
      <tr><td class="small">— aktív szárított</td><td></td><td class="amt small">${fmtG(r.yeast.activeDry)}</td></tr>`;
    return rows;
  }

  function renderResult(r) {
    document.getElementById('res-style').textContent = r.styleLabel;
    document.getElementById('res-total').innerHTML = `${fmtG(r.totalDoughG)} <span>összes tészta</span>`;
    const meta = r.style === 'teglia'
      ? `${fmt(r.panAreaM2, 2)} m² tepsi`
      : `${r.ballCount} × ${fmt(r.ballWeightG, 0)} g gombóc`;
    document.getElementById('res-meta').textContent = `${meta} · ${fmt(r.totalHours, 1)} óra kelesztés összesen`;

    document.getElementById('ing-table').innerHTML = ingredientRows(r);

    const bigaCard = document.getElementById('biga-card');
    if (r.biga) {
      bigaCard.hidden = false;
      document.getElementById('biga-table').innerHTML = `
        <tr><td>Biga liszt</td><td class="pct">50%</td><td class="amt">${fmtG(r.biga.biga.flour)}</td></tr>
        <tr><td>Biga víz</td><td class="pct">${r.biga.biga.hydration}%</td><td class="amt">${fmtG(r.biga.biga.water)}</td></tr>
        <tr><td>Biga élesztő (friss)</td><td class="pct">${fmt(r.biga.biga.yeastPct, 2)}%</td><td class="amt">${fmtG(r.biga.biga.yeastFresh)}</td></tr>
        <tr><td>Végső dagasztás liszt</td><td></td><td class="amt">${fmtG(r.biga.final.flour)}</td></tr>
        <tr><td>Végső dagasztás víz</td><td></td><td class="amt">${fmtG(r.biga.final.water)}</td></tr>`;
    } else {
      bigaCard.hidden = true;
    }

    document.getElementById('res-timeline').innerHTML = r.timeline.map(item => `
      <li><span class="t">${item.h === 0 ? 'most' : '+' + fmt(item.h, 1) + ' óra'}</span><span class="dot"></span> ${item.label}</li>
    `).join('');
  }

  // ---------------------------------------------------------------------
  // Mentés kedvencekbe
  // ---------------------------------------------------------------------
  document.getElementById('btn-save').addEventListener('click', () => {
    if (!lastResult) return;
    openSheet('Recept mentése', `
      <div class="field">
        <label class="field-label">Recept neve</label>
        <input type="text" id="save-name" placeholder="pl. Szombat esti nápolyi" value="${lastResult.styleLabel} — ${new Date().toLocaleDateString('hu-HU')}">
      </div>
      <button class="btn btn-primary btn-block" id="save-confirm">Mentés</button>
    `);
    document.getElementById('save-confirm').addEventListener('click', async () => {
      const name = document.getElementById('save-name').value.trim() || 'Névtelen recept';
      await PizzaDB.save({ name, input: lastInput, result: lastResult });
      closeSheet();
      showToast('Recept elmentve ✓');
      renderRecipeList();
    });
  });

  // ---------------------------------------------------------------------
  // Receptjeim nézet
  // ---------------------------------------------------------------------
  async function renderRecipeList() {
    const listEl = document.getElementById('recipe-list');
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

  document.getElementById('recipe-list').addEventListener('click', async e => {
    const item = e.target.closest('.recipe-item');
    if (!item) return;
    const id = item.dataset.id;
    const rec = await PizzaDB.get(id);
    if (e.target.closest('.act-load')) {
      lastInput = rec.input; lastResult = rec.result;
      currentStyle = rec.input.style;
      document.querySelectorAll('#style-select button').forEach(b => b.classList.toggle('active', b.dataset.style === currentStyle));
      renderFormFields(currentStyle);
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

  // ---------------------------------------------------------------------
  // Nyomtatás
  // ---------------------------------------------------------------------
  document.getElementById('btn-print').addEventListener('click', () => {
    if (!lastResult) return;
    printRecipe(lastResult.styleLabel, lastResult, '');
  });

  function printRecipe(name, r, notes) {
    document.getElementById('p-title').textContent = name;
    document.getElementById('p-subtitle').textContent = r.style === 'teglia'
      ? `${fmt(r.panAreaM2, 2)} m² tepsis pizza`
      : `${r.ballCount} × ${fmt(r.ballWeightG, 0)} g gombóc — ${r.styleLabel}`;
    document.getElementById('p-date').textContent = new Date().toLocaleDateString('hu-HU');
    document.getElementById('p-footer-date').textContent = 'Készült: ' + new Date().toLocaleString('hu-HU');
    document.getElementById('p-badges').innerHTML = `
      <span class="p-badge">${fmt(r.hydration,0)}% hidratáció</span>
      <span class="p-badge">${fmt(r.salt,1)}% só</span>
      <span class="p-badge">${fmt(r.totalHours,1)} óra kelesztés</span>`;
    document.getElementById('p-ingredients').innerHTML = ingredientRows(r)
      .replaceAll('ing-table', '').replaceAll('class="pct"', 'class="pct"');
    document.getElementById('p-timeline').innerHTML = r.timeline.map(item =>
      `<li><span class="t">${item.h === 0 ? 'most' : '+' + fmt(item.h, 1) + ' óra'}</span>${item.label}</li>`).join('');
    const bigaSection = document.getElementById('p-biga-section');
    if (r.biga) {
      bigaSection.hidden = false;
      document.getElementById('p-biga').innerHTML = `
        <tr><td>Biga liszt</td><td class="amt">${fmtG(r.biga.biga.flour)}</td></tr>
        <tr><td>Biga víz</td><td class="amt">${fmtG(r.biga.biga.water)}</td></tr>
        <tr><td>Biga élesztő</td><td class="amt">${fmtG(r.biga.biga.yeastFresh)}</td></tr>`;
    } else { bigaSection.hidden = true; }
    document.getElementById('p-notes').textContent = notes || '';
    window.print();
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
    document.getElementById('wiki-cats').innerHTML = WIKI_DATA.map(cat => `
      <button class="wiki-cat-btn" data-id="${cat.id}">
        <span class="ic">${WIKI_ICONS[cat.icon] || ''}</span>
        <span><h4>${cat.title}</h4><span class="sub">${cat.summary}</span></span>
      </button>
    `).join('');
  }
  renderWikiCats();

  document.getElementById('wiki-cats').addEventListener('click', e => {
    const btn = e.target.closest('.wiki-cat-btn');
    if (!btn) return;
    const cat = WIKI_DATA.find(c => c.id === btn.dataset.id);
    document.getElementById('wiki-article-body').innerHTML = `<h2>${cat.title}</h2>${cat.html}`;
    document.getElementById('wiki-index').hidden = true;
    document.getElementById('wiki-article').hidden = false;
  });
  document.getElementById('wiki-back').addEventListener('click', () => {
    document.getElementById('wiki-index').hidden = false;
    document.getElementById('wiki-article').hidden = true;
  });
  document.getElementById('link-wiki-fogalmak').addEventListener('click', () => {
    switchView('view-wiki');
    document.querySelector('.wiki-cat-btn[data-id="fogalmak"]').click();
  });

  // ---------------------------------------------------------------------
  // Navigáció
  // ---------------------------------------------------------------------
  function switchView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === id));
    document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.view === id));
    window.scrollTo(0, 0);
  }
  document.querySelector('.bottom-nav').addEventListener('click', e => {
    const btn = e.target.closest('button[data-view]');
    if (btn) switchView(btn.dataset.view);
  });

  // ---------------------------------------------------------------------
  // Toast
  // ---------------------------------------------------------------------
  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  // ---------------------------------------------------------------------
  // PWA: telepítés + service worker
  // ---------------------------------------------------------------------
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('btn-install').hidden = false;
  });
  document.getElementById('btn-install').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.getElementById('btn-install').hidden = true;
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  // Induláskor töltsük be a mentett recepteket
  renderRecipeList();
})();
