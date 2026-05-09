"use client";

import { useEffect, useState } from "react";

const defaults = {
  title: "",
  descriptionText: "",
  min_players: 2,
  max_players: 4,
  avg_play_time_minutes: 60,
  publisher: "",
  is_expansion: false,
  price_pln: "",
  type: "",
};

export default function GameForm({
  initialGame,
  types = [],
  onSubmit,
  submitLabel = "Zapisz",
}) {
  const [values, setValues] = useState(defaults);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialGame) {
      setValues(defaults);
      return;
    }
    setValues({
      title: initialGame.title ?? "",
      descriptionText: Array.isArray(initialGame.description)
        ? initialGame.description.join("\n")
        : "",
      min_players: initialGame.min_players ?? 2,
      max_players: initialGame.max_players ?? 4,
      avg_play_time_minutes: initialGame.avg_play_time_minutes ?? 60,
      publisher: initialGame.publisher ?? "",
      is_expansion: Boolean(initialGame.is_expansion),
      price_pln:
        initialGame.price_pln != null ? String(initialGame.price_pln) : "",
      type: initialGame.type ?? "",
    });
  }, [initialGame]);

  function handleChange(field, raw) {
    setValues((v) => ({ ...v, [field]: raw }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!values.title.trim()) {
      setError("Tytuł jest wymagany.");
      return;
    }
    const price = Number(String(values.price_pln).replace(",", "."));
    if (Number.isNaN(price) || price <= 0) {
      setError("Podaj poprawną cenę większą od zera.");
      return;
    }
    const minP = Number(values.min_players);
    const maxP = Number(values.max_players);
    if (Number.isNaN(minP) || Number.isNaN(maxP) || minP < 1 || maxP < 1) {
      setError("Liczba graczy musi być dodatnia.");
      return;
    }
    if (minP > maxP) {
      setError("Minimalna liczba graczy nie może być większa od maksymalnej.");
      return;
    }
    const minutes = Number(values.avg_play_time_minutes);
    if (Number.isNaN(minutes) || minutes < 1) {
      setError("Podaj sensowny czas rozgrywki (minuty).");
      return;
    }
    const description = values.descriptionText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({
      title: values.title.trim(),
      description,
      min_players: minP,
      max_players: maxP,
      avg_play_time_minutes: minutes,
      publisher: values.publisher.trim(),
      is_expansion: values.is_expansion,
      price_pln: price,
      type: values.type.trim() || "bez kategorii",
      images: initialGame?.images ?? [],
      auction: initialGame?.auction ?? null,
    });
  }

  const listId = "game-types-list";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-xl flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
    >
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Tytuł</span>
        <input
          required
          value={values.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Opis (każda linia = akapit)</span>
        <textarea
          rows={6}
          value={values.descriptionText}
          onChange={(e) => handleChange("descriptionText", e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Min. graczy</span>
          <input
            type="number"
            min={1}
            value={values.min_players}
            onChange={(e) => handleChange("min_players", e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Max. graczy</span>
          <input
            type="number"
            min={1}
            value={values.max_players}
            onChange={(e) => handleChange("max_players", e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Średni czas (minuty)</span>
        <input
          type="number"
          min={1}
          value={values.avg_play_time_minutes}
          onChange={(e) => handleChange("avg_play_time_minutes", e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Wydawca</span>
        <input
          value={values.publisher}
          onChange={(e) => handleChange("publisher", e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Typ / mechanika</span>
        <input
          list={listId}
          value={values.type}
          onChange={(e) => handleChange("type", e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <datalist id={listId}>
          {types.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.is_expansion}
          onChange={(e) => handleChange("is_expansion", e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300"
        />
        <span>To dodatek / rozszerzenie</span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Cena (PLN)</span>
        <input
          type="text"
          inputMode="decimal"
          value={values.price_pln}
          onChange={(e) => handleChange("price_pln", e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>

      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
