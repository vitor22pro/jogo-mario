const GRAVITY = 1800; // px/s^2
const MOVE_SPEED = 260; // px/s
const JUMP_SPEED = 640; // px/s
const MAX_FALL_SPEED = 1200;

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 34;
    this.h = 46;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.alive = true;
    this.invulnerableTime = 0;
  }

  get bounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  update(dt, input, platforms, worldWidth) {
    if (!this.alive) return;

    // Movimento horizontal
    if (input.left) {
      this.vx = -MOVE_SPEED;
      this.facing = -1;
    } else if (input.right) {
      this.vx = MOVE_SPEED;
      this.facing = 1;
    } else {
      this.vx = 0;
    }

    // Pulo
    if (input.jump && this.onGround) {
      this.vy = -JUMP_SPEED;
      this.onGround = false;
    }

    // Gravidade
    this.vy += GRAVITY * dt;
    if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

    // Move eixo X e resolve colisões
    this.x += this.vx * dt;
    this.x = Math.max(0, Math.min(this.x, worldWidth - this.w));
    this.resolveAxis("x", platforms);

    // Move eixo Y e resolve colisões
    this.y += this.vy * dt;
    this.onGround = false;
    this.resolveAxis("y", platforms);

    if (this.invulnerableTime > 0) this.invulnerableTime -= dt;
  }

  resolveAxis(axis, platforms) {
    for (const p of platforms) {
      if (!this.intersects(p)) continue;

      if (axis === "y") {
        if (this.vy > 0) {
          // caindo sobre a plataforma
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
        } else if (this.vy < 0) {
          // batendo a cabeça
          this.y = p.y + p.h;
          this.vy = 0;
        }
      } else {
        if (this.vx > 0) this.x = p.x - this.w;
        else if (this.vx < 0) this.x = p.x + p.w;
      }
    }
  }

  intersects(rect) {
    return (
      this.x < rect.x + rect.w &&
      this.x + this.w > rect.x &&
      this.y < rect.y + rect.h &&
      this.y + this.h > rect.y
    );
  }

  bounce() {
    this.vy = -JUMP_SPEED * 0.6;
  }

  hit() {
    if (this.invulnerableTime > 0) return false;
    this.invulnerableTime = 1.2;
    return true;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.alive = true;
    this.invulnerableTime = 0;
  }
}