const API_URL =
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

  ["r1","r2","completed","pending"].forEach(id => {
    document.getElementById(id).onchange = renderFixtures;
  });

  renderFixtures();
}

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

  // ===== GLOBAL SUMMARY =====
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
    let visible = 0;

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
        visible++;
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

      visible++;
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

    if (visible > 0) {
      card.innerHTML = html;
      grid.appendChild(card);
    }
  });
}

/* ================= RESULTS ================= */
function showResults() {
  showFixtures(); // ✅ same UI + logic as Fixtures
}

/* ================= TEAM ================= */
function renderTeamView() {
  showFixtures(); // ✅ same unified behavior
}

/* ================= PLAYER ================= */
function renderPlayerView() {
  showFixtures(); // ✅ same unified behavior
}

/* ================= EXPORT ================= */
window.showFixtures = showFixtures;
window.showResults = showResults;
window.renderTeamView = renderTeamView;
window.renderPlayerView = renderPlayerView;
