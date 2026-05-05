/*************************************************
 * CONFIG
 *************************************************/
const API_URL =
  "https://script.google.com/macros/s/AKfycbwxDaxyf_2LfCldvKk5Ci3WrP-2_yPURXhq-zVK9eXm1kdl-oA7PX2We1sNNom0avi_sw/exec";

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
  clearMain();

  const title = document.createElement("h2");
  title.textContent = "Fixtures";
  container.appendChild(title);

  const data = await fetchAPI();
  const fixtures = data.fixtures;

  // Group by round
  const rounds = {};
  fixtures.forEach(f => {
    if (!rounds[f.round_no]) rounds[f.round_no] = [];
    rounds[f.round_no].push(f);
  });

  Object.keys(rounds)
    .sort((a, b) => a - b)
    .forEach(roundNo => {
      const roundHeader = document.createElement("h3");
      roundHeader.textContent = `Round ${roundNo}`;
      container.appendChild(roundHeader);

      rounds[roundNo].forEach(fixture => {
        const card = document.createElement("div");
        card.className = "fixture-card";

        card.innerHTML = `
          <div class="fixture-title">
            <strong>${fixture.team_a}</strong>
            <span class="vs">vs</span>
            <strong>${fixture.team_b}</strong>
          </div>
          <ul class="fixture-matches">
            ${fixture.matches
              .map(
                (m, i) => `
                <li>
                  <strong>Match ${i + 1}:</strong>
                  ${m[0]} <span class="vs">vs</span> ${m[1]}
                </li>`
              )
              .join("")}
          </ul>
        `;

        container.appendChild(card);
      });
    });
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
