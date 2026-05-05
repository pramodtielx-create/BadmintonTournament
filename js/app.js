const API_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

async function loadAPI() {
  const res = await fetch(API_URL);
  return await res.json();
}

async function loadOverview() {
  const data = await loadAPI();
  document.getElementById("main-content").innerHTML = `
    <h2>Overview</h2>
    <p>Teams: ${new Set(data.fixtures.map(f => f.team_a)).size}</p>
    <p>Total Fixtures: ${data.fixtures.length}</p>
  `;
}
