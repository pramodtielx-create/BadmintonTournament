const API_URL ="https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";
let dataCache = null

/* INIT */
async function init() {
  const res = await fetch(API_URL);
  dataCache = await res.json();
  showFixtures();
}
init();

/*===============================renderfixtures()=====================================*/
/*function renderFixtures() {
  const grid = document.getElementById("fixtures-grid");
  const summary = document.getElementById("summary");
  grid.innerHTML = "";

  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  const showR1 = document.getElementById("r1").checked;
  const showR2 = document.getElementById("r2").checked;
  const showCompleted = document.getElementById("completed").checked;
  const showPending = document.getElementById("pending").checked;

  let completedTotal = 0;
  fixtures.forEach(f => {
    const r = results[f.tie_id];
    if (r) r.matches.forEach(m => m.sets && completedTotal++);
  });

  summary.innerHTML = `
    <div class="summary">
      📊 <strong>Fixtures Summary:</strong>
      ${completedTotal} / ${fixtures.length * 3} matches completed
    </div>
  `;

  fixtures.forEach(f => {
    if ((f.round_no === 1 && !showR1) || (f.round_no === 2 && !showR2)) return;

    const r = results[f.tie_id];

    // ✅ COUNT MATCH STATES
    let pendingCount = 0;
    let completedCount = 0;

    f.matches.forEach((_, i) => {
      const m = r && r.matches[i];
      if (!m || !m.sets) pendingCount++;
      else completedCount++;
    });

    // ✅ FIXTURE‑LEVEL FILTER (THIS IS THE KEY)
    if (showPending && !showCompleted && completedCount > 0) return;
    if (showCompleted && !showPending && pendingCount > 0) return;

    const card = document.createElement("div");
    card.className = "fixture-card";

    let html = `
      <div class="fixture-header">
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>
    `;

    f.matches.forEach((pair, i) => {
      const m = r && r.matches[i];

      // ✅ PENDING MATCH
      if (!m || !m.sets) {
        if (!showPending) return;

        html += `
          <div class="match pending">
            M${i + 1} ⏳
            <div>${pair[0]}</div>
            <div>vs ${pair[1]}</div>
          </div>
        `;
        return;
      }

      // ✅ COMPLETED MATCH
      if (!showCompleted) return;

      let a = 0, b = 0;
      m.sets.forEach(s => (s[0] > s[1] ? a++ : b++));
      const w = a > b ? 0 : 1;
      const score = m.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

      html += `
        <div class="match done">
          M${i + 1} 🏆
          <div>${pair[w]}</div>
          <div>vs ${pair[w ? 0 : 1]}</div>
          <div class="result-score">${score}</div>
        </div>
      `;
    });

    card.innerHTML = html;
    grid.appendChild(card);
  });
}*/



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

  /* ================= GLOBAL SUMMARY (ENTIRE TOURNAMENT) ================= */
  let totalCompleted = 0;
  let totalPending = 0;

  fixtures.forEach(f => {
    const r = results[f.tie_id];
    f.matches.forEach((_, i) => {
      const m = r && r.matches[i];
      if (!m || !m.sets) totalPending++;
      else totalCompleted++;
    });
  });

  /* ================= FIXTURES ================= */
  fixtures.forEach(f => {
    // Round filter
    if ((f.round_no === 1 && !showR1) || (f.round_no === 2 && !showR2)) return;

    const r = results[f.tie_id];

    const card = document.createElement("div");
    card.className = "fixture-card";

    let html = `
      <div class="fixture-header">
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>

      <div class="result-row header">
        <div>M</div>
        <div>${f.team_a}</div>
        <div>VS</div>
        <div>${f.team_b}</div>
        <div>Score</div>
      </div>
    `;

    let visibleMatchCount = 0;

    f.matches.forEach((pair, i) => {
      const m = r && r.matches[i];

      /* ================= PENDING MATCH ================= */
      if (!m || !m.sets) {
        if (!showPending) return;

        visibleMatchCount++;

        html += `
          <div class="result-row pending">
            <div>M${i + 1}</div>
            <div>${pair[0]}</div>
            <div>vs</div>
            <div>${pair[1]}</div>
            <div>—</div>
          </div>
        `;
        return;
      }

      /* ================= COMPLETED MATCH ================= */
      if (!showCompleted) return;

      let a = 0, b = 0;
      m.sets.forEach(s => (s[0] > s[1] ? a++ : b++));

      const winnerSide = a > b ? 0 : 1;
      const score = m.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

      visibleMatchCount++;

      html += `
        <div class="result-row">
          <div>M${i + 1}</div>
          <div>${winnerSide === 0 ? "🏆 " : ""}${pair[0]}</div>
          <div>vs</div>
          <div>${winnerSide === 1 ? "🏆 " : ""}${pair[1]}</div>
          <div>${score}</div>
        </div>
      `;
    });

    // ✅ Show tie ONLY if at least one match is visible
    if (visibleMatchCount > 0) {
      card.innerHTML = html;
      grid.appendChild(card);
    }
  });

  /* ================= SUMMARY RENDER ================= */
  let summaryText = "";

  if (showPending && !showCompleted) {
    summaryText = `⏳ Pending: ${totalPending} matches`;
  } else if (showCompleted && !showPending) {
    summaryText = `✅ Completed: ${totalCompleted} matches`;
  } else {
    summaryText = `📊 Completed: ${totalCompleted} / ${totalCompleted + totalPending} matches`;
  }

  summary.innerHTML = `
    <div class="summary">
      ${summaryText}
    </div>
  `;
}

/**************************showresult*********************/
function showResults() {
  const c = document.getElementById("main-content");

  c.innerHTML = `
    <div class="filters">
      <label><input type="checkbox" id="res-r1" checked> Round 1</label>
      <label><input type="checkbox" id="res-r2" checked> Round 2</label>
      <label><input type="checkbox" id="res-completed" checked> Completed</label>
      <label><input type="checkbox" id="res-pending" checked> Pending</label>
    </div>

    <h2>Results</h2>
    <div id="results-grid" class="fixtures-grid"></div>
  `;

  ["res-r1", "res-r2", "res-completed", "res-pending"].forEach(id => {
    document.getElementById(id).onchange = renderResults;
  });

  renderResults();
}
/* =================render RESULTS ================= */

function renderResults() {
  const grid = document.getElementById("results-grid");
  grid.innerHTML = "";

  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  const showR1 = document.getElementById("res-r1").checked;
  const showR2 = document.getElementById("res-r2").checked;
  const showCompleted = document.getElementById("res-completed").checked;
  const showPending = document.getElementById("res-pending").checked;

  /* ================= GLOBAL SUMMARY (ENTIRE TOURNAMENT) ================= */
  let totalCompleted = 0;
  let totalPending = 0;

  fixtures.forEach(f => {
    const r = results[f.tie_id];
    f.matches.forEach((_, i) => {
      const m = r && r.matches[i];
      if (!m || !m.sets) totalPending++;
      else totalCompleted++;
    });
  });

  /* ================= RESULTS GRID ================= */
  fixtures.forEach(f => {
    // Round filter
    if ((f.round_no === 1 && !showR1) || (f.round_no === 2 && !showR2)) return;

    const r = results[f.tie_id];
    const card = document.createElement("div");
    card.className = "fixture-card";

    let html = `
      <div class="fixture-header">
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>

      <div class="result-row header">
        <div>M</div>
        <div>${f.team_a}</div>
        <div>VS</div>
        <div>${f.team_b}</div>
        <div>Score</div>
      </div>
    `;

    let visibleMatchCount = 0;

    f.matches.forEach((pair, i) => {
      const m = r && r.matches[i];

      /* ================= PENDING ================= */
      if (!m || !m.sets) {
        if (!showPending) return;

        visibleMatchCount++;

        html += `
          <div class="result-row pending">
            <div>M${i + 1}</div>
            <div>${pair[0]}</div>
            <div>vs</div>
            <div>${pair[1]}</div>
            <div>—</div>
          </div>
        `;
        return;
      }

      /* ================= COMPLETED ================= */
      if (!showCompleted) return;

      let a = 0, b = 0;
      m.sets.forEach(s => (s[0] > s[1] ? a++ : b++));

      const winnerSide = a > b ? 0 : 1;
      const score = m.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

      visibleMatchCount++;

      html += `
        <div class="result-row">
          <div>M${i + 1}</div>
          <div>${winnerSide === 0 ? "🏆 " : ""}${pair[0]}</div>
          <div>vs</div>
          <div>${winnerSide === 1 ? "🏆 " : ""}${pair[1]}</div>
          <div>${score}</div>
        </div>
      `;
    });

    // ✅ Show tie only if at least one row is visible
    if (visibleMatchCount > 0) {
      card.innerHTML = html;
      grid.appendChild(card);
    }
  });

  /* ================= SUMMARY ================= */
  const summary = document.getElementById("summary");
  let summaryText = "";

  if (showPending && !showCompleted) {
    summaryText = `⏳ Pending: ${totalPending} matches`;
  } else if (showCompleted && !showPending) {
    summaryText = `✅ Completed: ${totalCompleted} matches`;
  } else {
    summaryText = `📊 Completed: ${totalCompleted} / ${totalCompleted + totalPending} matches`;
  }

  summary.innerHTML = `
    <div class="summary">
      ${summaryText}
    </div>
  `;
}


/* ================= TEAM ================= */



function showTeamMatches(team) {
  const g = document.getElementById("team-grid");
  g.innerHTML = "";
  if (!team) return;

  const showR1 = document.getElementById("t-r1").checked;
  const showR2 = document.getElementById("t-r2").checked;
  const showCompleted = document.getElementById("t-completed").checked;
  const showPending = document.getElementById("t-pending").checked;

  dataCache.fixtures.forEach(f => {
    if (f.team_a !== team && f.team_b !== team) return;
    if ((f.round_no === 1 && !showR1) || (f.round_no === 2 && !showR2)) return;

    const r = dataCache.results[f.tie_id];
    const card = document.createElement("div");
    card.className = "fixture-card";

    let html = `<div class="fixture-header">${f.team_a} vs ${f.team_b}</div>`;

    f.matches.forEach((p,i) => {
      const m = r && r.matches[i];

      if (!m || !m.sets) {
        if (!showPending) return;
        html += `
          <div class="match pending">
            M${i+1} ⏳
            <div>${p[0]}</div>
            <div>vs ${p[1]}</div>
          </div>
        `;
        return;
      }

      if (!showCompleted) return;

      let a=0,b=0;
      m.sets.forEach(s => s[0] > s[1] ? a++ : b++);
      const w = a > b ? 0 : 1;
      const score = m.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

      html += `
        <div class="match done">
          M${i+1} 🏆
          <div>${p[w]}</div>
          <div>vs ${p[w ? 0 : 1]}</div>
          <div class="result-score">${score}</div>
        </div>
      `;
    });

    card.innerHTML = html;
    g.appendChild(card);
  });
}

/* ================= PLAYER ================= */
function renderPlayerView() {
  const c = document.getElementById("main-content");

  c.innerHTML = `
    <div class="filters">
      <label><input type="checkbox" id="p-r1" checked> Round 1</label>
      <label><input type="checkbox" id="p-r2" checked> Round 2</label>
      <label><input type="checkbox" id="p-completed" checked> Completed</label>
      <label><input type="checkbox" id="p-pending" checked> Pending</label>
    </div>

    <h2>Player Match Tracker</h2>

    <select id="playerSelect"></select>

    <div id="summary"></div>
    <div id="player-grid" class="fixtures-grid"></div>
  `;

  const playerSelect = document.getElementById("playerSelect");
  [...new Set(
    dataCache.fixtures.flatMap(f =>
      f.matches.flatMap(p => p.join(" / ").split(" / "))
    )
  )].forEach(p => playerSelect.innerHTML += `<option>${p}</option>`);

  playerSelect.onchange = renderPlayerMatches;

  ["p-r1","p-r2","p-completed","p-pending"].forEach(id => {
    document.getElementById(id).onchange = renderPlayerMatches;
  });

  renderPlayerMatches();
}
function renderPlayerMatches() {
  const player = document.getElementById("playerSelect").value;
  const grid = document.getElementById("player-grid");
  const summary = document.getElementById("summary");

  grid.innerHTML = "";
  if (!player) return;

  const showR1 = document.getElementById("p-r1").checked;
  const showR2 = document.getElementById("p-r2").checked;
  const showCompleted = document.getElementById("p-completed").checked;
  const showPending = document.getElementById("p-pending").checked;

  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  let totalCompleted = 0;
  let totalPending = 0;

  fixtures.forEach(f => {
    const r = results[f.tie_id];
    f.matches.forEach((pair, i) => {
      if (!pair.join(" ").includes(player)) return;
      const m = r && r.matches[i];
      if (!m || !m.sets) totalPending++;
      else totalCompleted++;
    });
  });

  summary.innerHTML = `
    <div class="summary">
      ${showPending && !showCompleted
        ? `⏳ Pending: ${totalPending} matches`
        : showCompleted && !showPending
        ? `✅ Completed: ${totalCompleted} matches`
        : `📊 Completed: ${totalCompleted} / ${totalCompleted + totalPending} matches`}
    </div>
  `;

  fixtures.forEach(f => {
    if ((f.round_no === 1 && !showR1) || (f.round_no === 2 && !showR2)) return;

    const r = results[f.tie_id];
    let visibleCount = 0;

    const card = document.createElement("div");
    card.className = "fixture-card";

    let html = `
      <div class="fixture-header">
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>

      <div class="result-row header">
        <div>M</div>
        <div>${f.team_a}</div>
        <div>VS</div>
        <div>${f.team_b}</div>
        <div>Score</div>
      </div>
    `;

    f.matches.forEach((pair, i) => {
      if (!pair.join(" ").includes(player)) return;
      const m = r && r.matches[i];

      if (!m || !m.sets) {
        if (!showPending) return;
        visibleCount++;
        html += `
          <div class="result-row pending">
            <div>M${i + 1}</div>
            <div>${pair[0]}</div>
            <div>vs</div>
            <div>${pair[1]}</div>
            <div>—</div>
          </div>
        `;
        return;
      }

      if (!showCompleted) return;

      let a = 0, b = 0;
      m.sets.forEach(s => (s[0] > s[1] ? a++ : b++));
      const winnerSide = a > b ? 0 : 1;
      const score = m.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

      visibleCount++;
      html += `
        <div class="result-row">
          <div>M${i + 1}</div>
          <div>${winnerSide === 0 ? "🏆 " : ""}${pair[0]}</div>
          <div>vs</div>
          <div>${winnerSide === 1 ? "🏆 " : ""}${pair[1]}</div>
          <div>${score}</div>
        </div>
      `;
    });

    if (visibleCount > 0) {
      card.innerHTML = html;
      grid.appendChild(card);
    }
  });
}
function showPlayerMatches(player) {
  const g = document.getElementById("player-grid");
  g.innerHTML = "";
  if (!player) return;

  const showR1 = document.getElementById("p-r1").checked;
  const showR2 = document.getElementById("p-r2").checked;
  const showCompleted = document.getElementById("p-completed").checked;
  const showPending = document.getElementById("p-pending").checked;

  dataCache.fixtures.forEach(f => {
    if ((f.round_no === 1 && !showR1) || (f.round_no === 2 && !showR2)) return;

    const r = dataCache.results[f.tie_id];

    f.matches.forEach((p,i) => {
      if (!p.join(" ").includes(player)) return;

      const m = r && r.matches[i];
      const card = document.createElement("div");
      card.className = "fixture-card";

      let html = `<div class="fixture-header">${f.team_a} vs ${f.team_b}</div>`;

      if (!m || !m.sets) {
        if (!showPending) return;
        html += `
          <div class="match pending">
            M${i+1} ⏳
            <div>${p[0]}</div>
            <div>vs ${p[1]}</div>
          </div>
        `;
      } else {
        if (!showCompleted) return;
        let a=0,b=0;
        m.sets.forEach(s => s[0] > s[1] ? a++ : b++);
        const w = a > b ? 0 : 1;
        const score = m.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

        html += `
          <div class="match done">
            M${i+1} 🏆
            <div>${p[w]}</div>
            <div>vs ${p[w ? 0 : 1]}</div>
            <div class="result-score">${score}</div>
          </div>
        `;
      }

      card.innerHTML = html;
      g.appendChild(card);
    });
  });
}



/* EXPORT */
window.showFixtures = showFixtures;
window.showResults = showResults;
window.renderTeamView = renderTeamView;
window.renderPlayerView = renderPlayerView;
window.showStandings = showStandings;
window.showPlayerStandings = showPlayerStand;



/* ================= INIT ================= */
async function init() {
  const res = await fetch(API_URL);
  dataCache = await res.json();
  showFixtures();
}
init();

/* ================= FIXTURES ================= */
function showFixtures() {
  const c = document.getElementById("main-content");

  c.innerHTML = `
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
    document.getElementById(id).onchange = renderFixtures;
  });

  renderFixtures();
}
/*==================================renderfixes===============================*/
function renderTeamView() {
  const c = document.getElementById("main-content");

  c.innerHTML = `
    <div class="filters">
      <label><input type="checkbox" id="t-r1" checked> Round 1</label>
      <label><input type="checkbox" id="t-r2" checked> Round 2</label>
      <label><input type="checkbox" id="t-completed" checked> Completed</label>
      <label><input type="checkbox" id="t-pending" checked> Pending</label>
    </div>

    <h2>Team Match Tracker</h2>

    <select id="teamSelect"></select>

    <div id="summary"></div>
    <div id="team-grid" class="fixtures-grid"></div>
  `;

  const teamSelect = document.getElementById("teamSelect");
  [...new Set(dataCache.fixtures.flatMap(f => [f.team_a, f.team_b]))]
    .forEach(t => teamSelect.innerHTML += `<option>${t}</option>`);

  teamSelect.onchange = renderTeamMatches;

  ["t-r1","t-r2","t-completed","t-pending"].forEach(id => {
    document.getElementById(id).onchange = renderTeamMatches;
  });

  renderTeamMatches();
}

function renderTeamMatches() {
  const team = document.getElementById("teamSelect").value;
  const grid = document.getElementById("team-grid");
  const summary = document.getElementById("summary");

  grid.innerHTML = "";
  if (!team) return;

  const showR1 = document.getElementById("t-r1").checked;
  const showR2 = document.getElementById("t-r2").checked;
  const showCompleted = document.getElementById("t-completed").checked;
  const showPending = document.getElementById("t-pending").checked;

  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  // ===== GLOBAL SUMMARY =====
  let totalCompleted = 0;
  let totalPending = 0;

  fixtures.forEach(f => {
    if (f.team_a !== team && f.team_b !== team) return;
    const r = results[f.tie_id];
    f.matches.forEach((_, i) => {
      const m = r && r.matches[i];
      if (!m || !m.sets) totalPending++;
      else totalCompleted++;
    });
  });

  summary.innerHTML = `
    <div class="summary">
      ${showPending && !showCompleted
        ? `⏳ Pending: ${totalPending} matches`
        : showCompleted && !showPending
        ? `✅ Completed: ${totalCompleted} matches`
        : `📊 Completed: ${totalCompleted} / ${totalCompleted + totalPending} matches`}
    </div>
  `;

  // ===== GRID =====
  fixtures.forEach(f => {
    if (f.team_a !== team && f.team_b !== team) return;
    if ((f.round_no === 1 && !showR1) || (f.round_no === 2 && !showR2)) return;

    const r = results[f.tie_id];
    let visibleCount = 0;

    const card = document.createElement("div");
    card.className = "fixture-card";

    let html = `
      <div class="fixture-header">
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>

      <div class="result-row header">
        <div>M</div>
        <div>${f.team_a}</div>
        <div>VS</div>
        <div>${f.team_b}</div>
        <div>Score</div>
      </div>
    `;

    f.matches.forEach((pair, i) => {
      const m = r && r.matches[i];

      // Pending
      if (!m || !m.sets) {
        if (!showPending) return;
        visibleCount++;
        html += `
          <div class="result-row pending">
            <div>M${i + 1}</div>
            <div>${pair[0]}</div>
            <div>vs</div>
            <div>${pair[1]}</div>
            <div>—</div>
          </div>
        `;
        return;
      }

      // Completed
      if (!showCompleted) return;

      let a = 0, b = 0;
      m.sets.forEach(s => (s[0] > s[1] ? a++ : b++));
      const winnerSide = a > b ? 0 : 1;
      const score = m.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

      visibleCount++;
      html += `
        <div class="result-row">
          <div>M${i + 1}</div>
          <div class="${winnerSide === 0 ? "winner" : ""}">${pair[0]}</div>
          <div>vs</div>
          <div class="${winnerSide === 1 ? "winner" : ""}">${pair[1]}</div>
          <div>${score}</div>
        </div>
      `;
    });

    if (visibleCount > 0) {
      card.innerHTML = html;
      grid.appendChild(card);
    }
  });
}



function computeTeamStandings() {
  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  const teams = {};

  // Initialize teams
  fixtures.forEach(f => {
    if (!teams[f.team_a]) teams[f.team_a] = initTeam(f.team_a);
    if (!teams[f.team_b]) teams[f.team_b] = initTeam(f.team_b);
  });

  // Process matches
  fixtures.forEach(f => {
    const res = results[f.tie_id];
    if (!res) return;

    res.matches.forEach((m, idx) => {
      if (!m.sets) return; // pending match

      const pairA = f.matches[idx][0];
      const pairB = f.matches[idx][1];

      let setsA = 0, setsB = 0;
      let pointsA = 0, pointsB = 0;

      m.sets.forEach(s => {
        pointsA += s[0];
        pointsB += s[1];
        if (s[0] > s[1]) setsA++;
        else setsB++;
      });

      const teamA = teams[f.team_a];
      const teamB = teams[f.team_b];

      teamA.played++;
      teamB.played++;

      teamA.setsWon += setsA;
      teamA.setsLost += setsB;
      teamB.setsWon += setsB;
      teamB.setsLost += setsA;

      teamA.pointsWon += pointsA;
      teamA.pointsLost += pointsB;
      teamB.pointsWon += pointsB;
      teamB.pointsLost += pointsA;

      if (setsA > setsB) {
        teamA.wins++;
        teamB.losses++;
        teamA.leaguePoints += 2;
        teamA.form.unshift("W");
        teamB.form.unshift("L");
      } else {
        teamB.wins++;
        teamA.losses++;
        teamB.leaguePoints += 2;
        teamB.form.unshift("W");
        teamA.form.unshift("L");
      }
    });
  });

  // Final calculations
  Object.values(teams).forEach(t => {
    t.setDiff = t.setsWon - t.setsLost;
    t.pointDiff = t.pointsWon - t.pointsLost;
    t.form = t.form.slice(0, 5).join("");
  });

  // Sort standings
  return Object.values(teams).sort((a, b) =>
    b.leaguePoints - a.leaguePoints ||
    b.setDiff - a.setDiff ||
    b.pointDiff - a.pointDiff ||
    b.wins - a.wins ||
    a.name.localeCompare(b.name)
  );
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
    form: []
  };
}

function renderForm(formString) {
  // formString is like "WLWWL"
  return formString
    .split("")
    .map(ch => {
      if (ch === "W") return `<span class="form-W">W</span>`;
      if (ch === "L") return `<span class="form-L">L</span>`;
      return ch;
    })
    .join("");
}

function showStandings(round = null) {
  const standings = computeTeamStandings(round);
  const c = document.getElementById("main-content");

  let html = `
    <h2>🏆 Team Standings</h2>

    <div class="filters">
      <button onclick="showStandings(null)">Overall</button>
      <button onclick="showStandings(1)">Round 1</button>
      <button onclick="showStandings(2)">Round 2</button>
      <button onclick="exportStandingsExcel()">Export Excel</button>
    </div>

    <div class="fixture-card">
      <div class="standings-grid standings-header">
        <div>Team</div>
        <div>R</div>
        <div>P</div>
        <div>W</div>
        <div>L</div>
        <div>SW</div>
        <div>SL</div>
        <div>PW</div>
        <div>PL</div>
        <div>SD</div>
        <div>PD</div>
        <div>Pts</div>
        <div>Form</div>
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

function showStandings() {
  const standings = computeTeamStandings();
  const c = document.getElementById("main-content");

  let html = `
    <h2>🏆 Team Standings</h2>
    <div class="fixture-card">
      <div class="result-row header">
        <div>Team</div>
        <div>R</div>
        <div>P</div>
        <div>W</div>
        <div>L</div>
        <div>SW</div>
        <div>SL</div>
        <div>PW</div>
        <div>PL</div>
        <div>SD</div>
        <div>PD</div>
        <div>Pts</div>
        <div>Form</div>
      </div>
  `;

  standings.forEach((t, i) => {
    html += `
      <div class="result-row">
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
        <div>${t.form}</div>
      </div>
    `;
  });

  html += `</div>`;
  c.innerHTML = html;
}


function computePlayerStandings() {
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
      form: []
    };
  }

  fixtures.forEach(f => {
    const res = results[f.tie_id];
    if (!res) return;

    f.matches.forEach((pair, i) => {
      const m = res.matches[i];
      if (!m || !m.sets) return;

      const [pA, pB] = pair;

      players[pA] ??= initPlayer(pA, f.team_a);
      players[pB] ??= initPlayer(pB, f.team_b);

      let setsA = 0, setsB = 0;
      let ptsA = 0, ptsB = 0;

      m.sets.forEach(s => {
        ptsA += s[0];
        ptsB += s[1];
        s[0] > s[1] ? setsA++ : setsB++;
      });

      const A = players[pA];
      const B = players[pB];

      A.played++; B.played++;
      A.setsWon += setsA; A.setsLost += setsB;
      B.setsWon += setsB; B.setsLost += setsA;
      A.pointsWon += ptsA; A.pointsLost += ptsB;
      B.pointsWon += ptsB; B.pointsLost += ptsA;

      if (setsA > setsB) {
        A.wins++; B.losses++;
        A.form.unshift("W");
        B.form.unshift("L");
      } else {
        B.wins++; A.losses++;
        B.form.unshift("W");
        A.form.unshift("L");
      }
    });
  });

  Object.values(players).forEach(p => {
    p.setDiff = p.setsWon - p.setsLost;
    p.pointDiff = p.pointsWon - p.pointsLost;
    p.winPct = p.played ? Math.round((p.wins / p.played) * 100) : 0;
    p.form = p.form.slice(0, 5).join("");
  });

  return Object.values(players).sort((a, b) =>
    b.wins - a.wins ||
    b.setDiff - a.setDiff ||
    b.pointDiff - a.pointDiff ||
    a.played - b.played ||
    a.name.localeCompare(b.name)
  );
}

function showPlayerStandings(showAll = false) {
  const players = computePlayerStandings();
  const list = showAll ? players : players.slice(0, 10);

  const c = document.getElementById("main-content");

  let html = `
    <h2>👤 Player Standings</h2>
    <p style="opacity:.7">Ranked by Wins → Set Diff → Point Diff → Played</p>

    <label style="margin-bottom:12px;display:inline-block">
      <input type="checkbox" ${showAll ? "checked" : ""}
        onchange="showPlayerStandings(this.checked)">
      Show All Players
    </label>

    <div class="fixture-card">
      <div class="standings-grid standings-header">
        <div>R</div>
        <div>Player</div>
        <div>Team</div>
        <div>P</div>
        <div>W</div>
        <div>L</div>
        <div>Win%</div>
        <div>SW</div>
        <div>SL</div>
        <div>SD</div>
        <div>PW</div>
        <div>PL</div>
        <div>PD</div>
        <div>Form</div>
      </div>
  `;

  list.forEach((p, i) => {
    html += `
      <div class="standings-grid standings-row">
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
        <div>${renderForm(p.form)}</div>
      </div>
    `;
  });

  c.innerHTML = html + `</div>`;
}
function computeIndividualPlayerStandings() {
  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  const stats = {};

  // Helper to init player
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
      form: []
    };
  }

  // Assign teams to players (same as Python teams_data loop)
  fixtures.forEach(f => {
    f.matches.forEach(pair => {
      pair[0].split("/").forEach(p => {
        const name = p.trim();
        stats[name] ??= initPlayer(name, f.team_a);
      });
      pair[1].split("/").forEach(p => {
        const name = p.trim();
        stats[name] ??= initPlayer(name, f.team_b);
      });
    });
  });

  // Process results
  Object.entries(results).forEach(([tieId, r]) => {
    const fixture = fixtures.find(f => f.tie_id === tieId);
    if (!fixture) return;

    r.matches.forEach((m, idx) => {
      if (!m || !m.sets) return;

      const [pairA, pairB] = fixture.matches[idx];
      const teamAPlayers = pairA.split("/").map(p => p.trim());
      const teamBPlayers = pairB.split("/").map(p => p.trim());

      let aSets = 0, bSets = 0, aPts = 0, bPts = 0;

      m.sets.forEach(([a, b]) => {
        aPts += a;
        bPts += b;
        a > b ? aSets++ : bSets++;
      });

      // Team A players
      teamAPlayers.forEach(p => {
        const s = stats[p];
        s.played++;
        s.setsWon += aSets;
        s.setsLost += bSets;
        s.pointsWon += aPts;
        s.pointsLost += bPts;
        if (aSets > bSets) {
          s.wins++;
          s.form.push("W");
        } else {
          s.losses++;
          s.form.push("L");
        }
      });

      // Team B players
      teamBPlayers.forEach(p => {
        const s = stats[p];
        s.played++;
        s.setsWon += bSets;
        s.setsLost += aSets;
        s.pointsWon += bPts;
        s.pointsLost += aPts;
        if (bSets > aSets) {
          s.wins++;
          s.form.push("W");
        } else {
          s.losses++;
          s.form.push("L");
        }
      });
    });
  });

  // Final calculations
  Object.values(stats).forEach(p => {
    p.setDiff = p.setsWon - p.setsLost;
    p.pointDiff = p.pointsWon - p.pointsLost;
    p.winPct = p.played > 0 ? Math.round((p.wins / p.played) * 100) : 0;
    p.recentForm = p.form.slice(-5).join(" ");
    delete p.form;
  });

  // Sort exactly like Streamlit
  return Object.values(stats).sort((a, b) =>
    b.wins - a.wins ||
    b.setDiff - a.setDiff ||
    b.pointDiff - a.pointDiff ||
    a.played - b.played ||
    a.name.localeCompare(b.name)
  );
}
function showPlayerStandings(showAll = false) {
  const players = computeIndividualPlayerStandings();
  const list = showAll ? players : players.slice(0, 10);
  const c = document.getElementById("main-content");

  let html = `
    <h2>👤 Player Standings</h2>
    <p style="opacity:.7">Ranked based on Wins → Set Diff → Point Diff → Played</p>

    <label style="display:inline-flex;gap:6px;margin-bottom:12px">
      <input type="checkbox" ${showAll ? "checked" : ""}
        onchange="showPlayerStandings(this.checked)">
      Show All Players
    </label>

    <div class="fixture-card">
      <div class="standings-grid standings-header">
        <div>R</div>
        <div>Player</div>
        <div>Team</div>
        <div>P</div>
        <div>W</div>
        <div>L</div>
        <div>Win%</div>
        <div>SW</div>
        <div>SL</div>
        <div>SD</div>
        <div>PW</div>
        <div>PL</div>
        <div>PD</div>
        <div>Recent Form</div>
      </div>
  `;

  list.forEach((p, i) => {
    html += `
      <div class="standings-grid standings-row">
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

  c.innerHTML = html + `</div>`;
}
