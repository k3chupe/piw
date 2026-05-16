"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  formatPln,
  getAuctionState,
  getDisplayPrice,
} from "../../_lib/auction";
import { imageUrlFromApiPath } from "../../_lib/images";
import { useAuth } from "../../_contexts/AuthContext";
import { useGames } from "../../_contexts/GamesContext";

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { user } = useAuth();
  const { subscribeGame, buyGame, placeBid } = useGames();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [broken, setBroken] = useState({});
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [bidAmount, setBidAmount] = useState("");

  useEffect(() => {
    if (id == null) return undefined;
    setLoading(true);
    const unsub = subscribeGame(id, (g) => {
      setGame(g);
      setLoading(false);
    });
    return () => unsub();
  }, [id, subscribeGame]);

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
  const urls = images.map((p) => imageUrlFromApiPath(p)).filter(Boolean);
  const sold = game.status === "sold";
  const isOwner = user && game.ownerId === user.uid;
  const auctionState = getAuctionState(game);
  const { amount: displayAmount, isAuction } = getDisplayPrice(game);

  async function handleBuy() {
    setActionError("");
    setActionLoading(true);
    try {
      await buyGame(game.id);
    } catch (e) {
      setActionError(e.message || "Nie udało się kupić gry.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBid(e) {
    e.preventDefault();
    setActionError("");
    setActionLoading(true);
    try {
      await placeBid(game.id, bidAmount);
      setBidAmount("");
    } catch (err) {
      setActionError(err.message || "Nie udało się złożyć oferty.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div
      className={`mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 ${
        sold ? "opacity-90" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
        >
          Wstecz
        </button>
        {isOwner ? (
          <Link
            href={`/edit/${game.id}`}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Edytuj
          </Link>
        ) : null}
      </div>

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        {game.title}
        {sold ? (
          <span className="ml-3 text-lg font-normal text-zinc-500">
            (sprzedane)
          </span>
        ) : null}
      </h1>

      <p className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
        {formatPln(displayAmount)} PLN
        {isAuction ? " · licytacja" : ""}
      </p>

      {actionError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {actionError}
        </p>
      ) : null}

      {!sold && user && !auctionState ? (
        <button
          type="button"
          disabled={actionLoading}
          onClick={handleBuy}
          className="w-fit rounded-lg bg-emerald-700 px-5 py-2.5 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {actionLoading ? "Przetwarzanie…" : "Kup teraz"}
        </button>
      ) : null}

      {!sold && !user && !auctionState ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/login" className="underline">
            Zaloguj się
          </Link>
          , aby kupić tę grę.
        </p>
      ) : null}

      {sold ? (
        <p className="rounded-lg bg-zinc-200 px-4 py-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          Ta oferta została sprzedana i nie jest już dostępna.
        </p>
      ) : null}

      {auctionState && !sold ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <h2 className="mb-2 text-lg font-semibold text-amber-900 dark:text-amber-100">
            Licytacja
          </h2>
          <p className="mb-3 text-sm text-amber-800 dark:text-amber-200">
            {auctionState.hasBids ? (
              <>
                Aktualna oferta:{" "}
                <strong>{formatPln(auctionState.currentBid)} PLN</strong>
                {" · licytacja trwa"}
              </>
            ) : (
              <>
                Cena wywoławcza:{" "}
                <strong>{formatPln(auctionState.startingPrice)} PLN</strong>
                {" · brak ofert powyżej ceny wywoławczej"}
              </>
            )}
          </p>
          {user ? (
            <form onSubmit={handleBid} className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Twoja oferta (PLN)</span>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950"
                />
              </label>
              <button
                type="submit"
                disabled={actionLoading}
                className="rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:opacity-50"
              >
                {actionLoading ? "…" : "Licytuj"}
              </button>
            </form>
          ) : (
            <p className="text-sm">
              <Link href="/login" className="underline">
                Zaloguj się
              </Link>
              , aby licytować.
            </p>
          )}
        </section>
      ) : null}

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
        {game.ownerEmail ? (
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Sprzedający</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">
              {game.ownerEmail}
            </dd>
          </div>
        ) : null}
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
            game.description.map((para, i) => <p key={i}>{para}</p>)
          ) : (
            <p className="text-zinc-500">Brak opisu.</p>
          )}
        </div>
      </section>
    </div>
  );
}

