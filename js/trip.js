const TripEngine = {
  state: null,
  start(onFinish) {
    const pool = SCENARIOS.filter(s => s.mode.includes("trip"));
    if (!pool.length) return alert("Сценарии не загружены.");
    const steps = pool.slice(0, 10);
    this.state = { steps, index: 0, correct: 0, onFinish };
    this.render();
  },
  render() {
    const s = this.state;
    if (s.index >= s.steps.length) return this.finish();
    const q = s.steps[s.index];
    
    document.getElementById("app").innerHTML = `
      <div class="quiz">
        <h3>Шаг ${s.index + 1} из ${s.steps.length}</h3>
        <h2 class="q-text">${q.text}</h2>
        <div class="options">
          ${q.options.map((opt, i) => `<button class="option" data-i="${i}">${opt.text}</button>`).join("")}
        </div>
        <div class="explain hidden" id="explain"></div>
      </div>
    `;
    document.querySelectorAll(".option").forEach(btn => {
      btn.onclick = () => this.answer(+btn.dataset.i, btn);
    });
  },
  answer(i, btn) {
    const s = this.state, q = s.steps[s.index];
    document.querySelectorAll(".option").forEach(b => b.disabled = true);
    const isCorrect = q.options[i].correct;

    if (isCorrect) { btn.classList.add("correct"); s.correct++; App.addXP(10); }
    else { btn.classList.add("wrong"); App.loseHeart(); }

    const ex = document.getElementById("explain");
    ex.classList.remove("hidden");
    ex.innerHTML = `<strong>${isCorrect ? "Верно!" : "Ошибка"}</strong><br>${q.explain}<br>
      <button class="btn-primary" id="nextQ" style="margin-top:15px">Далее</button>`;

    document.getElementById("nextQ").onclick = () => {
      if (App.progress.hearts <= 0) {
        alert("Сердца закончились! Поездка провалена.");
        App.saveStreak(); s.onFinish(); return;
      }
      s.index++; this.render();
    };
  },
  finish() {
    document.getElementById("app").innerHTML = `
      <div class="result">
        <h2>Вы доехали!</h2>
        <p>Правильных решений: ${this.state.correct}/${this.state.steps.length}</p>
        <button class="btn-primary" id="finBtn">На главную</button>
      </div>
    `;
    document.getElementById("finBtn").onclick = () => {
      App.saveStreak();
      const cb = this.state.onFinish;
      this.state = null;
      if (cb) cb(); else App.go("home");
    };
  }
};
