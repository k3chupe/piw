export const PAGE_SIZE = 10;

export default function Pagination({
  currentPage,
  totalItems,
  pageSize = PAGE_SIZE,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const pages = [];
  const windowSize = 5;
  let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1);
  }
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 py-4"
      aria-label="Paginacja"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-zinc-600"
      >
        Poprzednia
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`min-w-10 rounded-lg px-3 py-1.5 text-sm font-medium ${
            p === currentPage
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "border border-zinc-300 dark:border-zinc-600"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-zinc-600"
      >
        Następna
      </button>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        Strona {currentPage} / {totalPages} ({totalItems} wyników)
      </span>
    </nav>
  );
}
