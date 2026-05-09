"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import GameForm from "../_components/GameForm";
import { useGames } from "../_contexts/GamesContext";

export default function NewGamePage() {
  const router = useRouter();
  const { games, addGame } = useGames();

  const types = useMemo(() => {
    const s = new Set();
    games.forEach((g) => {
      if (g.type) s.add(g.type);
    });
    return [...s].sort((a, b) => a.localeCompare(b, "pl"));
  }, [games]);

  function handleSubmit(payload) {
    addGame(payload);
    router.push("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
        >
          Lista gier
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Dodaj ogłoszenie
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Dane są tylko w pamięci przeglądarki — po odświeżeniu znikną (jak na
        zajęciach, zanim pojawi się baza).
      </p>
      <GameForm
        initialGame={null}
        types={types}
        onSubmit={handleSubmit}
        submitLabel="Dodaj"
      />
    </div>
  );
}
