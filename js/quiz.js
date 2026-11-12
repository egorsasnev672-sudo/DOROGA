const QuizEngine = {
  state: null,
  start(section, onFinish) {
    if (!section.questions || !section.questions.length) return alert("Нет вопросов.");
    this.state = { section, index: 0, correct: 0, total: section.questions.length, onFinish };
    this.render();
  },
  render() {
    const s = this.state;
    if (s.index >= s.total) return this.finish();
    const q = s.section.questions[s.index];
    
    document.getElementById("app").innerHTML = `
      <div class="quiz">
        <h2 class="q-text">${q.q}</h2>
        <div class="options">
          ${q.options.map((opt, i) => `<button class="option" data-i="${i}">${opt}</button>`).join("")}
        </div>
        <div class="explain hidden" id="explain"></div>
      </div>
    `;
    document.querySelectorAll(".option").forEach(btn => {
      btn.onclick = () => this.answer(+btn.dataset.i, btn);
    });
  },
  answer(i, btn) {
    const s = this.state, q = s.section.questions[s.index];
    document.querySelectorAll(".option").forEach(b => b.disabled = true);
    
    if (i === q.answer) { btn.classList.add("correct"); s.correct++; App.addXP(10); }
    else { btn.classList.add("wrong"); document.querySelectorAll(".option")[q.answer].classList.add("correct"); App.loseHeart(); }
    
    const ex = document.getElementById("explain");
    ex.classList.remove("hidden");
    ex.innerHTML = `<strong>${i === q.answer ? "Верно!" : "Ошибка"}</strong><br>${q.explain}<br>
      <button class="btn-primary" id="nextQ" style="margin-top:15px">Далее</button>`;
    
    document.getElementById("nextQ").onclick = () => { s.index++; this.render(); };
  },
  finish() {
    document.getElementById("app").innerHTML = `
      <div class="result">
        <h2>Результат: ${this.state.correct}/${this.state.total}</h2>
        <button class="btn-primary" id="finBtn">Продолжить</button>
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
