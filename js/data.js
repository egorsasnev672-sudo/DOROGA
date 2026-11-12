// ============================================================
// ДАННЫЕ ПДД (Всё в одном файле)
// ============================================================

const SIGN_IMG_BASE = "https://suvjunmd.github.io/images/";
const signImg = (code) => `${SIGN_IMG_BASE}s${code.replace(/\./g, "-")}.png`;

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
     <rect width="100" height="100" fill="#12203a" rx="12"/>
     <text x="50" y="45" fill="#9fb0c9" font-size="12" text-anchor="middle" font-family="sans-serif">знак</text>
     <text x="50" y="60" fill="#3d6fb5" font-size="12" text-anchor="middle" font-family="sans-serif">скоро</text>
   </svg>`
);

const generateWarnCards = () => {
  const codes = [
    "1.1", "1.2", "1.3.1", "1.3.2", "1.4.1", "1.4.2", "1.4.3", "1.4.4", "1.4.5", "1.4.6",
    "1.5", "1.6", "1.7.1", "1.7.2", "1.7.3", "1.7.4", "1.9", "1.10", "1.11", "1.12.1",
    "1.12.2", "1.13.1", "1.13.2", "1.14.1", "1.14.2", "1.15", "1.16.1", "1.16.2", "1.17.1",
    "1.17.2", "1.18.1", "1.18.2", "1.18.3", "1.19", "1.20", "1.21", "1.22", "1.23", "1.24.1",
    "1.24.2", "1.25.1", "1.25.2", "1.26", "1.27", "1.28", "1.29", "1.30", "1.31.1", "1.31.2",
    "1.32.1", "1.32.2", "1.33"
  ];
  const titles = {
    "1.1": "Ж/д переезд со шлагбаумом", "1.2": "Ж/д переезд без шлагбаума",
    "1.5": "Пересечение с трамвайной линией", "1.6": "Пересечение равнозначных дорог",
    "1.22": "Пешеходный переход", "1.23": "Дети", "1.25.1": "Дорожные работы",
  };
  return codes.map(code => ({
    id: code, code: code, title: titles[code] || `Знак ${code}`,
    image: signImg(code), description: `Описание и особенности применения знака ${code}.`
  }));
};

const PDD_DATA = {
  blocks: [
    {
      id: "signs", title: "Дорожные знаки", emoji: "🚸",
      sections: [
        {
          id: "warn", title: "Предупреждающие (1.x)",
          cards: generateWarnCards(),
          questions: [
            { q: "На каком расстоянии вне населённого пункта ставится знак 1.1?", options: ["50–100 м", "150–300 м", "300–500 м"], answer: 1, explain: "Вне населённого пункта предупреждающие знаки ставят за 150–300 м.", cardId: "1.1", difficulty: 1 }
          ]
        },
        {
          id: "priority", title: "Знаки приоритета (2.x)",
          cards: [
            { id: "2.1", code: "2.1", title: "Главная дорога", image: signImg("2.1"), description: "Преимущественный проезд." },
            { id: "2.2", code: "2.2", title: "Конец главной дороги", image: signImg("2.2"), description: "Действие 2.1 закончилось." },
            { id: "2.3", code: "2.3", title: "Пересечение со второстепенной", image: signImg("2.3"), description: "Преимущество на перекрестке." },
            { id: "2.4", code: "2.4", title: "Уступите дорогу", image: signImg("2.4"), description: "Нужно уступить." },
            { id: "2.5", code: "2.5", title: "STOP", image: signImg("2.5"), description: "Движение без остановки запрещено." },
            { id: "2.6", code: "2.6", title: "Преимущество встречного", image: signImg("2.6"), description: "Узкий участок, вы уступаете." }
          ],
          questions: [
            { q: "До какого знака действует знак 2.1?", options: ["До перекрестка", "До знака 2.2", "До конца города"], answer: 1, explain: "Зона действия ограничена знаком 2.2.", cardId: "2.1", difficulty: 1 }
          ]
        }
      ]
    },
    {
      id: "rules", title: "Правила движения", emoji: "📖",
      sections: [
        {
          id: "general", title: "Общие положения",
          cards: [ { id: "p1.4", code: "п. 1.4", title: "Правостороннее движение", description: "На дорогах РФ установлено правостороннее движение." } ],
          questions: [ { q: "Какое движение на дорогах РФ?", options: ["Левостороннее", "Правостороннее", "Зависит от региона"], answer: 1, explain: "П. 1.4 ПДД.", cardId: "p1.4", difficulty: 1 } ]
        }
      ]
    }
  ]
};

const SCENARIOS = [
  {
    id: "exit-parking", category: "parking", tags: [], difficulty: 1, mode: ["trip", "cop"],
    text: "Вы выезжаете с парковки. Справа приближается автомобиль.",
    options: [ { text: "Уступить", correct: true, rule: "п. 8.3" }, { text: "Выехать первым", correct: false, rule: "п. 8.3" }, { text: "Сигналить", correct: false, rule: "п. 8.3" } ],
    violations: [ { text: "Не уступил при выезде с прилегающей", isMain: true, rule: "п. 8.3" } ],
    explain: "Выезд с прилегающей: уступить всем.", cardId: "p1.4"
  },
  {
    id: "pedestrian-night", category: "pedestrian", tags: [], difficulty: 1, mode: ["trip", "cop"],
    text: "Ночь, впереди переход, пешеход в тёмной одежде.",
    options: [ { text: "Продолжить", correct: false, rule: "п. 14.1" }, { text: "Уступить", correct: true, rule: "п. 14.1" }, { text: "Сигналить", correct: false, rule: "п. 14.1" } ],
    violations: [ { text: "Не уступил пешеходу", isMain: true, rule: "п. 14.1" } ],
    explain: "Обязан уступить на переходе.", cardId: "p1.4"
  },
  {
    id: "red-light", category: "light", tags: [], difficulty: 1, mode: ["trip"],
    text: "Красный свет, вам направо.",
    options: [ { text: "Стоять", correct: true, rule: "п. 6.2" }, { text: "Повернуть", correct: false, rule: "п. 6.2" }, { text: "На жёлтый", correct: false, rule: "п. 6.2" } ],
    violations: [ { text: "Проезд на красный", isMain: true, rule: "п. 6.2" } ],
    explain: "Красный запрещает движение.", cardId: "p1.4"
  }
];
