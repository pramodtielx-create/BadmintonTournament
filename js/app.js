/*************************************************
 * CONFIG
 *************************************************/
const API_URL =
  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";

let dataCache = null;

/*************************************************
 * INIT
 *************************************************/
async function init() {
  const res = await fetch(API_URL);
  dataCache = await res.json();
  showDashboard();
}
init();

/*************************************************
 * DASHBOARD
 *************************************************/
function showDashboard() {
  const c = document.getElementById("main-content");

  const teams = computeTeamStandings();
  const players = computeIndividualPlayerStandings();

  c.innerHTML = `
    <h2>Dashboard</h2>

    <div class="summary">League Leader: ${teams[0]?.name || "-"}</div>
    <div class="summary">Top Player: ${players[0]?.name || "-"}</div>
    <div class="summary">
      Teams: ${teams.length} | Players: ${players.length}
    </div>
  `;
}

/*************************************************
 * FIXTURES
 *************************************************/
function showFixtures() {
  const c = document.getElementById("main-content");

  c.innerHTML = `
    <h2>Fixtures & Results</h2>
    <div class="fixtures-grid" id="fixtures-grid"></div>
  `;

  renderFixtures();
}

function renderFixtures() {
  const grid = document.getElementById("fixtures-grid");
  grid.innerHTML = "";

  dataCache.fixtures.forEach(f => {
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

/*************************************************
 * TEAM STANDINGS
 *************************************************/
function showStandings() {
  const standings = computeTeamStandings();
  const c = document.getElementById("main-content");

  let html = `
    <h2>Team Standings</h2>
    <div class="fixture-card standings-wrapper">
      <div class="standings-grid standings-header">
        <div>Team</div><div>R</div><div>P</div><div>W</div><div>L</div>
        <div>SW</div><div>SL</div><div>PW</div><div>PL</div>
        <div>SD</div><div>PD</div><div>Pts</div><div>Form</div>
      </div>
  `;

  standings.forEach((t, i) => {
    html += `
      <div class="standings-grid standings-row ${i < 2 ? "qualifier" : ""}">
        <div>${t.name}</div>
        <div>${i + 1}</div>
        <div>${t.played}</div>
        <div>${t.wins}</div>
        <div>${t.losses}</div>
        <div>${t.setsWon}</div>
        <div>${t.setsLost}</div>
        <div>${t.pointsWon}</div>
        <div>${t.pointsLost}</div>
        <div>${t.setDiff}</div>
        <div>${t.pointDiff}</div>
        <div>${t.leaguePoints}</div>
        <div>${renderForm(t.form)}</div>
      </div>
    `;
  });

  c.innerHTML = html + `</div>`;
}

/*************************************************
 * PLAYER STANDINGS
 *************************************************/
function showPlayerStandings(showAll = false) {
  const players = computeIndividualPlayerStandings();
  const list = showAll ? players : players.slice(0, 10);
  const c = document.getElementById("main-content");

  let html = `
    <h2>Player Standings</h2>

    <label>
      <input type="checkbox" ${showAll ? "checked" : ""}
        onchange="showPlayerStandings(this.checked)">
      Show All Players
    </label>

    <div class="fixture-card standings-wrapper">
      <div class="standings-grid standings-header">
        <div>R</div><div>Player</div><div>Team</div><div>P</div><div>W</div><div>L</div>
        <div>Win%</div><div>SW</div><div>SL</div><div>SD</div>
        <div>PW</div><div>PL</div><div>PD</div><div>Form</div>
      </div>
  `;

  list.forEach((p, i) => {
    html += `
      <div class="standings-grid standings-row rank-${i + 1}">
        <div>${i + 1}</div>
        <div>${p.name}</div>
        <div>${p.team}</div>
        <div>${p.played}</div>
        <div>${p.wins}</div>
        <div>${p.losses}</div>
        <div>${p.winPct}</div>
        <div>${p.setsWon}</div>
        <div>${p.setsLost}</div>
        <div>${p.setDiff}</div>
        <div>${p.pointsWon}</div>
        <div>${p.pointsLost}</div>
        <div>${p.pointDiff}</div>
        <div>${renderForm(p.recentForm.replace(/ /g, ""))}</div>
      </div>
    `;
  });

  c.innerHTML = `<div class="player-standings">${html}</div>`;
}

/*************************************************
 * TEAM & PLAYER TRACKERS (PLACEHOLDERS)
 *************************************************/
function renderTeamView() {
  document.getElementById("main-content").innerHTML =
    "<h2>Team Match Tracker (coming next)</h2>";
}

function renderPlayerView() {
  document.getElementById("main-content").innerHTML =
    "<h2>Player Match Tracker (coming next)</h2>";
}

/*************************************************
 * COMPUTATION HELPERS
 *************************************************/
function computeTeamStandings() {
  const teams = {};

  dataCache.fixtures.forEach(f => {
    teams[f.team_a] ??= initTeam(f.team_a);
    teams[f.team_b] ??= initTeam(f.team_b);
  });

  return Object.values(teams);
}

function initTeam(name) {
  return {
    name,
    played: 0,
    wins: 0,
    losses: 0,
    setsWon: 0,
    setsLost: 0,
    pointsWon: 0,
    pointsLost: 0,
    setDiff: 0,
    pointDiff: 0,
    leaguePoints: 0,
    form: ""
  };
}

function computeIndividualPlayerStandings() {
  return [];
}

function renderForm(form) {
  return form
    .split("")
    .map(c =>
      c === "W"
        ? `<span class="form-W">W</span>`
        : `<span class="form-L">L</span>`
    )
    .join("");
}
