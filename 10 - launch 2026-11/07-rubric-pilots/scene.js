const parameters = new URLSearchParams(location.search);
const item = pilotCatalog.find(entry => entry.id === parameters.get("id")) || pilotCatalog[0];
const frame = item.frames[Number(parameters.get("frame"))] || item.frames[0];
const canvas = document.getElementById("frame");
const longest = Math.max(...frame.title.split("\n").map(line => line.length));
canvas.classList.add(frame.layout || "poster", frame.tone || item.tone);
if (frame.title || frame.note) canvas.classList.add("has-copy");
if (longest < 8) canvas.classList.add("short");
if (longest > 14) canvas.classList.add("compact");
if (parameters.has("reel")) canvas.classList.add("reel");

function add(tag, css, value, parent = canvas) {
  const element = document.createElement(tag);
  element.className = css;
  element.textContent = value;
  parent.append(element);
  return element;
}

if (frame.image) add("img", "media", "").src = frame.image;
if (frame.object) add("img", "object", "").src = frame.object;
const copy = add("div", "copy", "");
if (frame.title) add("h1", "head", frame.title, copy);
if (frame.mark) {
  const lockup = add("div", "lockup", "", copy);
  add("span", "", "helloiam", lockup);
  const mark = add("img", "", "", lockup);
  mark.src = frame.mark;
  mark.alt = "";
  add("span", "", "am", lockup);
}
if (frame.note) add("p", "note", frame.note, copy);
if (frame.diagram) {
  const route = add("div", "route", "");
  add("strong", "", "SOF", route);
  add("strong", "arrival", "EVN", route);
  add("hr", "", "", route);
  add("small", "", "Sofia", route);
  add("small", "arrival", "Yerevan", route);
}
if (frame.source) add("p", "source", frame.source);
