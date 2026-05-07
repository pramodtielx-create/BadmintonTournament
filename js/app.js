const API_URL =
  "https://scriptElementById(id).onchange = renderFixtures  "https://script.google.com/macros/s/AKfycbwqdLGb2vz7ZiMbdBtJLOqQG0ou-zud5TFWIatJCotA8MULgst_1iXQ1f3M8FXF9TFm4w/exec";
  );
  renderFixtures();
}

function renderFixtures() {
  const grid = document.getElementById("fixtures-grid");
  const summary = document.getElementById("summary");
  grid.innerHTML = "";

  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  let completed = 0;
  fixtures.forEach(f => {
    const r = results[f.tie_id];
    if (r) r.matches.forEach(m => m.sets && completed++);
  });

  summary.innerHTML = `
    <div class="summary">
      📊 <b>Fixtures Summary:</b> ${completed} / ${fixtures.length * 3}
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
    `;

    f.matches.forEach((pair,i)=>{
      const m = r && r.matches[i];
      if(!m || !m.sets){
        html += `<div class="match pending">M${i+1} ⏳ ${pair[0]} vs ${pair[1]}</div>`;
        return;
      }
      let a=0,b=0;
      m.sets.forEach(s=>s[0]>s[1]?a++:b++);
      const w=a>b?0:1;
      html += `
        <div class="match done">
          M${i+1} 🏆 ${pair[w]} vs ${pair[w?0:1]}
          <div class="result-score">${m.sets.map(s=>`${s[0]}-${s[1]}`).join(" | ")}</div>
        </div>
      `;
    });

    card.innerHTML = html;
    grid.appendChild(card);
  });
}

/* ================= RESULTS ================= */
function showResults() {
  const c = document.getElementById("main-content");
  c.innerHTML = `
    <div class="filters">
      <label><input type="checkbox" id="rr1" checked> Round 1</label>
      <label><input type="checkbox" id="rr2" checked> Round 2</label>
      <label><input type="checkbox" id="rc" checked> Completed</label>
      <label><input type="checkbox" id="rp" checked> Pending</label>
    </div>
    <div class="fixtures-grid" id="results-grid"></div>
  `;
  ["rr1","rr2","rc","rp"].forEach(id =>
    document.getElementById(id).onchange = showResults
  );

  const grid = document.getElementById("results-grid");
  const fixtures = dataCache.fixtures;
  const results = dataCache.results || {};

  fixtures.forEach(f=>{
    const r = results[f.tie_id];
    const card = document.createElement("div");
    card.className="fixture-card";

    let html = `
      <div class="fixture-header">
        ${f.team_a} <span class="vs">vs</span> ${f.team_b}
      </div>
      <div class="result-row header">
        <div>M</div><div></div><div>Winner</div><div></div><div>Opponent</div><div>Score</div>
      </div>
    `;

    f.matches.forEach((pair,i)=>{
      const m = r && r.matches[i];
      if(!m || !m.sets){
        html += `
          <div class="result-row pending">
            <div>M${i+1}</div><div>⏳</div>
            <div>Pending</div><div>vs</div>
            <div>${pair[0]} / ${pair[1]}</div><div>—</div>
          </div>
        `;
        return;
      }
      let a=0,b=0;
      m.sets.forEach(s=>s[0]>s[1]?a++:b++);
      const w=a>b?0:1;
      html += `
        <div class="result-row">
          <div>M${i+1}</div><div>🏆</div>
          <div>${pair[w]}</div><div>vs</div>
          <div>${pair[w?0:1]}</div>
          <div>${m.sets.map(s=>`${s[0]}-${s[1]}`).join(" | ")}</div>
        </div>
      `;
    });

    card.innerHTML = html;
    grid.appendChild(card);
  });
}

/* ================= TEAM ================= */
function renderTeamView() {
  const c=document.getElementById("main-content");
  c.innerHTML=`<h2>Team Match Tracker</h2><select id="teamSel"></select><div class="fixtures-grid" id="teamGrid"></div>`;
  const sel=document.getElementById("teamSel");
  [...new Set(dataCache.fixtures.flatMap(f=>[f.team_a,f.team_b]))].forEach(t=>sel.innerHTML+=`<option>${t}</option>`);
  sel.onchange=()=>showTeamMatches(sel.value);
}

function showTeamMatches(team){
  const g=document.getElementById("teamGrid"); g.innerHTML="";
  dataCache.fixtures.forEach(f=>{
    if(f.team_a!==team && f.team_b!==team) return;
    const r=dataCache.results[f.tie_id];
    const c=document.createElement("div");
    c.className="fixture-card";
    let h=`<div class="fixture-header">${f.team_a} vs ${f.team_b}</div>`;
    f.matches.forEach((p,i)=>{
      const m=r && r.matches[i];
      if(!m||!m.sets) h+=`<div class="match pending">M${i+1} ⏳ ${p[0]} vs ${p[1]}</div>`;
      else {
        let a=0,b=0;
        m.sets.forEach(s=>s[0]>s[1]?a++:b++);
        h+=`<div class="match done">M${i+1} 🏆 ${p[a>b?0:1]} vs ${p[a>b?1:0]}<div class="result-score">${m.sets.map(s=>`${s[0]}-${s[1]}`).join(" | ")}</div></div>`;
      }
    });
    c.innerHTML=h; g.appendChild(c);
  });
}

/* ================= PLAYER ================= */
function renderPlayerView(){
  const c=document.getElementById("main-content");
  c.innerHTML=`<h2>Player Match Tracker</h2><select id="pSel"></select><div class="fixtures-grid" id="pGrid"></div>`;
  const sel=document.getElementById("pSel");
  [...new Set(dataCache.fixtures.flatMap(f=>f.matches.flatMap(p=>p.join(" / ").split(" / "))))].forEach(p=>sel.innerHTML+=`<option>${p}</option>`);
  sel.onchange=()=>showPlayerMatches(sel.value);
}

function showPlayerMatches(player){
  const g=document.getElementById("pGrid"); g.innerHTML="";
  dataCache.fixtures.forEach(f=>{
    const r=dataCache.results[f.tie_id];
    f.matches.forEach((p,i)=>{
      if(!p.join(" ").includes(player)) return;
      const c=document.createElement("div");
      c.className="fixture-card";
      let h=`<div class="fixture-header">${f.team_a} vs ${f.team_b}</div>`;
      const m=r && r.matches[i];
      if(!m||!m.sets) h+=`<div class="match pending">M${i+1} ⏳ ${p[0]} vs ${p[1]}</div>`;
      else {
        let a=0,b=0;
        m.sets.forEach(s=>s[0]>s[1]?a++:b++);
        h+=`<div class="match done">M${i+1} 🏆 ${p[a>b?0:1]} vs ${p[a>b?1:0]}<div class="result-score">${m.sets.map(s=>`${s[0]}-${s[1]}`).join(" | ")}</div></div>`;
      }
      c.innerHTML=h; g.appendChild(c);
    });
  });
}

/* EXPORT */
window.showFixtures = showFixtures;
window.showResults = showResults;
window.renderTeamView = renderTeamView;
window.renderPlayerView = renderPlayerView;

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
  ["r1","r2","completed","pending"].forEach(id =>
