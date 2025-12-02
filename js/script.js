const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const selection = []; // array con los nombres de los ingredientes

// ESTADO DEL JUEGO
let score = 0;
let lives = 3;
let day = 1;
let timeLeft = 15;
let currentRecipe = null;
let isGameOver = false;
let timerId = null;

// RECETAS
const recipes = {
  latte: ["coffee", "milk", "foam"],
  mocha: ["coffee", "milk", "cocoa"],
  espresso: ["coffee"],
  cappu: ["coffee", "foam", "foam"],
};

const recipeNames = Object.keys(recipes);
const MAX_INGREDIENTS = 4;
const shelfItems = document.querySelectorAll(".ingredient");
const outputArea = document.getElementById("output-area");

function updateHUD() {
  // asumiendo que tienes estos spans en el HTML
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("score").textContent = score;
  document.getElementById("lives").textContent = lives;
}

function gameOver() {
  isGameOver = true;
  clearInterval(timerId);
  alert("GAME OVER");
}

function newOrder() {
  if (isGameOver) return;

  const index = Math.floor(Math.random() * recipeNames.length);
  currentRecipe = recipeNames[index];

  document.getElementById("order-text").textContent =
    currentRecipe.toUpperCase();

  // Reiniciar la selección de ingredientes
  selection.length = 0;
  updateOutputArea();

  // Reiniciar tiempo
  timeLeft = 15; // luego lo ajustas tú
  updateHUD();
}

// TIMER
timerId = setInterval(() => {
  if (isGameOver) return;
  if (gameScreen.style.display === "none") return;

  timeLeft--;
  if (timeLeft < 0) timeLeft = 0;
  updateHUD();

  if (timeLeft === 0) {
    lives--;
    if (lives <= 0) {
      lives = 0;
      updateHUD();
      gameOver();
      return;
    }
    updateHUD();
    newOrder(); // siguiente cliente
  }
}, 1000);

document.querySelector(".start-btn").addEventListener("click", () => {
  startScreen.style.display = "none";
  gameScreen.style.display = "block";
  newOrder();
});

// 1. actualizar la fila visual
function updateOutputArea() {
  outputArea.innerHTML = "";

  selection.forEach((name, index) => {
    const img = document.createElement("img");
    img.src = `assets/ing-${name}.png`; // ing-milk, ing-coffee, etc
    img.classList.add("selected-ing");
    img.dataset.index = index; // para poder borrarlo luego

    // al hacer click en una imagen de abajo -> borrar ese ingrediente
    img.addEventListener("click", () => {
      removeIngredient(index);
    });

    outputArea.appendChild(img);
  });
}

function removeIngredient(index) {
  selection.splice(index, 1); // quita 1 elemento en esa posición
  updateOutputArea(); // vuelve a pintar la fila
}

shelfItems.forEach((el) => {
  el.addEventListener("click", () => {
    if (isGameOver) return;

    if (selection.length >= MAX_INGREDIENTS) {
      return;
    }

    const name = el.dataset.name; // "milk", "coffee", etc.
    selection.push(name);
    updateOutputArea();
  });
});

function brewDrink() {
  if (isGameOver) return;
  if (!currentRecipe) return;

  const expected = recipes[currentRecipe];

  // orden NO importa
  const ok =
    selection.length === expected.length &&
    [...selection].sort().join(",") === [...expected].sort().join(",");

  if (ok) {
    score += 10;
    updateHUD();
  } else {
    lives--;
    if (lives <= 0) {
      lives = 0;
      updateHUD();
      gameOver();
      return;
    }
    updateHUD();
  }

  newOrder();
}

document.getElementById("brew-btn").addEventListener("click", brewDrink);

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    brewDrink();
  }
});
