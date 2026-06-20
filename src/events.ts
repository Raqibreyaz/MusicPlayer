import { audio } from './state.js';
import { togglePlay, playNext, playPrev, toggleShuffle, cycleRepeat } from './player.js';
import { switchView, renderSearchResults, toggleNowPlaying, dom } from './ui.js';
import { initWebAudio } from './audio.js';

export function setupEventListeners() {
  dom.navItems?.forEach((item) => {
    item.addEventListener("click", () => {
      const view = item.dataset.view;
      if (view) switchView(view);
    });
  });

  document
    .getElementById("back-to-home")
    ?.addEventListener("click", () => switchView("home"));

  dom.searchInput?.addEventListener("input", (e) =>
    renderSearchResults((e.target as HTMLInputElement).value)
  );

  document.getElementById("play-btn")?.addEventListener("click", togglePlay);
  document.getElementById("prev-btn")?.addEventListener("click", playPrev);
  document.getElementById("next-btn")?.addEventListener("click", playNext);
  document
    .getElementById("shuffle-btn")
    ?.addEventListener("click", toggleShuffle);
  document.getElementById("repeat-btn")?.addEventListener("click", cycleRepeat);

  const mobilePlayBtn = document.getElementById("mobile-play-btn");
  if (mobilePlayBtn) {
    mobilePlayBtn.addEventListener("click", togglePlay);
  }

  const seekBar = document.getElementById("seek-bar") as HTMLInputElement;
  const seekFill = document.getElementById("seek-fill");

  if (seekBar) {
    seekBar.addEventListener("mousedown", () => ((seekBar as any).isDragging = true));
    seekBar.addEventListener("touchstart", () => ((seekBar as any).isDragging = true));

    seekBar.addEventListener("input", (e) => {
      if (seekFill) seekFill.style.width = `${(e.target as HTMLInputElement).value}%`;
    });

    seekBar.addEventListener("change", (e) => {
      (seekBar as any).isDragging = false;
      if (audio.duration) {
        audio.currentTime = (Number((e.target as HTMLInputElement).value) / 100) * audio.duration;
      }
    });
  }

  const volSlider = document.getElementById("volume-slider") as HTMLInputElement;
  const volFill = document.getElementById("volume-fill");
  const muteBtn = document.getElementById("mute-btn");
  const volIcon = document.getElementById("vol-icon")?.querySelector("use");

  if (volSlider) {
    volSlider.addEventListener("input", (e) => {
      const val = Number((e.target as HTMLInputElement).value);
      if (volFill) volFill.style.width = `${val}%`;
      audio.volume = val / 100;
      audio.muted = false;
      updateVolumeIcon();
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      audio.muted = !audio.muted;
      updateVolumeIcon();
    });
  }

  function updateVolumeIcon() {
    if (!volIcon) return;
    if (audio.muted || audio.volume === 0)
      volIcon.setAttribute("href", "#icon-volume-x");
    else volIcon.setAttribute("href", "#icon-volume-2");
  }

  document
    .getElementById("player-expand-btn")
    ?.addEventListener("click", toggleNowPlaying);
  document
    .getElementById("close-overlay-btn")
    ?.addEventListener("click", toggleNowPlaying);

  document.getElementById("eq-toggle-btn")?.addEventListener("click", () => {
    document.getElementById("eq-modal")?.classList.add("active");
    initWebAudio();
  });
  document.getElementById("close-eq-btn")?.addEventListener("click", () => {
    document.getElementById("eq-modal")?.classList.remove("active");
  });

  document.addEventListener("keydown", (e) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;

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
        if (volSlider) {
          volSlider.value = Math.min(100, parseInt(volSlider.value) + 5).toString();
          volSlider.dispatchEvent(new Event("input"));
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (volSlider) {
          volSlider.value = Math.max(0, parseInt(volSlider.value) - 5).toString();
          volSlider.dispatchEvent(new Event("input"));
        }
        break;
      case "KeyM":
        e.preventDefault();
        muteBtn?.click();
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
          ?.classList.remove("active");
        document.getElementById("eq-modal")?.classList.remove("active");
        break;
    }
  });
}
