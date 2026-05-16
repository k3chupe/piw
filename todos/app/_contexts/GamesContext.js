"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  updateDoc,
} from "firebase/firestore";
import { db } from "../_lib/firebase";
import { getAuctionState } from "../_lib/auction";
import { formatFirestoreError } from "../_lib/firebaseErrors";
import { useAuth } from "./AuthContext";

export const PAGE_SIZE = 10;
const GAMES_COLLECTION = "games";

const GamesContext = createContext(null);

function docToGame(snap) {
  return { id: snap.id, ...snap.data() };
}

function sortGamesNewestFirst(items) {
  return [...items].sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? a.createdAt?.seconds ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? b.createdAt?.seconds ?? 0;
    if (tb !== ta) return tb - ta;
    return String(b.id).localeCompare(String(a.id));
  });
}

export function useGames() {
  const ctx = useContext(GamesContext);
  if (ctx == null) {
    throw new Error("useGames musi być użyty wewnątrz GamesProvider");
  }
  return ctx;
}

export function GamesProvider({ children }) {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCursors, setPageCursors] = useState([null]);
  const [lastDoc, setLastDoc] = useState(null);
  const [useSimplePagination, setUseSimplePagination] = useState(false);

  const applyPage = useCallback((pageDocs, hasMore) => {
    setGames(pageDocs.map(docToGame));
    setHasNextPage(hasMore);
    setLastDoc(pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null);
    setIsEmpty(pageDocs.length === 0);
  }, []);

  const fetchPageSimple = useCallback(async () => {
    const snapshot = await getDocs(
      query(collection(db, GAMES_COLLECTION), limit(200)),
    );
    const all = sortGamesNewestFirst(snapshot.docs);
    const pageDocs = all.slice(0, PAGE_SIZE);
    const hasMore = all.length > PAGE_SIZE;
    setUseSimplePagination(true);
    applyPage(pageDocs, hasMore);
  }, [applyPage]);

  const fetchPage = useCallback(
    async (cursor = null) => {
      setLoading(true);
      setError(null);
      setIsEmpty(false);

      try {
        const constraints = [orderBy("createdAt", "desc"), limit(PAGE_SIZE + 1)];
        if (cursor) {
          constraints.push(startAfter(cursor));
        }
        const q = query(collection(db, GAMES_COLLECTION), ...constraints);
        const snapshot = await getDocs(q);
        const docs = snapshot.docs;
        const hasMore = docs.length > PAGE_SIZE;
        const pageDocs = hasMore ? docs.slice(0, PAGE_SIZE) : docs;
        setUseSimplePagination(false);
        applyPage(pageDocs, hasMore);
      } catch (e) {
        console.warn("orderBy(createdAt):", e);

        if (e?.code === "failed-precondition" || !cursor) {
          try {
            await fetchPageSimple();
            return;
          } catch (e2) {
            console.error(e2);
            setError(formatFirestoreError(e2));
          }
        } else {
          setError(formatFirestoreError(e));
        }

        setGames([]);
        setHasNextPage(false);
        setIsEmpty(false);
      } finally {
        setLoading(false);
      }
    },
    [applyPage, fetchPageSimple],
  );

  useEffect(() => {
    fetchPage(null);
    setPageIndex(0);
    setPageCursors([null]);
  }, [fetchPage]);

  const nextPage = useCallback(async () => {
    if (!hasNextPage) return;

    if (useSimplePagination) {
      setError("Nie można przejść dalej — odśwież stronę.");
      return;
    }

    if (!lastDoc) return;
    const nextCursor = lastDoc;
    await fetchPage(nextCursor);
    setPageCursors((prev) => [...prev, nextCursor]);
    setPageIndex((i) => i + 1);
  }, [hasNextPage, lastDoc, fetchPage, useSimplePagination]);

  const prevPage = useCallback(async () => {
    if (pageIndex <= 0 || useSimplePagination) return;
    const newIndex = pageIndex - 1;
    const cursor = pageCursors[newIndex] ?? null;
    await fetchPage(cursor);
    setPageIndex(newIndex);
    setPageCursors((prev) => prev.slice(0, newIndex + 1));
  }, [pageIndex, pageCursors, fetchPage, useSimplePagination]);

  const refreshCurrentPage = useCallback(async () => {
    if (useSimplePagination) {
      await fetchPageSimple();
      return;
    }
    const cursor = pageCursors[pageIndex] ?? null;
    await fetchPage(cursor);
  }, [pageCursors, pageIndex, fetchPage, useSimplePagination, fetchPageSimple]);

  const getGameById = useCallback(
    (id) => games.find((g) => String(g.id) === String(id)),
    [games],
  );

  const subscribeGame = useCallback((id, onUpdate) => {
    const ref = doc(db, GAMES_COLLECTION, String(id));
    return onSnapshot(
      ref,
      (snap) => {
        onUpdate(snap.exists() ? docToGame(snap) : null);
      },
      (e) => {
        console.error(e);
        onUpdate(null);
      },
    );
  }, []);

  const fetchGameById = useCallback(async (id) => {
    const snap = await getDoc(doc(db, GAMES_COLLECTION, String(id)));
    if (!snap.exists()) return null;
    return docToGame(snap);
  }, []);

  const addGame = useCallback(
    async (payload) => {
      if (!user) throw new Error("Musisz być zalogowany, aby dodać ogłoszenie.");
      const data = {
        title: payload.title,
        images: Array.isArray(payload.images) ? payload.images : [],
        description: Array.isArray(payload.description) ? payload.description : [],
        min_players: Number(payload.min_players),
        max_players: Number(payload.max_players),
        avg_play_time_minutes: Number(payload.avg_play_time_minutes),
        publisher: payload.publisher,
        is_expansion: Boolean(payload.is_expansion),
        price_pln: Number(payload.price_pln),
        type: payload.type,
        ownerId: user.uid,
        ownerEmail: user.email ?? "",
        status: "available",
        createdAt: serverTimestamp(),
        auction: payload.enableAuction
          ? {
              currentBid: Number(payload.price_pln),
              startingPrice: Number(payload.price_pln),
              highestBidderId: null,
            }
          : null,
      };
      const ref = await addDoc(collection(db, GAMES_COLLECTION), data);
      await refreshCurrentPage();
      return ref.id;
    },
    [user, refreshCurrentPage],
  );

  const updateGame = useCallback(
    async (id, payload) => {
      if (!user) throw new Error("Musisz być zalogowany.");
      const existing = await fetchGameById(id);
      if (!existing || existing.ownerId !== user.uid) {
        throw new Error("Możesz edytować tylko własne ogłoszenia.");
      }
      await updateDoc(doc(db, GAMES_COLLECTION, String(id)), {
        title: payload.title,
        images: Array.isArray(payload.images) ? payload.images : existing.images,
        description: Array.isArray(payload.description)
          ? payload.description
          : existing.description,
        min_players: Number(payload.min_players),
        max_players: Number(payload.max_players),
        avg_play_time_minutes: Number(payload.avg_play_time_minutes),
        publisher: payload.publisher,
        is_expansion: Boolean(payload.is_expansion),
        price_pln: Number(payload.price_pln),
        type: payload.type,
      });
      await refreshCurrentPage();
    },
    [user, fetchGameById, refreshCurrentPage],
  );

  const deleteGame = useCallback(
    async (id) => {
      if (!user) throw new Error("Musisz być zalogowany.");
      const existing = await fetchGameById(id);
      if (!existing || existing.ownerId !== user.uid) {
        throw new Error("Możesz usuwać tylko własne ogłoszenia.");
      }
      await deleteDoc(doc(db, GAMES_COLLECTION, String(id)));
      await refreshCurrentPage();
    },
    [user, fetchGameById, refreshCurrentPage],
  );

  const buyGame = useCallback(
    async (id) => {
      if (!user) throw new Error("Musisz być zalogowany, aby kupić grę.");
      const ref = doc(db, GAMES_COLLECTION, String(id));
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("Gra nie istnieje.");
        const data = snap.data();
        if (data.status !== "available") {
          throw new Error("Ta oferta nie jest już dostępna.");
        }
        tx.update(ref, {
          status: "sold",
          soldBy: user.uid,
          soldAt: serverTimestamp(),
        });
      });
    },
    [user],
  );

  const placeBid = useCallback(
    async (id, amount) => {
      if (!user) throw new Error("Musisz być zalogowany, aby licytować.");
      const bid = Number(amount);
      if (Number.isNaN(bid) || bid <= 0) {
        throw new Error("Podaj poprawną kwotę licytacji.");
      }
      const ref = doc(db, GAMES_COLLECTION, String(id));
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("Gra nie istnieje.");
        const data = snap.data();
        if (data.status !== "available") {
          throw new Error("Gra nie jest dostępna do licytacji.");
        }
        const auctionState = getAuctionState({
          auction: data.auction,
          price_pln: data.price_pln,
        });
        if (!auctionState) {
          throw new Error("Ta gra nie jest na licytacji.");
        }
        const minBid = auctionState.currentBid;
        if (bid <= minBid) {
          throw new Error(`Oferta musi być wyższa niż ${minBid} PLN.`);
        }
        tx.update(ref, {
          auction: {
            currentBid: bid,
            highestBidderId: user.uid,
            startingPrice: auctionState.startingPrice,
          },
        });
      });
    },
    [user],
  );

  const value = useMemo(
    () => ({
      games,
      loading,
      error,
      isEmpty,
      pageIndex,
      hasNextPage,
      hasPrevPage: pageIndex > 0 && !useSimplePagination,
      nextPage,
      prevPage,
      refreshCurrentPage,
      getGameById,
      fetchGameById,
      subscribeGame,
      addGame,
      updateGame,
      deleteGame,
      buyGame,
      placeBid,
    }),
    [
      games,
      loading,
      error,
      isEmpty,
      pageIndex,
      hasNextPage,
      useSimplePagination,
      nextPage,
      prevPage,
      refreshCurrentPage,
      getGameById,
      fetchGameById,
      subscribeGame,
      addGame,
      updateGame,
      deleteGame,
      buyGame,
      placeBid,
    ],
  );

  return (
    <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
  );
}

export default GamesContext;
