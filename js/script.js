const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");

document.querySelector(".start-btn").addEventListener("click", () => {
  startScreen.style.display = "none";
  gameScreen.style.display = "block";
});

const selection = []; // array con los nombres de los ingredientes
const MAX_INGREDIENTS = 4;
const shelfItems = document.querySelectorAll(".ingredient");
const outputArea = document.getElementById("output-area");

// 1. actualizar la fila visual
function updateOutputArea() {
  outputArea.innerHTML = "";

  selection.forEach((name, index) => {
    const img = document.createElement("img");
    img.src = `assets/ing-${name}.png`; // ing-marg etc
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
    if (selection.length >= MAX_INGREDIENTS) {
      return;
    }

    const name = el.dataset.name; // "milk", "coffee", etc.
    selection.push(name);
    updateOutputArea();
  });
});

function brewDrink() {
  console.log("Brewing:", selection);
}

document.getElementById("brew-btn").addEventListener("click", brewDrink);

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    brewDrink();
  }
});
