function loadContent(section) {
  const content = document.getElementById("main-content");

  switch (section) {
    case "overview":
      content.innerHTML = `
        <h2>Overview</h2>
        <p>Tournament summary, schedule, and key highlights.</p>
      `;
      break;

    case "fixtures":
      content.innerHTML = `
        <h2>Fixtures</h2>
        <ul>
          <li>Match 1: Player A vs Player B</li>
          <li>Match 2: Player C vs Player D</li>
        </ul>
      `;
      break;

    case "results":
      content.innerHTML = `
        <h2>Results</h2>
        <p>Completed match results and scores.</p>
      `;
      break;

    case "standings":
      content.innerHTML = `
        <h2>Standings</h2>
        <p>Points table and rankings.</p>
      `;
      break;

    case "insights":
      content.innerHTML = `
        <h2>Insights</h2>
        <p>Analytics, trends, and performance insights.</p>
      `;
      break;
  }

  setActive(section);
}

function setActive(section) {
  document.querySelectorAll(".sidebar button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.innerText.toLowerCase() === section) {
      btn.classList.add("active");
    }
  });
}