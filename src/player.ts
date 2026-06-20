import { state, audio } from './state.js';
import { updatePlayerUI, updateNowPlayingOverlay, updateAllSongRows, updateQueueUI, renderFavorites, dom } from './ui.js';
import { fetchSongsForFolder } from './api.js';

export async function playAlbum(folder) {
  const songs = await fetchSongsForFolder(folder);
  if (songs.length > 0) {
    playSong(songs[0], songs, 0);
  }
}

export function playSong(song, newQueue = null, index = 0) {
  if (newQueue) {
    state.queue = [...newQueue];
    if (state.shuffleMode) shuffleQueue();
    state.currentSongIndex = state.queue.findIndex((s) => s.src === song.src);
  } else {
    state.currentSongIndex = index;
  }

  const actualSong = state.queue[state.currentSongIndex];

  audio.src = actualSong.src;
  audio.play();

  updatePlayerUI();
  updateNowPlayingOverlay();
  updateAllSongRows();
}

export function togglePlay() {
  if (!audio.src) return;
  if (audio.paused) audio.play();
  else audio.pause();
}

export function playNext() {
  if (state.queue.length === 0) return;

  if (state.repeatMode === 2) {
    audio.currentTime = 0;
    audio.play();
    return;
  }

  state.currentSongIndex++;
  if (state.currentSongIndex >= state.queue.length) {
    if (state.repeatMode === 1) {
      state.currentSongIndex = 0;
    } else {
      state.currentSongIndex = state.queue.length - 1;
      audio.pause();
      return;
    }
  }
  playSong(state.queue[state.currentSongIndex]);
}

export function playPrev() {
  if (state.queue.length === 0) return;

  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  state.currentSongIndex--;
  if (state.currentSongIndex < 0) {
    state.currentSongIndex = state.queue.length - 1;
  }
  playSong(state.queue[state.currentSongIndex]);
}

export function toggleShuffle() {
  state.shuffleMode = !state.shuffleMode;
  const btn = document.getElementById("shuffle-btn");
  btn.classList.toggle("active", state.shuffleMode);

  if (state.queue.length > 0) {
    const currentSong = state.queue[state.currentSongIndex];
    if (state.shuffleMode) {
      shuffleQueue();
    }
    state.currentSongIndex = state.queue.findIndex((s) => s.src === currentSong.src);
    updateQueueUI();
  }
}

export function shuffleQueue() {
  let current = state.queue[state.currentSongIndex];
  for (let i = state.queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.queue[i], state.queue[j]] = [state.queue[j], state.queue[i]];
  }
  const newIdx = state.queue.findIndex((s) => s.src === current.src);
  [state.queue[0], state.queue[newIdx]] = [state.queue[newIdx], state.queue[0]];
  state.currentSongIndex = 0;
}

export function cycleRepeat() {
  state.repeatMode = (state.repeatMode + 1) % 3;
  const btn = document.getElementById("repeat-btn");
  const icon = btn.querySelector("use");

  btn.classList.remove("active");
  if (state.repeatMode === 0) {
    icon.setAttribute("href", "#icon-repeat");
  } else if (state.repeatMode === 1) {
    btn.classList.add("active");
    icon.setAttribute("href", "#icon-repeat");
  } else if (state.repeatMode === 2) {
    btn.classList.add("active");
    icon.setAttribute("href", "#icon-repeat-1");
  }
}

export function toggleFavorite(src) {
  if (state.favorites.has(src)) state.favorites.delete(src);
  else state.favorites.add(src);

  state.saveFavorites();
  const uiModule = import('./ui.js');
  uiModule.then(m => {
      m.updateFavCount();
      m.updateAllSongRows();
      m.updatePlayerUI();
      if (dom.views.favorites && dom.views.favorites.classList.contains("active")) m.renderFavorites();
  });
}
