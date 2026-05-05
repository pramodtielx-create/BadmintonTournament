/*************************************************
 * CONFIG
 *************************************************/

const API_URL =
  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";
console.log("USING NEW API:", API_URL);
/*************************************************
 * COMMON HELPERS
 *************************************************/
async function fetchAPI() {
  const res = await fetch(API_URL, { cache: "no-store" });
  return await res.json();
}

function clearMain() {
  document.getElementById("main-content").innerHTML = "";
}

/*************************************************
 * FIXTURES (ROUND 1 + ROUND 2)
 *************************************************/
async function loadFixtures() {
  const container = document.getElementById("main-content");
  container.innerHTML = "";

  const data = await fetchAPI();
  const fixtures = data.fixtures;
  const results = data.results;

  /* ---------- FILTER BAR ---------- */
  container.insertAdjacentHTML(
    "beforeend",
    `
    <div class="filters">
      <label><input type="checkbox" checked> Round 1</label>
      <label><input type="checkbox" checked> Round 2</label>
      <label><input type="checkbox"> Completed</label>
      <label><input type="checkbox" checked> Pending</label>
    </div>
    `
  );

  /* ---------- SUMMARY ---------- */
  let completedMatches = 0;
  let totalMatches = fixtures.length * 3;

  Object.values(results).forEach(r =>
    r.matches.forEach(m => m.sets && completedMatches++)
  );

  container.insertAdjacentHTML(
    "beforeend",
    `
    <div class="summary">
      📊 <strong>Fixtures Summary:</strong> ${completedMatches} / ${totalMatches} matches completed
    </div>
    `
  );

  /* ---------- GRID ---------- */
  const grid = document.createElement("div");
  grid.className = "fixtures-grid";

  fixtures.forEach(fixture => {
    const res = results[fixture.tie_id];
    const completed = res
      ? res.matches.filter(m => m.sets).length
      : 0;

    const percent = Math.round((completed / 3) * 100);

    const card = document.createElement("div");
    card.className = "fixture-card";

    card.innerHTML = `
      <div class="fixture-header">
        ${fixture.team_a} <span class="vs">vs</span> ${fixture.team_b}
      </div>
      <div class="fixture-sub">${completed} / 3 matches completed</div>

      <div class="progress-bar">
        <div class="progress-fill" style="width:${percent}%"></div>
      </div>

      ${fixture.matches
        .map((m, i) => {
          const done = res && res.matches[i] && res.matches[i].sets;
          return `
            <div class="match">
              <strong>M${i + 1}</strong>
              <span class="${done ? "badge-done" : "badge-pending"}">
                ${done ? "✅" : "⏳"}
              </span>
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
/*************************************************
 * STUBS (so buttons never break)
 *************************************************/
function loadOverview() {
  clearMain();
  document.getElementById("main-content").innerHTML =
    "<h2>Overview coming next</h2>";
}

function loadTeamChart() {
  clearMain();
  document.getElementById("main-content").innerHTML =
    "<h2>Team performance coming next</h2>";
}

function openInsights() {
  window.open("https://mathigangbhl.streamlit.app/", "_blank");
}
