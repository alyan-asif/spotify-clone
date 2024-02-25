let CurrentSong = new Audio();
let songs;
let CurFolder;

function convertSecondsToMinutesSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Use padStart to ensure the format "00:00"
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  try {
    CurFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    // console.log(response);
    // Create a temporary div to parse the HTML content
    let div = document.createElement("div");
    div.innerHTML = response;
    // Find the table in the parsed HTML content
    let table = div.querySelector("table");
    // Get all rows (excluding the first one which contains headers)
    let rows = table.querySelectorAll("tr:not(:first-child)");
    songs = [];
    // Loop through each row and extract information
    rows.forEach((row) => {
      let cells = row.querySelectorAll("a");
      // console.log(cells)
      for (let index = 0; index < cells.length; index++) {
        const element = cells[index];
        if (element.href.endsWith(".mp3")) {
          songs.push(element.href.split(`/${folder}/`)[1]);
        }
      }
      console.log(songs);

      // let name = cells[0].innerText;
      // let size = cells[1].innerText;
      // let dateModified = cells[2].innerText;

      // Log or display the information as needed
      // console.log(`Name: ${name}, Size: ${size}, Date Modified: ${dateModified}`);
    });

    // Show all the songs in the playlist
    let songsUl = document
      .querySelector(".songList")
      .getElementsByTagName("ul")[0];
    songsUl.innerHTML = " ";
    for (const song of songs) {
      songsUl.innerHTML =
        songsUl.innerHTML +
        `<li>
                <img class="invert" src="music.svg" />
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>SMA(Alyan)</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" src="play.svg" alt="" />
                </div>
              </li>`;
    }

    // var audio = new Audio(songs[2]);
    // audio.play();

    // audio.addEventListener("loadeddata", () => {
    //   console.log(audio.duration, audio.currentSrc, audio.currentTime);
    //   // The duration variable now holds the duration (in seconds) of the audio clip
    // });

    // Attach an event Listener to each song
    Array.from(
      document.querySelector(".songList").getElementsByTagName("li")
    ).forEach((e) => {
      e.addEventListener("click", (element) => {
        // console.log(e.querySelector(".info").firstElementChild.innerHTML);
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
      });
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

// Play Music
const playMusic = (track) => {
  // let audio = new Audio("/songs/" + track);
  CurrentSong.src = `/${CurFolder}/` + track;
  CurrentSong.play();
  play.src = "pause.svg";
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let cardcontainer = document.querySelector(".cardcontainer");

  let table = div.querySelector("table");
  let rows = table.querySelectorAll("tr:not(:first-child)");

  rows.forEach(async (row) => {
    let anchors = row.querySelectorAll("a");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      if (e.href.includes("/songs")) {
        let folder = e.href.split("/").slice(-2)[0];
        let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
        let response = await a.json();

        cardcontainer.innerHTML =
          cardcontainer.innerHTML +
          `<div data-folder=${folder} class="card">
          <div class="play">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                stroke="#141B34"
                stroke-width="1.5"
                stroke-linejoin="round"
              ></path>
            </svg>
          </div>
          <img
            src="/songs/${folder}/cover.jpg"
            alt=""
          />
          <h2>${response.title}</h2>
          <p>${response.description}</p>
        </div> `;
      }
    }

    // load Playlist When Card is Clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      // console.log(e);
      e.addEventListener("click", async (item) => {
        // console.log(item.target, item.currentTarget.dataset);
        const folder = item.currentTarget.dataset.folder;
        await getSongs(`songs/${folder}`);
      });
    });
  });
}
// for (let index = 0; index < cells.length; index++) {
//   const element = cells[index];
//   if (element.href.endsWith(".mp3")) {
//     songs.push(element.href.split(`/${folder}/`)[1]);
//   }
// }

async function main() {
  songs = await getSongs("songs/Calm");

  displayAlbums();

  // Attach an event Listener to play, next and prev
  play.addEventListener("click", () => {
    if (CurrentSong.paused) {
      CurrentSong.play();
      play.src = "pause.svg";
    } else {
      CurrentSong.pause();
      play.src = "play.svg";
    }
  });

  // Listen for timeupdate event
  CurrentSong.addEventListener("timeupdate", () => {
    // console.log(CurrentSong.currentTime, CurrentSong.duration);
    document.querySelector(
      ".songtime"
    ).innerHTML = `${convertSecondsToMinutesSeconds(CurrentSong.currentTime)}:
  ${convertSecondsToMinutesSeconds(CurrentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (CurrentSong.currentTime / CurrentSong.duration) * 100 + "%";
  });

  // Add an event Listener to Seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    CurrentSong.currentTime = (CurrentSong.duration * percent) / 100;
  });

  // Add an event Listener for menu
  document.querySelector(".menu").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event Listener for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  // Add an event Listener for next button
  next.addEventListener("click", () => {
    CurrentSong.pause();
    let index = songs.indexOf(CurrentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  // Add an event Listener for prev button
  prev.addEventListener("click", () => {
    CurrentSong.pause();
    let index = songs.indexOf(CurrentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    } else {
      playMusic(songs[songs.length - 1]);
    }
  });

  // Add an event to Volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
      // console.log(e, e.target, e.target.value);
      CurrentSong.volume = parseInt(e.target.value) / 100;
    });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      CurrentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0
    }
    else{
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      CurrentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10
    }
    console.log(e.target.src);
  });
}

main();
