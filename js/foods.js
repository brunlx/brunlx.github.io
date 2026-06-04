/** @typedef {'good' | 'bad' | 'neutral'} FoodType */
/** @typedef {'all' | 'healthy' | 'protein' | 'junk' | 'neutral'} FoodCategory */

/**
 * @typedef {Object} Food
 * @property {string} id
 * @property {string} name
 * @property {string} icon
 * @property {FoodCategory} category
 * @property {FoodType} type
 * @property {number} muscle
 * @property {number} fat
 * @property {number} health
 * @property {string} [desc]
 */

/** @type {Food[]} */
export const FOODS = [
  // Saudáveis
  { id: 'apple',     name: 'Maçã',          icon: '🍎', category: 'healthy', type: 'good',    muscle: 4,  fat: -5,  health: 12 },
  { id: 'broccoli',  name: 'Brócolis',      icon: '🥦', category: 'healthy', type: 'good',    muscle: 5,  fat: -6,  health: 14 },
  { id: 'salad',     name: 'Salada',        icon: '🥗', category: 'healthy', type: 'good',    muscle: 4,  fat: -7,  health: 13 },
  { id: 'banana',    name: 'Banana',        icon: '🍌', category: 'healthy', type: 'good',    muscle: 3,  fat: -2,  health: 9  },
  { id: 'avocado',   name: 'Abacate',       icon: '🥑', category: 'healthy', type: 'good',    muscle: 2,  fat: 4,   health: 11 },
  { id: 'carrot',    name: 'Cenoura',       icon: '🥕', category: 'healthy', type: 'good',    muscle: 3,  fat: -4,  health: 10 },
  { id: 'juice',     name: 'Suco natural',  icon: '🧃', category: 'healthy', type: 'good',    muscle: 1,  fat: -3,  health: 8  },

  // Proteínas / fitness
  { id: 'whey',      name: 'Whey',          icon: '🥛', category: 'protein', type: 'good',    muscle: 18, fat: -2,  health: 7  },
  { id: 'chicken',   name: 'Frango',        icon: '🍗', category: 'protein', type: 'good',    muscle: 14, fat: -4,  health: 9  },
  { id: 'egg',       name: 'Ovo',           icon: '🥚', category: 'protein', type: 'good',    muscle: 10, fat: 1,   health: 8  },
  { id: 'salmon',    name: 'Salmão',        icon: '🐟', category: 'protein', type: 'good',    muscle: 12, fat: -3,  health: 11 },
  { id: 'oats',      name: 'Aveia',         icon: '🥣', category: 'protein', type: 'good',    muscle: 8,  fat: -2,  health: 10 },

  // Indulgência
  { id: 'pizza',     name: 'Pizza',         icon: '🍕', category: 'junk',    type: 'bad',     muscle: -2, fat: 14,  health: -11 },
  { id: 'burger',    name: 'X-Burger',      icon: '🍔', category: 'junk',    type: 'bad',     muscle: -1, fat: 16,  health: -12 },
  { id: 'soda',      name: 'Refrigerante',  icon: '🥤', category: 'junk',    type: 'bad',     muscle: -3, fat: 10,  health: -8  },
  { id: 'donut',     name: 'Donut',         icon: '🍩', category: 'junk',    type: 'bad',     muscle: -2, fat: 17,  health: -10 },
  { id: 'fries',     name: 'Batata frita',  icon: '🍟', category: 'junk',    type: 'bad',     muscle: -1, fat: 13,  health: -9  },
  { id: 'icecream',  name: 'Sorvete',       icon: '🍦', category: 'junk',    type: 'bad',     muscle: -2, fat: 12,  health: -7  },
  { id: 'chocolate', name: 'Chocolate',     icon: '🍫', category: 'junk',    type: 'bad',     muscle: -1, fat: 11,  health: -6  },
  { id: 'hotdog',    name: 'Hot dog',       icon: '🌭', category: 'junk',    type: 'bad',     muscle: 0,  fat: 12,  health: -8  },

  // Neutros
  { id: 'rice',      name: 'Arroz',         icon: '🍚', category: 'neutral', type: 'neutral', muscle: 2,  fat: 3,   health: 3  },
  { id: 'pasta',     name: 'Macarrão',      icon: '🍝', category: 'neutral', type: 'neutral', muscle: 1,  fat: 5,   health: 1  },
  { id: 'sandwich',  name: 'Sanduíche',     icon: '🥪', category: 'neutral', type: 'neutral', muscle: 3,  fat: 6,   health: 0  },
  { id: 'cheese',    name: 'Queijo',        icon: '🧀', category: 'neutral', type: 'neutral', muscle: 4,  fat: 7,   health: -2 },
];

/** @type {{ id: FoodCategory | 'all'; label: string }[]} */
export const FOOD_FILTERS = [
  { id: 'all',     label: 'Todos' },
  { id: 'healthy', label: '🥗 Saudáveis' },
  { id: 'protein', label: '💪 Proteínas' },
  { id: 'junk',    label: '🍕 Indulgência' },
  { id: 'neutral', label: '⚖️ Neutros' },
];

export const STAT_MIN = 0;
export const STAT_MAX = 100;
export const DEFAULT_STATS = { muscle: 50, fat: 50, health: 50 };
