"use client";

import { useEffect, useMemo, useState } from "react";
import GameCard from "./_components/GameCard";
import Filters from "./_components/Filters";
import Pagination from "./_components/Pagination";
import SearchBar from "./_components/SearchBar";
import { useGames } from "./_contexts/GamesContext";

function useDebounced(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function HomeClient() {
  const {
    games,
    loading,
    error,
    isEmpty,
    pageIndex,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = useGames();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 200);

  const [typeFilter, setTypeFilter] = useState("");
  const [expansionFilter, setExpansionFilter] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [playersMin, setPlayersMin] = useState("");
  const [playersMax, setPlayersMax] = useState("");

  const types = useMemo(() => {
    const s = new Set();
    games.forEach((g) => {
      if (g.type) s.add(g.type);
    });
    return [...s].sort((a, b) => a.localeCompare(b, "pl"));
  }, [games]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return games.filter((g) => {
      if (q && !g.title.toLowerCase().includes(q)) return false;
      if (typeFilter && g.type !== typeFilter) return false;
      if (expansionFilter === "yes" && !g.is_expansion) return false;
      if (expansionFilter === "no" && g.is_expansion) return false;

      if (priceMin !== "" && !Number.isNaN(Number(priceMin))) {
        if (g.price_pln < Number(priceMin)) return false;
      }
      if (priceMax !== "" && !Number.isNaN(Number(priceMax))) {
        if (g.price_pln > Number(priceMax)) return false;
      }

      if (playersMin !== "" && !Number.isNaN(Number(playersMin))) {
        const n = Number(playersMin);
        if (g.max_players < n) return false;
      }
      if (playersMax !== "" && !Number.isNaN(Number(playersMax))) {
        const n = Number(playersMax);
        if (g.min_players > n) return false;
      }

      return true;
    });
  }, [
    games,
    debouncedQuery,
    typeFilter,
    expansionFilter,
    priceMin,
    priceMax,
    playersMin,
    playersMax,
  ]);

  const disabled = loading;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Gry planszowe
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">Lista ogłoszeń.</p>
      </header>

      {error ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
          {error}
        </p>
      ) : null}

      {!loading && !error && isEmpty ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-600 dark:border-zinc-600 dark:text-zinc-400">
          Brak ogłoszeń. Zaloguj się i dodaj pierwsze.
        </p>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SearchBar value={query} onChange={setQuery} disabled={disabled} />
      </div>

      <Filters
        types={types}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        expansionFilter={expansionFilter}
        onExpansionChange={setExpansionFilter}
        priceMin={priceMin}
        priceMax={priceMax}
        onPriceMinChange={setPriceMin}
        onPriceMaxChange={setPriceMax}
        playersMin={playersMin}
        playersMax={playersMax}
        onPlayersMinChange={setPlayersMin}
        onPlayersMaxChange={setPlayersMax}
        disabled={disabled}
      />

      {loading ? (
        <p className="text-zinc-600 dark:text-zinc-400">Ładowanie…</p>
      ) : null}

      {!loading && !error && !isEmpty && filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-600 dark:border-zinc-600 dark:text-zinc-400">
          Brak gier spełniających kryteria na tej stronie.
        </p>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
          <Pagination
            pageIndex={pageIndex}
            hasPrevPage={hasPrevPage}
            hasNextPage={hasNextPage}
            onPrevPage={prevPage}
            onNextPage={nextPage}
            loading={loading}
          />
        </>
      ) : null}
    </div>
  );
}
