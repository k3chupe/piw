"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../_contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signInEmail, signInGoogle, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await signInEmail(email.trim(), password);
      router.push("/");
    } catch {} finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    clearError();
    setSubmitting(true);
    try {
      await signInGoogle();
      router.push("/");
    } catch {} finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Zaloguj się
      </h1>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Hasło</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {submitting ? "Logowanie…" : "Zaloguj"}
        </button>
      </form>

      <button
        type="button"
        disabled={submitting}
        onClick={handleGoogle}
        className="rounded-lg border border-zinc-300 px-4 py-2.5 font-medium disabled:opacity-50 dark:border-zinc-600"
      >
        Zaloguj przez Google
      </button>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Nie masz konta?{" "}
        <Link href="/register" className="font-medium underline">
          Zarejestruj się
        </Link>
      </p>
    </div>
  );
}
