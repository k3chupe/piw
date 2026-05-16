export default function Pagination({
  pageIndex,
  hasPrevPage,
  hasNextPage,
  onPrevPage,
  onNextPage,
  loading,
}) {
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 py-4"
      aria-label="Paginacja"
    >
      <button
        type="button"
        disabled={!hasPrevPage || loading}
        onClick={onPrevPage}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-zinc-600"
      >
        Poprzednia
      </button>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        Strona {pageIndex + 1}
      </span>
      <button
        type="button"
        disabled={!hasNextPage || loading}
        onClick={onNextPage}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-zinc-600"
      >
        Następna
      </button>
    </nav>
  );
}
