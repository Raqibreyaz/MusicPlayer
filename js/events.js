import { audio } from './state.js';
import { togglePlay, playNext, playPrev, toggleShuffle, cycleRepeat } from './player.js';
import { switchView, renderSearchResults, toggleNowPlaying, dom } from './ui.js';
import { initWebAudio } from './audio.js';

export function setupEventListeners() {
  dom.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const view = item.dataset.view;
      if (view) switchView(view);
    });
  });

  document
    .getElementById("back-to-home")
    .addEventListener("click", () => switchView("home"));

  dom.searchInput.addEventListener("input", (e) =>
    renderSearchResults(e.target.value)
  );

  document.getElementById("play-btn").addEventListener("click", togglePlay);
  document.getElementById("prev-btn").addEventListener("click", playPrev);
  document.getElementById("next-btn").addEventListener("click", playNext);
  document
    .getElementById("shuffle-btn")
    .addEventListener("click", toggleShuffle);
  document.getElementById("repeat-btn").addEventListener("click", cycleRepeat);

  if (document.getElementById("mobile-play-btn")) {
    document
      .getElementById("mobile-play-btn")
      .addEventListener("click", togglePlay);
  }

  const seekBar = document.getElementById("seek-bar");
  const seekFill = document.getElementById("seek-fill");

  seekBar.addEventListener("mousedown", () => (seekBar.isDragging = true));
  seekBar.addEventListener("touchstart", () => (seekBar.isDragging = true));

  seekBar.addEventListener("input", (e) => {
    seekFill.style.width = `${e.target.value}%`;
  });

  seekBar.addEventListener("change", (e) => {
    seekBar.isDragging = false;
    if (audio.duration) {
      audio.currentTime = (e.target.value / 100) * audio.duration;
    }
  });

  const volSlider = document.getElementById("volume-slider");
  const volFill = document.getElementById("volume-fill");
  const muteBtn = document.getElementById("mute-btn");
  const volIcon = document.getElementById("vol-icon").querySelector("use");

  volSlider.addEventListener("input", (e) => {
    const val = e.target.value;
    volFill.style.width = `${val}%`;
    audio.volume = val / 100;
    audio.muted = false;
    updateVolumeIcon();
  });

  muteBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    updateVolumeIcon();
  });

  function updateVolumeIcon() {
    if (audio.muted || audio.volume === 0)
      volIcon.setAttribute("href", "#icon-volume-x");
    else volIcon.setAttribute("href", "#icon-volume-2");
  }

  document
    .getElementById("player-expand-btn")
    .addEventListener("click", toggleNowPlaying);
  document
    .getElementById("close-overlay-btn")
    .addEventListener("click", toggleNowPlaying);

  document.getElementById("eq-toggle-btn").addEventListener("click", () => {
    document.getElementById("eq-modal").classList.add("active");
    initWebAudio();
  });
  document.getElementById("close-eq-btn").addEventListener("click", () => {
    document.getElementById("eq-modal").classList.remove("active");
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;

    switch (e.code) {
      case "Space":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowRight":
        e.preventDefault();
        audio.currentTime += 5;
        break;
      case "ArrowLeft":
        e.preventDefault();
        audio.currentTime -= 5;
        break;
      case "ArrowUp":
        e.preventDefault();
        volSlider.value = Math.min(100, parseInt(volSlider.value) + 5);
        volSlider.dispatchEvent(new Event("input"));
        break;
      case "ArrowDown":
        e.preventDefault();
        volSlider.value = Math.max(0, parseInt(volSlider.value) - 5);
        volSlider.dispatchEvent(new Event("input"));
        break;
      case "KeyM":
        e.preventDefault();
        muteBtn.click();
        break;
      case "KeyN":
        e.preventDefault();
        playNext();
        break;
      case "KeyP":
        e.preventDefault();
        playPrev();
        break;
      case "KeyR":
        e.preventDefault();
        cycleRepeat();
        break;
      case "KeyS":
        e.preventDefault();
        toggleShuffle();
        break;
      case "Escape":
        document
          .getElementById("now-playing-overlay")
          .classList.remove("active");
        document.getElementById("eq-modal").classList.remove("active");
        break;
    }
  });
}
