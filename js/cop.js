const CopEngine = {
  state: null,
  start(onFinish) {
    const pool = SCENARIOS.filter(s => s.mode.includes("cop"));
    if (!pool.length) return alert("Нет сценариев для Гаишника.");
    this.state = { steps: pool.slice(0, 3), index: 0, onFinish };
    this.renderStep1();
  },
  renderStep1() {
    const s = this.state;
    if (s.index >= s.steps.length) return this.finish();
    const q = s.steps[s.index];
    
    document.getElementById("app").innerHTML = `
      <div class="quiz">
        <h3>Дело ${s.index + 1} из ${s.steps.length}</h3>
        <h2 class="q-text">${q.text}</h2>
        <p>Отметьте нарушения:</p>
        <div class="options">
          ${q.violations.map((v, i) => `
            <label style="display:block;padding:10px;background:#12203a;margin-bottom:8px;border-radius:8px">
              <input type="checkbox" value="${i}" class="viol-check"> ${v.text}
            </label>
          `).join("")}
        </div>
        <button class="btn-primary" id="checkBtn" style="margin-top:15px">Проверить</button>
      </div>
    `;

    document.getElementById("checkBtn").onclick = () => {
      const checked = Array.from(document.querySelectorAll(".viol-check:checked")).map(el => +el.value);
      this.renderStep2(checked);
    };
  },
  renderStep2(checked) {
    const s = this.state;
    const q = s.steps[s.index];
    
    document.getElementById("app").innerHTML = `
      <div class="quiz">
        <h3>Главное нарушение</h3>
        <h2 class="q-text">Какое из отмеченных является самым грубым?</h2>
        <div class="options">
          ${q.violations.map((v, i) => `
            <label style="display:block;padding:10px;background:#12203a;margin-bottom:8px;border-radius:8px">
              <input type="radio" name="mainViol" value="${i}"> ${v.text}
            </label>
          `).join("")}
        </div>
        <button class="btn-primary" id="confirmBtn" style="margin-top:15px">Подтвердить</button>
      </div>
    `;

    document.getElementById("confirmBtn").onclick = () => {
      const mainRadio = document.querySelector('input[name="mainViol"]:checked');
      if (!mainRadio) return alert("Выберите главное нарушение!");
      
      const mainIdx = +mainRadio.value;
      const isMainCorrect = q.violations[mainIdx].isMain;
      
      let foundCount = 0;
      q.violations.forEach((v, i) => {
        if (v.isMain && checked.includes(i)) foundCount++;
      });
      
      App.addXP(foundCount * 10);
      
      if (isMainCorrect) {
        App.addXP(20);
        alert("Верно! Главное нарушение найдено. +20 XP");
      } else {
        App.loseHeart();
        alert("Неверно! Это не главное нарушение. -1 сердце");
      }

      s.index++;
      if (App.progress.hearts <= 0) {
        alert("Сердца закончились! Смена окончена.");
        s.onFinish(); return;
      }
      this.renderStep1();
    };
  },
  finish() {
    App.saveStreak();
    document.getElementById("app").innerHTML = `
      <div class="result">
        <h2>Смена окончена!</h2>
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
