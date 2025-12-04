const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");

const dayEl = document.getElementById("day");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const orderTextEl = document.getElementById("order-text");

const customerImg = document.getElementById("customer-img");

const shelfItems = document.querySelectorAll(".ingredient");
const outputArea = document.getElementById("output-area");
const recipeContent = document.getElementById("recipe-content");
const brewBtn = document.getElementById("brew-btn");

const endScreen = document.getElementById("end-screen");
const finalScoreEl = document.getElementById("final-score");
const backToStartBtn = document.getElementById("back-to-start-btn");

const instructionsScreen = document.getElementById("instructions-screen");
const instructionsBtn = document.querySelector(".instructions-btn");
const closeInstructionsBtn = document.getElementById("close-instructions");

let selection = [];
let score = 0;
let lives = 3;
let day = 1;
let timeLeft = 15;
let currentRecipe = null;
let isGameOver = false;

let timerId = null;
let ordersServed = 0;

const ORDERS_PER_DAY = 5;
const BASE_TIME = 20;
const MIN_TIME = 8;
const TIME_DECREASE_PER_DAY = 3;

const recipes = {
  latte: ["coffee", "milk", "foam"],
  mocha: ["coffee", "milk", "cocoa"],
  espresso: ["coffee"],
  cappu: ["coffee", "foam", "foam"],
};

function getAvailableRecipes() {
  if (day === 1) return ["espresso", "latte"];
  if (day === 2) return ["espresso", "latte", "cappu"];
  return ["espresso", "latte", "cappu", "mocha"];
}

const customers = [
  "assets/super1.png",
  "assets/super2.png",
  "assets/super3.png",
  "assets/super4.png",
  "assets/super5.png",
];

function updateHUD() {
  timeEl.textContent = timeLeft;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  dayEl.textContent = day;
}

function checkDayProgress() {
  if (ordersServed > 0 && ordersServed % ORDERS_PER_DAY === 0) {
    const finishedDay = day;
    day++;
    updateHUD();
    showDayComplete(finishedDay);
  }
}

function showDayComplete(num) {
  const overlay = document.getElementById("day-complete-overlay");
  const text = document.getElementById("day-complete-text");

  text.textContent = `DAY ${num} COMPLETE!`;
  overlay.style.opacity = 1;

  isGameOver = true;

  setTimeout(() => {
    overlay.style.opacity = 0;

    setTimeout(() => {
      isGameOver = false;
      updateHUD();
      newOrder();
    }, 400);
  }, 2000);
}

function updateRecipePanel() {
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

function setRandomCustomer() {
  const index = Math.floor(Math.random() * customers.length);
  customerImg.src = customers[index];

  customerImg.classList.remove("customer-enter");
  void customerImg.offsetWidth;
  customerImg.classList.add("customer-enter");
}

function newOrder() {
  if (isGameOver) return;

  const available = getAvailableRecipes();
  const index = Math.floor(Math.random() * available.length);
  currentRecipe = available[index];

  orderTextEl.textContent = currentRecipe.toUpperCase();
  selection = [];
  updateOutputArea();

  timeLeft = BASE_TIME - (day - 1) * TIME_DECREASE_PER_DAY;
  if (timeLeft < MIN_TIME) timeLeft = MIN_TIME;

  updateHUD();
  updateRecipePanel();
  setRandomCustomer();
}

function gameOver() {
  isGameOver = true;

  finalScoreEl.textContent = score;

  gameScreen.style.display = "none";
  endScreen.style.display = "flex";
}

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

    ordersServed++;
    checkDayProgress();
    newOrder();
  }
}, 1000);

document.querySelector(".start-btn").addEventListener("click", () => {
  startScreen.style.display = "none";
  gameScreen.style.display = "block";

  score = 0;
  lives = 3;
  day = 1;
  timeLeft = BASE_TIME;
  isGameOver = false;
  ordersServed = 0;

  updateHUD();
  newOrder();
});

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

shelfItems.forEach((el) => {
  el.addEventListener("click", () => {
    if (isGameOver) return;
    if (selection.length >= 4) return;

    const name = el.dataset.name;
    selection.push(name);
    updateOutputArea();
  });
});

function brewDrink() {
  if (isGameOver) return;
  if (!currentRecipe) return;
  if (selection.length === 0) return;

  const expected = recipes[currentRecipe];

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

  ordersServed++;
  checkDayProgress();
  newOrder();
}

brewBtn.addEventListener("click", brewDrink);

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    brewDrink();
  }
});

/* End screen: return to start */
backToStartBtn.addEventListener("click", () => {
  endScreen.style.display = "none";
  startScreen.style.display = "block";
  isGameOver = false;
});

/* Instructions screen */
instructionsBtn.addEventListener("click", () => {
  instructionsScreen.style.display = "flex";
});

closeInstructionsBtn.addEventListener("click", () => {
  instructionsScreen.style.display = "none";
});
