import { state, Album, Song } from './state.js';
import { fetchSongsForFolder } from './api.js';
import { formatTime } from './utils.js';
import { playAlbum, playSong, toggleFavorite } from './player.js';

export const dom = {
  views: {
    home: null as HTMLElement | null,
    album: null as HTMLElement | null,
    favorites: null as HTMLElement | null,
    search: null as HTMLElement | null,
  } as Record<string, HTMLElement | null>,
  navItems: null as NodeListOf<HTMLElement> | null,
  searchContainer: null as HTMLElement | null,
  searchInput: null as HTMLInputElement | null,
};

export function initDOM() {
  dom.views.home = document.getElementById("home-view");
  dom.views.album = document.getElementById("album-view");
  dom.views.favorites = document.getElementById("favorites-view");
  dom.views.search = document.getElementById("search-view");
  dom.navItems = document.querySelectorAll(".nav-item");
  dom.searchContainer = document.getElementById("search-container");
  dom.searchInput = document.getElementById("search-input") as HTMLInputElement;
}

export function switchView(viewName: string) {
  Object.values(dom.views).forEach((v) => v?.classList.remove("active"));
  dom.views[viewName]?.classList.add("active");

  dom.navItems?.forEach((n) => n.classList.remove("active"));
  document.querySelector(`.nav-item[data-view="${viewName}"]`)?.classList.add("active");

  if (dom.searchContainer) dom.searchContainer.style.display = viewName === "search" ? "block" : "none";
  if (viewName === "search" && dom.searchInput) dom.searchInput.focus();
  if (viewName === "favorites") renderFavorites();
}

export function renderAlbumGrid() {
  const grid = document.getElementById("album-grid");
  if (!grid) return;
  grid.innerHTML = "";

  state.ALBUMS.forEach((album) => {
    const card = document.createElement("div");
    card.className = "album-card";
    card.onclick = () => openAlbum(album);

    card.innerHTML = `
      <div class="album-cover-wrapper">
        <img src="${album.folder}/cover.jpg" alt="${album.title}" class="album-cover" loading="lazy">
        <button class="album-play-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><use href="#icon-play"/></svg>
        </button>
      </div>
      <h3 class="album-title">${album.title}</h3>
      <p class="album-desc">${album.description}</p>
    `;
    const playBtn = card.querySelector(".album-play-btn") as HTMLElement;
    playBtn.onclick = (e) => {
      e.stopPropagation();
      playAlbum(album.folder);
    };
    grid.appendChild(card);
  });
}

export async function openAlbum(album: Album) {
  state.currentAlbumContext = album;

  (document.getElementById("album-large-cover") as HTMLImageElement).src = `/${album.folder}/cover.jpg`;
  (document.getElementById("album-large-title") as HTMLElement).textContent = album.title;
  (document.getElementById("album-large-desc") as HTMLElement).textContent = album.description;

  (document.getElementById("play-album-btn") as HTMLElement).onclick = () => playAlbum(album.folder);

  const songs = await fetchSongsForFolder(album.folder);
  renderSongList(songs, document.getElementById("album-song-list"), album.folder);

  switchView("album");
}

export function renderSongList(songs: Song[], container: HTMLElement | null, contextId = "global") {
  if (!container) return;
  container.innerHTML = "";
  if (songs.length === 0) {
    container.innerHTML = `<div class="empty-state">No songs found in this playlist. Add some MP3s to the folder!</div>`;
    return;
  }

  songs.forEach((song, idx) => {
    const isPlaying = state.currentSongIndex !== -1 && state.queue[state.currentSongIndex]?.src === song.src;
    const isFav = state.favorites.has(song.src);

    const row = document.createElement("div");
    row.className = `song-row ${isPlaying ? "playing" : ""}`;
    row.dataset.src = song.src;
    row.onclick = () => playSong(song, songs, idx);

    row.innerHTML = `
      <div class="song-index">${idx + 1}</div>
      <div class="playing-bars">
        <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
      </div>
      <img src="${song.cover}" alt="cover" class="song-thumb">
      <div class="song-details">
        <div class="song-name">${song.name}</div>
        <div class="song-artist">${song.albumTitle}</div>
      </div>
      <div class="song-actions">
        <button class="fav-btn ${isFav ? "active" : ""}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><use href="#icon-heart"/></svg>
        </button>
        <div class="song-duration">--:--</div>
      </div>
    `;

    const favBtn = row.querySelector(".fav-btn") as HTMLElement;
    favBtn.onclick = (e) => {
      e.stopPropagation();
      toggleFavorite(song.src);
    };

    const tempAudio = new Audio(song.src);
    tempAudio.addEventListener("loadedmetadata", () => {
      const dur = row.querySelector(".song-duration");
      if (dur) dur.textContent = formatTime(tempAudio.duration);
    });

    container.appendChild(row);
  });
}

export function renderFavorites() {
  const favSongs = state.allSongs.filter((s) => state.favorites.has(s.src));
  renderSongList(favSongs, document.getElementById("favorites-list"), "favorites");
}

export function updateFavCount() {
  const el = document.getElementById("fav-count");
  if (el) el.textContent = `${state.favorites.size} songs`;
}

export function renderSearchResults(query: string) {
  query = query.toLowerCase();

  const matchedAlbums = state.ALBUMS.filter(
    (a) =>
      a.title.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query)
  );

  const albumGrid = document.getElementById("search-albums-grid");
  if (albumGrid) {
    albumGrid.innerHTML = "";
    matchedAlbums.forEach((album) => {
      const card = document.createElement("div");
      card.className = "album-card";
      card.onclick = () => openAlbum(album);
      card.innerHTML = `
        <div class="album-cover-wrapper"><img src="/${album.folder}/cover.jpg" class="album-cover"></div>
        <h3 class="album-title">${album.title}</h3>
      `;
      albumGrid.appendChild(card);
    });
  }

  const matchedSongs = state.allSongs.filter(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      s.albumTitle.toLowerCase().includes(query)
  );
  renderSongList(matchedSongs, document.getElementById("search-songs-list"), "search");
}

export function updatePlayerUI() {
  const song = state.queue[state.currentSongIndex];
  if (!song) return;

  const titleEl = document.getElementById("player-song-name");
  if (titleEl) titleEl.textContent = song.name;
  
  const artistEl = document.getElementById("player-artist");
  if (artistEl) artistEl.textContent = song.albumTitle;
  
  const thumbEl = document.getElementById("player-thumb") as HTMLImageElement;
  if (thumbEl) {
    thumbEl.src = song.cover;
    thumbEl.style.display = "block";
  }

  const favBtn = document.getElementById("player-fav-btn");
  if (favBtn) {
    favBtn.style.display = "block";
    const isFav = state.favorites.has(song.src);
    favBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><use href="#icon-heart"/></svg>`;
    favBtn.classList.toggle("active", isFav);
    favBtn.onclick = () => toggleFavorite(song.src);
  }

  document.getElementById("play-icon")?.setAttribute("href", "#icon-pause");
  if (document.getElementById("mobile-play-icon")) {
    document.getElementById("mobile-play-icon")?.setAttribute("href", "#icon-pause");
  }
}

export function updateAllSongRows() {
  const currentSrc = state.queue[state.currentSongIndex]?.src;
  document.querySelectorAll(".song-row").forEach((row) => {
    const el = row as HTMLElement;
    const isPlaying = el.dataset.src === currentSrc;
    el.classList.toggle("playing", isPlaying);

    const favBtn = el.querySelector(".fav-btn");
    if (favBtn) {
      const isFav = state.favorites.has(el.dataset.src!);
      favBtn.classList.toggle("active", isFav);
      favBtn.querySelector("svg")?.setAttribute("fill", isFav ? "currentColor" : "none");
    }
  });
}

export function toggleNowPlaying() {
  const overlay = document.getElementById("now-playing-overlay");
  if (!overlay) return;
  overlay.classList.toggle("active");
  if (overlay.classList.contains("active")) updateNowPlayingOverlay();
}

export function updateNowPlayingOverlay() {
  const song = state.queue[state.currentSongIndex];
  if (!song) return;

  const titleEl = document.getElementById("overlay-title");
  if (titleEl) titleEl.textContent = song.name;
  
  const artistEl = document.getElementById("overlay-artist");
  if (artistEl) artistEl.textContent = song.albumTitle;
  
  const artEl = document.getElementById("overlay-art") as HTMLImageElement;
  if (artEl) artEl.src = song.cover;
  
  const bgEl = document.getElementById("overlay-bg");
  if (bgEl) bgEl.style.backgroundImage = `url(${song.cover})`;

  updateQueueUI();
}

export function updateQueueUI() {
  const container = document.getElementById("up-next-list");
  if (!container) return;
  container.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    let idx = state.currentSongIndex + i;
    if (idx >= state.queue.length) break;

    const song = state.queue[idx];
    const row = document.createElement("div");
    row.className = "song-row";
    row.innerHTML = `
      <img src="${song.cover}" class="song-thumb" style="width:32px;height:32px">
      <div class="song-details">
        <div class="song-name" style="font-size:13px">${song.name}</div>
      </div>
    `;
    row.onclick = () => {
      toggleNowPlaying();
      playSong(song, null, idx);
    };
    container.appendChild(row);
  }
}
