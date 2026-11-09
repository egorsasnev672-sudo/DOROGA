  { 
    id: "sc-01", 
    category: "signs", 
    tags: ["type:sign"], difficulty: 1, mode: ["trip","cop"], 
    // Текст без номеров! Спрашиваем, что означает картинка
    text: "Что означает этот дорожный знак?", 
    image: signImg("1.20"), // <--- ДОБАВЛЕНА КАРТИНКА
    options: [ 
      { text: "Пешеходный переход", correct: true, rule: "Знак 1.20" }, 
      { text: "Дети", correct: false }, 
      { text: "Дорожные работы", correct: false } 
    ], 
    explain: "Знак 1.20 — пешеходный переход. Снизьте скорость и будьте готовы уступить.", 
    cardId: "sign-1.20" 
  },
  { 
    id: "sc-02", 
    category: "signs", 
    tags: ["type:sign"], difficulty: 1, mode: ["trip","cop"], 
    text: "О чём предупреждает водителя этот знак?", 
    image: signImg("1.21"), // <--- ДОБАВЛЕНА КАРТИНКА
    options: [ 
      { text: "Дети", correct: true, rule: "Знак 1.21" }, 
      { text: "Пешеходный переход", correct: false }, 
      { text: "Дорожные работы", correct: false } 
    ], 
    violations: [], 
    explain: "Знак 1.21 — «Дети». Возможно появление детей на дороге.", 
    cardId: "sign-1.21" 
  },
