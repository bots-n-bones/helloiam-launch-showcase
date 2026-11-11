const isTuff = new URLSearchParams(location.search).get("game") === "tuff";
const field = document.getElementById("field");
const status = document.getElementById("status");
const dropButton = document.getElementById("drop");
const size = isTuff ? 3 : 5;
const walls = new Set(["1:1", "2:1", "3:3", "1:3"]);
const crumbs = new Set(["4:0", "0:4", "4:4"]);
const targetOrder = [[2, 1], [0, 2], [1, 0]];
const moves = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };
let state;

document.getElementById("title").textContent = isTuff ? "Pink Tuff Drop" : "Catch the Crumbs";
document.getElementById("instructions").textContent = isTuff
  ? "Move the stone above the yellow square. Drop it on three targets."
  : "Take Lavash around the red walls and collect all three crumbs.";
field.classList.add(isTuff ? "tuff" : "lavash");
dropButton.hidden = !isTuff;

function reset() {
  state = { x: isTuff ? 1 : 0, y: isTuff ? 1 : 0, remaining: new Set(crumbs), score: 0, landed: false, feedback: "" };
  render();
}

function render() {
  field.replaceChildren();
  const floor = isTuff ? field.appendChild(document.createElement("div")) : field;
  const target = targetOrder[state.score];
  if (isTuff) floor.className = "floor";

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = floor.appendChild(document.createElement("div"));
      const key = x + ":" + y;
      const selected = x === state.x && y === state.y;
      cell.className = isTuff ? "tile" : "cell";

      if (isTuff) {
        if (target && target[0] === x && target[1] === y) cell.classList.add("target");
        if (selected) {
          cell.classList.add("aim");
          const block = cell.appendChild(document.createElement("div"));
          block.className = "block" + (state.landed ? " lowered" : "");
          for (let face = 0; face < 3; face++) block.appendChild(document.createElement("i"));
        }
      } else if (walls.has(key)) {
        cell.classList.add("wall");
      } else if (selected) {
        const bread = cell.appendChild(document.createElement("img"));
        bread.src = "../02-claude-session%202026-11-10/emoji-cutout/01-Lavash.png";
        bread.alt = "";
      } else if (state.remaining.has(key)) {
        cell.textContent = "●";
      }
    }
  }

  const score = isTuff ? state.score : crumbs.size - state.remaining.size;
  const place = "Column " + (state.x + 1) + ", row " + (state.y + 1) + ".";
  const hint = target && isTuff ? " Target: column " + (target[0] + 1) + ", row " + (target[1] + 1) + "." : "";
  status.textContent = score === 3 ? "You got all three! Play again?" :
    [state.feedback, score + " / 3.", place + hint].filter(Boolean).join(" ");
  dropButton.disabled = state.score === 3 || state.landed;
}

function move(direction) {
  if (state.score === 3 || (!isTuff && !state.remaining.size)) return;
  const [dx, dy] = moves[direction];
  const x = state.x + dx;
  const y = state.y + dy;
  const key = x + ":" + y;
  if (x < 0 || x >= size || y < 0 || y >= size || (!isTuff && walls.has(key))) return;
  Object.assign(state, { x, y, landed: false, feedback: "" });
  if (!isTuff) state.remaining.delete(key);
  render();
}

function drop() {
  if (!isTuff || dropButton.disabled) return;
  const [x, y] = targetOrder[state.score];
  if (state.x === x && state.y === y) {
    state.score += 1;
    state.feedback = "On target.";
  } else {
    state.feedback = "Miss. Move toward the yellow square.";
  }
  state.landed = true;
  render();
}

document.querySelectorAll("[data-move]").forEach(button => button.addEventListener("click", () => move(button.dataset.move)));
dropButton.addEventListener("click", drop);
document.getElementById("reset").addEventListener("click", reset);
document.addEventListener("keydown", event => {
  const direction = event.key.replace("Arrow", "").toLowerCase();
  if (event.key.startsWith("Arrow") && Object.hasOwn(moves, direction)) {
    event.preventDefault();
    move(direction);
  }
});
reset();
