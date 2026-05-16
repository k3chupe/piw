export const PIWO_API_BASE = "https://szandala.github.io/piwo-api/";

export function imageUrlFromApiPath(path) {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `${PIWO_API_BASE}${trimmed.replace(/^\//, "")}`;
}
