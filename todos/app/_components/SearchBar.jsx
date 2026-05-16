export default function SearchBar({ value, onChange, disabled }) {
  return (
    <label className="flex w-full max-w-md flex-col gap-1">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Szukaj po tytule
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={Boolean(disabled)}
        placeholder="np. Catan"
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400"
      />
    </label>
  );
}
