/* TripEngine — «Поездка»: 10 сценариев, сердца, провал при 0 */
const TripEngine = (() => {
  let state = null;

  function start(onFinish) {
    const range = App.getDifficultyRange();
    let pool = App.getUnseenScenarios("trip")
      .filter(sc => sc.difficulty >= range[0] && sc.difficulty <= range[1]);
    if (pool.length < 10) pool = PDD_DATA.scenarios.filter(sc => sc.mode.includes("trip"));
    pool = shuffle(pool).slice(0, 10);

    state = {
      onFinish,
      steps: pool,
      idx: 0,
      answered: false,
      correctCount: 0,
      lost: false,
    };
    render();
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function render() {
    const app = document.getElementById("app");
    if (App.progress.hearts <= 0) {
      fail();
      return;
    }
    const sc = state.steps[state.idx];
    const total = state.steps.length;

    app.innerHTML = `
      <div class="quiz-top">
        <span>🚗 Шаг ${state.idx + 1} / ${total}</span>
        <span>${App.heartIcons()}</span>
      </div>
      <div class="progress"><span style="width:${(state.idx / total) * 100}%"></span></div>
      <div class="quiz-question">${escapeHtml(sc.text)}</div>
      <div id="t-options">
        ${sc.options.map((opt, i) => `
          <button class="option" data-i="${i}">${escapeHtml(opt.text)}</button>
        `).join("")}
      </div>
      <div id="t-feedback" style="display:none"></div>
      <div class="btn-row">
        <button class="btn ghost" id="t-quit">Выйти</button>
      </div>
    `;
    app.querySelectorAll(".option").forEach(btn => {
      btn.addEventListener("click", () => answer(parseInt(btn.dataset.i), btn));
    });
    document.getElementById("t-quit").addEventListener("click", () => { state = null; App.render(); });
  }

  function answer(i, btn) {
    if (state.answered) return;
    state.answered = true;
    const sc = state.steps[state.idx];
    const correct = sc.options[i].correct;
    document.querySelectorAll(".option").forEach((b, idx) => {
      b.disabled = true;
      if (sc.options[idx].correct) b.classList.add("correct");
      if (idx === i && !correct) b.classList.add("wrong");
    });

    App.markSeen(sc.id);

    if (correct) {
      state.correctCount++;
      App.addXP(10);
    } else {
      App.loseHeart();
      App.addXP(-15);
    }

    const fb = document.getElementById("t-feedback");
    fb.style.display = "block";
    fb.innerHTML = `
      <div class="explain ${correct ? "ok" : "err"}">
        <strong>${correct ? "✅ Верно!" : "❌ Ошибка."}</strong>
        <div>Правильный ответ: <em>${escapeHtml(sc.options.find(o => o.correct).text)}</em></div>
        <div style="margin-top:6px">${escapeHtml(sc.explain || "")}</div>
        ${sc.cardId ? `<button class="btn ghost" id="t-review" style="margin-top:10px;width:auto">📖 Повторить карточку</button>` : ""}
      </div>
      <div class="btn-row">
        <button class="btn primary" id="t-next">Далее</button>
      </div>
    `;
    const review = document.getElementById("t-review");
    if (review) review.addEventListener("click", () => { state = null; App.go("card", sc.cardId); });
    document.getElementById("t-next").addEventListener("click", next);
    App.renderHUD();
  }

  function next() {
    state.answered = false;
    state.idx++;
    if (App.progress.hearts <= 0) { fail(); return; }
    if (state.idx >= state.steps.length) { finish(); return; }
    render();
  }

  function fail() {
    const s = state;
    state = null;
    document.getElementById("app").innerHTML = `
      <div class="card center">
        <div class="big-emoji">💥</div>
        <h1>Поездка провалена</h1>
        <p class="dim">Сердца закончились. Восстановите их и попробуйте снова.</p>
        <div class="btn-row"><button class="btn primary" id="t-back">На главную</button></div>
      </div>
    `;
    document.getElementById("t-back").addEventListener("click", () => App.go("home"));
    if (s && typeof s.onFinish === "function") s.onFinish(false);
  }

  function finish() {
    const s = state;
    state = null;
    const perfect = s.correctCount === s.steps.length;
    if (perfect) {
      App.addXP(50);
      App.loseHeart();
    }
    document.getElementById("app").innerHTML = `
      <div class="card center">
        <div class="big-emoji">${perfect ? "🏁" : "🚗"}</div>
        <h1>Поездка завершена</h1>
        <p>Верно: ${s.correctCount} из ${s.steps.length}</p>
        ${perfect ? "<p class='dim'>Бонус +50 XP, сердце восстановлено</p>" : ""}
        <div class="btn-row"><button class="btn primary" id="t-back">На главную</button></div>
      </div>
    `;
    document.getElementById("t-back").addEventListener("click", () => App.go("home"));
    App.saveProgress();
    App.renderHUD();
    if (typeof s.onFinish === "function") s.onFinish(perfect);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  return { start, quit: () => { state = null; App.render(); } };
})();
