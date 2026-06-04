import { SKIN_BASE, SKIN_TANNED, lerpColor, darken, lighten } from './colors.js';

/**
 * @typedef {Object} DrawAnim
 * @property {number} bodyBob
 * @property {number} bodySquash
 * @property {number} headTilt
 * @property {number} armRaise
 * @property {number} mouthOpen
 * @property {number} reactBounce
 * @property {number} faceBoost
 * @property {string | null} foodAtMouth
 * @property {number} foodAlpha
 * @property {boolean} isBlinking
 */

export class CharacterRenderer {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.CX = this.W / 2;
  }

  /**
   * @param {{ muscle: number; fat: number; health: number }} stats
   * @param {DrawAnim} anim
   */
  draw(stats, anim) {
    const { ctx, W, H, CX } = this;
    ctx.clearRect(0, 0, W, H);

    const muscle = stats.muscle / 100;
    const fat = stats.fat / 100;
    const health = clamp01((stats.health / 100) + anim.faceBoost);

    ctx.save();
    ctx.translate(0, anim.bodyBob);
    ctx.translate(CX, H * 0.42);
    ctx.scale(1 + anim.reactBounce, anim.bodySquash - anim.reactBounce * 0.3);
    ctx.translate(-CX, -H * 0.42);

    this._drawBody(muscle, fat, health, anim);
    ctx.restore();
  }

  /**
   * @param {number} m
   * @param {number} f
   * @param {number} h
   * @param {DrawAnim} anim
   */
  _drawBody(m, f, h, anim) {
    const { ctx, CX } = this;
    const shW = 28 + m * 24;
    const chestW = 24 + m * 20 + f * 4;
    const waistW = 14 + f * 28 - m * 5;
    const hipW = 20 + f * 22;
    const armW = 6 + m * 10 + f * 7;
    const armLen = 82 + f * 6;
    const legW = 8 + m * 7 + f * 9;
    const legLen = 108 + f * 6;
    const headR = 20 + f * 8;
    const bellyR = (2 + f * 36) * (1 - m * 0.15);
    const neckW = 12 + f * 5;

    const tan = clamp01((m - f * 0.5 + 0.5) / 1.5);
    const skin = lerpColor(SKIN_BASE, SKIN_TANNED, tan);
    const skinDark = darken(skin, 0.2);
    const skinLight = lighten(skin, 0.12);
    const skinPale = lighten(skin, 0.06);

    const topY = 80;
    const headCy = 50 + f * 2;

    this._drawShadow(CX, 276 + f * 6, 35 + f * 25);
    this._drawLegs(CX, 148, legW, legLen, m, f, skinLight, skinDark);
    this._drawShorts(CX, 146, hipW + 4, 14);
    this._drawArms(CX, topY, shW, armW, armLen, m, f, skin, skinDark, anim.armRaise, headCy, headR);
    this._drawTorso(CX, topY, 148, shW, chestW, waistW, hipW, f, skin, skinDark, skinLight);

    if (m > 0.12) this._drawDeltoids(CX, 82, shW, m, f, skinDark, skinLight);
    if (bellyR > 3) this._drawBelly(CX, 118, bellyR, m, skinLight, skinDark);
    if (m > 0.2) this._drawPecs(CX, 88, m, f, skinDark, skinLight);
    if (m > 0.3 && f < 0.75) this._drawAbs(CX, 106, m, f, skinDark);

    ctx.fillStyle = skinPale;
    ctx.beginPath();
    ctx.roundRect(CX - neckW / 2, 66 + f * 2, neckW, 10 + f * 3, 3);
    ctx.fill();

    ctx.save();
    ctx.translate(CX, headCy);
    ctx.rotate(anim.headTilt);
    ctx.translate(-CX, -headCy);
    this._drawHead(CX, headCy, headR, f, h, m, skin, skinLight, skinDark, anim);
    ctx.restore();

    if (anim.foodAtMouth && anim.foodAlpha > 0) {
      this._drawFoodAtMouth(CX, headCy + headR * 0.55, anim.foodAtMouth, anim.foodAlpha);
    }
  }

  _drawFoodAtMouth(cx, cy, icon, alpha) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const wobble = Math.sin(Date.now() / 80) * 3;
    ctx.fillText(icon, cx + wobble, cy);
    ctx.restore();
  }

  _drawShadow(cx, y, width) {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.ellipse(cx, y, width, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawLegs(cx, y, width, len, m, f, light, dark) {
    const { ctx } = this;
    const gap = 14;
    const quadVis = Math.max(0, (m - 0.25) / 0.75) * (1 - f * 0.6);
    const calfVis = Math.max(0, (m - 0.35) / 0.65) * (1 - f * 0.5);

    [-1, 1].forEach((side) => {
      const legCx = cx + side * gap;
      const thighW = width + m * 4 + f * 5;
      const calfW = width + m * 3 + f * 4;
      const thighH = len * 0.52;
      const calfH = len * 0.35;
      const calfY = y + len * 0.58;

      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.roundRect(legCx - thighW / 2, y, thighW, thighH, 5);
      ctx.fill();

      ctx.fillStyle = darken(light, 0.05);
      ctx.beginPath();
      ctx.roundRect(legCx - thighW * 0.35, y + thighH - 2, thighW * 0.7, 6, 2);
      ctx.fill();
      ctx.fillStyle = light;

      ctx.beginPath();
      ctx.roundRect(legCx - calfW / 2, calfY, calfW, calfH, 4);
      ctx.fill();

      const footW = width * 0.6 + 4;
      ctx.fillStyle = darken(light, 0.08);
      ctx.beginPath();
      ctx.roundRect(legCx - footW / 2, y + len - 4, footW, 7, 3);
      ctx.fill();

      if (quadVis > 0.05) {
        ctx.save();
        ctx.globalAlpha = quadVis;
        ctx.strokeStyle = dark;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        const qY1 = y + 6;
        const qY2 = y + thighH - 8;
        const qOff = thighW * 0.22;
        [-qOff, 0, qOff].forEach((off) => {
          ctx.beginPath();
          ctx.moveTo(legCx + off, qY1);
          ctx.quadraticCurveTo(legCx + off * 1.2, (qY1 + qY2) / 2, legCx + off, qY2);
          ctx.stroke();
        });
        ctx.restore();
      }

      if (calfVis > 0.05) {
        ctx.save();
        ctx.globalAlpha = calfVis;
        ctx.strokeStyle = dark;
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        const cMidX = legCx + side * calfW * 0.15;
        ctx.beginPath();
        ctx.moveTo(cMidX, calfY + 4);
        ctx.quadraticCurveTo(cMidX + side * 4, calfY + calfH * 0.5, cMidX, calfY + calfH - 4);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  _drawShorts(cx, y, width, height) {
    const { ctx } = this;
    const grad = ctx.createLinearGradient(cx - width, y - height, cx + width, y);
    grad.addColorStop(0, '#2c3e50');
    grad.addColorStop(0.5, '#4a6278');
    grad.addColorStop(1, '#2c3e50');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(cx - width, y - height, width * 2, height, 4);
    ctx.fill();

    ctx.fillStyle = '#1a252f';
    ctx.beginPath();
    ctx.roundRect(cx - width + 2, y - height, width * 2 - 4, 6, 3);
    ctx.fill();
  }

  _drawArms(cx, y, shW, width, len, m, f, skin, dark, armRaise, headCy, headR) {
    const { ctx } = this;
    const bicepW = width + m * 10;
    const forearmW = width + m * 4 + f * 3;
    const bicepY = y + 18;
    const forearmY = y + 52;
    const foreEndY = y + len;

    const drawOneArm = (side, raiseAmount) => {
      const startX = cx + side * (shW - 2);
      const pivotX = startX;
      const pivotY = y + 6;
      const angle = side === 1 ? -1.25 * raiseAmount : 0.12 * raiseAmount;

      ctx.save();
      if (raiseAmount > 0.01) {
        ctx.translate(pivotX, pivotY);
        ctx.rotate(angle);
        ctx.translate(-pivotX, -pivotY);
      }

      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.moveTo(startX - side * width * 0.3, y);
      ctx.quadraticCurveTo(startX - side * bicepW * 0.5, bicepY, startX - side * forearmW * 0.2, forearmY);
      ctx.lineTo(startX + side * forearmW * 0.2, forearmY);
      ctx.quadraticCurveTo(startX + side * bicepW * 0.5, bicepY, startX + side * width * 0.3, y);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      const fStartX = startX - side * forearmW * 0.2;
      ctx.moveTo(fStartX, forearmY);
      ctx.quadraticCurveTo(
        startX - side * forearmW * 0.4,
        forearmY + 22 - raiseAmount * 10,
        startX - side * forearmW * 0.2,
        foreEndY - raiseAmount * 12
      );
      ctx.lineTo(startX + side * forearmW * 0.2, foreEndY - raiseAmount * 12);
      ctx.quadraticCurveTo(startX + side * forearmW * 0.4, forearmY + 22, startX + side * forearmW * 0.2, forearmY);
      ctx.closePath();
      ctx.fill();

      if (m > 0.3) {
        const vis = Math.max(0, (m - 0.3) / 0.7) * (1 - f * 0.5);
        ctx.save();
        ctx.globalAlpha = vis;
        ctx.strokeStyle = dark;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        const bCx = startX - side * bicepW * 0.15;
        ctx.beginPath();
        ctx.moveTo(bCx + side * 2, y + 6);
        ctx.quadraticCurveTo(bCx - side * 6, bicepY + 6, bCx + side * 2, forearmY - 4);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    };

    drawOneArm(-1, armRaise * 0.12);
    drawOneArm(1, armRaise);
  }

  _drawTorso(cx, topY, botY, shW, chestW, waistW, hipW, f, skin, dark, light) {
    const { ctx } = this;
    const lh = f * 18;

    ctx.beginPath();
    ctx.moveTo(cx - shW, topY);
    ctx.quadraticCurveTo(cx - chestW - lh * 0.3, topY + 12, cx - chestW, topY + 20);
    ctx.quadraticCurveTo(cx - waistW - lh, topY + 44, cx - waistW, topY + 48);
    ctx.quadraticCurveTo(cx - hipW + lh * 0.1, botY - 4, cx - hipW, botY);
    ctx.lineTo(cx + hipW, botY);
    ctx.quadraticCurveTo(cx + hipW - lh * 0.1, botY - 4, cx + waistW, topY + 48);
    ctx.quadraticCurveTo(cx + waistW + lh, topY + 44, cx + chestW, topY + 20);
    ctx.quadraticCurveTo(cx + chestW + lh * 0.3, topY + 12, cx + shW, topY);
    ctx.closePath();

    const grad = ctx.createLinearGradient(cx - shW, topY, cx + shW, botY);
    grad.addColorStop(0, dark);
    grad.addColorStop(0.25, skin);
    grad.addColorStop(0.55, light);
    grad.addColorStop(0.8, skin);
    grad.addColorStop(1, dark);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  _drawDeltoids(cx, y, shW, m, f, dark, light) {
    const { ctx } = this;
    const vis = Math.max(0, (m - 0.12) / 0.88) * (1 - f * 0.7);
    const deltSize = 6 + m * 12;
    const deltH = 14 + m * 10;

    ctx.save();
    ctx.globalAlpha = Math.min(1, vis);
    [-1, 1].forEach((side) => {
      const dx = cx + side * (shW - 2);
      ctx.beginPath();
      ctx.ellipse(dx, y + deltH * 0.5, deltSize * 0.5, deltH * 0.5, side * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = light;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(dx - side * 2, y + deltH * 0.5, deltSize * 0.3, deltH * 0.4, side * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = dark;
      ctx.fill();
    });
    ctx.restore();
  }

  _drawBelly(cx, cy, r, m, light, dark) {
    if (r < 4) return;
    const { ctx } = this;
    const flatness = 0.65 + m * 0.1;
    const shiftY = r * 0.12;

    ctx.save();
    const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, 2, cx, cy + shiftY, r);
    grad.addColorStop(0, lighten(light, 0.08));
    grad.addColorStop(0.5, light);
    grad.addColorStop(1, dark);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + shiftY, r, r * flatness, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = darken(dark, 0.1);
    ctx.beginPath();
    ctx.ellipse(cx, cy + shiftY + r * flatness * 0.15, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawPecs(cx, cy, m, f, dark, light) {
    const { ctx } = this;
    const vis = Math.max(0, (m - 0.2) / 0.8) * (1 - f * 0.85);
    if (vis < 0.02) return;
    const w = 12 + m * 22;
    const h = 10 + m * 16;

    ctx.save();
    ctx.globalAlpha = vis;
    const grad = ctx.createLinearGradient(cx - w, cy, cx + w, cy + h);
    grad.addColorStop(0, dark);
    grad.addColorStop(0.5, light);
    grad.addColorStop(1, dark);

    for (const sign of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + sign * 2, cy - h * 0.3);
      ctx.quadraticCurveTo(cx + sign * w * 0.8, cy + h * 0.1, cx + sign * w * 0.9, cy + h * 0.7);
      ctx.quadraticCurveTo(cx + sign * w * 0.5, cy + h, cx + sign * 2, cy + h * 0.6);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    ctx.strokeStyle = dark;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.25);
    ctx.lineTo(cx, cy + h * 0.7);
    ctx.stroke();
    ctx.restore();
  }

  _drawAbs(cx, cy, m, f, dark) {
    const { ctx } = this;
    const vis = Math.max(0, (m - 0.3) / 0.7) * Math.max(0, 1 - f * 0.9);
    if (vis < 0.02) return;

    const rows = 4;
    const spacing = 9;
    const abW = 5 + m * 10;

    ctx.save();
    ctx.globalAlpha = vis;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    const topY = cy - spacing * 0.5;
    const botY = cy + (rows - 0.5) * spacing;
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx, botY);
    ctx.stroke();

    for (let i = 0; i < rows; i++) {
      const y = cy + i * spacing;
      ctx.beginPath();
      ctx.moveTo(cx - abW / 2, y);
      ctx.lineTo(cx + abW / 2, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawHead(cx, cy, r, f, h, m, skin, light, dark, anim) {
    const { ctx } = this;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 10;
    const grad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, 2, cx, cy, r);
    grad.addColorStop(0, light);
    grad.addColorStop(0.65, skin);
    grad.addColorStop(1, dark);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (f > 0.4) {
      ctx.fillStyle = darken(skin, 0.12);
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.62, r * 0.28 * (f - 0.4) * 2.5, r * 0.12 * (f - 0.4) * 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const eyeY = cy - r * 0.08;
    const eyeSpacing = r * 0.34;
    const eyeW = r * 0.28;
    const eyeH = r * 0.34;

    if (anim.isBlinking) {
      ctx.strokeStyle = darken(skin, 0.35);
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      [-eyeSpacing, eyeSpacing].forEach((ex) => {
        ctx.beginPath();
        ctx.moveTo(ex - eyeW * 0.6, eyeY);
        ctx.quadraticCurveTo(ex, eyeY + 2, ex + eyeW * 0.6, eyeY);
        ctx.stroke();
      });
    } else {
      ctx.fillStyle = '#fff';
      [-eyeSpacing, eyeSpacing].forEach((ex) => {
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      const pupilR = r * 0.1;
      ctx.fillStyle = '#2c3e50';
      [-eyeSpacing, eyeSpacing].forEach((ex) => {
        ctx.beginPath();
        ctx.arc(ex + 1.5, eyeY + 1.5, pupilR, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#fff';
      [-eyeSpacing, eyeSpacing].forEach((ex) => {
        ctx.beginPath();
        ctx.arc(ex + 3, eyeY - 2.5, pupilR * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.strokeStyle = darken(skin, 0.35);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    const browY = eyeY - r * 0.35;
    this._drawBrows(cx, eyeSpacing, browY, h, anim.mouthOpen);

    const mouthY = cy + r * 0.38;
    this._drawMouth(cx, mouthY, h, anim.mouthOpen, dark, skin);

    if (f > 0.25 || h > 0.6) {
      ctx.save();
      ctx.globalAlpha = f > 0.25 ? Math.min(0.4, f * 0.5) : 0.15;
      ctx.fillStyle = '#e8a0a0';
      [-r * 0.48, r * 0.48].forEach((ox) => {
        ctx.beginPath();
        ctx.ellipse(cx + ox, cy + r * 0.18, r * 0.14, r * 0.09, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }
  }

  _drawBrows(cx, eyeSpacing, browY, h, mouthOpen) {
    const { ctx } = this;
    if (mouthOpen > 0.2) {
      ctx.beginPath();
      ctx.moveTo(cx - eyeSpacing - 6, browY - 2);
      ctx.lineTo(cx - eyeSpacing + 7, browY - 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + eyeSpacing - 7, browY - 2);
      ctx.lineTo(cx + eyeSpacing + 6, browY - 2);
      ctx.stroke();
      return;
    }
    if (h < 0.25) {
      ctx.beginPath();
      ctx.moveTo(cx - eyeSpacing - 5, browY - 1);
      ctx.quadraticCurveTo(cx - eyeSpacing + 1, browY + 4, cx - eyeSpacing + 7, browY + 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + eyeSpacing + 5, browY - 1);
      ctx.quadraticCurveTo(cx + eyeSpacing - 1, browY + 4, cx + eyeSpacing - 7, browY + 1);
      ctx.stroke();
    } else if (h > 0.75) {
      ctx.beginPath();
      ctx.moveTo(cx - eyeSpacing - 5, browY + 1);
      ctx.quadraticCurveTo(cx - eyeSpacing, browY - 5, cx - eyeSpacing + 7, browY + 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + eyeSpacing + 5, browY + 1);
      ctx.quadraticCurveTo(cx + eyeSpacing, browY - 5, cx + eyeSpacing - 7, browY + 1);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - eyeSpacing - 6, browY);
      ctx.lineTo(cx - eyeSpacing + 7, browY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + eyeSpacing - 7, browY);
      ctx.lineTo(cx + eyeSpacing + 6, browY);
      ctx.stroke();
    }
  }

  _drawMouth(cx, mouthY, h, mouthOpen, dark, skin) {
    const { ctx } = this;
    ctx.strokeStyle = darken(skin, 0.4);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    if (mouthOpen > 0.15) {
      const openH = 4 + mouthOpen * 14;
      ctx.fillStyle = darken(skin, 0.55);
      ctx.beginPath();
      ctx.ellipse(cx, mouthY + openH * 0.2, 7 + mouthOpen * 4, openH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(cx, mouthY - openH * 0.15, 5, 2.5 * mouthOpen, 0, 0, Math.PI);
      ctx.fill();
      return;
    }

    if (h < 0.2) {
      ctx.beginPath();
      ctx.arc(cx, mouthY + 7, 8, 0.05, Math.PI - 0.05);
      ctx.stroke();
    } else if (h < 0.4) {
      ctx.beginPath();
      ctx.arc(cx, mouthY + 4, 6, 0.1, Math.PI - 0.1);
      ctx.stroke();
    } else if (h > 0.8) {
      ctx.beginPath();
      ctx.arc(cx, mouthY - 2, 9, 0.1, Math.PI - 0.1);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(cx, mouthY + 1, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (h > 0.6) {
      ctx.beginPath();
      ctx.arc(cx, mouthY, 7, 0.15, Math.PI - 0.15);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - 6, mouthY);
      ctx.lineTo(cx + 6, mouthY);
      ctx.stroke();
    }
  }
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
