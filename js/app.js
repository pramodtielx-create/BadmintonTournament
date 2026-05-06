const API_URL =
  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";

let dataCache = null;

/* ================= INITIAL LOAD ================= */
async function init() {
  const res = await fetch(API_URL);
  dataCache = await res.json();
  buildUI();
  renderFixtures();
}

init();

/* ================= BUILD FILTER UI ONCE ================= */
function buildUI() {
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

/* ================= FIXTURES RENDER ================= */
function renderFixtures() {
  const grid = document.getElementById("fixtures-grid");
  const summary = document.getElementById("summary");

  grid.innerHTML = "";

  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  const showR1 = document.getElementById("r1").checked;
  const showR2 = document.getElementById("r2").checked;
  const showCompleted = document.getElementById("completed").checked;
  const showPending = document.getElementById("pending").checked;

  /* ===== SUMMARY ===== */
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

  /* ===== FIXTURE CARDS ===== */
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
      const matchResult = res && res.matches[idx];

      /* ===== PENDING MATCH ===== */
      if (!matchResult || !matchResult.sets) {
        card.innerHTML += `
          <div class="match pending">
            <strong>M${idx + 1}</strong> ⏳
            ${pair[0]} <span class="vs">vs</span> ${pair[1]}
          </div>
        `;
        return;
      }

      /* ===== CALCULATE WINNER ===== */
      let aSets = 0;
      let bSets = 0;

      matchResult.sets.forEach(s => {
        if (s[0] > s[1]) aSets++;
        else bSets++;
      });

      const winnerIndex = aSets > bSets ? 0 : 1;
      const winnerPair = pair[winnerIndex];
      const loserPair = pair[winnerIndex === 0 ? 1 : 0];
      const winnerTeam = winnerIndex === 0 ? f.team_a : f.team_b;

      const scoreLine = matchResult.sets
        .map(s => `${s[0]}-${s[1]}`)
        .join(" | ");

      /* ===== COMPLETED MATCH ===== */
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


/* ==================================showteam ================================*/

function showTeamMatches(team) {
  const grid = document.getElementById("team-results");
  grid.innerHTML = "";

  let totalCompleted = 0;
  let totalPending = 0;

  dataCache.fixtures.forEach(f => {
    if (f.team_a !== team && f.team_b !== team) return;

    const opponentTeam = f.team_a === team ? f.team_b : f.team_a;
    const res = dataCache.results[f.tie_id];

    const card = document.createElement("div");
    card.className = "fixture-card";

    let completedHTML = "";
    let pendingHTML = "";

    f.matches.forEach((pair, idx) => {
      const isTeamA = f.team_a === team;
      const teamPair = isTeamA ? pair[0] : pair[1];
      const opponentPair = isTeamA ? pair[1] : pair[0];

      const matchRes = res && res.matches[idx];

      // ===== PENDING MATCH =====
      if (!matchRes || !matchRes.sets) {
        totalPending++;
        pendingHTML += `
          <div class="match pending">
            <strong>M${idx + 1}</strong> ⏳
            <div><b>${team}:</b> ${teamPair}</div>
            <div><b>${opponentTeam}:</b> ${opponentPair}</div>
          </div>
        `;
        return;
      }

      // ===== COMPLETED MATCH =====
      totalCompleted++;

      let a = 0, b = 0;
      matchRes.sets.forEach(s => (s[0] > s[1] ? a++ : b++));
      const teamWon = (isTeamA && a > b) || (!isTeamA && b > a);

      const scoreLine = matchRes.sets
        .map(s => `${s[0]}-${s[1]}`)
        .join(" | ");

      completedHTML += `
        <div class="match done">
          <strong>M${idx + 1}</strong> ✅
          <div>
            <b>${team}:</b>
            <span class="${teamWon ? "winner" : ""}">${teamPair}</span>
          </div>
          <div>
            <b>${opponentTeam}:</b> ${opponentPair}
          </div>
          <div class="result-score">${scoreLine}</div>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="fixture-header">
        ${team} <span class="vs">vs</span> ${opponentTeam}
      </div>

      ${
        completedHTML
          ? `<h4>✅ Completed Matches</h4>${completedHTML}`
          : ""
      }

      ${
        pendingHTML
          ? `<h4>⏳ Pending Matches</h4>${pendingHTML}`
          : ""
      }
    `;

    grid.appendChild(card);
  });

  // ===== GLOBAL SUMMARY =====
  const summary = document.createElement("div");
  summary.className = "summary";
  summary.innerHTML = `
    🏆 <b>${team}</b> —
    ✅ Completed: ${totalCompleted}
    &nbsp;&nbsp;⏳ Pending: ${totalPending}
  `;

  grid.prepend(summary);
}



#########################################################
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
    f.matches.forEach(pair => {
      pair.forEach(side =>
        side.split("/").forEach(p => playerSet.add(p.trim()))
      );
    })
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

      let content = `
        <div class="fixture-header">
          ${f.team_a} <span class="vs">vs</span> ${f.team_b}
        </div>
        <div class="fixture-sub">Match M${idx + 1}</div>
      `;

      const matchRes = res && res.matches[idx];
      if (!matchRes || !matchRes.sets) {
        content += `
          <div class="match pending">
            ⏳ Pending — ${pair[0]} vs ${pair[1]}
          </div>
        `;
      } else {
        let a = 0, b = 0;
        matchRes.sets.forEach(s => s[0] > s[1] ? a++ : b++);
        const winner = a > b ? pair[0] : pair[1];
        const score = matchRes.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

        content += `
          <div class="match done">
            ✅ ${pair[0]} vs ${pair[1]}
            <div class="winner">Winner: ${winner}</div>
            <div class="result-score">${score}</div>
          </div>
        `;
      }

      card.innerHTML = content;
      grid.appendChild(card);
    });
  });
}
