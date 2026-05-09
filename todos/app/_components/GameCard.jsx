"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { imageUrlFromApiPath } from "../_lib/images";

export default function GameCard({ game }) {
  const firstPath = game.images?.length ? game.images[0] : null;
  const primaryUrl = imageUrlFromApiPath(firstPath);
  const [imgSrc, setImgSrc] = useState(
    primaryUrl || "/placeholder.png",
  );

  const price = Number(game.price_pln).toFixed(2);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <Link href={`/games/${game.id}`} className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={imgSrc}
          alt={game.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          onError={() => setImgSrc("/placeholder.png")}
          unoptimized={imgSrc.startsWith("http")}
        />
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
          {price} PLN
        </p>
        <Link
          href={`/games/${game.id}`}
          className="inline-flex justify-center rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Szczegóły
        </Link>
      </div>
    </article>
  );
}
