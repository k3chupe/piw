export default function Filters({
  types,
  typeFilter,
  onTypeChange,
  expansionFilter,
  onExpansionChange,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  playersMin,
  playersMax,
  onPlayersMinChange,
  onPlayersMaxChange,
  disabled,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
      <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        Filtry
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Typ</span>
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            disabled={Boolean(disabled)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">wszystkie</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Dodatek</span>
          <select
            value={expansionFilter}
            onChange={(e) => onExpansionChange(e.target.value)}
            disabled={Boolean(disabled)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">wszystkie</option>
            <option value="yes">tylko dodatki</option>
            <option value="no">bez dodatków</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Cena od (PLN)
          </span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={priceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
            disabled={Boolean(disabled)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Cena do (PLN)
          </span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={priceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            disabled={Boolean(disabled)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Min. graczy (≥)
          </span>
          <input
            type="number"
            min={1}
            value={playersMin}
            onChange={(e) => onPlayersMinChange(e.target.value)}
            disabled={Boolean(disabled)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Max. graczy (≤)
          </span>
          <input
            type="number"
            min={1}
            value={playersMax}
            onChange={(e) => onPlayersMaxChange(e.target.value)}
            disabled={Boolean(disabled)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
      </div>
    </div>
  );
}
