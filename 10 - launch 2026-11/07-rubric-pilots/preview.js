const scriptUrl = new URL(document.currentScript.src);
const exportBase = new URL("exports/", scriptUrl);

function node(tag, content, parent, css) {
  const element = document.createElement(tag);
  if (css) element.className = css;
  if (content) element.textContent = content;
  parent.append(element);
  return element;
}

function renderCard(item, grid) {
  const details = node("details", "", grid, "pilot-card");
  const summary = node("summary", "", details);
  const dir = new URL(item.id + "/", exportBase);
  const cover = node("img", "", summary, "pilot-cover");
  cover.src = new URL("01.png" + scriptUrl.search, dir);
  cover.alt = "";
  cover.width = 1080;
  cover.height = 1350;
  cover.loading = "lazy";
  node("span", item.title, summary, "pilot-card-title").lang = "en";
  if (item.edition === "illustrated") node("p", "Версия с эмодзи · фото не используются", details);
  if (item.kind === "board") node("p", "Раскадровка · редакционный черновик", details);

  if (item.kind === "reel") {
    const video = node("video", "", details);
    video.controls = true;
    video.playsInline = true;
    video.preload = "none";
    video.poster = cover.src;
    video.src = new URL(item.id + ".mp4" + scriptUrl.search, dir);
    video.setAttribute("aria-label", item.title);
    details.addEventListener("toggle", () => { if (!details.open) video.pause(); });
    node("a", "Открыть MP4", details).href = video.src;
  } else if (item.frames.length === 1) {
    node("a", "Открыть PNG", details).href = cover.src;
  } else {
    const list = node("div", "", details, "slides");
    item.frames.forEach((_, i) => {
      const link = node("a", "", list);
      link.href = new URL(String(i + 1).padStart(2, "0") + ".png" + scriptUrl.search, dir);
      const thumb = node("img", "", link);
      thumb.src = link.href;
      thumb.alt = item.title + " · " + (i + 1);
      thumb.loading = "lazy";
    });
  }
  node("p", item.caption, details).lang = "en";
  if (item.source) node("a", item.sourceLabel, details).href = item.source;
}

document.querySelectorAll("[data-pilots]").forEach(grid => {
  pilotCatalog
    .filter(item => item.section === grid.dataset.pilots)
    .forEach(item => renderCard(item, grid));
});
