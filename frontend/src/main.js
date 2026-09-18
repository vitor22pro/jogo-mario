import "./style.css";
import { Game } from "./game.js";

const canvas = document.getElementById("game");
const hud = {
  coins: document.getElementById("coins"),
  lives: document.getElementById("lives"),
  level: document.getElementById("level"),
};
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const restartBtn = document.getElementById("restart");

function showOverlay(title, text) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

const game = new Game(canvas, hud, showOverlay);

const keyMap = {
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyA: "left",
  KeyD: "right",
  Space: "jump",
  ArrowUp: "jump",
  KeyW: "jump",
};

window.addEventListener("keydown", (e) => {
  const action = keyMap[e.code];
  if (!action) return;
  e.preventDefault();
  game.input[action] = true;
});

window.addEventListener("keyup", (e) => {
  const action = keyMap[e.code];
  if (!action) return;
  e.preventDefault();
  game.input[action] = false;
});

restartBtn.addEventListener("click", () => {
  hideOverlay();
  game.restart();
});

game.start();