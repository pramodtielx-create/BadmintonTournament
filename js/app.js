const API_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

async function fetchAPI() {
  const res = await fetch(API_URL);
  return await res.json();
}

/* ================= OVERVIEW CHART ================= */

async function loadOverview() {
  const res = await fetch(API_URL);
  const data = await res.json();

  let completed = 0;
  let total = data.fixtures.length * 3;

  Object.values(data.results).forEach(r => {
    r.matches.forEach(m => {
      if (m && m.sets) completed++;
    });
  });

  document.getElementById("main-content").innerHTML = `
    <h2>Match Progress</h2>
    <canvas id="progressChart"></canvas>
  `;

  new Chart(document.getElementById("progressChart"), {
    type: "doughnut",
    data: {
      labels: ["Completed", "Pending"],
      datasets: [{
        data: [completed, total - completed],
        backgroundColor: ["#2563EB", "#E5E7EB"]
      }]
    }
  });
}
