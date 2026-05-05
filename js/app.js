const API_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

async function fetchAPI() {
  const res = await fetch(API_URL);
  return await res.json();
}

/* ================= OVERVIEW CHART ================= */
async function loadOverview() {
  const data = await fetchAPI();

  const totalFixtures = data.fixtures.length;
  let completedMatches = 0;

  Object.values(data.results).forEach(r => {
    r.matches.forEach(m => {
      if (m && m.sets) completedMatches++;
    });
  });

  document.getElementById("main-content").innerHTML = `
    <h2>Overview</h2>
    <canvas id="matchesChart"></canvas>
  `;

  new Chart(document.getElementById("matchesChart"), {
    type: "doughnut",
    data: {
      labels: ["Completed Matches", "Pending Matches"],
      datasets: [{
        data: [completedMatches, totalFixtures * 3 - completedMatches],
        backgroundColor: ["#2563EB", "#E5E7EB"]
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}
