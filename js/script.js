const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");

// HUD
const dayEl = document.getElementById("day");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const orderTextEl = document.getElementById("order-text");

// Cliente
const customerImg = document.getElementById("customer-img");

// elementos del juego
const shelfItems = document.querySelectorAll(".ingredient");
const outputArea = document.getElementById("output-area");
const recipeContent = document.getElementById("recipe-content");
const brewBtn = document.getElementById("brew-btn");

const endScreen = document.getElementById("end-screen");
const finalScoreEl = document.getElementById("final-score");
const backToStartBtn = document.getElementById("back-to-start-btn");

// ESTADO DEL JUEGO
let selection = []; // ingredientes elegidos
let score = 0;
let lives = 3;
let day = 1;
let timeLeft = 15;
let currentRecipe = null;
let isGameOver = false;
let timerId = null;

let ordersServed = 0;
const ORDERS_PER_DAY = 5; // pedidos para subir de día
const BASE_TIME = 20; // tiempo base del Día 1
const MIN_TIME = 8; // tiempo mínimo
const TIME_DECREASE_PER_DAY = 3; // se resta por cada día

// RECETAS
const recipes = {
  latte: ["coffee", "milk", "foam"],
  mocha: ["coffee", "milk", "cocoa"],
  espresso: ["coffee"],
  cappu: ["coffee", "foam", "foam"],
};

const recipeNames = Object.keys(recipes);
const MAX_INGREDIENTS = 4;

// Qué recetas están disponibles según el día
function getAvailableRecipes() {
  if (day === 1) {
    // Día 1: solo cosas sencillas
    return ["espresso", "latte"];
  } else if (day === 2) {
    // Día 2: añadimos cappu
    return ["espresso", "latte", "cappu"];
  } else {
    // Día 3 en adelante: todas
    return ["espresso", "latte", "cappu", "mocha"];
  }
}

// sprites de clientes
const customers = [
  "assets/super1.png",
  "assets/super2.png",
  "assets/super3.png",
  "assets/super4.png",
  "assets/super5.png",
];

// ---------- HUD ----------
function updateHUD() {
  timeEl.textContent = timeLeft;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  dayEl.textContent = day;
}

// ---------- PROGRESO DE DÍA ----------
function checkDayProgress() {
  if (ordersServed > 0 && ordersServed % ORDERS_PER_DAY === 0) {
    day++;
    updateHUD();
    showDayCompleteOverlay(day - 1); // muestra el día que acabas de terminar
  }
}

function showDayCompleteOverlay(dayNumber) {
  const overlay = document.getElementById("day-complete-overlay");
  const text = document.getElementById("day-complete-text");

  text.textContent = `DAY ${dayNumber} COMPLETE!`;

  overlay.style.opacity = 1;

  // ocultamos después de 1.5 segundos
  setTimeout(() => {
    overlay.style.opacity = 0;
  }, 1500);
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

// ---------- CLIENTE RANDOM ----------
function setRandomCustomer() {
  if (!customerImg) return;

  const index = Math.floor(Math.random() * customers.length);
  customerImg.src = customers[index];

  // reiniciar animación de entrada
  customerImg.classList.remove("customer-enter");
  void customerImg.offsetWidth; // truco para reiniciar animación
  customerImg.classList.add("customer-enter");
}

// ---------- NUEVO PEDIDO ----------
function newOrder() {
  if (isGameOver) return;

  // recetas disponibles según el día actual
  const available = getAvailableRecipes();
  const index = Math.floor(Math.random() * available.length);
  currentRecipe = available[index];

  orderTextEl.textContent = currentRecipe.toUpperCase();

  // limpiar selección
  selection = [];
  updateOutputArea();

  // tiempo según el día
  timeLeft = BASE_TIME - (day - 1) * TIME_DECREASE_PER_DAY;
  if (timeLeft < MIN_TIME) {
    timeLeft = MIN_TIME;
  }

  updateHUD();
  updateRecipePanel();
  setRandomCustomer();
}

// ---------- GAME OVER ----------
function gameOver() {
  isGameOver = true;
  // OJO: ya no usamos clearInterval(timerId); el intervalo sigue,
  // pero como isGameOver = true, el timer deja de restar tiempo.

  // mostrar score final en la end screen
  finalScoreEl.textContent = score;

  // ocultar game screen y mostrar end screen
  gameScreen.style.display = "none";
  endScreen.style.display = "block";
}
// ---------- TIMER ----------
timerId = setInterval(() => {
  if (isGameOver) return;
  if (gameScreen.style.display === "none") return;

  // 👇 ESTO FALTABA
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

    // cuenta pedido fallado por tiempo
    ordersServed++;
    checkDayProgress();

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
  timeLeft = BASE_TIME;
  isGameOver = false;
  ordersServed = 0;

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

  // este pedido ya se atendió (bien o mal)
  ordersServed++;
  checkDayProgress();

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

function showDayComplete(completedDay) {
  const overlay = document.getElementById("day-complete-overlay");
  const text = document.getElementById("day-complete-text");

  text.textContent = `DAY ${completedDay} COMPLETE!`;
  overlay.style.opacity = 1;

  // Pausar el juego temporalmente
  isGameOver = true;

  setTimeout(() => {
    overlay.style.opacity = 0;

    setTimeout(() => {
      isGameOver = false;
      updateHUD();
      newOrder(); // arrancamos el día siguiente
    }, 400);
  }, 2200);
}

backToStartBtn.addEventListener("click", () => {
  // ocultamos la end screen y volvemos al start
  endScreen.style.display = "none";
  startScreen.style.display = "block";
});
