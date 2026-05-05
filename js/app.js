/*************************************************
 * CONFIG
 *************************************************/
const API_URL =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnTXMoAwXbvDwO7qlKlhZdQIDF1xO7udrCnDuCC7kweDOElvkc5ep9-8V42WmhZBCvBv7i5PBwEzOZXtknmLBwiz1ZGVO1DLdaJBvgpFtQSDTO1MbqsG4HFZ252eAuNNSfS0CLR7fHq36H7fQ5-kkgF46vCZFBeyecLwLpUdX2TsTisuCPIhwGNDbklhTxQWNXhdSWgD853n_QO8HAFt2H8fBqJ9SIfZOJilrAdcE3NJ0d7k-bwTY7Z3DkzOW2UZ8o9cso-onO8LzLh1xUHwpm0GMU1b4Q&lib=MnlW5-0CjeWiL0y3FATjIigWVRn-u2K4R";

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
