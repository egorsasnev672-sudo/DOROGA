/* DailyEngine — «Сценарий дня»: 2 детерминированных сценария, 1 жизнь */
const DailyEngine = (() => {
  let state = null;

  function dateHash() {
    const d = new Date();
    const s = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function start(onFinish) {
    const h = dateHash();
    const pool = PDD_DATA.scenarios.slice();
    const idx1 = h % pool.length;
    const idx2 = (h * 7 + 13) % pool.length;
    const chosen = [pool[idx1], pool[idx2 === idx1 ? (idx2 + 1) % pool.length : idx2]];

    state = {
      onFinish,
      steps: chosen,
      idx: 0,
      lives: 1,
      answered: false,
      correctCount: 0,
      dirty: false,
    };
    render();
  }

  function render() {
    const app = document.getElementById("app");
    const sc = state.steps[state.idx];
    const total = state.steps.length;

    app.innerHTML = `
      <div class="quiz-top">
        <span>🎯 Сценарий дня ${state.idx + 1} / ${total}</span>
        <span>${state.lives > 0 ? "❤️" : "💔"}</span>
      </div>
      <div class="progress"><span style="width:${(state.idx / total) * 100}%"></span></div>
      <div class="quiz-question">${escapeHtml(sc.text)}</div>
      <div id="d-options">
        ${sc.options.map((opt, i) => `
          <button class="option" data-i="${i}">${escapeHtml(opt.text)}</button>
        `).join("")}
      </div>
      <div id="d-feedback" style="display:none"></div>
    `;
    app.querySelectorAll(".option").forEach(btn => {
      btn.addEventListener("click", () => answer(parseInt(btn.dataset.i), btn));
    });
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
    if (!correct) {
      state.dirty = true;
      state.lives--;
    } else {
      state.correctCount++;
    }
    const fb = document.getElementById("d-feedback");
    fb.style.display = "block";
    fb.innerHTML = `
      <div class="explain ${correct ? "ok" : "err"}">
        <strong>${correct ? "✅ Верно!" : "❌ Ошибка."}</strong>
        <div>${escapeHtml(sc.explain || "")}</div>
      </div>
      <div class="btn-row"><button class="btn primary" id="d-next">${state.idx + 1 < state.steps.length ? "Далее" : "Завершить"}</button></div>
    `;
    document.getElementById("d-next").addEventListener("click", next);
  }

  function next() {
    state.answered = false;
    state.idx++;
    if (state.idx >= state.steps.length) { finish(); return; }
    if (state.lives <= 0) { finish(); return; }
    render();
  }

  function finish() {
    const s = state; state = null;
    const clean = !s.dirty && s.lives > 0 && s.correctCount === s.steps.length;
    if (clean) {
      App.addXP(30);
      App.addXP(30); // бонус за чистоту
      App.restoreHearts(1);
    } else {
      App.addXP(30);
    }
    document.getElementById("app").innerHTML = `
      <div class="card center">
        <div class="big-emoji">${clean ? "🌟" : "🎯"}</div>
        <h1>Сценарий дня пройден</h1>
        <p>Верно: ${s.correctCount} из ${s.steps.length}</p>
        ${clean ? "<p class='dim'>+1 сердце за чистоту</p>" : ""}
        <div class="btn-row"><button class="btn primary" id="d-back">На главную</button></div>
      </div>`;
    document.getElementById("d-back").addEventListener("click", () => App.go("home"));
    App.saveProgress(); App.renderHUD();
    if (s.onFinish) s.onFinish(clean);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  return { start, quit: () => { state = null; App.render(); } };
})();
