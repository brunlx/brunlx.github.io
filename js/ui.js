import { FOODS, FOOD_FILTERS } from './foods.js';

/** @param {number} v */
function formatDelta(v) {
  return v >= 0 ? `+${v}` : `${v}`;
}

/** @param {import('./foods.js').Food} food */
function buildFoodTags(food) {
  const tags = [];
  if (food.muscle !== 0) tags.push({ text: `${formatDelta(food.muscle)}💪`, pos: food.muscle > 0 });
  if (food.fat !== 0) tags.push({ text: `${formatDelta(food.fat)}🍔`, pos: food.fat <= 0 });
  if (food.health !== 0) tags.push({ text: `${formatDelta(food.health)}❤️`, pos: food.health > 0 });
  return tags;
}

export class GameUI {
  constructor() {
    this.els = {
      muscleValue: document.getElementById('muscleValue'),
      fatValue: document.getElementById('fatValue'),
      healthValue: document.getElementById('healthValue'),
      muscleBar: document.getElementById('muscleBar'),
      fatBar: document.getElementById('fatBar'),
      healthBar: document.getElementById('healthBar'),
      message: document.getElementById('message'),
      toast: document.getElementById('toast'),
      foodGrid: document.getElementById('foodGrid'),
      foodFilters: document.getElementById('foodFilters'),
      resetBtn: document.getElementById('resetBtn'),
      characterWrapper: document.querySelector('.character-wrapper'),
    };
    this.activeFilter = 'all';
    this.onFeed = null;
    this.onReset = null;
    this.onFilterChange = null;
  }

  bind({ onFeed, onReset, onFilterChange }) {
    this.onFeed = onFeed;
    this.onReset = onReset;
    this.onFilterChange = onFilterChange;
    this.els.resetBtn.addEventListener('click', () => this.onReset?.());
    this.renderFilters();
    this.renderFoods();
  }

  renderFilters() {
    const container = this.els.foodFilters;
    container.innerHTML = '';
    FOOD_FILTERS.forEach((filter) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn' + (filter.id === this.activeFilter ? ' active' : '');
      btn.textContent = filter.label;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', filter.id === this.activeFilter ? 'true' : 'false');
      btn.addEventListener('click', () => {
        this.activeFilter = filter.id;
        this.onFilterChange?.(filter.id);
        this.renderFilters();
        this.renderFoods();
      });
      container.appendChild(btn);
    });
  }

  /** @param {boolean} disabled */
  setFoodButtonsDisabled(disabled) {
    this.els.foodGrid.querySelectorAll('.food-btn').forEach((btn) => {
      btn.disabled = disabled;
    });
  }

  renderFoods() {
    const grid = this.els.foodGrid;
    grid.innerHTML = '';
    const list =
      this.activeFilter === 'all'
        ? FOODS
        : FOODS.filter((f) => f.category === this.activeFilter);

    list.forEach((food) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'food-btn';
      btn.dataset.type = food.type;
      btn.setAttribute('role', 'listitem');
      btn.title = `${food.name}: músculo ${formatDelta(food.muscle)}, gordura ${formatDelta(food.fat)}, saúde ${formatDelta(food.health)}`;

      const icon = document.createElement('span');
      icon.className = 'food-icon';
      icon.textContent = food.icon;

      const name = document.createElement('span');
      name.className = 'food-name';
      name.textContent = food.name;

      const tags = document.createElement('div');
      tags.className = 'food-tags';
      buildFoodTags(food).forEach((tag) => {
        const span = document.createElement('span');
        span.className = 'food-tag ' + (tag.pos ? 'pos' : 'neg');
        span.textContent = tag.text;
        tags.appendChild(span);
      });

      btn.append(icon, name, tags);
      btn.addEventListener('click', () => this.onFeed?.(food));
      grid.appendChild(btn);
    });
  }

  /** @param {{ muscle: number; fat: number; health: number }} stats */
  updateStats(stats, animate = true) {
    const round = (n) => Math.round(n);
    this.els.muscleValue.textContent = String(round(stats.muscle));
    this.els.fatValue.textContent = String(round(stats.fat));
    this.els.healthValue.textContent = String(round(stats.health));
    this.els.muscleBar.style.width = `${clamp(stats.muscle)}%`;
    this.els.fatBar.style.width = `${clamp(stats.fat)}%`;
    this.els.healthBar.style.width = `${clamp(stats.health)}%`;

    if (animate) {
      document.querySelectorAll('.stat-card').forEach((card) => {
        card.classList.remove('bump');
        void card.offsetWidth;
        card.classList.add('bump');
      });
    }
  }

  /** @param {{ muscle: number; fat: number; health: number }} stats */
  updateMessage(stats) {
    const { muscle, fat, health } = stats;
    let msg;

    if (health <= 15) msg = '😰 Preciso de ajuda... estou muito doente!';
    else if (health <= 30) msg = '😟 Não estou me sentindo bem...';
    else if (fat >= 85) msg = '🐷 Estou muito pesado... hora de comer melhor!';
    else if (fat >= 70) msg = '😅 Acho que exagerei na comida...';
    else if (muscle >= 80 && fat <= 20) msg = '💪 Estou monstro! Que shape!';
    else if (muscle >= 65 && fat <= 30) msg = '🔥 Mandou bem! Tô fitness!';
    else if (muscle >= 45 && fat <= 40 && health >= 50) msg = '😊 Me sentindo saudável!';
    else if (muscle >= 75) msg = '🏋️ Bora treinar mais!';
    else if (fat >= 60) msg = '🍕 Só mais um pedaço...';
    else msg = '😐 Hmm, o que você vai me dar?';

    const el = this.els.message;
    el.textContent = msg;
    el.classList.add('pop');
    setTimeout(() => el.classList.remove('pop'), 350);
  }

  showToast(text, type) {
    const toast = this.els.toast;
    toast.textContent = text;
    toast.className = `show type-${type}`;
    clearTimeout(toast._hide);
    toast._hide = setTimeout(() => toast.classList.remove('show'), 2000);
  }

  setEatingVisual(active) {
    this.els.characterWrapper.classList.toggle('eating', active);
  }

  /** @param {import('./foods.js').Food} food */
  spawnFoodFly(food) {
    const canvas = document.getElementById('characterCanvas');
    const rect = canvas.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height * 0.35;

    const el = document.createElement('div');
    el.textContent = food.icon;
    el.setAttribute('aria-hidden', 'true');
    const startX = 40 + Math.random() * (window.innerWidth - 120);
    const startY = 80 + Math.random() * 120;
    el.style.cssText = `
      position: fixed;
      font-size: 2.4rem;
      pointer-events: none;
      z-index: 99;
      left: ${startX}px;
      top: ${startY}px;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
    `;
    document.body.appendChild(el);

    const tx = targetX - startX - 16;
    const ty = targetY - startY - 16;
    el.style.setProperty('--tx', `${tx}px`);
    el.style.setProperty('--ty', `${ty}px`);
    el.style.animation = 'foodFly 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards';
    setTimeout(() => el.remove(), 800);
  }

  /** @param {import('./foods.js').Food} food */
  spawnParticles(food) {
    const canvas = document.getElementById('characterCanvas');
    const rect = canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.3;
    const icons = food.type === 'good' ? ['✨', '💚', '⭐'] : food.type === 'bad' ? ['💨', '⚠️'] : ['✨'];

    for (let i = 0; i < 6; i++) {
      const p = document.createElement('span');
      p.className = 'food-particle';
      p.textContent = icons[i % icons.length];
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
      const dist = 40 + Math.random() * 50;
      p.style.setProperty('--px', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--py', `${Math.sin(angle) * dist}px`);
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 750);
    }
  }
}

function clamp(v) {
  return Math.max(0, Math.min(100, v));
}
