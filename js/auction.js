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
