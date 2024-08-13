function secondsToMinutesAndSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


let audio = new Audio();
let songs = [];
let songName = document.querySelector('.song-name');
let play = document.querySelector('.play-buttons').children[1];
let prev = document.querySelector('.play-buttons').children[0];
let next = document.querySelector('.play-buttons').children[2];
let shuffle = false;

async function getAudios(folder) {
    let file = await fetch(`/songs/${folder}`);

    file = await file.text();

    let div = document.createElement('div');
    div.innerHTML = file;

    let as = div.getElementsByTagName("a");


    songs = []
    for (const a of as) {
        if (a.innerHTML.endsWith('.mp3')) {
            
            songs.push(a.href);
        }
    }
}


function song_card(name, src) {
    let element = `   <li>
    <img src="img/music.svg" alt="music">
    <div class="flex song-info">
        <span>${name}</span>
        <span>
            raqib
       <span>
    </div>
    <div class="play-now flex">
        <span>play now</span>
        <img src="img/play.svg" alt="play">
    </div>
</li>`;


    document.querySelector(".library-content").insertAdjacentHTML('beforeend', element);

    if (audio.src === "") {
        let start = src.lastIndexOf('/') + 1;
        let name = src.slice(start).replaceAll('%20', '-').replace('.mp3', '');
        songName.innerHTML = name;
        audio.src = src;
    }

    document.querySelector('.library-content').lastElementChild.addEventListener('click', () => {
        playSong(src);
    }
    )
}

// creating song cards
function createSongCard() {
    document.querySelector('.library-content').innerHTML = "";
    for (let song of songs) {

        let start = song.lastIndexOf('/') + 1;
        const src = song;

        song = song.slice(start).replaceAll('%20', '-').slice(0, 20).replace('.mp3', '');

        song_card(song, src);
    }
}

function playSong(src) {

    let start = src.lastIndexOf('/') + 1;
    let name = src.slice(start).replaceAll('%20', '-').replace('.mp3', '');

    songName.innerHTML = name;
    audio.src = src;
    audio.play();
    play.setAttribute('src', 'img/pause.svg');
}

function playNext() {

    let index;

    if (!shuffle)
        index = (songs.indexOf(audio.src) + 1) % songs.length;
    else
        index = Math.floor(Math.random() * songs.length);

    let src = songs[index];
    playSong(src);
}

function playPrev() {
    let index;

    if (!shuffle)
        index = songs.indexOf(audio.src) - 1;
    else
        index = Math.floor(Math.random() * songs.length);

    index = index < 0 ? songs.length - 1 : index;
    let src = songs[index];

    playSong(src);
}

async function displayAlbums() {

    let file = await fetch(`/songs/`);

    file = await file.text();

    let div = document.createElement('div');
    div.innerHTML = file;

    let as = div.getElementsByTagName("a");

    for (const a of as) {

        if (a.href.includes('/songs')) {

            let folder = a.innerHTML.slice(0, a.innerHTML.length - 1)

            let info = await fetch(`/songs/${folder}/info.json`);

            info = await info.json();


            let album = `<div data-folder=${folder} class="box flex align-center">
        <div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <div class="flex justify-center align-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="black"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>
        </div>
        <div class="playlist-info">
            <h3>${info.title}</h3>
            <div>${info.description}</div>
        </div>
    </div>`

            document.querySelector('.playlists').insertAdjacentHTML('beforeend', album);

        }

    }

    let playlists = document.getElementsByClassName('box');

    for (const playlist of playlists) {
        playlist.addEventListener('click',async () => {
            console.log(playlist, playlist.dataset.folder);

           await getAudios(playlist.dataset.folder);

            createSongCard();
        })
    }

}

async function main() {

    await displayAlbums();

    await getAudios('love-mood');

    createSongCard();

    console.log(songs);
    

    // slide will be shown 
    const slide = document.querySelector(".bar-box1").firstElementChild;

    slide.addEventListener('click', () => {

        document.querySelector('.left-box').style = "left:1%"; 
    }
    )

    // slide will be hidden
    const close = document.querySelector(".home").firstElementChild;

    close.addEventListener('click', () => {
        document.querySelector('.left-box').style = "left:-100%";
    }
    )

    // shuffle listener
    document.getElementById('shuffle').addEventListener('click', (e) => {
       if(shuffle)
       e.target.src='img/un-shuffle.svg';
        else
        e.target.src='img/shuffle.svg';
    shuffle = !shuffle;
    }
    )

    // play or pause listener
    play.addEventListener('click', () => {
        if (!audio.paused) {
            audio.pause();
            play.setAttribute('src', 'img/play.svg');
        }
        else {
            audio.play();
            play.setAttribute('src', 'img/pause.svg');
        }
    }
    )
}

// prev button listener
prev.addEventListener('click', () => {

    playPrev();
}
)
// next button listener
next.addEventListener('click', () => {
    playNext();
}
)

// updating the circle position 
audio.addEventListener('timeupdate', () => {
    let current_time = secondsToMinutesAndSeconds(audio.currentTime);

    current_time = current_time.slice(0, current_time.indexOf("."))

    let total_time = secondsToMinutesAndSeconds(audio.duration);

    total_time = total_time.slice(0, total_time.indexOf("."))

    document.querySelector('.duration').innerHTML = `${current_time}/${total_time}`;

    document.querySelector('#circle').style.left = (audio.currentTime / audio.duration) * 99 + '%';

    if (audio.currentTime === audio.duration) {
        document.querySelector('#circle').style.left = "0%";
        audio.pause();
        document.querySelector(".play-buttons").children[1].setAttribute('src', "img/play.svg");
        playNext();
    }
}
)

// mute or unmute listener
document.querySelector(".volume-scroll").firstElementChild.addEventListener("click", (e) => {

    if (audio.muted) {
        audio.muted = false;
        e.target.setAttribute('src', 'img/unmute.svg');
    }
    else {
        audio.muted = true;
        e.target.setAttribute('src', 'img/mute.svg');
    }
}
)

// adding listener to volume-slider
document.getElementById('volume-slider').addEventListener('change', (e) => {
    audio.volume = (e.target.value) / 100;
}
)

// adding the listeners to seek bar
document.querySelector('.seek-bar').addEventListener('click', (e) => {

    //   document.querySelector('#circle').style.left = e.offsetX +'px';

    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 99;

    document.querySelector('#circle').style.left = percent + '%';

    audio.currentTime = ((audio.duration) * percent) / 100;

}
)

main()
