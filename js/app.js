const API_URL =
  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";

let dataCache = null;

/* ================= INITIAL LOAD ================= */
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
    <div id="results-grid" class="fixtures-grid"></div>
  `;

  const grid = document.getElementById("results-grid");
  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  fixtures.forEach(f => {
    const res = results[f.tie_id];

    const card = document.createElement("div");
    card.className = "fixture-card";

    let html = `
      <div class="fixture-header">
        <strong>${f.team_a}</strong> <span class="vs">vs</span> <strong>${f.team_b}</strong>
      </div>
    `;

    f.matches.forEach((pair, idx) => {
      const matchRes = res && res.matches[idx];

      // ================= PENDING MATCH =================
      if (!matchRes || !matchRes.sets) {
        html += `
          <div class="match pending">
            <strong>M${idx + 1}</strong> ⏳ Pending
            <div>${pair[0]}</div>
            <div>${pair[1]}</div>
          </div>
        `;
        return;
      }

      // ================= COMPLETED MATCH =================
      let a = 0, b = 0;
      matchRes.sets.forEach(s => (s[0] > s[1] ? a++ : b++));

      const winnerIndex = a > b ? 0 : 1;
      const winnerPair = pair[winnerIndex];
      const loserPair = pair[winnerIndex === 0 ? 1 : 0];

      const scoreLine = matchRes.sets
        .map(s => `${s[0]}-${s[1]}`)
        .join(" | ");

      html += `
        <div class="match done">
          <strong>M${idx + 1}</strong>
          <span class="winner">🏆 ${winnerPair}</span>
          <div class="opponent">vs ${loserPair}</div>
          <div class="result-score">${scoreLine}</div>
        </div>
      `;
    });

    card.innerHTML = html;
    grid.appendChild(card);
  });
}
/* ================= EXPOSE FUNCTIONS ================= */
window.showFixtures = showFixtures;
window.showResults = showResults;
