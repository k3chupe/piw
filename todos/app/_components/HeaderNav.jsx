"use client";

import Link from "next/link";
import { useAuth } from "../_contexts/AuthContext";

export default function HeaderNav() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link
          href="/"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Gry planszowe
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link
            href="/"
            className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            Lista
          </Link>
          {user ? (
            <Link
              href="/new"
              className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              Dodaj ogłoszenie
            </Link>
          ) : null}
          {!loading && user ? (
            <>
              <span className="text-zinc-600 dark:text-zinc-400">
                {user.email}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-600"
              >
                Wyloguj
              </button>
            </>
          ) : null}
          {!loading && !user ? (
            <>
              <Link
                href="/login"
                className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
              >
                Zaloguj
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Zarejestruj
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
