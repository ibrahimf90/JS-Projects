const playerContainer = document.getElementById("player-container");
const loadMoreBtn = document.getElementById("load-more-btn");

let startingIndex = 0;
let endingIndex = 8;
let playerDataArr = [];

const initialFetch = async () => {
  try {
    const res = await fetch("players.json");
    playerDataArr = await res.json();
    displayPlayers(playerDataArr.slice(startingIndex, endingIndex));
  } catch (err) {
    playerContainer.innerHTML =
      '<p class="error-msg">There was an error loading the players</p>';
  }
};

const fetchMorePlayers = () => {
  startingIndex += 8;
  endingIndex += 8;

  displayPlayers(playerDataArr.slice(startingIndex, endingIndex));
  if (playerDataArr.length <= endingIndex) {
    loadMoreBtn.disabled = true;
    loadMoreBtn.style.cursor = "not-allowed";
    loadMoreBtn.textContent = "No more data to load";
  }
};

const displayPlayers = (players) => {
  players.forEach(({ name, position, image, bio, goals, caps }, index) => {
    playerContainer.innerHTML += `
    <div class="player-card">
      <img class="player-img" src="${image}" alt="${name}">
      <h3 class="player-name">${name}</h3>
      <span class="player-position">${position}</span>
      <p class="player-bio">${bio}</p>
      <div class="player-stats">
        <div class="stat">
          <div class="stat-value">${goals}</div>
          <div class="stat-label">Goals</div>
        </div>
        <div class="stat">
          <div class="stat-value">${caps}</div>
          <div class="stat-label">Caps</div>
        </div>
      </div>
    </div>
  `;
  });
};

initialFetch();
loadMoreBtn.addEventListener("click", fetchMorePlayers);
