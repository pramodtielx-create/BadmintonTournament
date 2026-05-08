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
        <div style="cursor:pointer;color:#2563eb;font-weight:700"
     onclick="showPlayerProfile('${p.name}')">
  ${p.name}
</div>
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
  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};
  const players = {};

  function initPlayer(name, team) {
    return {
      name,
      team,
      played: 0,
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      pointsWon: 0,
      pointsLost: 0,
      setDiff: 0,
      pointDiff: 0,
      winPct: 0,
      recentForm: []
    };
  }

  fixtures.forEach(f => {
    const res = results[f.tie_id];
    if (!res) return;

    f.matches.forEach((pair, idx) => {
      const m = res.matches[idx];
      if (!m || !m.sets) return;

      // ✅ Split doubles into individual players
      const teamAPlayers = pair[0].split("/").map(p => p.trim());
      const teamBPlayers = pair[1].split("/").map(p => p.trim());

      teamAPlayers.forEach(p => {
        players[p] ??= initPlayer(p, f.team_a);
      });
      teamBPlayers.forEach(p => {
        players[p] ??= initPlayer(p, f.team_b);
      });

      let setsA = 0, setsB = 0;
      let ptsA = 0, ptsB = 0;

      m.sets.forEach(([a, b]) => {
        ptsA += a;
        ptsB += b;
        a > b ? setsA++ : setsB++;
      });

      // ✅ Update Team A players
      teamAPlayers.forEach(p => {
        const pl = players[p];
        pl.played++;
        pl.setsWon += setsA;
        pl.setsLost += setsB;
        pl.pointsWon += ptsA;
        pl.pointsLost += ptsB;
        if (setsA > setsB) {
          pl.wins++;
          pl.recentForm.push("W");
        } else {
          pl.losses++;
          pl.recentForm.push("L");
        }
      });

      // ✅ Update Team B players
      teamBPlayers.forEach(p => {
        const pl = players[p];
        pl.played++;
        pl.setsWon += setsB;
        pl.setsLost += setsA;
        pl.pointsWon += ptsB;
        pl.pointsLost += ptsA;
        if (setsB > setsA) {
          pl.wins++;
          pl.recentForm.push("W");
        } else {
          pl.losses++;
          pl.recentForm.push("L");
        }
      });
    });
  });

  Object.values(players).forEach(p => {
    p.setDiff = p.setsWon - p.setsLost;
    p.pointDiff = p.pointsWon - p.pointsLost;
    p.winPct = p.played ? Math.round((p.wins / p.played) * 100) : 0;
    p.recentForm = p.recentForm.slice(-5).join(" ");
  });

  return Object.values(players).sort((a, b) =>
    b.wins - a.wins ||
    b.setDiff - a.setDiff ||
    b.pointDiff - a.pointDiff ||
    a.played - b.played ||
    a.name.localeCompare(b.name)
  );
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
/*************************************************
 * PLAYER PROFILE PAGE
 *************************************************/
/*************************************************
 * PLAYER PROFILE PAGE (ENHANCED)
 *************************************************/
function showPlayerProfile(playerName) {
  const c = document.getElementById("main-content");

  const players = computeIndividualPlayerStandings();
  const player = players.find(p => p.name === playerName);

  if (!player) {
    c.innerHTML = "<h2>Player not found</h2>";
    return;
  }

  const rank = players.indexOf(player) + 1;
  const photo = PLAYER_PHOTOS[player.name] || DEFAULT_PLAYER_PHOTO;

  /******** MATCH HISTORY ********/
  const matchHistory = [];

  dataCache.fixtures.forEach(f => {
    const res = dataCache.results?.[f.tie_id];
    if (!res) return;

    f.matches.forEach((pair, idx) => {
      if (!pair.join(" ").includes(playerName)) return;

      const m = res.matches[idx];
      if (!m || !m.sets) return;

      const score = m.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

      matchHistory.push({
        opponent: pair[0].includes(playerName) ? pair[1] : pair[0],
        teams: `${f.team_a} vs ${f.team_b}`,
        score
      });
    });
  });

  /******** RENDER ********/
  c.innerHTML = `
    <div class="player-profile">

      <div class="player-profile-header">
        <img src="${photo}" class="player-photo"
             onerror="this.src='${DEFAULT_PLAYER_PHOTO}'">

        <div class="player-info">
          <h2>${player.name}</h2>
          <p>Team: <strong>${player.team}</strong></p>
          <p>Rank: ${rank}</p>
        </div>
      </div>

      <div class="summary">
        Played: ${player.played} |
        Wins: ${player.wins} |
        Losses: ${player.losses} |
        Win%: ${player.winPct}
      </div>

      <div class="summary">
        Sets: ${player.setsWon} - ${player.setsLost} (Diff ${player.setDiff}) |
        Points: ${player.pointsWon} - ${player.pointsLost} (Diff ${player.pointDiff})
      </div>

      <div class="summary">
        Recent Form: ${renderForm(player.recentForm.replace(/ /g, ""))}
      </div>

      <h3 style="margin-top:24px">Match History</h3>

      <div class="fixture-card">
        ${
          matchHistory.length === 0
            ? "<p>No completed matches</p>"
            : matchHistory.map(m => `
                <div class="result-row">
                  <div>vs</div>
                  <div>${m.opponent}</div>
                  <div></div>
                  <div>${m.teams}</div>
                  <div>${m.score}</div>
                </div>
              `).join("")
        }
      </div>

      <button class="back-btn" onclick="showPlayerStandings()">
        ⬅ Back to Player Standings
      </button>

    </div>
  `;
}



/* ================= TEAM SQUADS ================= */
/*************************************************
 * TEAM SQUADS VIEW
 *************************************************/
function showTeamSquads() {
  const c = document.getElementById("main-content");

  const teams = buildTeamSquads();

  c.innerHTML = `
    <h2>🎽 Team Squads</h2>

    <div class="squads-grid">
      ${Object.entries(teams)
        .map(
          ([teamName, players]) => `
          <div class="team-card">
            <div class="team-header">${teamName}</div>
            <ul class="player-list">
              ${players.map(p => `<li>${p}</li>`).join("")}
            </ul>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}

/*************************************************
 * BUILD TEAM → PLAYERS MAP
 *************************************************/
function buildTeamSquads() {
  const teams = {};

  dataCache.fixtures.forEach(f => {
    if (!teams[f.team_a]) teams[f.team_a] = new Set();
    if (!teams[f.team_b]) teams[f.team_b] = new Set();

    f.matches.forEach(pair => {
      pair[0].split("/").forEach(p => teams[f.team_a].add(p.trim()));
      pair[1].split("/").forEach(p => teams[f.team_b].add(p.trim()));
    });
  });

  // Convert sets to sorted arrays
  Object.keys(teams).forEach(t => {
    teams[t] = [...teams[t]].sort();
  });

  return teams;
}

