/* App — ядро приложения */
const App = (() => {
  const STORAGE_KEY = "pdd_progress";
  let progress = null;
  let currentView = "home";
  let currentSection = null;
  let currentCardId = null;

  const LEVELS = [
    { lvl: 1, xp: 0, name: "🚶 Новичок" },
    { lvl: 2, xp: 100, name: "🚗 Ученик" },
    { lvl: 3, xp: 300, name: "🛣 Водитель" },
    { lvl: 4, xp: 600, name: "🚦 Опытный" },
    { lvl: 5, xp: 1000, name: "🎯 Эксперт" },
    { lvl: 6, xp: 2000, name: "🏆 Мастер ПДД" },
  ];

  function defaultProgress() {
    return {
      xp: 50,
      hearts: 5,
      streak: 0,
      lastStudy: "",
      lastHeartRestore: "",
      seenScenarios: {},
      sections: {},
      createdAt: Date.now(),
    };
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) progress = Object.assign(defaultProgress(), JSON.parse(raw));
      else progress = defaultProgress();
    } catch (e) {
      progress = defaultProgress();
    }
  }

  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (e) {}
  }

  function checkStreak() {
    const today = todayStr();
    if (!progress.lastStudy) {
      progress.streak = 1;
      progress.lastStudy = today;
      return;
    }
    if (progress.lastStudy === today) return;
    const last = new Date(progress.lastStudy);
    const now = new Date(today);
    const diff = Math.round((now - last) / 86400000);
    if (diff === 1) progress.streak += 1;
    else progress.streak = 1;
    progress.lastStudy = today;
  }

  function restoreHearts() {
    const today = todayStr();
    if (progress.lastHeartRestore !== today && progress.hearts < 5) {
      progress.hearts = Math.min(5, progress.hearts + 1);
      progress.lastHeartRestore = today;
    }
    if (!progress.lastHeartRestore) progress.lastHeartRestore = today;
  }

  function loseHeart() {
    if (progress.hearts > 0) progress.hearts--;
    saveProgress();
  }

  function addHeart() {
    if (progress.hearts < 5) progress.hearts++;
    saveProgress();
  }

  function addXP(n) {
    progress.xp = Math.max(0, progress.xp + n);
    saveProgress();
  }

  function getLevel() {
    let cur = LEVELS[0];
    for (const l of LEVELS) { if (progress.xp >= l.xp) cur = l; }
    return cur;
  }

  function getDifficultyRange() {
    const lvl = getLevel().lvl;
    if (lvl <= 2) return [1, 1];
    if (lvl === 3) return [1, 2];
    if (lvl === 4) return [2, 3];
    if (lvl === 5) return [3, 4];
    return [4, 5];
  }

  function markSeen(id) {
    progress.seenScenarios[id] = Date.now();
    saveProgress();
  }

  function getUnseenScenarios(mode) {
    const all = PDD_DATA.scenarios.filter(s => !mode || s.mode.includes(mode));
    const unseen = all.filter(s => !progress.seenScenarios[s.id]);
    const seen = all.filter(s => progress.seenScenarios[s.id])
      .sort((a, b) => (progress.seenScenarios[a.id] || 0) - (progress.seenScenarios[b.id] || 0));
    return unseen.concat(seen);
  }

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function heartIcons() {
    let s = "";
    for (let i = 0; i < 5; i++) s += i < progress.hearts ? "❤️" : "🖤";
    return s;
  }

  function renderHUD() {
    const hs = document.getElementById("hud-streak");
    const hh = document.getElementById("hud-hearts");
    if (hs) hs.textContent = "🔥 " + progress.streak;
    if (hh) hh.textContent = heartIcons() + " " + progress.hearts + "/5";
  }

  function renderNav() {
    document.querySelectorAll(".tab").forEach(el => {
      el.classList.toggle("active", el.dataset.nav === currentView);
    });
  }

  function render() {
    renderHUD();
    renderNav();
    const app = document.getElementById("app");
    
    // Очищаем контейнер перед рендером, чтобы старые обработчики удалялись
    app.innerHTML = ""; 

    switch (currentView) {
      case "home": viewHome(app); break;
      case "library": viewLibrary(app); break;
      case "quiz": viewQuizMenu(app); break;
      case "modes": viewModes(app); break;
      case "profile": viewProfile(app); break;
      case "section": viewSection(app); break;
      case "card": viewCard(app); break;
      default: viewHome(app);
    }
  }

  function go(view, arg) {
    currentView = view;
    if (arg) {
      if (view === "section") currentSection = arg;
      if (view === "card") currentCardId = arg;
    }
    window.scrollTo(0, 0);
    render();
  }

  function findCard(id) {
    return PDD_DATA.signs.all.find(c => c.id === id) ||
      PDD_DATA.rules.sections.flatMap(s => s.cards).find(c => c.id === id) ||
      null;
  }

  // --- НОВАЯ ГЛАВНАЯ СТРАНИЦА ---
  function viewHome(app) {
    const lvl = getLevel();
    
    app.innerHTML = `
      <div style="text-align:center; margin: 20px 0 30px;">
        <div style="font-size:3.5rem; margin-bottom:10px;">🚦</div>
        <h1 style="font-size:2rem; margin:0; font-weight:800;">Привет, Водитель!</h1>
        <p class="dim" style="margin-top:8px; font-size:1.05rem;">${lvl.name} · ${progress.xp} XP</p>
      </div>

      <div class="card" style="background: var(--bg-card-hover); margin-bottom: 24px;">
        <h3 style="margin-top:0; color:#fff;">🔥 Продолжить обучение</h3>
        <p class="dim" style="font-size:0.9rem; margin-bottom:16px;">Стрик: ${progress.streak} дней. Не теряй ритм!</p>
        <div style="display:flex; gap:12px;">
          <button class="btn primary" id="home-trip" style="flex:1;">🚗 Поездка</button>
          <button class="btn" id="home-quiz" style="flex:1;">🎯 Тест</button>
        </div>
      </div>

      <h2 style="margin-top:24px;">Знаки</h2>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:24px;">
        ${PDD_DATA.signs.sections.map(s => `
          <div class="card" data-sec="${s.id}" style="padding:20px 16px; text-align:center; cursor:pointer; margin:0;">
            <div style="font-size:2rem; margin-bottom:8px;">🚸</div>
            <div style="font-weight:700; font-size:0.95rem; margin-bottom:4px;">${s.title.split(' ')[0]}</div>
            <div class="dim" style="font-size:0.8rem;">${s.cards.length} знаков</div>
          </div>
        `).join("")}
      </div>

      <h2>Правила ПДД</h2>
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${PDD_DATA.rules.sections.slice(0, 5).map(s => `
          <div class="card" data-sec="${s.id}" style="padding:16px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; margin:0;">
            <div style="font-weight:600;">${s.title}</div>
            <div class="dim" style="font-size:1.2rem;">→</div>
          </div>
        `).join("")}
        <button class="btn ghost" id="home-all-rules" style="margin-top:8px;">Посмотреть все 26 разделов</button>
      </div>
    `;
    
    // Обработчики для Главной
    document.querySelectorAll("[data-sec]").forEach(el => {
      el.addEventListener("click", () => {
        currentSection = el.dataset.sec;
        go("section");
      });
    });
    
    document.getElementById("home-trip").addEventListener("click", () => TripEngine.start());
    document.getElementById("home-quiz").addEventListener("click", () => go("quiz"));
    document.getElementById("home-all-rules").addEventListener("click", () => go("library"));
  }

  function getSectionData(id) {
    if (id.startsWith("signs-")) {
      return PDD_DATA.signs.sections.find(s => s.id === id);
    }
    return PDD_DATA.rules.sections.find(s => s.id === id);
  }

  function viewSection(app) {
    const sec = getSectionData(currentSection);
    if (!sec) { go("home"); return; }
    app.innerHTML = `
      <button class="btn ghost" id="sec-back" style="width:auto;margin-bottom:12px; padding:10px 16px;">← Назад</button>
      <h1>${sec.title}</h1>
      <div id="sec-list">
        ${sec.cards.map(c => `
          <div class="lib-card" data-card="${c.id}">
            ${c.image ? `<img src="${c.image}" alt="" onerror="this.style.display='none'" />` : `<div style="font-size:1.6rem;width:64px;text-align:center">📘</div>`}
            <div class="lib-body">
              <div class="lib-title">${c.title}</div>
              <div class="lib-sub">${c.subtitle || ""}</div>
            </div>
          </div>
        `).join("")}
      </div>
      <div class="btn-row" style="margin-top:16px">
        <button class="btn primary" id="sec-quiz">🎯 Проверить себя</button>
      </div>
    `;
    document.getElementById("sec-back").addEventListener("click", () => go("home"));
    document.querySelectorAll("[data-card]").forEach(el => {
      el.addEventListener("click", () => go("card", el.dataset.card));
    });
    document.getElementById("sec-quiz").addEventListener("click", () => {
      QuizEngine.start({ section: currentSection });
    });
  }

  function viewCard(app) {
    const c = findCard(currentCardId);
    if (!c) { go("home"); return; }
    app.innerHTML = `
      <button class="btn ghost" id="c-back" style="width:auto;margin-bottom:12px; padding:10px 16px;">← Назад</button>
      <div class="card">
        ${c.image ? `<div style="text-align:center;margin-bottom:16px"><img src="${c.image}" alt="" style="max-width:120px;max-height:120px;object-fit:contain; background:#fff; border-radius:12px; padding:8px;" onerror="this.style.display='none'" /></div>` : ""}
        <h1 style="margin-top:0">${c.title}</h1>
        ${c.subtitle ? `<div class="dim" style="margin-bottom:12px">${c.subtitle}</div>` : ""}
        <p>${c.description || ""}</p>
      </div>
      <div class="btn-row">
        <button class="btn primary" id="card-quiz">🎯 Проверить себя</button>
      </div>
    `;
    document.getElementById("c-back").addEventListener("click", () => go("section", c.section || "signs-1"));
    document.getElementById("card-quiz").addEventListener("click", () => {
      QuizEngine.start({ section: currentSection });
    });
  }

  function viewLibrary(app) {
    app.innerHTML = `
      <h1>📚 Библиотека</h1>
      <h2>Знаки</h2>
      ${PDD_DATA.signs.sections.map(s => `
        <div class="section-row" data-sec="${s.id}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div class="lib-title" style="font-weight:700;">${s.title}</div>
            <div class="lib-sub dim">${s.cards.length} знаков</div>
          </div>
          <div style="font-size:1.2rem; color:var(--text-dim);">→</div>
        </div>
      `).join("")}
      <h2>Правила ПДД</h2>
      ${PDD_DATA.rules.sections.map(s => `
        <div class="section-row" data-sec="${s.id}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div class="lib-title" style="font-weight:700;">${s.title}</div>
            <div class="lib-sub dim">${s.cards.length} карточек</div>
          </div>
          <div style="font-size:1.2rem; color:var(--text-dim);">→</div>
        </div>
      `).join("")}
    `;
    document.querySelectorAll("[data-sec]").forEach(el => {
      el.addEventListener("click", () => { currentSection = el.dataset.sec; go("section"); });
    });
  }

  function viewQuizMenu(app) {
    app.innerHTML = `
      <h1>🎯 Тест</h1>
      <p class="dim">Выберите раздел:</p>
      <h2>Знаки</h2>
      ${PDD_DATA.signs.sections.map(s => `
        <div class="section-row" data-quiz="${s.id}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div class="lib-title" style="font-weight:700;">${s.title}</div>
            <div class="lib-sub dim">${s.cards.length} знаков</div>
          </div>
          <div style="font-size:1.2rem; color:var(--text-dim);">→</div>
        </div>
      `).join("")}
      <h2>Правила</h2>
      ${PDD_DATA.rules.sections.map(s => `
        <div class="section-row" data-quiz="${s.id}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div class="lib-title" style="font-weight:700;">${s.title}</div>
            <div class="lib-sub dim">${s.cards.length} карточек</div>
          </div>
          <div style="font-size:1.2rem; color:var(--text-dim);">→</div>
        </div>
      `).join("")}
      <div class="btn-row" style="margin-top:16px">
        <button class="btn primary" id="quiz-all">🎲 Смешанный тест</button>
      </div>
    `;
    document.querySelectorAll("[data-quiz]").forEach(el => {
      el.addEventListener("click", () => QuizEngine.start({ section: el.dataset.quiz }));
    });
    document.getElementById("quiz-all").addEventListener("click", () => QuizEngine.start({ section: "all" }));
  }

  function viewModes(app) {
    app.innerHTML = `
      <h1>🎮 Режимы</h1>
      <div class="card" style="cursor:pointer;" id="mode-trip">
        <h3 style="margin-top:0;">🚗 Поездка</h3>
        <p class="dim" style="margin-bottom:0;">10 сценариев, сердца. Провал при 0.</p>
      </div>
      <div class="card" style="cursor:pointer;" id="mode-cop">
        <h3 style="margin-top:0;">🚔 Гаишник</h3>
        <p class="dim" style="margin-bottom:0;">Отметьте нарушения и главное.</p>
      </div>
      <div class="card" style="cursor:pointer;" id="mode-daily">
        <h3 style="margin-top:0;">🎯 Сценарий дня</h3>
        <p class="dim" style="margin-bottom:0;">2 детерминированных сценария, 1 жизнь.</p>
      </div>
    `;
    document.getElementById("mode-trip").addEventListener("click", () => TripEngine.start());
    document.getElementById("mode-cop").addEventListener("click", () => CopEngine.start());
    document.getElementById("mode-daily").addEventListener("click", () => DailyEngine.start());
  }

  function viewProfile(app) {
    const lvl = getLevel();
    const nextLvl = LEVELS.find(l => l.lvl === lvl.lvl + 1);
    const xpToNext = nextLvl ? nextLvl.xp - progress.xp : 0;
    app.innerHTML = `
      <h1>👤 Профиль</h1>
      <div class="card">
        <div style="font-size:1.3rem;font-weight:800; color:var(--accent);">${lvl.name}</div>
        <div class="dim" style="margin-top:4px;">${progress.xp} XP</div>
        <div class="progress" style="margin:12px 0;"><span style="width:${nextLvl ? Math.min(100, (progress.xp / nextLvl.xp) * 100) : 100}%"></span></div>
        ${nextLvl ? `<div class="dim" style="font-size:.85rem">До ${nextLvl.name}: ${xpToNext} XP</div>` : "<div class='dim'>Максимальный уровень!</div>"}
      </div>
      
      <div class="card" style="display:flex; justify-content:space-between; text-align:center;">
        <div>
          <div style="font-size:1.5rem; margin-bottom:4px;">🔥</div>
          <div style="font-weight:700;">${progress.streak}</div>
          <div class="dim" style="font-size:0.8rem;">Стрик</div>
        </div>
        <div>
          <div style="font-size:1.5rem; margin-bottom:4px;">❤️</div>
          <div style="font-weight:700;">${progress.hearts}/5</div>
          <div class="dim" style="font-size:0.8rem;">Сердца</div>
        </div>
        <div>
          <div style="font-size:1.5rem; margin-bottom:4px;">📖</div>
          <div style="font-weight:700;">${Object.keys(progress.seenScenarios).length}</div>
          <div class="dim" style="font-size:0.8rem;">Изучено</div>
        </div>
      </div>

      <h2 style="color:var(--error);">Сброс прогресса</h2>
      <div class="btn-row">
        <button class="btn danger" id="p-reset">Сбросить всё</button>
      </div>
      <div class="divider" style="height:1px; background:var(--border); margin:24px 0;"></div>
      <p class="dim" style="font-size:.85rem; text-align:center;">
        Приложение работает полностью на устройстве.<br>
        Аналитики, cookies и трекеров нет.
      </p>
    `;
    document.getElementById("p-reset").addEventListener("click", () => {
      if (confirm("Сбросить весь прогресс?")) {
        localStorage.removeItem(STORAGE_KEY);
        progress = defaultProgress();
        saveProgress();
        go("home");
      }
    });
  }

  function bindEvents() {
    // Навигация внизу экрана
    document.querySelectorAll("[data-nav]").forEach(el => {
      el.onclick = (e) => {
        e.preventDefault();
        go(el.dataset.nav);
      };
    });
  }

  function init() {
    loadProgress();
    restoreHearts();
    checkStreak();
    bindEvents();
    renderHUD();
    render();
  }

  return {
    init, loadProgress, saveProgress, checkStreak, restoreHearts,
    loseHeart, addHeart, addXP, getLevel, getDifficultyRange,
    markSeen, getUnseenScenarios, go, render, renderHUD, heartIcons,
    LEVELS, todayStr,
    get progress() { return progress; },
    set progress(v) { progress = v; }
  };
})();

document.addEventListener("DOMContentLoaded", () => App.init());
