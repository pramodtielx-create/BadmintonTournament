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
