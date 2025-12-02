const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");

// HUD
const dayEl = document.getElementById("day");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const orderTextEl = document.getElementById("order-text");

// elementos del juego
const shelfItems = document.querySelectorAll(".ingredient");
const outputArea = document.getElementById("output-area");
const recipeContent = document.getElementById("recipe-content");
const brewBtn = document.getElementById("brew-btn");

// ESTADO DEL JUEGO
let selection = []; // ingredientes elegidos
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

// ---------- HUD ----------
function updateHUD() {
  timeEl.textContent = timeLeft;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  dayEl.textContent = day;
}

// ---------- RECETA VISUAL ----------
function updateRecipePanel() {
  if (!currentRecipe) return;

  recipeContent.innerHTML = "";

  const recipe = recipes[currentRecipe];

  recipe.forEach((name, index) => {
    const img = document.createElement("img");
    img.src = `assets/ing-${name}.png`;
    img.classList.add("recipe-ing");
    recipeContent.appendChild(img);

    if (index < recipe.length - 1) {
      const plus = document.createElement("span");
      plus.textContent = "+";
      plus.classList.add("recipe-plus");
      recipeContent.appendChild(plus);
    }
  });
}

// ---------- GAME OVER ----------
function gameOver() {
  isGameOver = true;
  clearInterval(timerId);
  alert("GAME OVER");
}

// ---------- NUEVO PEDIDO ----------
function newOrder() {
  if (isGameOver) return;

  const index = Math.floor(Math.random() * recipeNames.length);
  currentRecipe = recipeNames[index];

  orderTextEl.textContent = currentRecipe.toUpperCase();

  // limpiar selección
  selection = [];
  updateOutputArea();

  // reiniciar tiempo
  timeLeft = 15;
  updateHUD();
  updateRecipePanel();
}

// ---------- TIMER ----------
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
    newOrder();
  }
}, 1000);

// ---------- START BUTTON ----------
document.querySelector(".start-btn").addEventListener("click", () => {
  startScreen.style.display = "none";
  gameScreen.style.display = "block";

  // resetear estado por si se reinicia
  score = 0;
  lives = 3;
  day = 1;
  timeLeft = 15;
  isGameOver = false;
  updateHUD();
  newOrder();
});

// ---------- OUTPUT (INGREDIENTES ELEGIDOS) ----------
function updateOutputArea() {
  outputArea.innerHTML = "";

  selection.forEach((name, index) => {
    const img = document.createElement("img");
    img.src = `assets/ing-${name}.png`;
    img.classList.add("selected-ing");

    img.addEventListener("click", () => {
      removeIngredient(index);
    });

    outputArea.appendChild(img);
  });
}

function removeIngredient(index) {
  selection.splice(index, 1);
  updateOutputArea();
}

// ---------- CLICK EN INGREDIENTES DEL ESTANTE ----------
shelfItems.forEach((el) => {
  el.addEventListener("click", () => {
    if (isGameOver) return;
    if (selection.length >= MAX_INGREDIENTS) return;

    const name = el.dataset.name; // "milk", "coffee", etc.
    selection.push(name);
    updateOutputArea();
  });
});

// ---------- PREPARAR BEBIDA ----------
function brewDrink() {
  if (isGameOver) return;
  if (!currentRecipe) return;
  if (selection.length === 0) return; // no penalizar si está vacío

  const expected = recipes[currentRecipe];

  const sortedSel = [...selection].sort();
  const sortedExp = [...expected].sort();

  const ok =
    selection.length === expected.length &&
    sortedSel.join(",") === sortedExp.join(",");

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

// botón y barra espaciadora
brewBtn.addEventListener("click", brewDrink);

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    brewDrink();
  }
});
