import { createLevel, WORLD_WIDTH, GROUND_Y } from "./level.js";
import { Player } from "./player.js";

const ENEMY_SPEED = 70;

export class Game {
  constructor(canvas, hud, onStateChange) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hud = hud;
    this.onStateChange = onStateChange;

    this.input = { left: false, right: false, jump: false };
    this.level = createLevel();
    this.player = new Player(40, GROUND_Y - 46);

    this.coinsCollected = 0;
    this.lives = 3;
    this.finished = false;
    this.camera = 0;

    this.lastTime = 0;
    this.loop = this.loop.bind(this);
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  loop(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 1 / 30);
    this.lastTime = now;

    if (!this.finished) {
      this.update(dt);
    }
    this.render();

    requestAnimationFrame(this.loop);
  }

  update(dt) {
    this.player.update(dt, this.input, this.level.platforms, WORLD_WIDTH);

    this.updateEnemies(dt);
    this.updateCoins();
    this.updateCamera();

    if (this.player.y > this.canvas.height + 200) {
      this.loseLife();
    }

    if (this.player.intersects(this.level.flag)) {
      this.win();
    }
  }

  updateEnemies(dt) {
    for (const enemy of this.level.enemies) {
      enemy.x += ENEMY_SPEED * enemy.dir * dt;
      if (enemy.x < enemy.range[0] || enemy.x + enemy.w > enemy.range[1]) {
        enemy.dir *= -1;
      }

      if (this.player.invulnerableTime <= 0 && this.player.intersects(enemy)) {
        const stomping = this.player.vy > 0 && this.player.y + this.player.h - enemy.y < 18;
        if (stomping) {
          this.level.enemies = this.level.enemies.filter((e) => e !== enemy);
          this.player.bounce();
        } else if (this.player.hit()) {
          this.loseLife();
        }
      }
    }
  }

  updateCoins() {
    for (const coin of this.level.coins) {
      if (coin.taken) continue;
      const coinRect = { x: coin.x - 10, y: coin.y - 10, w: 20, h: 20 };
      if (this.player.intersects(coinRect)) {
        coin.taken = true;
        this.coinsCollected += 1;
        this.hud.coins.textContent = String(this.coinsCollected);
      }
    }
  }

  updateCamera() {
    const target = this.player.x - this.canvas.width / 2 + this.player.w / 2;
    this.camera = Math.max(0, Math.min(target, WORLD_WIDTH - this.canvas.width));
  }

  loseLife() {
    this.lives -= 1;
    this.hud.lives.textContent = String(Math.max(this.lives, 0));
    if (this.lives <= 0) {
      this.finish("Fim de jogo", "Você perdeu todas as vidas. Tente novamente!");
      return;
    }
    this.player.reset(40, GROUND_Y - 46);
  }

  win() {
    this.finish("Você venceu!", `Fase concluída com ${this.coinsCollected} moedas coletadas.`);
  }

  finish(title, text) {
    this.finished = true;
    this.onStateChange(title, text);
  }

  restart() {
    this.level = createLevel();
    this.player.reset(40, GROUND_Y - 46);
    this.coinsCollected = 0;
    this.lives = 3;
    this.finished = false;
    this.hud.coins.textContent = "0";
    this.hud.lives.textContent = "3";
  }

  render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-this.camera, 0);

    this.drawBackground();
    this.drawPlatforms();
    this.drawCoins();
    this.drawEnemies();
    this.drawFlag();
    this.drawPlayer();

    ctx.restore();
  }

  drawBackground() {
    const { ctx } = this;
    ctx.fillStyle = "#dff1c8";
    for (let i = 0; i < 6; i++) {
      const x = i * 420 + 80;
      ctx.beginPath();
      ctx.ellipse(x, 90, 46, 26, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 40, 100, 34, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawPlatforms() {
    const { ctx } = this;
    for (const p of this.level.platforms) {
      ctx.fillStyle = p.h > 40 ? "#8a5a34" : "#c97b3f";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#6fbf4e";
      ctx.fillRect(p.x, p.y, p.w, 10);
    }
  }

  drawCoins() {
    const { ctx } = this;
    for (const coin of this.level.coins) {
      if (coin.taken) continue;
      ctx.fillStyle = "#ffc94a";
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c98a1f";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  drawEnemies() {
    const { ctx } = this;
    for (const enemy of this.level.enemies) {
      ctx.fillStyle = "#5c4a8a";
      ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
      ctx.fillStyle = "#f4f0ff";
      const eyeX = enemy.dir > 0 ? enemy.x + enemy.w - 9 : enemy.x + 3;
      ctx.fillRect(eyeX, enemy.y + 6, 6, 6);
    }
  }

  drawFlag() {
    const { ctx } = this;
    const f = this.level.flag;
    ctx.fillStyle = "#cfd6de";
    ctx.fillRect(f.x, f.y, 6, f.h);
    ctx.fillStyle = "#ef5b3c";
    ctx.beginPath();
    ctx.moveTo(f.x + 6, f.y);
    ctx.lineTo(f.x + 46, f.y + 16);
    ctx.lineTo(f.x + 6, f.y + 32);
    ctx.closePath();
    ctx.fill();
  }

  drawPlayer() {
    const { ctx, player } = this;
    if (player.invulnerableTime > 0 && Math.floor(player.invulnerableTime * 12) % 2 === 0) {
      return; // pisca quando invulnerável
    }

    const { x, y, w, h, facing } = player;

    // corpo
    ctx.fillStyle = "#ef5b3c";
    ctx.fillRect(x, y + h * 0.35, w, h * 0.65);
    // cabeça
    ctx.fillStyle = "#f6c89f";
    ctx.fillRect(x + w * 0.15, y, w * 0.7, h * 0.4);
    // boné
    ctx.fillStyle = "#2a6fdb";
    ctx.fillRect(x, y - 4, w, h * 0.22);
    // viseira do boné (indica direção)
    ctx.fillRect(facing > 0 ? x + w - 8 : x, y + h * 0.1, 8, 6);
  }
}