/* CopEngine — «Гаишник»: отдельные сценарии нарушений */
const CopEngine = (() => {
  let state = null;

  // База нарушений для режима Гаишник (создана специально для этого режима)
  const COP_SCENARIOS = [
    {
      text: "Водитель движется по городу со скоростью 95 км/ч.",
      violations: [
        { text: "Превышение максимальной скорости", isMain: true },
        { text: "Опасное вождение", isMain: false }
      ]
    },
    {
      text: "Автомобиль выехал на перекрёсток на красный сигнал светофора и столкнулся с другой машиной.",
      violations: [
        { text: "Проезд на запрещающий сигнал светофора", isMain: true },
        { text: "Несоблюдение дистанции", isMain: false }
      ]
    },
    {
      text: "Водитель остановился на пешеходном переходе (на зебре), чтобы купить воды в киоске.",
      violations: [
        { text: "Остановка на пешеходном переходе", isMain: true },
        { text: "Создание помех пешеходам", isMain: false }
      ]
    },
    {
      text: "Водитель разговаривает по телефону, держа его в руке, во время движения.",
      violations: [
        { text: "Использование телефона без гарнитуры", isMain: true },
        { text: "Отвлечение от управления ТС", isMain: false }
      ]
    },
    {
      text: "Машина выехала на полосу встречного движения через сплошную линию разметки.",
      violations: [
        { text: "Выезд на встречную полосу", isMain: true },
        { text: "Пересечение сплошной линии разметки", isMain: true }
      ]
    },
    {
      text: "Автомобиль припарковался на месте для инвалидов без соответствующего знака на кузове.",
      violations: [
        { text: "Стоянка на месте для инвалидов", isMain: true },
        { text: "Нарушение правил парковки", isMain: false }
      ]
    }
  ];

  function start(onFinish) {
    // Берем 5 случайных ситуаций
    let pool = shuffle(COP_SCENARIOS.slice()).slice(0, 5);

    state = {
      onFinish,
      steps: pool.map(sc => {
        // Добавляем 2 ложных нарушения для перемешивания
        const fakes = ["Непристёгнутый ремень", "Езда без номеров", "Отсутствие аптечки", "Непройденный техосмотр"]
          .filter(f => !sc.violations.some(v => v.text === f));
        const extraFakes = shuffle(fakes).slice(0, 2).map(t => ({ text: t, isMain: false }));
        return Object.assign({}, sc, { violations: shuffle(sc.violations.concat(extraFakes)) });
      }),
      idx: 0,
      phase: "check", // check | main | done
      chosen: new Set(),
      correctCount: 0,
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
        <div class="quiz-question" style="background:var(--navy-700);padding:16px;border-radius:12px">${escapeHtml(sc.text)}</div>
        <p class="dim" style="margin-top:16px">Выберите все нарушения, которые видите:</p>
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
    } 
    else if (state.phase === "main") {
      // Находим главное нарушение для показа вариантов
      const mainViolations = sc.violations.filter(v => v.isMain);
      app.innerHTML = `
        <div class="quiz-top">
          <span>🚔 Главное нарушение</span>
          <span>${App.heartIcons()}</span>
        </div>
        <div class="progress"><span style="width:${((state.idx + 0.5) / total) * 100}%"></span></div>
        <div class="quiz-question">Какое из отмеченных нарушений является самым грубым (главным)?</div>
        <div id="c-radios">
          ${mainViolations.map((v, i) => `
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
      // Навешиваем обработчик на кнопку
      document.getElementById("c-confirm").addEventListener("click", () => {
        const sel = document.querySelector('input[name="main"]:checked');
        if (!sel) return alert("Выберите вариант!");
        confirmMain(mainViolations[parseInt(sel.value)]);
      });
    }
  }

  function checkViolations() {
    const sc = state.steps[state.idx];
    const checks = document.querySelectorAll(".check-item");
    let hasMain = false;

    sc.violations.forEach((v, i) => {
      const isChecked = state.chosen.has(i);
      const label = checks[i];
      
      if (v.isMain) hasMain = true;

      if (isChecked) {
        if (v.isMain) { label.classList.add("correct"); }
        else { label.classList.add("wrong"); App.loseHeart(); App.addXP(-15); }
      } else if (v.isMain) {
        label.classList.add("wrong");
        App.loseHeart();
        App.addXP(-15);
      }
    });
    
    document.querySelectorAll(".check-item input").forEach(cb => cb.disabled = true);
    document.getElementById("c-check").style.display = "none";
    
    if (!hasMain) {
      state.idx++;
      if (state.idx >= state.steps.length) { finish(); return; }
      state.chosen.clear(); state.phase = "check";
      render();
      return;
    }
    
    // Переходим к выбору главного
    setTimeout(() => {
      state.phase = "main";
      render();
    }, 1000); // Даем секунду посмотреть на правильные ответы
  }

  function confirmMain(mainViolation) {
    state.correctCount++;
    App.addXP(20);
    
    document.querySelectorAll(".radio-item").forEach(r => r.style.pointerEvents = "none");
    
    document.getElementById("c-confirm").style.display = "none";
    const fb = document.createElement("div");
    fb.className = "explain ok";
    fb.innerHTML = `<strong>✅ Верно!</strong><div>Главное нарушение: ${escapeHtml(mainViolation.text)}</div>`;
    document.getElementById("app").appendChild(fb);
    
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn primary";
    nextBtn.textContent = "Следующая ситуация";
    nextBtn.style.marginTop = "12px";
    nextBtn.addEventListener("click", () => {
      state.idx++;
      state.chosen.clear();
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
