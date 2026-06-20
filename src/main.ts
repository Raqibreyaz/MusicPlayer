import { initDOM, renderAlbumGrid, updateFavCount } from './ui.js';
import { loadAlbums, loadAllSongs } from './api.js';
import { setupVisualizer } from './audio.js';
import { setupEventListeners } from './events.js';
import { audio } from './state.js';
import { playNext } from './player.js';
import { formatTime } from './utils.js';

async function init() {
  initDOM();
  setupEventListeners();
  await loadAlbums();
  await loadAllSongs();
  renderAlbumGrid();
  updateFavCount();
  setupVisualizer();
}

audio.addEventListener("play", () => {
  document.getElementById("play-icon")?.setAttribute("href", "#icon-pause");
  if (document.getElementById("mobile-play-icon")) {
    document
      .getElementById("mobile-play-icon")
      ?.setAttribute("href", "#icon-pause");
  }
});

audio.addEventListener("pause", () => {
  document.getElementById("play-icon")?.setAttribute("href", "#icon-play");
  if (document.getElementById("mobile-play-icon")) {
    document
      .getElementById("mobile-play-icon")
      ?.setAttribute("href", "#icon-play");
  }
});

audio.addEventListener("timeupdate", () => {
  const current = audio.currentTime;
  const duration = audio.duration || 0;

  const currentEl = document.getElementById("time-current");
  const totalEl = document.getElementById("time-total");
  
  if (currentEl) currentEl.textContent = formatTime(current);
  if (totalEl) totalEl.textContent = formatTime(duration);

  const percent = duration ? (current / duration) * 100 : 0;
  const seekBar = document.getElementById("seek-bar") as HTMLInputElement;
  const seekFill = document.getElementById("seek-fill");

  if (seekBar && !(seekBar as any).isDragging) {
    seekBar.value = percent.toString();
    if (seekFill) seekFill.style.width = `${percent}%`;
  }
});

audio.addEventListener("ended", playNext);

window.addEventListener("DOMContentLoaded", init);
