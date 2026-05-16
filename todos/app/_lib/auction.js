function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getAuctionState(game) {
  if (!game?.auction || typeof game.auction !== "object") {
    return null;
  }

  const a = game.auction;
  const pricePln = toNumber(game.price_pln, 0);

  const startingPrice = toNumber(
    a.startingPrice ?? a.starting_price,
    pricePln,
  );

  const highestBidderId =
    a.highestBidderId ?? a.highest_bidder_uid ?? a.highestBidderUid ?? null;

  let currentBid = toNumber(
    a.currentBid ?? a.current_bid,
    startingPrice > 0 ? startingPrice : pricePln,
  );

  const hasBids = Boolean(highestBidderId);

  return {
    currentBid,
    startingPrice: startingPrice > 0 ? startingPrice : pricePln,
    highestBidderId,
    hasBids,
  };
}

export function formatPln(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

export function getDisplayPrice(game) {
  const auction = getAuctionState(game);
  if (!auction) {
    return { amount: toNumber(game.price_pln, 0), isAuction: false };
  }
  return { amount: auction.currentBid, isAuction: true };
}
