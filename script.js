const audio = document.getElementById("audio");
const play = document.getElementById("play");
const next = document.getElementById("next");
const back = document.getElementById("back");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const songName = document.getElementById("songName");
const artistName = document.getElementById("artistName");

const current = document.getElementById("current");
const duration = document.getElementById("duration");

const playlist = document.querySelectorAll("#playlist li");

const songs = [
{
name:"Kontraa Nasha",
artist:"Bollywood Pop",
src:"kontraa-nasha-bollywood-pop-music-451296.mp3"
},

{
name:"HitsLab Hindi Song",
artist:"Bollywood",
src:"hitslab-indian-hindi-song-bollywood-music-351439 (1).mp3"
},

{
name:"Apalon Beats",
artist:"Indian Beat",
src:"apalonbeats-indian-music-indian-beat-491427.mp3"
}

];

let currentSong = 0;
let isPlaying = false;

loadSong(currentSong);

function loadSong(index){

audio.src = songs[index].src;

songName.innerHTML = songs[index].name;

artistName.innerHTML = songs[index].artist;

playlist.forEach(item=>item.classList.remove("active"));

playlist[index].classList.add("active");

audio.load();

}

play.onclick = ()=>{

if(!isPlaying){

audio.play();

play.innerHTML='<i class="fa-solid fa-pause"></i>';

isPlaying=true;

}else{

audio.pause();

play.innerHTML='<i class="fa-solid fa-play"></i>';

isPlaying=false;

}

};

next.onclick=()=>{

currentSong++;

if(currentSong>=songs.length){

currentSong=0;

}

loadSong(currentSong);

audio.play();

play.innerHTML='<i class="fa-solid fa-pause"></i>';

isPlaying=true;

};

back.onclick=()=>{

currentSong--;

if(currentSong<0){

currentSong=songs.length-1;

}

loadSong(currentSong);

audio.play();

play.innerHTML='<i class="fa-solid fa-pause"></i>';

isPlaying=true;

};

playlist.forEach((item,index)=>{

item.onclick=()=>{

currentSong=index;

loadSong(currentSong);

audio.play();

play.innerHTML='<i class="fa-solid fa-pause"></i>';

isPlaying=true;

};

});
audio.addEventListener("loadedmetadata", () => {

    progress.max = Math.floor(audio.duration);

    duration.innerHTML = formatTime(audio.duration);

});

audio.addEventListener("timeupdate", () => {

    progress.value = Math.floor(audio.currentTime);

    current.innerHTML = formatTime(audio.currentTime);

});

progress.addEventListener("input", () => {

    audio.currentTime = progress.value;

});

volume.addEventListener("input", () => {

    audio.volume = volume.value;

});

audio.addEventListener("ended", () => {

    currentSong++;

    if(currentSong >= songs.length){

        currentSong = 0;

    }

    loadSong(currentSong);

    audio.play();

    play.innerHTML = '<i class="fa-solid fa-pause"></i>';

    isPlaying = true;

});

function formatTime(time){

    let min = Math.floor(time / 60);

    let sec = Math.floor(time % 60);

    if(min < 10){

        min = "0" + min;

    }

    if(sec < 10){

        sec = "0" + sec;

    }

    return min + ":" + sec;

}