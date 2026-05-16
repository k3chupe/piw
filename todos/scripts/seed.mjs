import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "REMOVED",
  authDomain: "piwo-f950d.firebaseapp.com",
  projectId: "piwo-f950d",
  storageBucket: "piwo-f950d.firebasestorage.app",
  messagingSenderId: "206427511681",
  appId: "1:206427511681:web:11000b972aa59fdf3aa680",
};

const API_URL = "https://szandala.github.io/piwo-api/board-games.json";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function normalizeAuction(auction, pricePln) {
  if (auction == null) return null;
  const startingPrice = Number(
    auction.starting_price ?? auction.startingPrice ?? pricePln,
  );
  const currentBid = Number(
    auction.current_bid ?? auction.currentBid ?? startingPrice,
  );
  const highestBidderId =
    auction.highest_bidder_uid ??
    auction.highestBidderId ??
    auction.highestBidderUid ??
    null;
  return {
    startingPrice,
    currentBid,
    highestBidderId: highestBidderId || null,
  };
}

async function seed() {
  console.log("Logowanie anonimowe…");
  let uid;
  try {
    const cred = await signInAnonymously(auth);
    uid = cred.user.uid;
    console.log(`uid: ${uid.slice(0, 8)}`);
  } catch (e) {
    console.error("Nie udało się zalogować anonimowo.");
    throw e;
  }

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const boardGames = Array.isArray(data.board_games) ? data.board_games : [];

  console.log(`Import: ${boardGames.length} gier`);

  for (const g of boardGames) {
    const id = String(g.id);
    const { id: _omit, ...rest } = g;
    await setDoc(doc(db, "games", id), {
      ...rest,
      ownerId: uid,
      ownerEmail: "",
      status: "available",
      createdAt: serverTimestamp(),
      auction: normalizeAuction(g.auction, g.price_pln),
    });
    console.log(`  ok ${id} – ${g.title}`);
  }

  console.log("Gotowe.");
  process.exit(0);
}

seed().catch((err) => {
  if (err?.code === "permission-denied") {
    console.error("Brak uprawnień do zapisu w bazie.");
  }
  console.error("Błąd:", err.message || err);
  process.exit(1);
});
