"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import GameForm from "../_components/GameForm";
import { useAuth } from "../_contexts/AuthContext";
import { useGames } from "../_contexts/GamesContext";

export default function NewGamePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { games, addGame } = useGames();
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const types = useMemo(() => {
    const s = new Set();
    games.forEach((g) => {
      if (g.type) s.add(g.type);
    });
    return [...s].sort((a, b) => a.localeCompare(b, "pl"));
  }, [games]);

  if (authLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 px-4 py-12">
        <p className="text-zinc-600 dark:text-zinc-400">Ładowanie…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
        <p className="text-zinc-700 dark:text-zinc-300">
          Musisz być zalogowany, aby dodać ogłoszenie.
        </p>
        <Link href="/login" className="text-blue-600 underline dark:text-blue-400">
          Przejdź do logowania
        </Link>
      </div>
    );
  }

  async function handleSubmit(payload) {
    setSubmitError("");
    setSubmitting(true);
    try {
      await addGame(payload);
      router.push("/");
    } catch (e) {
      setSubmitError(e.message || "Nie udało się dodać ogłoszenia.");
    } finally {
      setSubmitting(false);
    }
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
        Po zapisaniu wrócisz na listę.
      </p>
      {submitError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {submitError}
        </p>
      ) : null}
      <GameForm
        initialGame={null}
        types={types}
        onSubmit={handleSubmit}
        submitLabel={submitting ? "Zapisywanie…" : "Dodaj"}
        disabled={submitting}
        showAuctionOption
      />
    </div>
  );
}
