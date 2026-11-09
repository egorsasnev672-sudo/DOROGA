/* QuizEngine — тест по разделу */
const QuizEngine = (() => {
  let state = null;

  function start(section, onFinish) {
    const range = App.getDifficultyRange();
    // Отбираем вопросы, доступные на текущем уровне сложности
    let pool = PDD_DATA.questions.slice();
    // фильтр по сложности: вопросы не имеют difficulty — фильтруем сценарии,
    // но в тестах используем все вопросы; ограничим по количеству
    const count = Math.min(10, pool.length);
    // перемешиваем
    pool = shuffle(pool).slice(0, count);

    state = {
      section,
      onFinish,
      questions: pool,
      idx: 0,
      answered: false,
      correctCount: 0,
      usedIds: new Set(),
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
      finish(true);
      return;
    }
    const q = state.questions[state.idx];
    const total = state.questions.length;

    app.innerHTML = `
      <div class="quiz-top">
        <span>Вопрос ${state.idx + 1} / ${total}</span>
        <span>${App.heartIcons()}</span>
      </div>
      <div class="progress"><span style="width:${(state.idx / total) * 100}%"></span></div>
      <div class="quiz-question">${escapeHtml(q.text)}</div>
      <div id="q-options">
        ${q.options.map((opt, i) => `
          <button class="option" data-i="${i}">${escapeHtml(opt)}</button>
        `).join("")}
      </div>
      <div id="q-feedback" style="display:none"></div>
      <div class="btn-row">
        <button class="btn ghost" id="q-quit">Выйти</button>
      </div>
    `;

    app.querySelectorAll(".option").forEach(btn => {
      btn.addEventListener("click", () => answer(parseInt(btn.dataset.i), btn));
    });
    document.getElementById("q-quit").addEventListener("click", () => quit());
  }

  function answer(i, btn) {
    if (state.answered) return;
    state.answered = true;
    const q = state.questions[state.idx];
    const correct = i === q.answer;
    const all = document.querySelectorAll(".option");
    all.forEach((b, idx) => {
      b.disabled = true;
      if (idx === q.answer) b.classList.add("correct");
      if (idx === i && !correct) b.classList.add("wrong");
    });

    if (correct) {
      state.correctCount++;
      App.addXP(10);
    } else {
      App.loseHeart();
      App.addXP(-15);
    }

    const fb = document.getElementById("q-feedback");
    fb.style.display = "block";
    fb.innerHTML = `
      <div class="explain ${correct ? "ok" : "err"}">
        <strong>${correct ? "✅ Верно!" : "❌ Ошибка."}</strong>
        <div>Правильный ответ: <em>${escapeHtml(q.options[q.answer])}</em></div>
        ${q.cardId ? `<button class="btn ghost" id="q-review" style="margin-top:10px;width:auto">📖 Повторить карточку</button>` : ""}
      </div>
      <div class="btn-row">
        <button class="btn primary" id="q-next">Далее</button>
      </div>
    `;
    const review = document.getElementById("q-review");
    if (review) review.addEventListener("click", () => App.go("card", q.cardId));
    document.getElementById("q-next").addEventListener("click", next);

    // Обновляем шапку (сердца)
    App.renderHUD();
  }

  function next() {
    state.answered = false;
    state.idx++;
    if (state.idx >= state.questions.length) {
      finish(false);
      return;
    }
    if (App.progress.hearts <= 0) {
      finish(true);
      return;
    }
    render();
  }

  function quit() {
    state = null;
    App.render();
  }

  function finish(failed) {
    const s = state;
    state = null;
    const perfect = !failed && s.correctCount === s.questions.length;
    const app = document.getElementById("app");
    if (failed) {
      app.innerHTML = `
        <div class="card center">
          <div class="big-emoji">💔</div>
          <h1>Сердца закончились</h1>
          <p class="dim">Сессия прервана. Восстановите сердца завтра или пройдите «Сценарий дня» без ошибок.</p>
          <div class="btn-row"><button class="btn primary" id="q-back">На главную</button></div>
        </div>
      `;
    } else {
      if (perfect) {
        App.addXP(50);
        App.loseHeart();
      }
      app.innerHTML = `
        <div class="card center">
          <div class="big-emoji">${perfect ? "🏆" : "🎉"}</div>
          <h1>Тест завершён</h1>
          <p>Верно: ${s.correctCount} из ${s.questions.length}</p>
          ${perfect ? "<p class='dim'>Бонус +50 XP, сердце восстановлено</p>" : ""}
          <div class="btn-row">
            <button class="btn primary" id="q-back">На главную</button>
          </div>
        </div>
      `;
    }
    document.getElementById("q-back").addEventListener("click", () => App.go("home"));
    App.saveProgress();
    App.renderHUD();
    if (typeof s.onFinish === "function") s.onFinish(perfect);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  return { start, quit };
})();
