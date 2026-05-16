"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import GameForm from "../../_components/GameForm";
import { useAuth } from "../../_contexts/AuthContext";
import { useGames } from "../../_contexts/GamesContext";

export default function EditGamePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { user, loading: authLoading } = useAuth();
  const { games, fetchGameById, updateGame, deleteGame } = useGames();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id == null) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const g =
        games.find((x) => String(x.id) === String(id)) ??
        (await fetchGameById(id));
      if (!cancelled) {
        setGame(g);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, games, fetchGameById]);

  const types = useMemo(() => {
    const s = new Set();
    games.forEach((g) => {
      if (g.type) s.add(g.type);
    });
    return [...s].sort((a, b) => a.localeCompare(b, "pl"));
  }, [games]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 px-4 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">Ładowanie…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
        <p className="text-zinc-700 dark:text-zinc-300">Musisz być zalogowany.</p>
        <Link href="/login" className="text-blue-600 underline dark:text-blue-400">
          Zaloguj się
        </Link>
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

  if (game.ownerId !== user.uid) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
        <p className="text-zinc-700 dark:text-zinc-300">
          Możesz edytować tylko własne ogłoszenia.
        </p>
        <Link
          href={`/games/${game.id}`}
          className="text-blue-600 underline dark:text-blue-400"
        >
          Podgląd gry
        </Link>
      </div>
    );
  }

  async function handleSubmit(payload) {
    setSubmitError("");
    setSubmitting(true);
    try {
      await updateGame(game.id, payload);
      router.push(`/games/${game.id}`);
    } catch (e) {
      setSubmitError(e.message || "Nie udało się zapisać zmian.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Na pewno usunąć to ogłoszenie?")) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      await deleteGame(game.id);
      router.push("/");
    } catch (e) {
      setSubmitError(e.message || "Nie udało się usunąć ogłoszenia.");
      setSubmitting(false);
    }
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
      {submitError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {submitError}
        </p>
      ) : null}
      <GameForm
        initialGame={game}
        types={types}
        onSubmit={handleSubmit}
        submitLabel={submitting ? "Zapisywanie…" : "Zapisz zmiany"}
        disabled={submitting}
      />
      <button
        type="button"
        disabled={submitting}
        onClick={handleDelete}
        className="w-fit rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
      >
        Usuń ogłoszenie
      </button>
    </div>
  );
}
