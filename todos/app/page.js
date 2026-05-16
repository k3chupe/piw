"use client";

import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("./HomeClient"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Gry planszowe
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">Ładowanie…</p>
      </header>
    </div>
  ),
});

export default function Home() {
  return <HomeClient />;
}
