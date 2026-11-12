const DailyEngine = {
  state: null,
  start(onFinish) {
    if (!SCENARIOS.length) return alert("Нет сценариев.");
    this.state = { steps: SCENARIOS.slice(0, 2), index: 0, onFinish };
    this.render();
  },
  render() {
    const s = this.state;
    if (s.index >= s.steps.length) return this.finish();
    const q = s.steps[s.index];
    
    document.getElementById("app").innerHTML = `
      <div class="quiz">
        <h3>Сценарий дня (1 жизнь)</h3>
        <h2 class="q-text">${q.text}</h2>
        <div class="options">
          ${q.options.map((opt, i) => `<button class="option" data-i="${i}">${opt.text}</button>`).join("")}
        </div>
      </div>
    `;
    document.querySelectorAll(".option").forEach(btn => {
      btn.onclick = () => {
        if (!q.options[+btn.dataset.i].correct) {
          alert("Ошибка! Сценарий дня сгорел.");
          s.onFinish(); return;
        }
        s.index++; this.render();
      };
    });
  },
  finish() {
    App.addXP(30);
    App.saveStreak();
    document.getElementById("app").innerHTML = `
      <div class="result">
        <h2>Сценарий дня пройден!</h2>
        <p>+30 XP</p>
        <button class="btn-primary" id="finBtn">На главную</button>
      </div>
    `;
    document.getElementById("finBtn").onclick = () => {
      const cb = this.state.onFinish;
      this.state = null;
      if (cb) cb(); else App.go("home");
    };
  }
};
