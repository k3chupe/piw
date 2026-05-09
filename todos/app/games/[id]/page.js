"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { imageUrlFromApiPath } from "../../_lib/images";
import { useGames } from "../../_contexts/GamesContext";

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { getGameById, loading } = useGames();
  const game = id != null ? getGameById(id) : undefined;

  const [broken, setBroken] = useState({});

  useEffect(() => {
    setBroken({});
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col px-4 py-8">
        <p className="text-zinc-600 dark:text-zinc-400">Ładowanie…</p>
      </div>
    );
  }

  if (game == null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
        <p className="text-lg text-zinc-700 dark:text-zinc-300">
          Nie znaleziono gry.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Wróć na listę
        </button>
      </div>
    );
  }

  const images = Array.isArray(game.images) ? game.images : [];
  const urls = images
    .map((p) => imageUrlFromApiPath(p))
    .filter(Boolean);

  const price = Number(game.price_pln).toFixed(2);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
        >
          Wstecz
        </button>
        <Link
          href={`/edit/${game.id}`}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Edytuj
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        {game.title}
      </h1>

      <p className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
        {price} PLN
      </p>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Gracze</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-100">
            {game.min_players}–{game.max_players}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Czas</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-100">
            ~{game.avg_play_time_minutes} min
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Wydawca</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-100">
            {game.publisher}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Typ</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-100">
            {game.type}
            {game.is_expansion ? " · dodatek" : ""}
          </dd>
        </div>
      </dl>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Zdjęcia
        </h2>
        {urls.length === 0 ? (
          <div className="relative aspect-video max-w-xl overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <Image
              src="/placeholder.png"
              alt="Brak zdjęcia"
              fill
              className="object-contain p-8"
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {urls.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800"
              >
                <Image
                  src={broken[idx] ? "/placeholder.png" : url}
                  alt={`${game.title} ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                  onError={() =>
                    setBroken((prev) => ({ ...prev, [idx]: true }))
                  }
                  unoptimized={!broken[idx] && url.startsWith("http")}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Opis
        </h2>
        <div className="space-y-3 text-zinc-800 dark:text-zinc-200">
          {Array.isArray(game.description) && game.description.length > 0 ? (
            game.description.map((para, i) => (
              <p key={i}>{para}</p>
            ))
          ) : (
            <p className="text-zinc-500">Brak opisu.</p>
          )}
        </div>
      </section>
    </div>
  );
}
