const API_URL =
  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";

async function loadFixtures() {
  const container = document.getElementById("main-content");
  container.innerHTML = "";

  const res = await fetch(API_URL);
  const data = await res.json();

  const fixtures = data.fixtures;
  const results = data.results || {};

  /* ===== FILTERS ===== */
  container.innerHTML += `
    <div class="filters">
      <label><input type="checkbox" checked> Round 1</label>
      <label><input type="checkbox" checked> Round 2</label>
      <label><input type="checkbox"> Completed</label>
      <label><input type="checkbox" checked> Pending</label>
    </div>
  `;

  /* ===== SUMMARY ===== */
  let completed = 0;
  const total = fixtures.length * 3;

  Object.values(results).forEach(r =>
    r.matches.forEach(m => m.sets && completed++)
  );

  container.innerHTML += `
    <div class="summary">
      📊 <strong>Fixtures Summary:</strong>
      ${completed} / ${total} matches completed
    </div>
  `;

  /* ===== GRID ===== */
  const grid = document.createElement("div");
  grid.className = "fixtures-grid";

  fixtures.forEach(f => {
    const res = results[f.tie_id];
    const doneCount = res ? res.matches.filter(m => m.sets).length : 0;
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

      ${f.matches
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
}

/* load by default */
loadFixtures();
