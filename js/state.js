export const state = {
  ALBUMS: [],
  songsCache: {},
  allSongs: [],
  queue: [],
  currentSongIndex: -1,
  currentAlbumContext: null,
  shuffleMode: false,
  repeatMode: 0,
  favorites: new Set(JSON.parse(localStorage.getItem("moodify_favorites") || "[]")),
  
  saveFavorites() {
    localStorage.setItem("moodify_favorites", JSON.stringify([...this.favorites]));
  }
};

export const audio = new Audio();
