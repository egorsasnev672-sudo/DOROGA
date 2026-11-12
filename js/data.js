// ============================================================
// ДАННЫЕ ПДД (С заглушками, реальными правилами и 30 вопросами)
// ============================================================

const SIGN_IMG_BASE = "https://suvjunmd.github.io/images/";
const signImg = (code) => `${SIGN_IMG_BASE}s${code.replace(/\./g, "-")}.png`;

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#12203a" rx="12"/><text x="50" y="55" fill="#9fb0c9" font-size="14" text-anchor="middle" font-family="sans-serif">скоро</text></svg>`
);

// Генератор знаков 1.x
const generateWarnCards = () => {
  const codes = ["1.1", "1.2", "1.3.1", "1.3.2", "1.4.1", "1.4.2", "1.4.3", "1.4.4", "1.4.5", "1.4.6", "1.5", "1.6", "1.7.1", "1.7.2", "1.7.3", "1.7.4", "1.9", "1.10", "1.11", "1.12.1", "1.12.2", "1.13.1", "1.13.2", "1.14.1", "1.14.2", "1.15", "1.16.1", "1.16.2", "1.17.1", "1.17.2", "1.18.1", "1.18.2", "1.18.3", "1.19", "1.20", "1.21", "1.22", "1.23", "1.24.1", "1.24.2", "1.25.1", "1.25.2", "1.26", "1.27", "1.28", "1.29", "1.30", "1.31.1", "1.31.2", "1.32.1", "1.32.2", "1.33"];
  const titles = { "1.1": "Ж/д переезд со шлагбаумом", "1.2": "Ж/д переезд без шлагбаума", "1.5": "Пересечение с трамвайной линией", "1.6": "Пересечение равнозначных дорог", "1.22": "Пешеходный переход", "1.23": "Дети", "1.25.1": "Дорожные работы" };
  return codes.map(code => ({ id: code, code: code, title: titles[code] || `Знак ${code}`, image: signImg(code), description: `Описание знака ${code}.` }));
};

const PDD_DATA = {
  blocks: [
    {
      id: "signs", title: "Дорожные знаки", emoji: "🚸",
      sections: [
        { id: "warn", title: "Предупреждающие знаки (1.x)", cards: generateWarnCards(), questions: [] },
        {
          id: "priority", title: "Знаки приоритета (2.x)", cards: [
            { id: "2.1", code: "2.1", title: "Главная дорога", image: signImg("2.1"), description: "Преимущественный проезд." },
            { id: "2.2", code: "2.2", title: "Конец главной дороги", image: signImg("2.2"), description: "Действие 2.1 закончилось." },
            { id: "2.3", code: "2.3", title: "Пересечение со второстепенной", image: signImg("2.3"), description: "Преимущество на перекрестке." },
            { id: "2.4", code: "2.4", title: "Уступите дорогу", image: signImg("2.4"), description: "Нужно уступить." },
            { id: "2.5", code: "2.5", title: "STOP", image: signImg("2.5"), description: "Движение без остановки запрещено." },
            { id: "2.6", code: "2.6", title: "Преимущество встречного", image: signImg("2.6"), description: "Узкий участок." }
          ], questions: []
        },
        { id: "forbid", title: "Запрещающие знаки (3.x)", isStub: true },
        { id: "mandatory", title: "Предписывающие знаки (4.x)", isStub: true },
        { id: "info", title: "Информационные знаки (5.x-7.x)", isStub: true }
      ]
    },
    {
      id: "rules", title: "Правила движения", emoji: "📖",
      sections: [
        {
          id: "general", title: "Общие положения", cards: [
            { id: "p1.4", code: "п. 1.4", title: "Правостороннее движение", description: "На дорогах РФ установлено правостороннее движение." },
            { id: "p1.5", code: "п. 1.5", title: "Запрет создавать опасность", description: "Участники должны действовать так, чтобы не создавать опасности." }
          ], questions: []
        },
        {
          id: "duties", title: "Обязанности водителей", cards: [
            { id: "p2.1", code: "п. 2.1", title: "Документы", description: "Иметь при себе ВУ, СТС, ОСАГО." },
            { id: "p2.7", code: "п. 2.7", title: "Запреты", description: "Запрещено управлять в состоянии опьянения, пользоваться телефоном без гарнитуры." }
          ], questions: []
        },
        {
          id: "maneuvers", title: "Маневрирование", cards: [
            { id: "p8.1", code: "п. 8.1", title: "Подача сигналов", description: "Перед поворотом нужно подавать сигнал поворотником." },
            { id: "p8.3", code: "п. 8.3", title: "Выезд с прилегающей", description: "Водитель обязан уступить всем ТС и пешеходам." }
          ], questions: []
        },
        {
          id: "speed", title: "Скорость движения", cards: [
            { id: "p10.2", code: "п. 10.2", title: "В населенных пунктах", description: "Не более 60 км/ч." }
          ], questions: []
        },
        {
          id: "overtaking", title: "Обгон", cards: [
            { id: "p11.1", code: "п. 11.1", title: "Перед обгоном", description: "Убедиться в безопасности." },
            { id: "p11.4", code: "п. 11.4", title: "Запрещено", description: "Запрещен обгон на пешеходных переходах, перекрестках, ближе 100 м до ж/д переезда." }
          ], questions: []
        },
        {
          id: "stopping", title: "Остановка и стоянка", cards: [
            { id: "p12.4", code: "п. 12.4", title: "Где запрещена", description: "Остановка запрещена ближе 5 м до перехода, 15 м до остановок." }
          ], questions: []
        },
        {
          id: "crossroads", title: "Проезд перекрестков", cards: [
            { id: "p13.1", code: "п. 13.1", title: "Поворот", description: "Уступить пешеходам при повороте." },
            { id: "p13.9", code: "п. 13.9", title: "Неравнозначные", description: "Уступить на второстепенной." },
            { id: "p13.11", code: "п. 13.11", title: "Равнозначные", description: "Помеха справа." }
          ], questions: []
        },
        { id: "special", title: "Спецсигналы (раздел 3)", isStub: true },
        { id: "railway", title: "Ж/д переезды (раздел 15)", isStub: true }
      ]
    }
  ]
};

// Собираем все 30 вопросов в один пул (привязываем к разделам)
const ALL_QUESTIONS = [
  { q: "Что означает знак 1.1?", options: ["Ж/д переезд со шлагбаумом", "Ж/д переезд без шлагбаума", "Пересечение с трамваем"], answer: 0, explain: "Знак 1.1 — Ж/д переезд со шлагбаумом.", cardId: "1.1", difficulty: 1, sectionId: "warn" },
  { q: "На каком расстоянии вне населённого пункта ставится знак 1.1?", options: ["50–100 м", "150–300 м", "300–500 м"], answer: 1, explain: "Вне населённого пункта — за 150–300 м.", cardId: "1.1", difficulty: 1, sectionId: "warn" },
  { q: "Что означает знак 1.23?", options: ["Дети", "Пешеходный переход", "Дорожные работы"], answer: 0, explain: "1.23 — Дети.", cardId: "1.23", difficulty: 1, sectionId: "warn" },
  { q: "Знак 1.11 означает:", options: ["Опасный поворот", "Скользкая дорога", "Дорожные работы"], answer: 0, explain: "1.11 — Опасный поворот.", cardId: "1.11", difficulty: 1, sectionId: "warn" },
  { q: "Какой знак предупреждает о скользкой дороге?", options: ["1.15", "1.16", "1.17"], answer: 0, explain: "1.15 — Скользкая дорога.", cardId: "1.15", difficulty: 1, sectionId: "warn" },
  { q: "Что означает знак 1.25.1?", options: ["Дорожные работы", "Падение камней", "Тоннель"], answer: 0, explain: "1.25.1 — Дорожные работы.", cardId: "1.25.1", difficulty: 1, sectionId: "warn" },
  { q: "Знак 1.10 предупреждает о:", options: ["Выезде на набережную", "Разводном мосте", "Боковом ветре"], answer: 0, explain: "1.10 — Выезд на набережную.", cardId: "1.10", difficulty: 1, sectionId: "warn" },
  { q: "Что означает знак 1.13.1?", options: ["Крутой спуск", "Крутой подъём", "Опасный поворот"], answer: 0, explain: "1.13.1 — Крутой спуск.", cardId: "1.13.1", difficulty: 1, sectionId: "warn" },
  { q: "Знак 1.12.1 предупреждает о:", options: ["Опасных поворотах", "Сужении дороги", "Двустороннем движении"], answer: 0, explain: "1.12.1 — Опасные повороты.", cardId: "1.12.1", difficulty: 1, sectionId: "warn" },
  { q: "Знак 1.19 означает:", options: ["Пересечение с велодорожкой", "Пешеходный переход", "Дети"], answer: 0, explain: "1.19 — Пересечение с велодорожкой.", cardId: "1.19", difficulty: 1, sectionId: "warn" },
  { q: "Что означает знак 2.1?", options: ["Главная дорога", "Уступите дорогу", "STOP"], answer: 0, explain: "2.1 — Главная дорога.", cardId: "2.1", difficulty: 1, sectionId: "priority" },
  { q: "До какого знака действует 2.1?", options: ["До перекрестка", "До знака 2.2", "Бессрочно"], answer: 1, explain: "Зона действия ограничена знаком 2.2.", cardId: "2.1", difficulty: 1, sectionId: "priority" },
  { q: "Знак 2.4 означает:", options: ["Уступите дорогу", "Главная дорога", "STOP"], answer: 0, explain: "2.4 — Уступите дорогу.", cardId: "2.4", difficulty: 1, sectionId: "priority" },
  { q: "Что требует знак 2.5?", options: ["Обязательную остановку", "Снижение скорости", "Уступить трамваю"], answer: 0, explain: "2.5 (STOP) требует остановки.", cardId: "2.5", difficulty: 1, sectionId: "priority" },
  { q: "Знак 2.6 дает преимущество:", options: ["Вам", "Встречному транспорту", "Пешеходам"], answer: 1, explain: "2.6 — вы уступаете встречному.", cardId: "2.6", difficulty: 1, sectionId: "priority" },
  { q: "Какое движение на дорогах РФ?", options: ["Левостороннее", "Правостороннее", "Зависит от региона"], answer: 1, explain: "П. 1.4 ПДД.", cardId: "p1.4", difficulty: 1, sectionId: "general" },
  { q: "Что обязан иметь при себе водитель?", options: ["Только ВУ", "ВУ, СТС, ОСАГО", "Ничего"], answer: 1, explain: "П. 2.1 ПДД.", cardId: "p2.1", difficulty: 1, sectionId: "duties" },
  { q: "Разрешено ли пользоваться телефоном за рулем?", options: ["Да", "Только без гарнитуры", "Только с hands-free"], answer: 2, explain: "П. 2.7 ПДД.", cardId: "p2.7", difficulty: 1, sectionId: "duties" },
  { q: "Когда нужно включать поворотник?", options: ["Только при развороте", "Перед любым маневром", "Только ночью"], answer: 1, explain: "П. 8.1 ПДД.", cardId: "p8.1", difficulty: 1, sectionId: "maneuvers" },
  { q: "Кому уступает водитель при выезде с парковки?", options: ["Никому", "Всем ТС и пешеходам", "Только трамваю"], answer: 1, explain: "П. 8.3 ПДД.", cardId: "p8.3", difficulty: 1, sectionId: "maneuvers" },
  { q: "Максимальная скорость в городе?", options: ["40 км/ч", "60 км/ч", "80 км/ч"], answer: 1, explain: "П. 10.2 ПДД.", cardId: "p10.2", difficulty: 1, sectionId: "speed" },
  { q: "Что нужно сделать перед обгоном?", options: ["Включить дальний свет", "Убедиться в безопасности", "Подать звуковой сигнал"], answer: 1, explain: "П. 11.1 ПДД.", cardId: "p11.1", difficulty: 1, sectionId: "overtaking" },
  { q: "Разрешен ли обгон на пешеходном переходе?", options: ["Да", "Нет", "Только если нет пешеходов"], answer: 1, explain: "П. 11.4 ПДД.", cardId: "p11.4", difficulty: 1, sectionId: "overtaking" },
  { q: "За сколько метров до переезда запрещен обгон?", options: ["50 м", "100 м", "150 м"], answer: 1, explain: "П. 11.4 ПДД.", cardId: "p11.4", difficulty: 1, sectionId: "overtaking" },
  { q: "Где запрещена остановка?", options: ["На обочине", "Ближе 5 м до перехода", "У магазина"], answer: 1, explain: "П. 12.4 ПДД.", cardId: "p12.4", difficulty: 1, sectionId: "stopping" },
  { q: "Ближе какого расстояния до остановки автобуса запрещена стоянка?", options: ["10 м", "15 м", "20 м"], answer: 1, explain: "П. 12.4 ПДД.", cardId: "p12.4", difficulty: 1, sectionId: "stopping" },
  { q: "Кому уступает водитель при повороте?", options: ["Никому", "Пешеходам", "Только встречным"], answer: 1, explain: "П. 13.1 ПДД.", cardId: "p13.1", difficulty: 1, sectionId: "crossroads" },
  { q: "Кто уступает на неравнозначном перекрестке?", options: ["На главной", "На второстепенной", "Тот, у кого помеха справа"], answer: 1, explain: "П. 13.9 ПДД.", cardId: "p13.9", difficulty: 1, sectionId: "crossroads" },
  { q: "Что такое 'помеха справа'?", options: ["Уступить тому, кто справа", "Уступить тому, кто слева", "Проехать первым"], answer: 0, explain: "П. 13.11 ПДД.", cardId: "p13.11", difficulty: 1, sectionId: "crossroads" },
  { q: "Кто имеет преимущество на перекрестке равнозначных дорог?", options: ["Трамвай", "Легковой автомобиль", "Тот, кто быстрее"], answer: 0, explain: "П. 13.11 ПДД (трамвай всегда прав).", cardId: "p13.11", difficulty: 1, sectionId: "crossroads" }
];

// Автоматически раскидываем вопросы по их разделам
PDD_DATA.blocks.forEach(b => {
  b.sections.forEach(sec => {
    sec.questions = ALL_QUESTIONS.filter(q => q.sectionId === sec.id);
  });
});

// ================= СЦЕНАРИИ ДЛЯ РЕЖИМОВ =================
const SCENARIOS = [
  { id: "sc1", category: "parking", difficulty: 1, mode: ["trip", "cop"], text: "Вы выезжаете с парковки. Справа приближается автомобиль.", options: [{ text: "Уступить", correct: true }, { text: "Выехать первым", correct: false }, { text: "Сигналить", correct: false }], violations: [{ text: "Не уступил дорогу", isMain: true }], explain: "Уступите всем при выезде с прилегающей." },
  { id: "sc2", category: "pedestrian", difficulty: 1, mode: ["trip", "cop"], text: "Ночь, впереди переход, пешеход в тёмной одежде.", options: [{ text: "Продолжить", correct: false }, { text: "Уступить", correct: true }, { text: "Сигналить", correct: false }], violations: [{ text: "Не уступил пешеходу", isMain: true }], explain: "Обязан уступить на переходе." },
  { id: "sc3", category: "light", difficulty: 1, mode: ["trip"], text: "Красный свет, вам направо.", options: [{ text: "Стоять", correct: true }, { text: "Повернуть", correct: false }, { text: "На жёлтый", correct: false }], violations: [{ text: "Проезд на красный", isMain: true }], explain: "Красный запрещает движение." },
  { id: "sc4", category: "overtaking", difficulty: 1, mode: ["trip", "cop"], text: "Впереди пешеходный переход. Вы хотите обогнать грузовик.", options: [{ text: "Начать обгон", correct: false }, { text: "Отказаться от обгона", correct: true }, { text: "Сигналить", correct: false }], violations: [{ text: "Обгон на переходе", isMain: true }], explain: "Обгон на переходах запрещен." }
];
