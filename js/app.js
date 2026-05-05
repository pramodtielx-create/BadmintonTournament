const API_URL =
  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";

/* ========= FILTER STATE ========= */
let filterState = {
  rounds: new Set([1, 2]),
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

  /* ===== FILTER BAR ===== */
  container.innerHTML += `
    <div class="filters">
      <label>
        <input type="checkbox" id="r1" ${filterState.rounds.has(1) ? "checked" : ""}>
        Round 1
      </label>
      <label>
        <input type="checkbox" id="r2" ${filterState.rounds.has(2) ? "checked" : ""}>
        Round 2
      </label>
      <label>
        <input type="checkbox" id="completed" ${filterState.showCompleted ? "checked" : ""}>
        Completed
      </label>
      <label>
        <input type="checkbox" id="pending" ${filterState.showPending ? "checked" : ""}>
        Pending
      </label>
    </div>
  `;

  /* ===== SUMMARY ===== */
  let completedCount = 0;
  const totalCount = fixtures.length * 3;

  Object.values(results).forEach(r =>
    r.matches.forEach(m => m.sets && completedCount++)
  );

  container.innerHTML += `
    <div class="summary">
      📊 <strong>Fixtures Summary:</strong>
      ${completedCount} / ${totalCount} matches completed
    </div>
  `;

  /* ===== GRID ===== */
  const grid = document.createElement("div");
  grid.className = "fixtures-grid";

  fixtures.forEach(fixture => {
    if (!filterState.rounds.has(fixture.round_no)) return;

    const res = results[fixture.tie_id];
    const doneMatches = res ? res.matches.filter(m => m.sets).length : 0;

    const isCompleted = doneMatches === 3;
    const isPending = doneMatches < 3;

    if (
      (isCompleted && !filterState.showCompleted) ||
      (isPending && !filterState.showPending)
    ) {
      return;
    }

    const percent = Math.round((doneMatches / 3) * 100);

    const card = document.createElement("div");
    card.className = "fixture-card";

    card.innerHTML = `
      <div class="fixture-header">
        ${fixture.team_a} <span class="vs">vs</span> ${fixture.team_b}
      </div>
      <div class="fixture-sub">
        ${doneMatches} / 3 matches completed
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width:${percent}%"></div>
      </div>

      ${fixture.matches
        .map((m, i) => {
          const done = res && res.matches[i] && res.matches[i].sets;
          return `
            <div class="match ${done ? "done" : "pending"}">
              <strong>M${i + 1}</strong>
              ${done ? "✅" : "⏳"}
              ${m[0]} <span class="vs">vs</span> ${m[1]}
            </div>
          `;
        })
        .join("")}
    `;

    grid.appendChild(card);
  });

  container.appendChild(grid);

  /* ===== EVENT LISTENERS ===== */
  document.getElementById("r1").onchange = e => {
    e.target.checked ? filterState.rounds.add(1) : filterState.rounds.delete(1);
    loadFixtures();
  };

  document.getElementById("r2").onchange = e => {
    e.target.checked ? filterState.rounds.add(2) : filterState.rounds.delete(2);
    loadFixtures();
  };

  document.getElementById("completed").onchange = e => {
    filterState.showCompleted = e.target.checked;
    loadFixtures();
  };

  document.getElementById("pending").onchange = e => {
    filterState.showPending = e.target.checked;
    loadFixtures();
  };
}

/* Load initially */
loadFixtures();
