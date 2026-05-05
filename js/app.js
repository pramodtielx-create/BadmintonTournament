/*************************************************
 * CONFIG
 *************************************************/
const API_URL =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnTXMoAwXbvDwO7qlKlhZdQIDF1xO7udrCnDuCC7kweDOElvkc5ep9-8V42WmhZBCvBv7i5PBwEzOZXtknmLBwiz1ZGVO1DLdaJBvgpFtQSDTO1MbqsG4HFZ252eAuNNSfS0CLR7fHq36H7fQ5-kkgF46vCZFBeyecLwLpUdX2TsTisuCPIhwGNDbklhTxQWNXhdSWgD853n_QO8HAFt2H8fBqJ9SIfZOJilrAdcE3NJ0d7k-bwTY7Z3DkzOW2UZ8o9cso-onO8LzLh1xUHwpm0GMU1b4Q&lib=MnlW5-0CjeWiL0y3FATjIigWVRn-u2K4R";

/*************************************************
 * UTILITIES
 *************************************************/
async function fetchAPI() {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error("Failed to load API data");
  }
  return await res.json();
}

function setContent(html) {
  document.getElementById("main-content").innerHTML = html;
}

/*************************************************
 * OVERVIEW – MATCH PROGRESS CHART
 *************************************************/
async function loadOverview() {
  setContent("<h2>Loading match progress…</h2>");

  try {
    const data = await fetchAPI();

    let completed = 0;
    let total = data.fixtures.length * 3;

    Object.values(data.results).forEach(r => {
      r.matches.forEach(m => {
        if (m && m.sets) completed++;
      });
    });

    setContent(`
      <h2>Match Progress</h2>
      <canvas id="progressChart" height="120"></canvas>
    `);

    new Chart(document.getElementById("progressChart"), {
      type: "doughnut",
      data: {
        labels: ["Completed", "Pending"],
        datasets: [
          {
            data: [completed, total - completed],
            backgroundColor: ["#2563EB", "#E5E7EB"]
          }
        ]
      },
      options: {
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });

  } catch (err) {
    setContent("<p style='color:red'>Failed to load overview.</p>");
    console.error(err);
  }
}

/*************************************************
 * TEAM PERFORMANCE – BAR CHART
 *************************************************/
async function loadTeamChart() {
  setContent("<h2>Loading team performance…</h2>");

  try {
    const data = await fetchAPI();
    const teamWins = {};

    Object.entries(data.results).forEach(([tieId, r]) => {
      const fixture = data.fixtures.find(f => f.tie_id == tieId);
      if (!fixture) return;

      r.matches.forEach(m => {
        if (!m || !m.sets) return;

        let aSets = 0;
        let bSets = 0;

        m.sets.forEach(s => {
          if (s[0] > s[1]) aSets++;
          else bSets++;
        });

        if (aSets > bSets) {
          teamWins[fixture.team_a] =
            (teamWins[fixture.team_a] || 0) + 1;
        } else {
          teamWins[fixture.team_b] =
            (teamWins[fixture.team_b] || 0) + 1;
        }
      });
    });

    const teams = Object.keys(teamWins);
    const wins = Object.values(teamWins);

    setContent(`
      <h2>Team Performance</h2>
      <canvas id="teamChart" height="120"></canvas>
    `);

    new Chart(document.getElementById("teamChart"), {
      type: "bar",
      data: {
        labels: teams,
        datasets: [
          {
            label: "Match Wins",
            data: wins,
            backgroundColor: "#3B82F6"
          }
        ]
      },
      options: {
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

  } catch (err) {
    setContent("<p style='color:red'>Failed to load team chart.</p>");
    console.error(err);
  }
}

/*************************************************
 * INSIGHTS – STREAMLIT (NEW TAB)
 *************************************************/
function openInsights() {
  window.open(
    "https://mathigangbhl.streamlit.app/",
    "_blank",
    "noopener,noreferrer"
  );
}

/*************************************************
 * DEFAULT LOAD
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
  loadOverview();
});
/*************************************************
 * FIXTURES – ROUND 1 & ROUND 2
 *************************************************/
async function loadFixtures() {
  const container = document.getElementById("main-content");

  // Clear content first
  container.innerHTML = "<h2>Fixtures</h2>";

  const res = await fetch(API_URL, { cache: "no-store" });
  const data = await res.json();

  const fixtures = data.fixtures;

  // ✅ EXPLICIT round grouping
  const rounds = {};
  fixtures.forEach(fixture => {
    const round = fixture.round_no;
    if (!rounds[round]) {
      rounds[round] = [];
    }
    rounds[round].push(fixture);
  });

  // ✅ EXPLICIT rendering order
  Object.keys(rounds)
    .sort((a, b) => Number(a) - Number(b))
    .forEach(roundNo => {

      // ---- Round Heading ----
      const roundHeader = document.createElement("h3");
      roundHeader.textContent = `Round ${roundNo}`;
      container.appendChild(roundHeader);

      // ---- Fixtures in this round ----
      rounds[roundNo].forEach(fixture => {

        const card = document.createElement("div");
        card.className = "fixture-card";

        // Title
        const title = document.createElement("div");
        title.className = "fixture-title";
        title.innerHTML = `
          <strong>${fixture.team_a}</strong>
          <span class="vs">vs</span>
          <strong>${fixture.team_b}</strong>
        `;
        card.appendChild(title);

        // Matches list
        const ul = document.createElement("ul");
        ul.className = "fixture-matches";

        fixture.matches.forEach((match, index) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>Match ${index + 1}:</strong>
            ${match[0]} <span class="vs">vs</span> ${match[1]}
          `;
          ul.appendChild(li);
        });

        card.appendChild(ul);
        container.appendChild(card);
      });
    });
}
