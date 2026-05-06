const API_URL =
  "https ================= */  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";
async function init() {
  const res = await fetch(API_URL);
  dataCache = await res.json();
  showFixtures(); // default view
}

init();

/* ================= FIXTURES ENTRY ================= */
function showFixtures() {
  buildFixturesUI();
  renderFixtures();
}

/* ================= BUILD FIXTURES UI ================= */
function buildFixturesUI() {
  const container = document.getElementById("main-content");

  container.innerHTML = `
    <div class="filters">
      <label><input type="checkbox" id="r1" checked> Round 1</label>
      <label><input type="checkbox" id="r2" checked> Round 2</label>
      <label><input type="checkbox" id="completed" checked> Completed</label>
      <label><input type="checkbox" id="pending" checked> Pending</label>
    </div>

    <div id="summary"></div>
    <div id="fixtures-grid" class="fixtures-grid"></div>
  `;

  ["r1", "r2", "completed", "pending"].forEach(id => {
    document.getElementById(id).addEventListener("change", renderFixtures);
  });
}

/* ================= RENDER FIXTURES ================= */
function renderFixtures() {
  const grid = document.getElementById("fixtures-grid");
  const summary = document.getElementById("summary");

  if (!grid) return;

  grid.innerHTML = "";

  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  const showR1 = document.getElementById("r1").checked;
  const showR2 = document.getElementById("r2").checked;
  const showCompleted = document.getElementById("completed").checked;
  const showPending = document.getElementById("pending").checked;

  let completedMatches = 0;
  const totalMatches = fixtures.length * 3;

  Object.values(results).forEach(r =>
    r.matches.forEach(m => m.sets && completedMatches++)
  );

  summary.innerHTML = `
    <div class="summary">
      📊 <strong>Fixtures Summary:</strong>
      ${completedMatches} / ${totalMatches} matches completed
    </div>
  `;

  fixtures.forEach(f => {
    if ((f.round_no === 1 && !showR1) || (f.round_no === 2 && !showR2)) return;

    const res = results[f.tie_id];
    const doneCount = res ? res.matches.filter(m => m.sets).length : 0;

    if ((doneCount === 3 && !showCompleted) || (doneCount < 3 && !showPending)) return;

    const card = document.createElement("div");
    card.className = "fixture-card";

    card.innerHTML = `
      <div class="fixture-header">
        <strong>${f.team_a}</strong> <span class="vs">vs</span> <strong>${f.team_b}</strong>
      </div>
      <div class="fixture-sub">${doneCount} / 3 matches completed</div>
    `;

    f.matches.forEach((pair, idx) => {
      const matchRes = res && res.matches[idx];

      if (!matchRes || !matchRes.sets) {
        card.innerHTML += `
          <div class="match pending">
            <strong>M${idx + 1}</strong> ⏳
            ${pair[0]} <span class="vs">vs</span> ${pair[1]}
          </div>
        `;
        return;
      }

      let a = 0, b = 0;
      matchRes.sets.forEach(s => (s[0] > s[1] ? a++ : b++));
      const winnerIdx = a > b ? 0 : 1;
      const winnerPair = pair[winnerIdx];
      const winnerTeam = winnerIdx === 0 ? f.team_a : f.team_b;
      const scoreLine = matchRes.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

      card.innerHTML += `
        <div class="match done">
          <strong>M${idx + 1}</strong> ✅
          <span class="winner">${winnerPair}</span>
          <span class="winner-team">(${winnerTeam})</span>
          <div class="result-score">${scoreLine}</div>
        </div>
      `;
    });

    grid.appendChild(card);
  });
}

/* ================= RESULTS VIEW ================= */
function showResults() {
  const container = document.getElementById("main-content");

  container.innerHTML = `
    <h2>Results</h2>
    <div class="fixtures-grid" id="results-grid"></div>
  `;

  const grid = document.getElementById("results-grid");
  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  fixtures.forEach(f => {
    const res = results[f.tie_id];
    if (!res) return;

    const card = document.createElement("div");
    card.className = "fixture-card";

    card.innerHTML = `
      <div class="fixture-header">
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>
    `;

    res.matches.forEach((m, idx) => {
      if (!m.sets) {
        card.innerHTML += `
          <div class="match pending">
            <strong>M${idx + 1}</strong> ⏳ Pending
          </div>
        `;
        return;
      }

      let a = 0, b = 0;
      m.sets.forEach(s => (s[0] > s[1] ? a++ : b++));
      const winner = a > b ? f.matches[idx][0] : f.matches[idx][1];
      const score = m.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

      card.innerHTML += `
        <div class="match done">
          <strong>M${idx + 1}</strong> ✅
          <span class="winner">${winner}</span>
          <div class="result-score">${score}</div>
        </div>
      `;
    });

    grid.appendChild(card);
  });
}

/* ================= TEAM MATCH TRACKER ================= */
function renderTeamView() {
  const container = document.getElementById("main-content");

  container.innerHTML = `
    <h2>Team Match Tracker</h2>
    <select id="teamSelect">
      <option value="">Select a team</option>
    </select>
    <div id="team-results" class="fixtures-grid"></div>
  `;

  const teamSet = new Set();
  dataCache.fixtures.forEach(f => {
    teamSet.add(f.team_a);
    teamSet.add(f.team_b);
  });

  const select = document.getElementById("teamSelect");
  [...teamSet].sort().forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    select.appendChild(opt);
  });

  select.onchange = () => showTeamMatches(select.value);
}

function showTeamMatches(team) {
  const grid = document.getElementById("team-results");
  grid.innerHTML = "";

  let completed = 0, pending = 0;

  dataCache.fixtures.forEach(f => {
    if (f.team_a !== team && f.team_b !== team) return;

    const opponent = f.team_a === team ? f.team_b : f.team_a;
    const res = dataCache.results[f.tie_id];

    const card = document.createElement("div");
    card.className = "fixture-card";

    let doneHTML = "", pendingHTML = "";

    f.matches.forEach((pair, idx) => {
      const isTeamA = f.team_a === team;
      const teamPair = isTeamA ? pair[0] : pair[1];
      const oppPair = isTeamA ? pair[1] : pair[0];
      const matchRes = res && res.matches[idx];

      if (!matchRes || !matchRes.sets) {
        pending++;
        pendingHTML += `
          <div class="match pending">
            <strong>M${idx + 1}</strong> ⏳
            <div><b>${team}:</b> ${teamPair}</div>
            <div><b>${opponent}:</b> ${oppPair}</div>
          </div>
        `;
        return;
      }

      completed++;
      let a = 0, b = 0;
      matchRes.sets.forEach(s => (s[0] > s[1] ? a++ : b++));
      const teamWon = (isTeamA && a > b) || (!isTeamA && b > a);
      const score = matchRes.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

      doneHTML += `
        <div class="match done">
          <strong>M${idx + 1}</strong> ✅
          <div><b>${team}:</b> <span class="${teamWon ? "winner" : ""}">${teamPair}</span></div>
          <div><b>${opponent}:</b> ${oppPair}</div>
          <div class="result-score">${score}</div>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="fixture-header">
        ${team} <span class="vs">vs</span> ${opponent}
      </div>
      ${doneHTML ? `<h4>✅ Completed</h4>${doneHTML}` : ""}
      ${pendingHTML ? `<h4>⏳ Pending</h4>${pendingHTML}` : ""}
    `;

    grid.appendChild(card);
  });

  grid.prepend(`
    <div class="summary">
      🏆 <b>${team}</b> — ✅ Completed: ${completed} &nbsp; ⏳ Pending: ${pending}
    </div>
  `);
}

/* ================= PLAYER VIEW ================= */
function renderPlayerView() {
  const container = document.getElementById("main-content");

  container.innerHTML = `
    <h2>Player Match Tracker</h2>
    <select id="playerSelect">
      <option value="">Select a player</option>
    </select>
    <div id="player-results" class="fixtures-grid"></div>
  `;

  const playerSet = new Set();
  dataCache.fixtures.forEach(f =>
    f.matches.forEach(pair =>
      pair.forEach(side =>
        side.split("/").forEach(p => playerSet.add(p.trim()))
      )
    )
  );

  const select = document.getElementById("playerSelect");
  [...playerSet].sort().forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    select.appendChild(opt);
  });

  select.onchange = () => showPlayerMatches(select.value);
}

function showPlayerMatches(player) {
  const grid = document.getElementById("player-results");
  grid.innerHTML = "";

  if (!player) return;

  dataCache.fixtures.forEach(f => {
    const res = dataCache.results[f.tie_id];

    f.matches.forEach((pair, idx) => {
      if (!pair.join(" ").includes(player)) return;

      const card = document.createElement("div");
      card.className = "fixture-card";

      let html = `
        <div class="fixture-header">
          ${f.team_a} <span class="vs">vs</span> ${f.team_b}
        </div>
        <div class="fixture-sub">Match M${idx + 1}</div>
      `;

      const matchRes = res && res.matches[idx];
      if (!matchRes || !matchRes.sets) {
        html += `<div class="match pending">⏳ Pending</div>`;
      } else {
        let a = 0, b = 0;
        matchRes.sets.forEach(s => (s[0] > s[1] ? a++ : b++));
        const winner = a > b ? pair[0] : pair[1];
        const score = matchRes.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

        html += `
          <div class="match done">
            ✅ Winner: <span class="winner">${winner}</span>
            <div class="result-score">${score}</div>
          </div>
        `;
      }

      card.innerHTML = html;
      grid.appendChild(card);
    });
  });
}

/* ================= EXPOSE FUNCTIONS ================= */
window.showFixtures = showFixtures;
window.showResults = showResults;
window.renderTeamView = renderTeamView;
window.renderPlayerView = renderPlayerView;


let dataCache = null;

