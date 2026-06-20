export interface Album {
  title: string;
  folder: string;
  description: string;
}

export interface Song {
  name: string;
  src: string;
  folder: string;
  cover: string;
  albumTitle: string;
}

export interface State {
  ALBUMS: Album[];
  songsCache: Record<string, Song[]>;
  allSongs: Song[];
  queue: Song[];
  currentSongIndex: number;
  currentAlbumContext: Album | null;
  shuffleMode: boolean;
  repeatMode: number;
  favorites: Set<string>;
  saveFavorites: () => void;
}

export const state: State = {
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
