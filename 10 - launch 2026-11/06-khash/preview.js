const trailers = [...document.querySelectorAll("video")];
for (const trailer of trailers) {
  trailer.addEventListener("play", () => {
    for (const other of trailers) {
      if (other !== trailer) other.pause();
    }
  });
}
