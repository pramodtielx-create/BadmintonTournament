/* =====================================================/* ================================================= AUCTION MODULE
   Safe: Virtual credits only (no real money)
   ===================================================== */

/* ------------------ STATE ------------------ */

const AuctionStore = {
  currentUser: null,
  auction: null,
  socket: null
};

/* ------------------ INIT ------------------ */

function initAuction(user) {
  AuctionStore.currentUser = user;
  connectAuctionSocket();
}

/* ------------------ SOCKET ------------------ */

function connectAuctionSocket() {
  if (typeof io === "undefined") return;

  AuctionStore.socket = io("/");

  AuctionStore.socket.on("AUCTION_UPDATE", auction => {
    AuctionStore.auction = auction;
    renderAuctionUI();
  });

  AuctionStore.socket.on("AUCTION_CLOSED", result => {
    alert(`Auction closed. Winner: ${result.winnerName}`);
    loadCurrentAuction();
  });
}

/* ------------------ API CALLS ------------------ */

function loadCurrentAuction() {
  fetch("/api/auction/current")
    .then(res => res.json())
    .then(data => {
      AuctionStore.auction = data;
      renderAuctionUI();
    })
    .catch(console.error);
}

function placeAuctionBid(increment) {
  const user = AuctionStore.currentUser;
  const auction = AuctionStore.auction;

  const newBid = auction.highestBid + increment;

  if (user.credits < newBid) {
    alert("Insufficient credits");
    return;
  }

  fetch("/api/auction/bid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.id,
      amount: newBid
    })
  })
  .then(res => {
    if (!res.ok) throw new Error("Bid failed");
    return res.json();
  })
  .then(updatedAuction => {
    AuctionStore.auction = updatedAuction;
    renderAuctionUI();
  })
  .catch(err => alert(err.message));
}

/* ------------------ UI RENDER ------------------ */

function showFantasyAuction() {
  document.getElementById("main-content").innerHTML = `
    <div class="auction-page">
      <div class="auction-header">
        <h2>Fantasy Player Auction</h2>
        <div>
          Credits:
          <strong>${AuctionStore.currentUser.credits}</strong>
        </div>
      </div>

      <div id="auction-container"></div>

      <p class="disclaimer">
        Virtual credits only. No real money or prizes involved.
      </p>
    </div>
  `;

  loadCurrentAuction();
}

function renderAuctionUI() {
  const a = AuctionStore.auction;
  if (!a) return;

  document.getElementById("auction-container").innerHTML = `
    <div class="auction-card">
      <div class="player-block">
        <img src="${a.player.photo}">
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
        <button onclick="placeAuctionBid(10)">+10</button>
        <button onclick="placeAuctionBid(20)">+20</button>
        <button onclick="placeAuctionBid(50)">+50</button>
      </div>

      <button class="place-bid"
        onclick="placeAuctionBid(0)">
        Place Bid
      </button>
    </div>
  `;
}

/* ------------------ EXPORTS ------------------ */

window.showFantasyAuction = showFantasyAuction;
window.initAuction = initAuction;
``
