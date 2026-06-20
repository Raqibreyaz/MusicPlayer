import { state } from './state.js';

export async function loadAlbums() {
  try {
    const res = await fetch(`/songs/`);
    const html = await res.text();
    const div = document.createElement("div");
    div.innerHTML = html;
    const links = div.getElementsByTagName("a");

    for (let a of links) {
      const href = a.getAttribute("href");
      if (href && !href.startsWith(".") && href !== "/" && href !== "songs") {
        let folder = href.endsWith("/") ? href.slice(0, -1) : href;
        if (!folder.includes(".")) {
          try {
            const infoRes = await fetch(`/${folder}/info.json`);
            if (infoRes.ok) {
              const info = await infoRes.json();
              state.ALBUMS.push({
                title: info.title || folder,
                folder: folder,
                description: info.description || "",
              });
            }
          } catch (e) {
            console.error(`Failed to load info for ${folder}`);
          }
        }
      }
    }
  } catch (e) {
    console.error("Failed to load albums list", e);
  }
}

export async function fetchSongsForFolder(folder) {
  if (state.songsCache[folder]) return state.songsCache[folder];

  try {
    const res = await fetch(`/${folder}/`);
    const html = await res.text();
    const div = document.createElement("div");
    div.innerHTML = html;
    const links = div.getElementsByTagName("a");

    const songs = [];
    for (let a of links) {
      if (a.href.endsWith(".mp3")) {
        const src = new URL(a.href).pathname;
        const filename = decodeURIComponent(src.split("/").pop());
        const name = filename.replace(".mp3", "").replace(/-/g, " ");
        songs.push({
          name,
          src,
          folder,
          cover: `/songs/${folder}/cover.jpg`,
          albumTitle: state.ALBUMS.find((al) => al.folder === folder)?.title || folder,
        });
      }
    }
    state.songsCache[folder] = songs;
    return songs;
  } catch (e) {
    console.error(`Failed to fetch songs for ${folder}`, e);
    return [];
  }
}

export async function loadAllSongs() {
  state.allSongs = [];
  for (let album of state.ALBUMS) {
    const songs = await fetchSongsForFolder(album.folder);
    state.allSongs = [...state.allSongs, ...songs];
  }
}
