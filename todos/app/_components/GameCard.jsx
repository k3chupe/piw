"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPln, getAuctionState, getDisplayPrice } from "../_lib/auction";
import { imageUrlFromApiPath } from "../_lib/images";

export default function GameCard({ game }) {
  const firstPath = game.images?.length ? game.images[0] : null;
  const primaryUrl = imageUrlFromApiPath(firstPath);
  const [imgSrc, setImgSrc] = useState(primaryUrl || "/placeholder.png");

  const sold = game.status === "sold";
  const auctionState = getAuctionState(game);
  const { amount: displayAmount, isAuction } = getDisplayPrice(game);

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 ${
        sold ? "opacity-60" : ""
      }`}
    >
      <Link
        href={`/games/${game.id}`}
        className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-800"
      >
        <Image
          src={imgSrc}
          alt={game.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          onError={() => setImgSrc("/placeholder.png")}
          unoptimized={imgSrc.startsWith("http")}
        />
        {sold ? (
          <span className="absolute right-2 top-2 rounded-md bg-zinc-900/80 px-2 py-1 text-xs font-semibold text-white">
            Sprzedane
          </span>
        ) : null}
        {auctionState && !sold ? (
          <span className="absolute left-2 top-2 rounded-md bg-amber-600/90 px-2 py-1 text-xs font-semibold text-white">
            Licytacja
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
          <Link href={`/games/${game.id}`} className="hover:underline">
            {game.title}
          </Link>
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {game.type}
          {game.is_expansion ? " · dodatek" : ""}
        </p>
        <p className="mt-auto text-lg font-bold text-zinc-900 dark:text-zinc-50">
          {isAuction
            ? `${formatPln(displayAmount)} PLN (licytacja)`
            : `${formatPln(displayAmount)} PLN`}
        </p>
        <Link
          href={`/games/${game.id}`}
          className={`inline-flex justify-center rounded-lg px-3 py-2 text-sm font-medium ${
            sold
              ? "cursor-not-allowed bg-zinc-300 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
              : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          }`}
        >
          {sold ? "Niedostępne" : "Szczegóły"}
        </Link>
      </div>
    </article>
  );
}
