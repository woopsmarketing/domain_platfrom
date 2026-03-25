/** 14-day cache TTL in milliseconds */
export const CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

/** Check if a timestamp is older than 14 days */
export function isStale(updatedAt: string): boolean {
  return Date.now() - new Date(updatedAt).getTime() > CACHE_TTL_MS;
}
