import { lerp, easeOutBack } from './colors.js';

/**
 * @typedef {Object} AnimState
 * @property {number} time
 * @property {'idle' | 'eating' | 'react'} mode
 * @property {number} eatProgress
 * @property {number} chewPhase
 * @property {number} reactProgress
 * @property {string | null} foodIcon
 * @property {'good' | 'bad' | 'neutral' | null} reactType
 * @property {number} blinkTimer
 * @property {boolean} isBlinking
 */

export function createAnimState() {
  return {
    time: 0,
    mode: 'idle',
    eatProgress: 0,
    chewPhase: 0,
    reactProgress: 0,
    foodIcon: null,
    reactType: null,
    blinkTimer: 2 + Math.random() * 2,
    isBlinking: false,
  };
}

/** @param {AnimState} anim */
export function startEating(anim, foodIcon, foodType) {
  anim.mode = 'eating';
  anim.eatProgress = 0;
  anim.chewPhase = 0;
  anim.foodIcon = foodIcon;
  anim.reactType = foodType;
  anim.reactProgress = 0;
}

/** @param {AnimState} anim */
export function isBusy(anim) {
  return anim.mode === 'eating';
}

/**
 * @param {AnimState} anim
 * @param {number} dt seconds
 */
export function updateAnimation(anim, dt) {
  anim.time += dt;

  if (anim.blinkTimer > 0) {
    anim.blinkTimer -= dt;
    if (anim.blinkTimer <= 0) {
      anim.isBlinking = true;
      anim.blinkTimer = -0.12;
    }
  } else if (anim.blinkTimer < 0) {
    anim.blinkTimer += dt;
    if (anim.blinkTimer >= 0) {
      anim.isBlinking = false;
      anim.blinkTimer = 2.5 + Math.random() * 3;
    }
  }

  if (anim.mode === 'eating') {
    anim.eatProgress += dt / 1.1;
    anim.chewPhase = (anim.eatProgress * 8) % 1;

    if (anim.eatProgress >= 1) {
      anim.mode = 'react';
      anim.reactProgress = 0;
      anim.foodIcon = null;
    }
  } else if (anim.mode === 'react') {
    anim.reactProgress += dt / 0.45;
    if (anim.reactProgress >= 1) {
      anim.mode = 'idle';
      anim.reactType = null;
    }
  }
}

/**
 * @param {AnimState} anim
 * @returns {import('./renderer.js').DrawAnim}
 */
export function getDrawAnim(anim) {
  const idleBreath = Math.sin(anim.time * 2.2) * 2.2;
  const idleSquash = 1 + Math.sin(anim.time * 2.2) * 0.012;

  let bodyBob = idleBreath;
  let bodySquash = idleSquash;
  let headTilt = Math.sin(anim.time * 1.1) * 0.02;
  let armRaise = 0;
  let mouthOpen = 0;
  let reactBounce = 0;
  let faceBoost = 0;
  let foodAtMouth = null;
  let foodAlpha = 1;

  if (anim.mode === 'eating') {
    const p = anim.eatProgress;
    const chew = Math.sin(anim.chewPhase * Math.PI * 2) * 0.5 + 0.5;

    bodyBob = idleBreath - 4 * Math.sin(p * Math.PI);
    bodySquash = 1 + 0.03 * Math.sin(p * Math.PI * 4);
    headTilt = 0.06 * Math.sin(p * Math.PI * 6);

    if (p < 0.35) {
      armRaise = easeOutBack(p / 0.35);
    } else if (p < 0.85) {
      armRaise = 1;
      mouthOpen = 0.35 + chew * 0.55;
    } else {
      armRaise = 1 - easeOutBack((p - 0.85) / 0.15);
      mouthOpen = (1 - p) * 0.4;
    }

    foodAtMouth = anim.foodIcon;
    foodAlpha = p < 0.75 ? 1 : 1 - (p - 0.75) / 0.25;
    reactBounce = Math.sin(p * Math.PI) * 0.04;
  } else if (anim.mode === 'react') {
    const r = anim.reactProgress;
    reactBounce = Math.sin(r * Math.PI) * 0.08 * (1 - r);
    bodyBob = idleBreath - reactBounce * 30;
    faceBoost = anim.reactType === 'good' ? 0.25 * (1 - r) : anim.reactType === 'bad' ? -0.2 * (1 - r) : 0;
    headTilt = (anim.reactType === 'good' ? -0.08 : 0.06) * (1 - r);
  }

  return {
    bodyBob,
    bodySquash,
    headTilt,
    armRaise,
    mouthOpen,
    reactBounce,
    faceBoost,
    foodAtMouth,
    foodAlpha,
    isBlinking: anim.isBlinking,
  };
}

/**
 * @param {{ muscle: number; fat: number; health: number }} current
 * @param {{ muscle: number; fat: number; health: number }} target
 * @param {number} dt
 * @param {number} speed
 */
export function lerpStats(current, target, dt, speed = 6) {
  const t = 1 - Math.exp(-speed * dt);
  current.muscle = lerp(current.muscle, target.muscle, t);
  current.fat = lerp(current.fat, target.fat, t);
  current.health = lerp(current.health, target.health, t);
}
