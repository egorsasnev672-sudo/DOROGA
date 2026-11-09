/* CopEngine — «Гаишник»: чекбоксы нарушений → главное */
const CopEngine = (() => {
  let state = null;

  function start(onFinish) {
    const range = App.getDifficultyRange();
    let pool = PDD_DATA.scenarios.filter(sc => sc.mode.includes("cop") && sc.difficulty >= range[0] && sc.difficulty <= range[1]);
    if (pool.length < 5) pool = PDD_DATA.scenarios.filter(sc => sc.mode.includes("cop"));
    pool = shuffle(pool).slice(0, 5);

    state = {
      onFinish,
      steps: pool.map(sc => enrich(sc)),
      idx: 0,
      phase: "check", // check | main | done
      chosen: new Set(),
      mainIdx: null,
      correctCount: 0,
      usedIds: new Set(),
    };
    render();
  }

  function enrich(sc) {
    // Генерируем нарушения из options (правильные — как нарушения) + добавляем случайные
    const all = PDD_DATA.scenarios.filter(x => x.id !== sc.id).flatMap(x => x.options || []).map(o => o.text);
    const uniq = Array.from(new Set(all));
    const violations = sc.options.map(o => ({ text: o.text, isMain: o.correct, rule: o.rule || "" }));
    // Добавим 2–3 ложных
    const fakes = shuffle(uniq).filter(t => !violations.some(v => v.text === t)).slice(0, 3);
    fakes.forEach(t => violations.push({ text: t, isMain: false, rule: "" }));
    return Object.assign({}, sc, { violations: shuffle(violations) });
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
    if (App.progress.hearts <= 0) { fail(); return; }
    const sc = state.steps[state.idx];
    const total = state.steps.length;

    if (state.phase === "check") {
      app.innerHTML = `
        <div class="quiz-top">
          <span>🚔 Ситуация ${state.idx + 1} / ${total}</span>
          <span>${App.heartIcons()}</span>
        </div>
        <div class="progress"><span style="width:${(state.idx / total) * 100}%"></span></div>
        <div class="quiz-question">${escapeHtml(sc.text)}</div>
        <p class="dim">Отметьте все нарушения:</p>
        <div id="c-checks">
          ${sc.violations.map((v, i) => `
            <label class="check-item" data-i="${i}">
              <input type="checkbox" data-i="${i}" />
              <span class="check-box"></span>
              <span>${escapeHtml(v.text)}</span>
            </label>
          `).join("")}
        </div>
        <div class="btn-row">
          <button class="btn primary" id="c-check">Проверить</button>
          <button class="btn ghost" id="c-quit">Выйти</button>
        </div>
      `;
      document.querySelectorAll('.check-item input').forEach(cb => {
        cb.addEventListener("change", e => {
          const i = parseInt(e.target.dataset.i);
          if (e.target.checked) state.chosen.add(i); else state.chosen.delete(i);
        });
      });
      document.getElementById("c-check").addEventListener("click", checkViolations);
      document.getElementById("c-quit").addEventListener("click", () => { state = null; App.render(); });
    } else if (state.phase === "main") {
      app.innerHTML = `
        <div class="quiz-top">
          <span>🚔 Главное нарушение</span>
          <span>${App.heartIcons()}</span>
        </div>
        <div class="progress"><span style="width:${((state.idx + 0.5) / total) * 100}%"></span></div>
        <div class="quiz-question">Выберите главное нарушение:</div>
        <div id="c-radios">
          ${sc.violations.map((v, i) => `
            <label class="radio-item" data-i="${i}">
              <input type="radio" name="main" value="${i}" />
              <span class="radio-dot"></span>
              <span>${escapeHtml(v.text)}</span>
            </label>
          `).join("")}
        </div>
        <div class="btn-row">
          <button class="btn primary" id="c-confirm">Подтвердить</button>
        </div>
      `;
      document.getElementById("c-confirm").addEventListener("click", () => {
        const sel = document.querySelector('input[name="main"]:checked');
        if (!sel) return;
        state.mainIdx = parseInt(sel.value);
        confirmMain();
      });
    }
  }

  function checkViolations() {
    const sc = state.steps[state.idx];
    let ok = 0, total = 0;
    const checks = document.querySelectorAll(".check-item");
    sc.violations.forEach((v, i) => {
      const isChecked = state.chosen.has(i);
      const label = checks[i];
      if (isChecked) {
        total++;
        if (v.isMain) { ok++; label.classList.add("correct"); }
        else { label.classList.add("wrong"); App.loseHeart(); App.addXP(-15); }
      } else if (v.isMain) {
        label.classList.add("wrong");
        App.loseHeart();
        App.addXP(-15);
      }
    });
    document.querySelectorAll(".check-item input").forEach(cb => cb.disabled = true);
    document.getElementById("c-check").style.display = "none";
    // Переход к выбору главного
    const scNow = state.steps[state.idx];
    const hasMain = scNow.violations.some(v => v.isMain);
    if (!hasMain) {
      state.idx++;
      if (state.idx >= state.steps.length) { finish(); return; }
      state.chosen.clear(); state.mainIdx = null; state.phase = "check";
      render();
      return;
    }
    state.phase = "main";
    render();
  }

  function confirmMain() {
    const sc = state.steps[state.idx];
    const v = sc.violations[state.mainIdx];
    document.querySelectorAll(".radio-item").forEach(r => r.style.pointerEvents = "none");
    if (v.isMain) {
      state.correctCount++;
      App.addXP(20);
    } else {
      App.loseHeart();
      App.addXP(-15);
    }
    document.getElementById("c-confirm").style.display = "none";
    const fb = document.createElement("div");
    fb.className = "explain " + (v.isMain ? "ok" : "err");
    fb.innerHTML = `<strong>${v.isMain ? "✅ Верно!" : "❌ Ошибка."}</strong><div>${escapeHtml(sc.explain || "")}</div>`;
    document.getElementById("app").appendChild(fb);
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn primary";
    nextBtn.textContent = "Далее";
    nextBtn.style.marginTop = "12px";
    nextBtn.addEventListener("click", () => {
      state.idx++;
      state.chosen.clear();
      state.mainIdx = null;
      state.phase = "check";
      if (App.progress.hearts <= 0) { fail(); return; }
      if (state.idx >= state.steps.length) { finish(); return; }
      render();
    });
    document.getElementById("app").appendChild(nextBtn);
    App.renderHUD();
  }

  function fail() {
    const s = state; state = null;
    document.getElementById("app").innerHTML = `
      <div class="card center">
        <div class="big-emoji">💥</div>
        <h1>Сердца закончились</h1>
        <p class="dim">Попробуйте снова после восстановления.</p>
        <div class="btn-row"><button class="btn primary" id="c-back">На главную</button></div>
      </div>`;
    document.getElementById("c-back").addEventListener("click", () => App.go("home"));
    if (s && s.onFinish) s.onFinish(false);
  }

  function finish() {
    const s = state; state = null;
    document.getElementById("app").innerHTML = `
      <div class="card center">
        <div class="big-emoji">🚔</div>
        <h1>Проверка завершена</h1>
        <p>Верно: ${s.correctCount} из ${s.steps.length}</p>
        <div class="btn-row"><button class="btn primary" id="c-back">На главную</button></div>
      </div>`;
    document.getElementById("c-back").addEventListener("click", () => App.go("home"));
    App.saveProgress(); App.renderHUD();
    if (s.onFinish) s.onFinish(s.correctCount === s.steps.length);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  return { start, quit: () => { state = null; App.render(); } };
})();
