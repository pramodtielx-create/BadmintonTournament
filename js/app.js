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

  ["r1","r2","completed","pending"].forEach(id =>
    document.getElementById(id).addEventListener("change", renderFixtures)
  );

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

  let completed = 0;
  const total = fixtures.length * 3;
  Object.values(results).forEach(r =>
    r.matches.forEach(m => m.sets && completed++)
  );

  summary.innerHTML = `
    <div class="summary">
      📊 <strong>Fixtures Summary:</strong> ${completed} / ${total} matches completed
    </div>
  `;

  fixtures.forEach(f => {
    if ((f.round_no === 1 && !showR1) || (f.round_no === 2 && !showR2)) return;

    const res = results[f.tie_id];
    const done = res ? res.matches.filter(m => m.sets).length : 0;
    if ((done === 3 && !showCompleted) || (done < 3 && !showPending)) return;

    const card = document.createElement("div");
    card.className = "fixture-card";

    let html = `
      <div class="fixture-header">
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>
    `;

    f.matches.forEach((pair,i)=>{
      const m = res && res.matches[i];
      if(!m || !m.sets){
        html += `<div class="match pending">M${i+1} ⏳ ${pair[0]} vs ${pair[1]}</div>`;
        return;
      }
      let a=0,b=0;
      m.sets.forEach(s=>s[0]>s[1]?a++:b++);
      const w=a>b?0:1;
      const score=m.sets.map(s=>`${s[0]}-${s[1]}`).join(" | ");
      html += `<div class="match done">M${i+1} 🏆 ${pair[w]}<div class="result-score">${score}</div></div>`;
    });

    card.innerHTML = html;
    grid.appendChild(card);
  });
}

/* ================= RESULTS ================= */
function showResults() {
  const container = document.getElementById("main-content");
  container.innerHTML = `
    <h2>Results</h2>
    <div class="fixtures-grid" id="results-grid"></div>
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
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>

      <div class="result-row header">
        <div>M</div><div></div><div>Winner</div><div></div><div>Opponent</div><div>Score</div>
      </div>
    `;

    f.matches.forEach((pair,i)=>{
      const m = res && res.matches[i];
      if(!m || !m.sets){
        html += `
          <div class="result-row pending">
            <div>M${i+1}</div><div>⏳</div>
            <div>Pending</div><div>vs</div>
            <div>${pair[0]} / ${pair[1]}</div><div>—</div>
          </div>`;
        return;
      }
      let a=0,b=0;
      m.sets.forEach(s=>s[0]>s[1]?a++:b++);
      const w=a>b?0:1;
      const score=m.sets.map(s=>`${s[0]}-${s[1]}`).join(" | ");
      html += `
        <div class="result-row">
          <div>M${i+1}</div><div>🏆</div>
          <div>${pair[w]}</div><div>vs</div>
          <div>${pair[w?0:1]}</div><div>${score}</div>
        </div>`;
    });

    card.innerHTML = html;
    grid.appendChild(card);
  });
}

/* ================= TEAM ================= */
function renderTeamView() {
  const container = document.getElementById("main-content");
  container.innerHTML = `
    <h2>Team Match Tracker</h2>
    <select id="teamSelect"><option value="">Select team</option></select>
    <div class="fixtures-grid" id="team-results"></div>
  `;

  const teams = new Set();
  dataCache.fixtures.forEach(f => { teams.add(f.team_a); teams.add(f.team_b); });
  const sel = document.getElementById("teamSelect");
  [...teams].forEach(t => sel.innerHTML += `<option>${t}</option>`);
  sel.onchange = () => showTeamMatches(sel.value);
}

function showTeamMatches(team){
  const grid = document.getElementById("team-results");
  grid.innerHTML = "";
  dataCache.fixtures.forEach(f => {
    if(f.team_a!==team && f.team_b!==team) return;
    const card = document.createElement("div");
    card.className="fixture-card";
    card.innerHTML = `<div class="fixture-header">${f.team_a} vs ${f.team_b}</div>`;
    grid.appendChild(card);
  });
}

/* ================= PLAYER ================= */
function renderPlayerView(){
  const container=document.getElementById("main-content");
  container.innerHTML=`
    <h2>Player Match Tracker</h2>
    <select id="playerSelect"><option value="">Select player</option></select>
    <div class="fixtures-grid" id="player-results"></div>
  `;

  const players=new Set();
  dataCache.fixtures.forEach(f =>
    f.matches.forEach(p =>
      p.forEach(s => s.split("/").forEach(n => players.add(n.trim())))
    )
  );
  const sel=document.getElementById("playerSelect");
  [...players].forEach(p => sel.innerHTML+=`<option>${p}</option>`);
  sel.onchange=()=>showPlayerMatches(sel.value);
}

function showPlayerMatches(p){
  const grid=document.getElementById("player-results");
  grid.innerHTML="";
  if(!p) return;
  dataCache.fixtures.forEach(f =>
    f.matches.forEach(pair=>{
      if(!pair.join(" ").includes(p)) return;
      const card=document.createElement("div");
      card.className="fixture-card";
      card.innerHTML=`<div class="fixture-header">${pair[0]} vs ${pair[1]}</div>`;
      grid.appendChild(card);
    })
  );
}

/* ================= EXPORT ================= */
window.showFixtures = showFixtures;
window.showResults = showResults;
