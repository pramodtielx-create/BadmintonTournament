let cachedData = null;
const API_URL =
  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";

/* ===== FILTER STATE ===== */
let filterState = {
  rounds: new Set(),
  showCompleted: false,
  showPending: true
};

async function loadFixtures() {
  const container = document.getElementById("main-content");
  container.innerHTML = "";

  const res = await fetch(API_URL);
  const data = await res.json();

  const fixtures = data.fixtures;
  const results = data.results || {};

  /* ===== FILTER UI ===== */
  container.innerHTML += `
    <div class="filters">
      <label><input type="checkbox" id="r1"> Round 1</label>
      <label><input type="checkbox" id="r2"> Round 2</label>
      <label><input type="checkbox" id="completed"> Completed</label>
      <label><input type="checkbox" id="pending" checked> Pending</label>
    </div>
  `;

  /* ===== SYNC FILTER STATE FROM UI ===== */
  filterState.rounds.clear();
  if (document.getElementById("r1").checked) filterState.rounds.add(1);
  if (document.getElementById("r2").checked) filterState.rounds.add(2);
  filterState.showCompleted = document.getElementById("completed").checked;
  filterState.showPending = document.getElementById("pending").checked;

  /* ===== SUMMARY ===== */
  let completed = 0;
  const total = fixtures.length * 3;

  Object.values(results).forEach(r =>
    r.matches.forEach(m => m.sets && completed++)
  );

  container.innerHTML += `
    <div class="summary">
      📊 <strong>Fixtures Summary:</strong> ${completed} / ${total} matches completed
    </div>
  `;

  const grid = document.createElement("div");
  grid.className = "fixtures-grid";

  fixtures.forEach(f => {
    if (!filterState.rounds.has(f.round_no) && filterState.rounds.size !== 0) return;

    const res = results[f.tie_id];
    const doneCount = res ? res.matches.filter(m => m.sets).length : 0;

    const isCompleted = doneCount === 3;
    const isPending = doneCount < 3;

    if ((isCompleted && !filterState.showCompleted) ||
        (isPending && !filterState.showPending)) return;

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
        const done = res && res.matches[i] && res.matches[i].sets;
        return `
          <div class="match ${done ? "done" : "pending"}">
            <strong>M${i + 1}</strong>
            ${done ? "✅" : "⏳"}
            ${m[0]} <span class="vs">vs</span> ${m[1]}
          </div>
        `;
      }).join("")}
    `;

    grid.appendChild(card);
  });

  container.appendChild(grid);

  /* ===== EVENT LISTENERS ===== */
  ["r1", "r2", "completed", "pending"].forEach(id => {
    document.getElementById(id).onchange = loadFixtures;
  });
}

/* ===== INITIAL LOAD ===== */
async function initFixtures() {
  const res = await fetch(API_URL);
  cachedData = await res.json();
  renderFixtures(); // first render
}

initFixtures();

function renderFixtures() {
  const container = document.getElementById("main-content");
  container.innerHTML = "";

  const fixtures = cachedData.fixtures;
  const results = cachedData.results || {};

  // ========= READ FILTER STATE FROM DOM =========
  const showR1 = document.getElementById("r1")?.checked ?? false;
  const showR2 = document.getElementById("r2")?.checked ?? false;
  const showCompleted = document.getElementById("completed")?.checked ?? false;
  const showPending = document.getElementById("pending")?.checked ?? true;

  // ========= FILTER BAR =========
  container.insertAdjacentHTML(
    "beforeend",
    `
    <div class="filters">
      <label><input type="checkbox" id="r1" ${showR1 ? "checked" : ""}> Round 1</label>
      <label><input type="checkbox" id="r2" ${showR2 ? "checked" : ""}> Round 2</label>
      <label><input type="checkbox" id="completed" ${showCompleted ? "checked" : ""}> Completed</label>
      <label><input type="checkbox" id="pending" ${showPending ? "checked" : ""}> Pending</label>
    </div>
    `
  );

  // ========= SUMMARY =========
  let completedCount = 0;
  const totalMatches = fixtures.length * 3;

  Object.values(results).forEach(r =>
    r.matches.forEach(m => m.sets && completedCount++)
  );

  container.insertAdjacentHTML(
    "beforeend",
    `
    <div class="summary">
      📊 <strong>Fixtures Summary:</strong> ${completedCount} / ${totalMatches} matches completed
    </div>
    `
  );

  // ========= GRID =========
  const grid = document.createElement("div");
  grid.className = "fixtures-grid";

  fixtures.forEach(f => {
    // Round filter
    if (
      (f.round_no === 1 && !showR1) ||
      (f.round_no === 2 && !showR2)
    ) return;

    const res = results[f.tie_id];
    const done = res ? res.matches.filter(m => m.sets).length : 0;

    const isCompleted = done === 3;
    const isPending = done < 3;

    if ((isCompleted && !showCompleted) || (isPending && !showPending)) return;

    const pct = Math.round((done / 3) * 100);

    const card = document.createElement("div");
    card.className = "fixture-card";

    card.innerHTML = `
      <div class="fixture-header">
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>
      <div class="fixture-sub">${done} / 3 matches completed</div>

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

  container.appendChild(grid);

  // ========= CHECKBOX EVENTS (NO FETCH) =========
  ["r1","r2","completed","pending"].forEach(id => {
    document.getElementById(id).onchange = renderFixtures;
  });
}
