const App = {
  route: "home",
  progress: {},
  currentSection: null,

  init() {
    this.loadProgress();
    this.checkStreak();
    this.restoreHearts();
    document.querySelectorAll(".bottomnav button").forEach(btn => {
      btn.onclick = () => this.go(btn.dataset.route);
    });
    this.go("home");
  },

  loadProgress() {
    try { this.progress = JSON.parse(localStorage.getItem("pdd_progress") || "{}"); } catch(e) { this.progress = {}; }
    this.renderTopBar();
  },

  saveProgress() {
    localStorage.setItem("pdd_progress", JSON.stringify(this.progress));
    this.renderTopBar();
  },

  renderTopBar() {
    const s = document.getElementById("streakCount");
    const h = document.getElementById("heartsCount");
    if (s) s.textContent = this.progress.streak || 0;
    if (h) h.textContent = (this.progress.hearts !== undefined ? this.progress.hearts : 5) + "/5";
  },

  saveStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const last = this.progress.lastStudy;
    if (!last) this.progress.streak = 1;
    else {
      const diff = (new Date(today) - new Date(last)) / 86400000;
      if (diff === 1) this.progress.streak = (this.progress.streak || 0) + 1;
      else if (diff > 1) this.progress.streak = 1;
    }
    this.progress.lastStudy = today;
    this.saveProgress();
  },

  checkStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const last = this.progress.lastStudy;
    if (last && (new Date(today) - new Date(last)) / 86400000 > 1) {
      this.progress.streak = 0;
      this.saveProgress();
    }
  },

  restoreHearts() {
    if (this.progress.hearts === undefined) this.progress.hearts = 5;
    if (this.progress.hearts < 5) {
      this.progress.hearts = Math.min(5, this.progress.hearts + 1);
      this.saveProgress();
    }
  },

  loseHeart() {
    if (this.progress.hearts > 0) {
      this.progress.hearts--;
      this.saveProgress();
      return this.progress.hearts > 0;
    }
    return false;
  },

  addXP(n) {
    this.progress.xp = Math.max(0, (this.progress.xp || 0) + n);
    this.saveProgress();
  },

  getLevel() {
    const xp = this.progress.xp || 0;
    if (xp >= 2000) return { lvl: 6, name: "🏆 Мастер ПДД" };
    if (xp >= 1000) return { lvl: 5, name: "🎯 Эксперт" };
    if (xp >= 600) return { lvl: 4, name: "🚦 Опытный" };
    if (xp >= 300) return { lvl: 3, name: "🛣 Водитель" };
    if (xp >= 100) return { lvl: 2, name: "🚗 Ученик" };
    return { lvl: 1, name: "🚶 Новичок" };
  },

  go(route) {
    this.route = route;
    document.querySelectorAll(".bottomnav button").forEach(b => b.classList.toggle("active", b.dataset.route === route));
    this.render();
  },

  render() {
    const app = document.getElementById("app");
    if (this.route === "home") app.innerHTML = this.viewHome();
    if (this.route === "section") app.innerHTML = this.viewSection(this.currentSection);
    if (this.route === "library") app.innerHTML = this.viewLibrary();
    if (this.route === "quiz") app.innerHTML = this.viewQuizMenu();
    if (this.route === "modes") app.innerHTML = this.viewModes();
    if (this.route === "profile") app.innerHTML = this.viewProfile();
    this.bindEvents();
  },

  viewHome() {
    return `
      <section class="home">
        <h1>Продолжайте серию 🔥</h1>
        <div class="cards-grid">
          ${PDD_DATA.blocks.map(b => `
            <div class="block-card">
              <div class="block-emoji">${b.emoji}</div>
              <h3>${b.title}</h3>
              ${b.sections.map(s => `
                <button class="section-btn ${s.isStub ? 'stub-btn' : ''}" data-section="${s.id}" data-stub="${!!s.isStub}">
                  ${s.title} <span class="sec-status">${s.isStub ? '🔒' : '→'}</span>
                </button>
              `).join("")}
            </div>
          `).join("")}
        </div>
      </section>
    `;
  },

  viewSection(section) {
    if (!section) return `<p>Раздел не найден.</p>`;
    return `
      <section class="section-view">
        <button class="back-btn" id="backHome">← Назад</button>
        <h1>${section.title}</h1>
        <div class="card-list">
          ${section.cards.map(c => `
            <div class="lib-card">
              ${c.image ? `<img src="${c.image}" onerror="this.style.display='none'">` : ""}
              <div>
                <div class="lib-code">${c.code}</div>
                <div class="lib-title">${c.title}</div>
                <p class="lib-desc">${c.description}</p>
              </div>
            </div>
          `).join("")}
        </div>
        ${section.questions && section.questions.length > 0 ? `<button class="btn-primary" id="startQuiz">🎯 Проверить себя (${section.questions.length} вопр.)</button>` : `<p style="text-align:center;color:#888;margin-top:20px">Вопросов пока нет</p>`}
      </section>
    `;
  },

  viewLibrary() {
    return `
      <section class="library">
        <h1>📚 Библиотека</h1>
        ${PDD_DATA.blocks.map(b => `
          <h2 class="lib-block">${b.emoji} ${b.title}</h2>
          ${b.sections.map(s => `
            <h3 class="lib-section">${s.title} ${s.isStub ? '🔒' : ''}</h3>
            ${s.isStub ? `<p style="color:#888;font-size:0.9rem;margin-bottom:10px">Раздел в разработке.</p>` : `
            <div class="card-list">
              ${s.cards.map(c => `
                <div class="lib-card">
                  ${c.image ? `<img src="${c.image}" onerror="this.style.display='none'">` : ""}
                  <div>
                    <div class="lib-code">${c.code}</div>
                    <div class="lib-title">${c.title}</div>
                    <p class="lib-desc">${c.description}</p>
                  </div>
                </div>
              `).join("")}
            </div>`}
          `).join("")}
        `).join("")}
      </section>
    `;
  },

  viewQuizMenu() {
    const availableSections = [];
    PDD_DATA.blocks.forEach(b => b.sections.forEach(s => {
      if (s.questions && s.questions.length > 0) availableSections.push(s);
    }));
    return `
      <section class="quiz-menu">
        <h1>🎯 Выберите раздел для теста</h1>
        ${availableSections.length ? availableSections.map(s => `
          <button class="section-btn" data-section="${s.id}">${s.title} <span>${s.questions.length} вопр.</span></button>
        `).join("") : '<p>Нет доступных тестов.</p>'}
      </section>
    `;
  },

  viewModes() {
    return `
      <section class="modes">
        <h1>🎮 Режимы</h1>
        <div class="cards-grid">
          <div class="block-card">
            <h3>🚗 Поездка</h3>
            <p class="sub">Квест, 10 сценариев.</p>
            <button class="btn-primary" id="startTripBtn">Начать поездку</button>
          </div>
          <div class="block-card">
            <h3>🚔 Гаишник</h3>
            <p class="sub">Отметьте нарушения.</p>
            <button class="btn-primary" id="startCopBtn">Начать проверку</button>
          </div>
          <div class="block-card">
            <h3>🎯 Сценарий дня</h3>
            <p class="sub">1 жизнь.</p>
            <button class="btn-primary" id="startDailyBtn">Играть</button>
          </div>
        </div>
      </section>
    `;
  },

  viewProfile() {
    const p = this.progress;
    const lvl = this.getLevel();
    return `
      <section class="profile">
        <h1>👤 Профиль</h1>
        <div class="block-card" style="margin-bottom:20px">
          <div style="font-size:1.2rem;font-weight:bold;color:#3d6fb5">${lvl.name}</div>
          <div>${p.xp || 0} XP</div>
          <div class="progress" style="margin-top:10px"><div class="bar" style="width:${Math.min(100, (p.xp||0)/20)}%"></div></div>
        </div>
        <div class="stat-grid">
          <div class="stat"><span>${p.streak || 0}</span>🔥 Стрик</div>
          <div class="stat"><span>${p.hearts !== undefined ? p.hearts : 5}/5</span>❤️ Сердца</div>
        </div>
        <button class="btn-danger" id="resetBtn" style="margin-top:20px">Сбросить всё</button>
      </section>
    `;
  },

  bindEvents() {
    document.querySelectorAll(".section-btn").forEach(btn => {
      btn.onclick = () => {
        if (btn.dataset.stub === "true") return alert("Этот раздел в разработке! Скоро добавим.");
        this.currentSection = this.findSection(btn.dataset.section);
        this.go("section");
      };
    });

    document.getElementById("backHome")?.addEventListener("click", () => this.go("home"));
    document.getElementById("startQuiz")?.addEventListener("click", () => QuizEngine.start(this.currentSection, () => this.go("home")));
    
    document.getElementById("startTripBtn")?.addEventListener("click", () => TripEngine.start(() => this.go("home")));
    document.getElementById("startCopBtn")?.addEventListener("click", () => CopEngine.start(() => this.go("home")));
    document.getElementById("startDailyBtn")?.addEventListener("click", () => DailyEngine.start(() => this.go("home")));

    document.getElementById("resetBtn")?.addEventListener("click", () => {
      if (confirm("Сбросить прогресс?")) {
        localStorage.removeItem("pdd_progress");
        this.progress = {};
        this.loadProgress();
        this.go("profile");
      }
    });
  },

  findSection(id) {
    for (const b of PDD_DATA.blocks) for (const s of b.sections) if (s.id === id) return s;
    return null;
  }
};

window.addEventListener("DOMContentLoaded", () => App.init());
