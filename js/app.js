const API_URL =
 type="checkbox" id="pending" checked> Pending</label>  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";
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

  let completed = 0;
  let total = 0;

  fixtures.forEach(f => {
    const r = results[f.tie_id];
    f.matches.forEach((_, i) => {
      total++;
      const m = r && r.matches[i];
      if (m && m.sets) completed++;
    });
  });

  summary.innerHTML = `
    <div class="summary">
      📊 Completed: ${completed} / ${total} matches
    </div>
  `;

  fixtures.forEach(f => {
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

    let visible = 0;

    f.matches.forEach((pair, i) => {
      const m = r && r.matches[i];
      if (!m || !m.sets) return;

      let a = 0, b = 0;
      m.sets.forEach(s => (s[0] > s[1] ? a++ : b++));
      const winner = a > b ? 0 : 1;
      const score = m.sets.map(s => `${s[0]}-${s[1]}`).join(" | ");

      visible++;
      html += `
        <div class="result-row">
          <div>M${i + 1}</div>
          <div class="${winner === 0 ? "winner" : ""}">${pair[0]}</div>
          <div>vs</div>
          <div class="${winner === 1 ? "winner" : ""}">${pair[1]}</div>
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

/* ================= TEAM STANDINGS ================= */
function showStandings() {
  const standings = computeTeamStandings();
  const c = document.getElementById("main-content");

  let html = `
    <h2>🏆 Team Standings</h2>

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
        <div>${t.form}</div>
      </div>
    `;
  });

  c.innerHTML = html + `</div>`;
}

function computeTeamStandings() {
  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};
  const teams = {};

  fixtures.forEach(f => {
    teams[f.team_a] ??= initTeam(f.team_a);
    teams[f.team_b] ??= initTeam(f.team_b);
  });

  fixtures.forEach(f => {
    const r = results[f.tie_id];
    if (!r) return;

    r.matches.forEach((m, i) => {
      if (!m.sets) return;

      let sa = 0, sb = 0, pa = 0, pb = 0;
      m.sets.forEach(s => {
        pa += s[0]; pb += s[1];
        s[0] > s[1] ? sa++ : sb++;
      });

      const A = teams[f.team_a];
      const B = teams[f.team_b];

      A.played++; B.played++;
      A.setsWon += sa; A.setsLost += sb;
      B.setsWon += sb; B.setsLost += sa;
      A.pointsWon += pa; A.pointsLost += pb;
      B.pointsWon += pb; B.pointsLost += pa;

      if (sa > sb) {
        A.wins++; B.losses++; A.leaguePoints += 2;
        A.form.unshift("W"); B.form.unshift("L");
      } else {
        B.wins++; A.losses++; B.leaguePoints += 2;
        B.form.unshift("W"); A.form.unshift("L");
      }
    });
  });

  Object.values(teams).forEach(t => {
    t.setDiff = t.setsWon - t.setsLost;
    t.pointDiff = t.pointsWon - t.pointsLost;
    t.form = t.form.slice(0, 5).join("");
  });

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

/* ================= EXPORT ================= */
window.showFixtures = showFixtures;
window.showStandings = showStandings;

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
