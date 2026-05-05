const API_URL =
  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";

let dataCache = null;

/* ================= INITIAL LOAD ================= */
async function init() {
  const res = await fetch(API_URL);
  dataCache = await res.json();
  buildStaticUI();
  renderFixtures();
}

init();

/* ================= BUILD FILTER BAR ONCE ================= */
function buildStaticUI() {
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

/* ================= PURE RENDER (NO FETCH, NO RESET) ================= */
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

    const pct = Math.round((doneCount / 3) * 100);

    const card = document.createElement("div");
    card.className = "fixture-card";

    card.innerHTML = `
      <div class="fixture-header">
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>
      <div class="fixture-sub">${doneCount} / 3 matches completed</div>

      <div class="progress-bar">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>

      ${f.matches.map((m, i) => {
        const finished = res && res.matches[i] && res.matches[i].sets;
        return `
          <div class="match ${finished ? "done" : "pending"}">
            <strong>M${i + 1}</strong>
            ${finished ? "✅" : "⏳"}
            ${m[0]} <span class="vs">vs</span> ${m[1]}
          </div>
        `;
      }).join("")}
    `;

    grid.appendChild(card);
  });
}
/*===========================Rendur result ==============================*/
function renderResults() {
  const container = document.getElementById("main-content");

  // ✅ Preserve SPA behavior
  container.innerHTML = `
    <div class="filters">
      <label><input type="checkbox" id="r1" checked> Round 1</label>
      <label><input type="checkbox" id="r2" checked> Round 2</label>
      <label><input type="checkbox" id="completed" checked> Completed</label>
      <label><input type="checkbox" id="pending" checked> Pending</label>
    </div>

    <h2>Results</h2>
    <div id="results-grid" class="fixtures-grid"></div>
  `;

  ["r1", "r2", "completed", "pending"].forEach(id => {
    document.getElementById(id).addEventListener("change", renderResults);
  });

  const grid = document.getElementById("results-grid");

  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  const showR1 = document.getElementById("r1").checked;
  const showR2 = document.getElementById("r2").checked;
  const showCompleted = document.getElementById("completed").checked;
  const showPending = document.getElementById("pending").checked;

  fixtures.forEach(f => {
    if ((f.round_no === 1 && !showR1) || (f.round_no === 2 && !showR2)) return;

    const res = results[f.tie_id];
    if (!res) return;

    const doneCount = res.matches.filter(m => m.sets).length;

    if ((doneCount === 3 && !showCompleted) || (doneCount < 3 && !showPending)) return;

    const card = document.createElement("div");
    card.className = "fixture-card";

    card.innerHTML = `
      <div class="fixture-header">
        Round ${f.round_no} · ${f.team_a} <span class="vs">vs</span> ${f.team_b}
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

      let aSets = 0;
      let bSets = 0;

      m.sets.forEach(s => {
        if (s[0] > s[1]) aSets++;
        else bSets++;
      });

      const winner =
        aSets > bSets ? f.matches[idx][0] : f.matches[idx][1];

      const scoreLine = m.sets.map(s => `${s[0]}–${s[1]}`).join(" | ");

      card.innerHTML += `
        <div class="match done">
          <strong>M${idx + 1}</strong> ✅
          <span class="winner">${winner}</span>
          <div class="result-score">${scoreLine}</div>
        </div>
      `;
    });

    grid.appendChild(card);
  });
}
