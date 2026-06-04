import { DEFAULT_STATS, STAT_MIN, STAT_MAX } from './js/foods.js';
import { ensureRoundRect, clamp } from './js/colors.js';
import { CharacterRenderer } from './js/renderer.js';
import {
  createAnimState,
  startEating,
  isBusy,
  updateAnimation,
  getDrawAnim,
  lerpStats,
} from './js/animation.js';
import { GameUI } from './js/ui.js';

class Game {
  constructor() {
    /** @type {{ muscle: number; fat: number; health: number }} */
    this.targetStats = { ...DEFAULT_STATS };
    /** @type {{ muscle: number; fat: number; health: number }} */
    this.displayStats = { ...DEFAULT_STATS };

    this.anim = createAnimState();
    this.ui = new GameUI();
    this.renderer = null;
    this.lastFrame = 0;
    this.rafId = 0;
  }

  init() {
    const canvas = document.getElementById('characterCanvas');
    this.renderer = new CharacterRenderer(canvas);
    ensureRoundRect(this.renderer.ctx);

    this.ui.bind({
      onFeed: (food) => this.feed(food),
      onReset: () => this.reset(),
      onFilterChange: () => {},
    });

    this.ui.updateStats(this.displayStats, false);
    this.ui.updateMessage(this.displayStats);

    this.lastFrame = performance.now();
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  clampStat(v) {
    return clamp(v, STAT_MIN, STAT_MAX);
  }

  /** @param {import('./js/foods.js').Food} food */
  feed(food) {
    if (isBusy(this.anim)) return;

    this.targetStats.muscle = this.clampStat(this.targetStats.muscle + food.muscle);
    this.targetStats.fat = this.clampStat(this.targetStats.fat + food.fat);
    this.targetStats.health = this.clampStat(this.targetStats.health + food.health);

    startEating(this.anim, food.icon, food.type);
    this.ui.setFoodButtonsDisabled(true);
    this.ui.setEatingVisual(true);
    this.ui.spawnFoodFly(food);
    this.ui.spawnParticles(food);

    const toastType = food.type === 'good' ? 'good' : food.type === 'bad' ? 'bad' : 'neutral';
    const toastMsg =
      food.type === 'good'
        ? `${food.icon} ${food.name} — ótima escolha!`
        : food.type === 'bad'
          ? `${food.icon} ${food.name} — ops, exagero!`
          : `${food.icon} ${food.name} — refeição equilibrada`;

    this.ui.showToast(toastMsg, toastType);
    this.ui.updateMessage(this.targetStats);
  }

  reset() {
    if (isBusy(this.anim)) return;

    this.targetStats = { ...DEFAULT_STATS };
    this.displayStats = { ...DEFAULT_STATS };
    this.ui.updateStats(this.displayStats, true);
    this.ui.updateMessage(this.displayStats);
    this.ui.showToast('🔄 Jogo resetado!', 'info');
    document.getElementById('message').textContent = '🔄 Resetado! Vamos de novo!';
  }

  loop(timestamp) {
    const dt = Math.min(0.05, (timestamp - this.lastFrame) / 1000);
    this.lastFrame = timestamp;

    updateAnimation(this.anim, dt);
    lerpStats(this.displayStats, this.targetStats, dt, 5);

    const drawAnim = getDrawAnim(this.anim);
    this.renderer.draw(this.displayStats, drawAnim);
    this.ui.updateStats(this.displayStats, false);

    if (!isBusy(this.anim) && this.anim.mode === 'idle') {
      this.ui.setFoodButtonsDisabled(false);
      this.ui.setEatingVisual(false);
    }

    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.init();
});
