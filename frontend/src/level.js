// Definição da fase: chão, plataformas, moedas, inimigos e a bandeira de chegada.
// Coordenadas em pixels, no espaço do "mundo" (mais largo que o canvas visível).

export const WORLD_WIDTH = 2400;
export const GROUND_Y = 440;

export function createLevel() {
  return {
    platforms: [
      { x: 0, y: GROUND_Y, w: WORLD_WIDTH, h: 64 }, // chão
      { x: 260, y: 340, w: 120, h: 20 },
      { x: 460, y: 280, w: 120, h: 20 },
      { x: 700, y: 360, w: 160, h: 20 },
      { x: 980, y: 300, w: 120, h: 20 },
      { x: 1180, y: 240, w: 120, h: 20 },
      { x: 1420, y: 340, w: 180, h: 20 },
      { x: 1700, y: 280, w: 120, h: 20 },
      { x: 1900, y: 360, w: 160, h: 20 },
    ],
    coins: [
      { x: 300, y: 300, taken: false },
      { x: 500, y: 240, taken: false },
      { x: 740, y: 320, taken: false },
      { x: 1020, y: 260, taken: false },
      { x: 1220, y: 200, taken: false },
      { x: 1460, y: 300, taken: false },
      { x: 1740, y: 240, taken: false },
      { x: 1940, y: 320, taken: false },
      { x: 2100, y: 400, taken: false },
    ],
    enemies: [
      { x: 620, y: GROUND_Y - 28, w: 32, h: 28, dir: -1, range: [560, 860] },
      { x: 1300, y: GROUND_Y - 28, w: 32, h: 28, dir: 1, range: [1180, 1500] },
      { x: 2000, y: GROUND_Y - 28, w: 32, h: 28, dir: -1, range: [1900, 2200] },
    ],
    flag: { x: 2300, y: GROUND_Y - 160, w: 16, h: 160 },
  };
}