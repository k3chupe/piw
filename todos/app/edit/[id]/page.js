"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import GameForm from "../../_components/GameForm";
import { useGames } from "../../_contexts/GamesContext";

export default function EditGamePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { games, getGameById, updateGame, loading } = useGames();
  const game = id != null ? getGameById(id) : undefined;

  const types = useMemo(() => {
    const s = new Set();
    games.forEach((g) => {
      if (g.type) s.add(g.type);
    });
    return [...s].sort((a, b) => a.localeCompare(b, "pl"));
  }, [games]);

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 px-4 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">Ładowanie…</p>
      </div>
    );
  }

  if (game == null) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
        <p className="text-zinc-700 dark:text-zinc-300">Nie znaleziono gry.</p>
        <Link href="/" className="text-blue-600 underline dark:text-blue-400">
          Wróć na listę
        </Link>
      </div>
    );
  }

  function handleSubmit(payload) {
    updateGame(game.id, payload);
    router.push(`/games/${game.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/games/${game.id}`}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
        >
          Podgląd gry
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
        >
          Lista gier
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Edytuj: {game.title}
      </h1>
      <GameForm
        initialGame={game}
        types={types}
        onSubmit={handleSubmit}
        submitLabel="Zapisz zmiany"
      />
    </div>
  );
}
