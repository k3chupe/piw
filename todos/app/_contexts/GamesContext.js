"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_URL = "https://szandala.github.io/piwo-api/board-games.json";

const GamesContext = createContext(null);

export function useGames() {
  const ctx = useContext(GamesContext);
  if (ctx == null) {
    throw new Error("useGames musi być użyty wewnątrz GamesProvider");
  }
  return ctx;
}

export function GamesProvider({ children }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Błąd odpowiedzi serwera");
        return res.json();
      })
      .then((data) => {
        setGames(Array.isArray(data.board_games) ? data.board_games : []);
      })
      .catch(() => {
        setError("Nie udało się pobrać listy gier.");
        setGames([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getGameById = useCallback(
    (id) => games.find((g) => String(g.id) === String(id)),
    [games],
  );

  const addGame = useCallback((payload) => {
    setGames((prev) => {
      const maxId = prev.reduce((max, g) => Math.max(max, Number(g.id) || 0), 0);
      const nextId = maxId + 1;
      const game = {
        id: nextId,
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
        auction: payload.auction != null ? payload.auction : null,
      };
      return [...prev, game];
    });
  }, []);

  const updateGame = useCallback((id, payload) => {
    setGames((prev) =>
      prev.map((g) => {
        if (String(g.id) !== String(id)) return g;
        return {
          ...g,
          title: payload.title ?? g.title,
          images: Array.isArray(payload.images) ? payload.images : g.images,
          description: Array.isArray(payload.description)
            ? payload.description
            : g.description,
          min_players:
            payload.min_players != null ? Number(payload.min_players) : g.min_players,
          max_players:
            payload.max_players != null ? Number(payload.max_players) : g.max_players,
          avg_play_time_minutes:
            payload.avg_play_time_minutes != null
              ? Number(payload.avg_play_time_minutes)
              : g.avg_play_time_minutes,
          publisher: payload.publisher ?? g.publisher,
          is_expansion:
            payload.is_expansion != null ? Boolean(payload.is_expansion) : g.is_expansion,
          price_pln: payload.price_pln != null ? Number(payload.price_pln) : g.price_pln,
          type: payload.type ?? g.type,
          auction: payload.auction !== undefined ? payload.auction : g.auction,
        };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      games,
      loading,
      error,
      getGameById,
      addGame,
      updateGame,
    }),
    [games, loading, error, getGameById, addGame, updateGame],
  );

  return (
    <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
  );
}

export default GamesContext;
