const API_URL =
  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";
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
  /*const grid = return; */
  const grid = document.getElementById("fixtures-grid");

    const r = results[f.tie_id];

    // ===== COUNT STATES =====
    let pendingCount = 0;
    let completedCount = 0;

    f.matches.forEach((_, i) => {
      const m = r && r.matches[i];
      if (!m || !m.sets) pendingCount++;
      else completedCount++;
    });

    // ===== STRICT FIXTURE FILTER (KEY PART) =====
    if (showPending && !showCompleted && completedCount > 0) return;
    if (showCompleted && !showPending && pendingCount > 0) return;

    const card = document.createElement("div");
    card.className = "fixture-card";

    let html = `
      <div class="fixture-header">
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>

      <div class="result-row header">
        <div>M</div>
        <div></div>
        <div>Winner</div>
        <div></div>
        <div>Opponent</div>
        <div>Score</div>
      </div>
    `;

    f.matches.forEach((pair, i) => {
      const m = r && r.matches[i];

      // ===== PENDING =====
      if (!m || !m.sets) {
        if (!showPending) return;

        html += `
          <div class="result-row pending">
            <div>M${i + 1}</div>
            <div>⏳</div>
            <div>Pending</div>
            <div>vs</div>
            <div>${pair[0]} / ${pair[1]}</div>
            <div>—</div>
          </div>
        `;
        return;
      }

      // ===== COMPLETED =====
      if (!showCompleted) return;

      let a = 0, b = 0;
      m.sets.forEach(s => (s[0] > s[1] ? a++ : b++));
      const w = a > b ? 0 : 1;
      const score = m.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

      html += `
        <div class="result-row">
          <div>M${i + 1}</div>
          <div>🏆</div>
          <div>${pair[w]}</div>
          <div>vs</div>
          <div>${pair[w ? 0 : 1]}</div>
          <div>${score}</div>
        </div>
      `;
    });

    card.innerHTML = html;
    grid.appendChild(card);
  });
}
  const summary = document.getElementById("summary");
  grid.innerHTML = "";

  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  const showR1 = document.getElementById("r1").checked;
  const showR2 = document.getElementById("r2").checked;
  const showCompleted = document.getElementById("completed").checked;
  const showPending = document.getElementById("pending").checked;

  // ===== SUMMARY =====
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
    // Round filter


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

  fixtures.forEach(f => {
    // ✅ Round filter
    if ((f.round_no === 1 && !showR1) || (f.round_no === 2 && !showR2)) return;

    const r = results[f.tie_id];

    // ✅ Count match states for strict filtering
    let pendingCount = 0;
    let completedCount = 0;

    f.matches.forEach((_, i) => {
      const m = r && r.matches[i];
      if (!m || !m.sets) pendingCount++;
      else completedCount++;
    });

    // ✅ Strict fixture-level filter (same as Fixtures)
    if (showPending && !showCompleted && completedCount > 0) return;
    if (showCompleted && !showPending && pendingCount > 0) return;

    const card = document.createElement("div");
    card.className = "fixture-card";

    let html = `
      <div class="fixture-header">
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>

      <div class="result-row header">
        <div>M</div>
        <div></div>
        <div>${f.team_a}</div>
        <div></div>
        <div>${f.team_b}</div>
        <div>Score</div>
      </div>
    `;

    f.matches.forEach((pair, i) => {
      const m = r && r.matches[i];

      // ================= PENDING =================
      if (!m || !m.sets) {
        if (!showPending) return;

        html += `
          <div class="result-row pending">
            <div>M${i + 1}</div>
            <div>⏳</div>
            <div>${pair[0]}</div>
            <div>vs</div>
            <div>${pair[1]}</div>
            <div>—</div>
          </div>
        `;
        return;
      }

      // ================= COMPLETED =================
      if (!showCompleted) return;

      let a = 0, b = 0;
      m.sets.forEach(s => (s[0] > s[1] ? a++ : b++));

      // ✅ 0 = left team wins, 1 = right team wins
      const winnerSide = a > b ? 0 : 1;
      const score = m.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

      html += `
        <div class="result-row">
          <div>M${i + 1}</div>

          <div>${winnerSide === 0 ? "🏆" : ""}</div>
          <div>${pair[0]}</div>

          <div>vs</div>

          <div>${pair[1]}</div>
          <div>${winnerSide === 1 ? "🏆" : ""}</div>

          <div>${score}</div>
        </div>
      `;
    });

    card.innerHTML = html;
    grid.appendChild(card);
  });
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

    <select id="playerSelect">
      <option value="">Select player</option>
    </select>

    <div class="fixtures-grid" id="player-grid"></div>
  `;

  const sel = document.getElementById("playerSelect");
  [...new Set(dataCache.fixtures.flatMap(f =>
    f.matches.flatMap(p => p.join(" / ").split(" / "))
  ))].forEach(p => sel.innerHTML += `<option>${p}</option>`);

  sel.onchange = () => showPlayerMatches(sel.value);

  ["p-r1","p-r2","p-completed","p-pending"].forEach(id =>
    document.getElementById(id).onchange = () => showPlayerMatches(sel.value)
  );
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

    <select id="teamSelect">
      <option value="">Select team</option>
    </select>

    <div class="fixtures-grid" id="team-grid"></div>
  `;

  const sel = document.getElementById("teamSelect");
  [...new Set(dataCache.fixtures.flatMap(f => [f.team_a, f.team_b]))]
    .forEach(t => sel.innerHTML += `<option>${t}</option>`);

  sel.onchange = () => showTeamMatches(sel.value);

  ["t-r1","t-r2","t-completed","t-pending"].forEach(id =>
    document.getElementById(id).onchange = () => showTeamMatches(sel.value)
  );
}
