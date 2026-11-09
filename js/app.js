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
    document.querySelectorAll("[data-nav]").forEach(el => {
      el.classList.toggle("active", el.dataset.nav === currentView);
    });
  }

  function render() {
    renderHUD();
    renderNav();
    const app = document.getElementById("app");
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

  function viewHome(app) {
    const lvl = getLevel();
    const nextLvl = LEVELS.find(l => l.lvl === lvl.lvl + 1);
    const xpToNext = nextLvl ? nextLvl.xp - progress.xp : 0;

    app.innerHTML = `
      <h1>Привет! 👋</h1>
      <div class="card">
        <div class="dim">Уровень</div>
        <div style="font-size:1.3rem;font-weight:700">${lvl.name}</div>
        <div class="dim" style="font-size:.85rem">${progress.xp} XP${nextLvl ? ` · до следующего ${xpToNext} XP` : ""}</div>
        <div class="progress"><span style="width:${nextLvl ? Math.min(100, (progress.xp / nextLvl.xp) * 100) : 100}%"></span></div>
        <div class="btn-row">
          <button class="btn primary" id="home-trip">🚗 Поездка</button>
          <button class="btn" id="home-quiz">🎯 Тест</button>
        </div>
      </div>

      <h2>Знаки</h2>
      ${PDD_DATA.signs.sections.map(s => `
        <div class="section-row" data-sec="${s.id}">
          <div class="ico">🚸</div>
          <div class="body">
            <div class="title">${s.title}</div>
            <div class="sub">${s.cards.length} знаков</div>
          </div>
        </div>
      `).join("")}

      <h2>Правила</h2>
      ${PDD_DATA.rules.sections.map(s => `
        <div class="section-row" data-sec="${s.id}">
          <div class="ico">📘</div>
          <div class="body">
            <div class="title">${s.title}</div>
            <div class="sub">${s.cards.length} карточек</div>
          </div>
        </div>
      `).join("")}

      <div class="btn-row" style="margin-top:24px">
        <button class="btn ghost" id="home-daily">🎯 Сценарий дня</button>
      </div>
    `;
    document.querySelectorAll("[data-sec]").forEach(el => {
      el.addEventListener("click", () => {
        currentSection = el.dataset.sec;
        go("section");
      });
    });
    document.getElementById("home-trip").addEventListener("click", () => {
      TripEngine.start();
    });
    document.getElementById("home-quiz").addEventListener("click", () => go("quiz"));
    document.getElementById("home-daily").addEventListener("click", () => {
      DailyEngine.start();
    });
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
    const isSigns = currentSection.startsWith("signs-");
    app.innerHTML = `
      <button class="btn ghost" id="sec-back" style="width:auto;margin-bottom:12px">← Назад</button>
      <h1>${sec.title}</h1>
      <div id="sec-list">
        ${sec.cards.map(c => `
          <div class="lib-card" data-card="${c.id}">
            ${c.image ? `<img src="${c.image}" alt="" onerror="this.style.display='none'" />` : `<div class="ico" style="font-size:1.6rem;width:64px;text-align:center">📘</div>`}
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
      <button class="btn ghost" id="c-back" style="width:auto;margin-bottom:12px">← Назад</button>
      <div class="card">
        ${c.image ? `<div style="text-align:center;margin-bottom:12px"><img src="${c.image}" alt="" style="max-width:120px;max-height:120px;object-fit:contain" onerror="this.style.display='none'" /></div>` : ""}
        <h1 style="margin-top:0">${c.title}</h1>
        ${c.subtitle ? `<div class="dim" style="margin-bottom:8px">${c.subtitle}</div>` : ""}
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
        <div class="section-row" data-sec="${s.id}">
          <div class="ico">🚸</div>
          <div class="body"><div class="title">${s.title}</div><div class="sub">${s.cards.length} знаков</div></div>
        </div>
      `).join("")}
      <h2>Правила</h2>
      ${PDD_DATA.rules.sections.map(s => `
        <div class="section-row" data-sec="${s.id}">
          <div class="ico">📘</div>
          <div class="body"><div class="title">${s.title}</div><div class="sub">${s.cards.length} карточек</div></div>
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
        <div class="section-row" data-quiz="${s.id}">
          <div class="ico">🚸</div>
          <div class="body"><div class="title">${s.title}</div><div class="sub">${s.cards.length} знаков</div></div>
        </div>
      `).join("")}
      <h2>Правила</h2>
      ${PDD_DATA.rules.sections.map(s => `
        <div class="section-row" data-quiz="${s.id}">
          <div class="ico">📘</div>
          <div class="body"><div class="title">${s.title}</div><div class="sub">${s.cards.length} карточек</div></div>
        </div>
      `).join("")}
      <div class="btn-row" style="margin-top:16px">
        <button class="btn" id="quiz-all">🎲 Смешанный тест</button>
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
      <div class="card">
        <h3>🚗 Поездка</h3>
        <p class="dim">10 сценариев, сердца. Провал при 0.</p>
        <button class="btn primary" id="m-trip">Начать</button>
      </div>
      <div class="card">
        <h3>🚔 Гаишник</h3>
        <p class="dim">Отметьте нарушения и главное.</p>
        <button class="btn primary" id="m-cop">Начать</button>
      </div>
      <div class="card">
        <h3>🎯 Сценарий дня</h3>
        <p class="dim">2 детерминированных сценария, 1 жизнь.</p>
        <button class="btn primary" id="m-daily">Начать</button>
      </div>
    `;
    document.getElementById("m-trip").addEventListener("click", () => TripEngine.start());
    document.getElementById("m-cop").addEventListener("click", () => CopEngine.start());
    document.getElementById("m-daily").addEventListener("click", () => DailyEngine.start());
  }

  function viewProfile(app) {
    const lvl = getLevel();
    const nextLvl = LEVELS.find(l => l.lvl === lvl.lvl + 1);
    const xpToNext = nextLvl ? nextLvl.xp - progress.xp : 0;
    app.innerHTML = `
      <h1>👤 Профиль</h1>
      <div class="card">
        <div style="font-size:1.2rem;font-weight:700">${lvl.name}</div>
        <div class="dim">${progress.xp} XP</div>
        <div class="progress"><span style="width:${nextLvl ? Math.min(100, (progress.xp / nextLvl.xp) * 100) : 100}%"></span></div>
        ${nextLvl ? `<div class="dim" style="font-size:.85rem">До ${nextLvl.name}: ${xpToNext} XP</div>` : "<div class='dim'>Максимальный уровень!</div>"}
      </div>
      <div class="card">
        <div>🔥 Стрик: <strong>${progress.streak}</strong></div>
        <div>❤️ Сердца: <strong>${progress.hearts}/5</strong></div>
        <div>📖 Изучено сценариев: <strong>${Object.keys(progress.seenScenarios).length}</strong></div>
      </div>
      <h2>Сброс прогресса</h2>
      <div class="btn-row">
        <button class="btn danger" id="p-reset">Сбросить всё</button>
      </div>
      <div class="divider"></div>
      <p class="dim" style="font-size:.85rem">
        Приложение работает полностью на устройстве. Прогресс хранится в localStorage (pdd_progress).
        Аналитики, cookies, трекеров нет. Сетевые запросы — только PNG знаков.
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
    document.querySelectorAll("[data-nav]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        go(el.dataset.nav);
      });
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
    viewHome, viewSection, viewLibrary, viewQuizMenu, viewModes, viewProfile,
    bindEvents,
    get progress() { return progress; },
    set progress(v) { progress = v; },
    LEVELS, todayStr,
  };
})();

document.addEventListener("DOMContentLoaded", () => App.init());
