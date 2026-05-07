const API_URL =
  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";

//let dataCache = null;


    <div id="summary"></div>
    <div id="fixtures-grid" class="fixtures-grid"></div>
  `;
  renderFixtures();
}


function renderFixtures() {
  const grid = document.getElementById("fixtures-grid");
  const summary = document.getElementById("summary");
  grid.innerHTML = "";

  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  let completed = 0;
  const total = fixtures.length * 3;
  Object.values(results).forEach(r =>
    r.matches.forEach(m => m.sets && completed++)
  );

  summary.innerHTML = `
    <div class="summary">
      📊 <b>Fixtures Summary:</b> ${completed} / ${total} matches completed
    </div>
  `;

  fixtures.forEach(f => {
    const card = document.createElement("div");
    card.className = "fixture-card";
    card.innerHTML = `
      <div class="fixture-header">
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ================= RESULTS ================= */
function showResults() {
  const container = document.getElementById("main-content");
  container.innerHTML = `
    <h2>Results</h2>
    <div class="fixtures-grid"></div>
  `;
}

/* ================= TEAM ================= */
function renderTeamView() {
  document.getElementById("main-content").innerHTML =
    "<h2>Team Match Tracker</h2>";
}

/* ================= PLAYER ================= */
function renderPlayerView() {
  document.getElementById("main-content").innerHTML =
    "<h2>Player Match Tracker</h2>";
}

/* ✅ EXPOSE FUNCTIONS */
window.showFixtures = showFixtures;
window.showResults = showResults;
window.renderTeamView = renderTeamView;
window.renderPlayerView = renderPlayerView;
  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";

let dataCache = null;

/* ================= INIT ================= */
async function init() {
  const res = await fetch(API_URL);
  dataCache = await res.json();
  showFixtures();
}
init();

/* ================= FIXTURES ================= */
function showFixtures() {
  const container = document.getElementById("main-content");
  container.innerHTML = `
    <div class="filters">
      <label><input type="checkbox" id="r1" checked> Round 1</label>
      <label><input type="checkbox" id="r2" checked> Round 2</label>
      <label><input type="checkbox" id="completed" checked> Completed</label>
      <label><input type="checkbox" id="pending" checked> Pending</label>
