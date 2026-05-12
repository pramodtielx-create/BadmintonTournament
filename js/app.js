const API_URL ="https://script.google.com/macros/s/AKfycbzXJYSI5VwLndm8tzCwBqDGPjYNiWrMGdNH0eg9KNzCkCwFVG-l4yToSHTCQhYGe0qUmg/exec";
let lastPlayerProfileSource = "standings"; // default
let previousTeamRanks = {};
let teamSortKey = "leaguePoints";
let teamSortAsc = false;
const PLAYER_PHOTOS = {
  // ✅ Quantum Force
  "Rajendra": "assets/players/Rajendra.png",
  "Deepak L": "assets/players/deepak-l.png",
  "Aniket": "assets/players/Aniket.png",
  "Rahul": "assets/players/Rahul.png",
  "Manmohan": "assets/players/Manmohan.png",
  "Prashant": "assets/players/Prashant.png",

  // ✅ Racket Scientists
  "Kiran": "assets/players/Kiran.png",
  "Piyush": "assets/players/Peeyush.png",
  "Pradyum": "assets/players/Pradyum.png",
  "Kaustubh": "assets/players/Kaustubh.png",
  "Amol S": "assets/players/Amol-S.png",
  "Amol P": "assets/players/Amol-P.png",

  // ✅ Net Ninjas
  "Jaswanth": "assets/players/default.png",
  "Sandeepk": "assets/players/Sandeep-K.png",
  "Ritesh": "assets/players/Ritesh.png",
  "Vikram": "assets/players/Vikram.png",
  "Pramod": "assets/players/pramod.png",
  "Deepak T": "assets/players/Deepak-T.png",

  // ✅ Smash Titans
  "Omkar": "assets/players/Omkar.png",
  "Nishit": "assets/players/Nishit.png",
  "Sandeep W": "assets/players/sandeep-w.png",
  "Ganesh": "assets/players/Ganesh.png",
  "Jayant": "assets/players/Jayant.png",
  "Amit": "assets/players/Amit.png"
};


const TEAM_SQUADS_ORDERED = {
  "Quantum Force": [
    "Rajendra",
    "Deepak L",
    "Aniket",
    "Rahul",
    "Manmohan",
    "Prashant"
  ],

  "Racket Scientists": [
    "Kiran",
    "Piyush",
    "Pradyum",
    "Kaustubh",
    "Amol S",
    "Amol P"
  ],

  "Net Ninjas": [
    "Jaswanth",
    "Sandeepk",
    "Ritesh",
    "Vikram",
    "Pramod",
    "Deepak T"
  ],

  "Smash Titans": [
    "Omkar",
    "Nishit",
    "Sandeep W",
    "Ganesh",
    "Jayant",
    "Amit"
  ]
};
const DEFAULT_PLAYER_PHOTO = "assets/players/default.png";

/*************************************************
 * NAME NORMALIZER ✅ ADD HERE
 *************************************************/
function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

/*************************************************
 * INIT
 *************************************************/


let dataCache = null




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



/* ================= EXPORT ================= */

window.showFixtures = showFixtures;
window.showResults = showResults;
window.renderTeamView = renderTeamView;
window.renderPlayerView = renderPlayerView;
window.showStandings = showStandings;
window.showPlayerStandings = showPlayerStandings;
window.showPlayerProfile = showPlayerProfile;
window.showTeamStandings = showTeamStandings;



/* ================= INIT ================= */
/* INIT */
async function init() {
  const res = await fetch(API_URL);
  dataCache = await res.json();

  // ✅ DEFAULT VIEW
  showTeamSquads();
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

/*function (round = null) {
  const standings = computeTeamStandings(round);
  const c = document.getElementById("main-content");

  let html = `
    <h2>🏆 Team Standings</h2>

    <div class="filters">
      <button onclick="(null)">Overall</button>
      <button onclick="(1)">Round 1</button>
      <button onclick="(2)">Round 2</button>
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
*/
function showStandings() {
  if (!dataCache || !dataCache.fixtures) {
    alert("Data not loaded yet");
    return;
  }

  const TEAM_STANDINGS = computeTeamStandings();
  const container = document.getElementById("main-content");

  let html = `
    <h2>🏆 Team Standings</h2>

    <div class="standings-wrapper">
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

  TEAM_STANDINGS.forEach((t, i) => {
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

  html += `</div>`;
  container.innerHTML = html;
}
/*
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


*//*
function showPlayerStandings(showAll = false) {
  const players = computeIndividualPlayerStandings();
  const list = showAll ? players : players.slice(0, 10);
  const c = document.getElementById("main-content");

  
  let html = `
    <h2>👤 Player Standings</h2>
    <p style="opacity:.7">Ranked by Wins → Set Diff → Point Diff → Played</p>

    <label style="margin-bottom:12px;display:inline-flex;gap:6px">
     
     Top 10 Players
    </label>

    <div class="fixture-card standings-wrapper">
      <div class="standings-grid standings-header">
        <div>Player</div>
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
        <div>Win%</div>
        <div>Form</div>
      </div>
  `;

  list.forEach((p, i) => {
    html += `

        <div class="standings-grid standings-row rank-${i + 1}">
        <div>${p.name}</div>
        <div>${i + 1}</div>
        <div>${p.played}</div>
        <div>${p.wins}</div>
        <div>${p.losses}</div>
        <div>${p.setsWon}</div>
        <div>${p.setsLost}</div>
        <div>${p.pointsWon}</div>
        <div>${p.pointsLost}</div>
        <div>${p.setDiff}</div>
        <div>${p.pointDiff}</div>
        <div>${p.winPct}</div>
        <div>${renderForm(computeRecentFormForPlayer(p.name))}</div>
      </div>
    `;
  });*/

 /* c.innerHTML = html + `</div>`;*/
  /*c.innerHTML = `<div class="player-standings">${html}</div>`;*/
/*}*/

/*=======================================*/
/*
function computeIndividualPlayerStandings() {
  
if (!dataCache || !dataCache.fixtures) {
    console.warn("Data not loaded yet – player standings skipped");
    return [];
  }

  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};
  const stats = {};

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
      winPct: 0
    };
  }

  // ✅ Register all players
  fixtures.forEach(f => {
    f.matches.forEach(pair => {
      pair[0].split("/").forEach(p =>
        stats[p.trim()] ??= initPlayer(p.trim(), f.team_a)
      );
      pair[1].split("/").forEach(p =>
        stats[p.trim()] ??= initPlayer(p.trim(), f.team_b)
      );
    });
  });

  // ✅ Process each MATCH once
  Object.entries(results).forEach(([tieId, r]) => {
    const fixture = fixtures.find(f => String(f.tie_id) === String(tieId));
    if (!fixture) return;

    r.matches.forEach((m, idx) => {
      if (!m || !m.sets) return;

      const [pairA, pairB] = fixture.matches[idx];
      const teamA = pairA.split("/").map(p => p.trim());
      const teamB = pairB.split("/").map(p => p.trim());

      let setsA = 0, setsB = 0;
      let ptsA = 0, ptsB = 0;

      m.sets.forEach(([a, b]) => {
        ptsA += a;
        ptsB += b;
        a > b ? setsA++ : setsB++;
      });

      const teamAWon = setsA > setsB;

      teamA.forEach(p => {
        const s = stats[p];
        s.played++;
        s.setsWon += setsA;
        s.setsLost += setsB;
        s.pointsWon += ptsA;
        s.pointsLost += ptsB;
        teamAWon ? s.wins++ : s.losses++;
      });

      teamB.forEach(p => {
        const s = stats[p];
        s.played++;
        s.setsWon += setsB;
        s.setsLost += setsA;
        s.pointsWon += ptsB;
        s.pointsLost += ptsA;
        teamAWon ? s.losses++ : s.wins++;
      });
    });
  });

  // ✅ Final calculations
  Object.values(stats).forEach(p => {
    p.setDiff = p.setsWon - p.setsLost;
    p.pointDiff = p.pointsWon - p.pointsLost;
    p.winPct = p.played ? Math.round((p.wins / p.played) * 100) : 0;
  });

  return Object.values(stats).sort((a, b) =>
    b.wins - a.wins ||
    b.setDiff - a.setDiff ||
    b.pointDiff - a.pointDiff ||
    a.played - b.played ||
    a.name.localeCompare(b.name)
  );
}*/

function computeIndividualPlayerStandings() {
  if (!dataCache || !dataCache.fixtures) return [];

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
      winPct: 0
    };
  }

  fixtures.forEach(f => {
    const res = results[f.tie_id];
    if (!res) return;

    f.matches.forEach((pair, idx) => {
      const m = res.matches[idx];
      if (!m || !m.sets) return;

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

      const teamAWon = setsA > setsB;

      teamAPlayers.forEach(p => {
        const pl = players[p];
        pl.played++;
        pl.setsWon += setsA;
        pl.setsLost += setsB;
        pl.pointsWon += ptsA;
        pl.pointsLost += ptsB;
        teamAWon ? pl.wins++ : pl.losses++;
      });

      teamBPlayers.forEach(p => {
        const pl = players[p];
        pl.played++;
        pl.setsWon += setsB;
        pl.setsLost += setsA;
        pl.pointsWon += ptsB;
        pl.pointsLost += ptsA;
        teamAWon ? pl.losses++ : pl.wins++;
      });
    });
  });

  Object.values(players).forEach(p => {
    p.setDiff = p.setsWon - p.setsLost;
    p.pointDiff = p.pointsWon - p.pointsLost;
    p.winPct = p.played ? Math.round((p.wins / p.played) * 100) : 0;
  });

  // ✅ SORTING LOGIC (IMPORTANT)
  return Object.values(players).sort((a, b) =>
    b.wins - a.wins ||
    b.setDiff - a.setDiff ||
    b.pointDiff - a.pointDiff ||
    a.played - b.played ||
    a.name.localeCompare(b.name)
  );
}

/****************===================================*/
/*
function showPlayerStandings(showAll = false) {
  const players = computeIndividualPlayerStandings();
  const list = showAll ? players : players.slice(0, 10);
  const c = document.getElementById("main-content");

  let html = `
    <h2>👤 Player Standings</h2>
    <p style="opacity:.7">
      Sorted by Wins → Set Diff → Point Diff → Played
    </p>

    <div class="fixture-card standings-wrapper">
      <div class="standings-grid standings-header">
        <div>Player</div>
        <div>Team</div>
        <div>R</div>
        <div>P</div>
        <div>W</div>
        <div>L</div>
        <div>SD</div>
        <div>PD</div>
        <div>Win%</div>
        <div>Form</div>
      </div>
  `;

  list.forEach((p, i) => {
    html += `
      <div class="standings-grid standings-row rank-${i + 1}">
        <div
          class="player-name-link"
          onclick="
            lastPlayerProfileSource='standings';
            showPlayerProfile('${p.name.replace(/'/g, "\\'")}')
          "
        >
          ${p.name}
        </div>

        <div>${p.team}</div>
        <div>${i + 1}</div>
        <div>${p.played}</div>
        <div>${p.wins}</div>
        <div>${p.losses}</div>
        <div>${p.setDiff}</div>
        <div>${p.pointDiff}</div>
        <div>${p.winPct}</div>
        <div>${renderForm(computeRecentFormForPlayer(p.name))}</div>
      </div>
    `;
  });

  c.innerHTML = html + `</div>`;
}
*/
/*******************new******************************/
/*************************************************
 * PLAYER PROFILE PAGE
 *************************************************/
/*function showPlayerProfile(playerName) {
  const c = document.getElementById("main-content");

  const players = computeIndividualPlayerStandings();
  const player = players.find(p => p.name === playerName);

  if (!player) {
    c.innerHTML = `<h2>Player not found</h2>`;
    return;
  }

  // Player match history
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
        opponent:
          pair[0].includes(playerName) ? pair[1] : pair[0],
        teamA: f.team_a,
        teamB: f.team_b,
        score
      });
    });
  });

  c.innerHTML = `
    <h2>👤 ${player.name}</h2>
    <p style="opacity:.7">Team: <strong>${player.team}</strong></p>

    <div class="summary">
      Rank: ${players.indexOf(player) + 1} |
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
          : matchHistory
              .map(
                m => `
          <div class="result-row">
            <div>vs</div>
            <div>${m.opponent}</div>
            <div></div>
            <div>${m.teamA} vs ${m.teamB}</div>
            <div>${m.score}</div>
          </div>
        `
              )
              .join("")
      }
    </div>

    <button style="margin-top:16px" onclick="showPlayerStandings()">⬅ Back to Player Standings</button>
  `;
}*/

/*************************************************
 * PLAYER PROFILE PAGE (FINAL FIXED)
 *************************************************/
/*************************************************
 * PLAYER PROFILE PAGE (PHOTO FIXED & ENHANCED)
 *************************************************/
/*************************************************
 * PLAYER PROFILE (ENHANCED + IMAGE ✅)
 *************************************************/
// ================= TEAM COLORS =================
const TEAM_COLORS = {
  "Quantum Force": "#2563eb",
  "Racket Scientists": "#3b82f6",
  "Net Ninjas": "#16a34a",
  "Smash Titans": "#f97316"
};
function showPlayerProfile(playerName) {

   if (!dataCache || !dataCache.fixtures) {
    alert("Data is still loading. Please try again.");
    return;
  }

  const players = computeIndividualPlayerStandings();
 const player = players.find(
  p => normalizeName(p.name) === normalizeName(playerName)
);


  if (!player) {
    alert("Player not found");
    return;
  }
  const c = document.getElementById("main-content");
  
 

  // ✅ 2. Now safely use player
  const teamColor =
    (typeof TEAM_COLORS !== "undefined" && TEAM_COLORS[player.team])
      ? TEAM_COLORS[player.team]
      : "#2563eb";

 
 /* const teamColor = TEAM_COLORS[player.team] || "#2563eb";*/
  


  if (!player) {
    c.innerHTML = "<h2>Player not found</h2>";
    return;
  }

  const rank = players.indexOf(player) + 1;
  const photo =
    PLAYER_PHOTOS[normalizeName(player.name)] || DEFAULT_PLAYER_PHOTO;

  const matchHistory = [];

  dataCache.fixtures.forEach(f => {
    const r = dataCache.results?.[f.tie_id];
    if (!r) return;

    f.matches.forEach((pair, i) => {
      if (!pair.join(" ").includes(playerName)) return;
      const m = r.matches[i];
      if (!m || !m.sets) return;

      matchHistory.push({
        opponent: pair[0].includes(playerName) ? pair[1] : pair[0],
        match: `${f.team_a} vs ${f.team_b}`,
        score: m.sets.map(s => `${s[0]}-${s[1]}`).join(" | ")
      });
    });
  });

  c.innerHTML = `
    <div class="player-profile">

    <div class="player-profile-header" style="border-left:5px solid ${teamColor}">

        <img src="${photo}" class="player-photo"
             onerror="this.src='${DEFAULT_PLAYER_PHOTO}'">

        <div class="player-info">
          <h2>${player.name}</h2>
         <p>
  <span class="team-dot" style="background:${teamColor}"></span>
  ${player.team}
</p>
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
        Sets: ${player.setsWon}-${player.setsLost} |
        Points: ${player.pointsWon}-${player.pointsLost}
      </div>

      <div class="summary">
        Recent Form: ${renderForm(computeRecentFormForPlayer(player.name))}
      </div>

      <h3>Match History</h3>

      <div class="fixture-card">
        ${
          matchHistory.length === 0
            ? "<p>No completed matches</p>"
            : matchHistory.map(m => `
                <div class="result-row">
                  <div>vs</div>
                  <div>${m.opponent}</div>
                  <div></div>
                  <div>${m.match}</div>
                  <div>${m.score}</div>
                </div>
              `).join("")
        }
      </div>

      <button class="back-btn" onclick="showPlayerStandings()">
        ← Back to Player Standings
      </button>

    </div>
  `;
}


/* ================= TEAM SQUADS ================= */
/*************************************************
 * TEAM SQUADS VIEW
 *************************************************/
/*function showTeamSquads() {
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
*/
function showTeamSquads() {
  const c = document.getElementById("main-content");
  const teams = buildTeamSquads();

  let html = `
    <h2>🎽 Team Squads</h2>
    <div class="squads-grid">
  `;

  Object.entries(teams).forEach(([team, players]) => {
    html += `
      <div class="team-card">
        <div class="team-header">${team}</div>
        <ul class="player-list">
    `;

    players.forEach(p => {
      const photo =
        PLAYER_PHOTOS[normalizeName(p)] || DEFAULT_PLAYER_PHOTO;

      html += `
        <li class="player-item"
            onclick="
              lastPlayerProfileSource='squads';
              showPlayerProfile('${p.replace(/'/g, "\\'")}')
            ">
          <img
            src="${photo}"
            class="squad-player-photo"
            onerror="this.src='${DEFAULT_PLAYER_PHOTO}'"
          >
          <span class="player-name">${p}</span>
        </li>
      `;
    });

    html += `
        </ul>
      </div>
    `;
  });

  html += `</div>`;
  c.innerHTML = html;
}

/*************************************************
 * BUILD TEAM → PLAYERS MAP
 *************************************************/
function buildTeamSquads() {
  const teams = {};

  // ✅ Use fixed order instead of auto‑sorting
  Object.keys(TEAM_SQUADS_ORDERED).forEach(team => {
    teams[team] = [...TEAM_SQUADS_ORDERED[team]];
  });

  return teams;
}
/****************player stabding *****************/
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
        <div>${renderForm(computeRecentFormForPlayer(p.name))}</div>
      </div>
    `;
  });

  c.innerHTML = `<div class="player-standings">${html}</div>`;
}


/*************************************************
 * TEAM & PLAYER TRACKERS (PLACEHOLDERS)
 *************************************************/

/*************************************************
 * COMPUTATION HELPERS
 *************************************************
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
*/
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



function computeRecentFormForPlayer(playerName, limit = 5) {
  const form = [];

  dataCache.fixtures.forEach(f => {
    const r = dataCache.results?.[f.tie_id];
    if (!r) return;

    f.matches.forEach((pair, idx) => {
      if (!pair.join(" ").includes(playerName)) return;

      const m = r.matches[idx];
      if (!m || !m.sets) return;

      let a = 0, b = 0;
      m.sets.forEach(([x, y]) => (x > y ? a++ : b++));

      const isInA = pair[0].includes(playerName);
      const won = isInA ? a > b : b > a;

      form.push(won ? "W" : "L");
    });
  });

  return form.slice(-limit).join("");
}
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}
function sortTeamStandings(key) {
  if (teamSortKey === key) {
    teamSortAsc = !teamSortAsc;
  } else {
    teamSortKey = key;
    teamSortAsc = false;
  }
  showTeamStandings();
}
/*****====================showteamstanding===================================*/
function showTeamStandings() {
  if (!dataCache || !dataCache.fixtures) {
    alert("Data not loaded yet");
    return;
  }

  let teams = computeTeamStandings();

  // ✅ Store initial ranks
  if (Object.keys(previousTeamRanks).length === 0) {
    teams.forEach((t, i) => {
      previousTeamRanks[t.name] = i + 1;
    });
  }

  // ✅ Sorting
  teams.sort((a, b) => {
    const A = a[teamSortKey];
    const B = b[teamSortKey];
    return teamSortAsc ? A - B : B - A;
  });

  const c = document.getElementById("main-content");

  let html = `
    <h2>🏆 Team Standings</h2>

    <div class="team-standings">
      <div class="standings-grid standings-header">
        <div>Team</div>
        <div>R</div>
        <div onclick="sortTeamStandings('played')">P ⬍</div>
        <div onclick="sortTeamStandings('wins')">W ⬍</div>
        <div onclick="sortTeamStandings('losses')">L ⬍</div>
        <div onclick="sortTeamStandings('setsWon')">SW ⬍</div>
        <div onclick="sortTeamStandings('setsLost')">SL ⬍</div>
        <div onclick="sortTeamStandings('pointsWon')">PW ⬍</div>
        <div onclick="sortTeamStandings('pointsLost')">PL ⬍</div>
        <div onclick="sortTeamStandings('setDiff')">SD ⬍</div>
        <div onclick="sortTeamStandings('pointDiff')">PD ⬍</div>
        <div onclick="sortTeamStandings('leaguePoints')">Pts ⬍</div>
        <div>Form</div>
      </div>
  `;

  teams.forEach((t, i) => {
    const currRank = i + 1;
    const prevRank = previousTeamRanks[t.name];

    let arrow = "";
    if (prevRank && currRank < prevRank) arrow = ` <span class="rank-up">↑</span>`;
    if (prevRank && currRank > prevRank) arrow = ` <span class="rank-down">↓</span>`;

    html += `
      <div class="standings-grid standings-row ${i < 2 ? "qualifier" : ""}">
        <div class="team-name">
          <span style="
            width:10px;
            height:10px;
            border-radius:50%;
            background:${TEAM_COLORS[t.name] || "#64748b"};
            display:inline-block;
          "></span>
          ${t.name}
        </div>

        <div>${currRank}${arrow}</div>
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

  html += `</div>`;
  c.innerHTML = html;
}
