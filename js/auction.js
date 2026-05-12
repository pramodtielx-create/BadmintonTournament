/* ======================================================
   FANTASY AUCTION MODULE
   ✅ Virtual credits only
   ✅ Backend-compatible
   ✅ WebSocket-ready
   ✅ Fully separated from app.js
   ====================================================== */

/* ===================== STATE ===================== */

const AuctionStore = {
  currentUser: null,
  auction: null,
  socket: null
};

/* ===================== INIT ===================== */
/*
  Call once from app.js:
  initAuction({
    id: "u1",
    name: "Rahul",
    credits: 390,
    premium: true
  });
*/

function initAuction(user) {
  AuctionStore.currentUser = user;
  connectAuctionSocket();
}

/* ===================== SOCKET ===================== */

function connectAuctionSocket() {
  if (typeof io === "undefined") return;

  AuctionStore.socket = io("/");

  AuctionStore.socket.on("AUCTION_UPDATE", auction => {
    AuctionStore.auction = auction;
    renderAuctionUI();
  });

  AuctionStore.socket.on("AUCTION_CLOSED", payload => {
    alert(`Auction closed. Winner: ${payload.winnerName}`);
    loadCurrentAuction();
  });
}

/* ===================== API ===================== */

function loadCurrentAuction() {
  fetch("/api/auction/current")
    .then(res => {
      if (!res.ok) throw new Error("Failed to load auction");
      return res.json();
    })
    .then(auction => {
      AuctionStore.auction = auction;
      renderAuctionUI();
    })
    .catch(err => {
      document.getElementById("auction-container").innerHTML =
        `<p style="opacity:.7">Auction unavailable</p>`;
      console.error(err);
    });
}

function submitAuctionBid(increment) {
  const user = AuctionStore.currentUser;
  const auction = AuctionStore.auction;

  if (!auction || auction.status !== "OPEN") {
    alert("Auction not active");
    return;
  }

  const bidAmount = auction.highestBid + increment;

  if (user.credits < bidAmount) {
    alert("Insufficient credits");
    return;
  }

  fetch("/api/auction/bid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.id,
      amount: bidAmount
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Bid rejected");
      return res.json();
    })
    .then(updatedAuction => {
      AuctionStore.auction = updatedAuction;
      renderAuctionUI();
    })
    .catch(err => alert(err.message));
}

/* ===================== UI ===================== */

function showFantasyAuction() {
  const c = document.getElementById("main-content");

  c.innerHTML = `
    <div class="auction-page">
      <div class="auction-header">
        <h2>Fantasy Player Auction</h2>
        <div>Credits: <strong>${AuctionStore.currentUser.credits}</strong></div>
      </div>

      <div id="auction-container"></div>

      <p class="disclaimer">
        This fantasy feature uses virtual credits only.
        No real money or prizes involved.
      </p>
    </div>
  `;

  loadCurrentAuction();
}

/* ======================================================
   ✅ FIXED PLAYER PHOTO RENDERING (IMPORTANT)
   ====================================================== */

function renderAuctionUI() {
  const a = AuctionStore.auction;
  if (!a) return;

  document.getElementById("auction-container").innerHTML = `
    <div class="auction-card">

      <div class="player-block">
        <img
          src="${a.player.photo}"
          alt="${a.player.name}"
          onerror="this.src='assets/players/default.png'"
        />

        <div class="player-meta">
          <h3>${a.player.name}</h3>
          <p>${a.player.team}</p>
          <p>Base Price: ${a.player.basePrice}</p>
        </div>
      </div>

      <div class="auction-stats">
        <div>
          <span>Highest Bid</span>
          <strong>${a.highestBid}</strong>
        </div>

        <div>
          <span>Leader</span>
          <strong>${a.highestBidderName}</strong>
        </div>

        <div>
          <span>Ends In</span>
          <strong class="timer">${a.secondsLeft}s</strong>
        </div>
      </div>

      <div class="bid-actions">
        <button onclick="submitAuctionBid(10)">+10</button>
        <button onclick="submitAuctionBid(20)">+20</button>
        <button onclick="submitAuctionBid(50)">+50</button>
      </div>

      <button class="place-bid" onclick="submitAuctionBid(0)">
        Place Bid
      </button>

    </div>
  `;
}

/* ===================== EXPORT ===================== */

window.showFantasyAuction = showFantasyAuction;
window.initAuction = initAuction;
