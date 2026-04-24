/**
 * useInfiniteNews.ts — infinite-scroll pagination hook
 *
 * Pagination strategy (three layers):
 *
 *  1. Initial load
 *     Fetch page 1 immediately on mount / filter change.
 *     Show a skeleton while loading, then reveal the first batch of articles.
 *
 *  2. Background prefetch
 *     After every successful page load, silently fetch the NEXT page into
 *     the cache while the user reads the current content.
 *     When the IntersectionObserver fires, the next page is already in memory
 *     → articles append instantly with no spinner and no network wait.
 *
 *  3. Client-side cache
 *     A module-level Map stores every successfully fetched page keyed by
 *     (filter + page number). The cache survives re-renders and component
 *     remounts, so switching topics and back again never re-fetches the
 *     same data from the backend.
 *
 * Other design decisions (unchanged from original):
 *   • Single `loading` flag covers both first load and append — no split.
 *   • `pendingRef` mutex prevents concurrent fetchPage calls during cache
 *     hits (where `loading` never becomes true, so the flag alone is not
 *     enough to block the IntersectionObserver from double-firing).
 *   • `JSON.stringify(filterCategories)` for deep-equal useCallback dep.
 *   • `replace` boolean on fetchPage — one function handles both reset
 *     (filter change) and append (scroll), avoiding duplication.
 *   • `observer.disconnect()` cleanup on every effect re-run.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Article }   from '../components/NewsCard';
import { fetchNews } from '../api/news';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;   // articles per page (must match backend default)

// Maximum pages to keep in the cache before evicting the oldest entry.
// With 6 pages × 5 topics = 30 max pages, this cap is rarely hit in practice
// but prevents unbounded memory growth in long-running sessions.
const MAX_CACHE_SIZE = 50;

// ── Module-level page cache ───────────────────────────────────────────────────

/**
 * pageCache — client-side store for fetched pages.
 *
 * Defined at MODULE level (outside the hook) so it:
 *   • Survives React re-renders (state changes don't clear it)
 *   • Survives component unmount / remount (e.g. React StrictMode)
 *   • Is shared across all instances of the hook (one cache for the whole app)
 *   • Resets only when the browser tab is fully refreshed
 *
 * Key  : "<sorted-categories>::<page>"
 *   e.g.  "Technology,Science,Health::2"   (Tech & Science, page 2)
 *          "__all__::1"                      (no filter, page 1)
 *
 * Value : { articles, hasMore } — everything needed to restore the page state.
 */
const pageCache = new Map<string, { articles: Article[]; hasMore: boolean }>();

/**
 * makeCacheKey — build a stable string key for a (filter, page) pair.
 *
 * Categories are sorted before joining so ["Science","Technology"] and
 * ["Technology","Science"] produce the same key, regardless of the order
 * they appear in the TOPICS definition.
 */
function makeCacheKey(page: number, categories?: string[]): string {
  const cats =
    categories && categories.length > 0
      ? [...categories].sort().join(',')
      : '__all__';
  return `${cats}::${page}`;
}

/**
 * writeToCache — store a page result, evicting the oldest entry if the
 * cache has grown past MAX_CACHE_SIZE (simple FIFO eviction).
 */
function writeToCache(
  key:      string,
  articles: Article[],
  hasMore:  boolean
): void {
  if (pageCache.size >= MAX_CACHE_SIZE) {
    // Map iterates in insertion order — the first key is the oldest.
    // The iterator value is string | undefined; guard before deleting
    // (in practice the map is non-empty at this point, but TS doesn't know that).
    const oldestKey = pageCache.keys().next().value as string | undefined;
    if (oldestKey !== undefined) pageCache.delete(oldestKey);
  }
  pageCache.set(key, { articles, hasMore });
}

// ── Background prefetch ───────────────────────────────────────────────────────

/**
 * prefetchPage — silently fetch one page into the cache.
 *
 * Called after every successful page load to warm the NEXT page while the
 * user reads the current content. By the time the IntersectionObserver fires,
 * the data is already in cache → instant append, no spinner.
 *
 * Errors are intentionally swallowed:
 *   • A failed prefetch is non-fatal — the observer will trigger a normal
 *     fetch (with spinner) when the user actually scrolls to that page.
 *   • Logging prefetch errors would pollute the console with noise that
 *     the user never sees or acts on.
 *
 * Defined at module level (not as a useCallback) because it has no
 * dependencies on hook state — it only reads/writes the shared pageCache.
 */
async function prefetchPage(
  page:            number,
  filterCategories?: string[]
): Promise<void> {
  const key = makeCacheKey(page, filterCategories);

  // Skip if already cached — don't waste bandwidth re-fetching
  if (pageCache.has(key)) return;

  try {
    const data = await fetchNews(page, PAGE_SIZE, 'All', filterCategories);
    writeToCache(key, data.articles, data.hasMore);
  } catch {
    // Silent failure — prefetch is opportunistic, not required
  }
}

// ── Return type ───────────────────────────────────────────────────────────────

interface UseInfiniteNewsReturn {
  articles:    Article[];                       // accumulated article list
  loading:     boolean;                         // true only during network fetches
  hasMore:     boolean;                         // false → show end-of-feed message
  error:       string | null;                   // last network error, null when clean
  sentinelRef: React.RefObject<HTMLDivElement>; // attach to the invisible sentinel div
  reset:       () => void;                      // re-fetch page 1 (retry button)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useInfiniteNews
 *
 * @param filterCategories  Raw backend category names to filter by.
 *                          undefined → fetch all categories.
 *                          Changing this value resets the feed and re-fetches page 1.
 */
export function useInfiniteNews(
  filterCategories?: string[]
): UseInfiniteNewsReturn {

  const [articles, setArticles] = useState<Article[]>([]);
  const [page,     setPage]     = useState(0);     // 0 = nothing fetched yet
  const [loading,  setLoading]  = useState(false);
  const [hasMore,  setHasMore]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // Ref attached to the invisible 1px sentinel div at the bottom of the feed.
  // The IntersectionObserver watches this element — when it enters the viewport
  // (+200px rootMargin), the next page is loaded / served from cache.
  const sentinelRef = useRef<HTMLDivElement>(null!);

  /**
   * pendingRef — mutex that prevents concurrent fetchPage calls.
   *
   * Why this is needed in addition to the `loading` flag:
   *   Cache hits resolve synchronously without ever setting loading=true.
   *   During a cache hit, the state updates (setArticles, setPage, setHasMore)
   *   are enqueued but not yet committed when control returns. In this brief
   *   window the IntersectionObserver could fire a second time and call
   *   fetchPage again for the same page. pendingRef blocks that re-entry.
   */
  const pendingRef = useRef(false);

  // ── Core fetch ──────────────────────────────────────────────────────────────

  /**
   * fetchPage — load one page: from cache if available, from network otherwise.
   *
   * @param pageToLoad  1-based page number to request.
   * @param replace     true  → overwrite the article list (filter change / reset)
   *                    false → append to the existing list (infinite scroll)
   *
   * Flow:
   *   1. Acquire the pendingRef mutex (block concurrent calls)
   *   2. Check the cache — if hit: update state instantly, schedule next prefetch
   *   3. If miss: fetch from network, write to cache, update state, schedule prefetch
   *   4. Release the mutex in all exit paths
   */
  const fetchPage = useCallback(
    async (pageToLoad: number, replace: boolean) => {

      // ── Mutex: block if another call is already in progress ─────────────
      if (pendingRef.current) return;
      pendingRef.current = true;

      const key    = makeCacheKey(pageToLoad, filterCategories);
      const cached = pageCache.get(key);

      // ── Path A: Cache hit ────────────────────────────────────────────────
      if (cached) {
        // Serve articles directly from memory — no network, no spinner.
        // `loading` is never set to true so the UI never flashes a spinner
        // when the user scrolls through already-prefetched pages.
        setArticles(prev =>
          replace ? cached.articles : [...prev, ...cached.articles]
        );
        setPage(pageToLoad);
        setHasMore(cached.hasMore);
        setError(null);

        pendingRef.current = false;   // release mutex immediately after state enqueue

        // Warm the page after this one while the user reads
        if (cached.hasMore) {
          prefetchPage(pageToLoad + 1, filterCategories);
        }
        return;
      }

      // ── Path B: Cache miss → fetch from network ──────────────────────────
      // Show the spinner (append load) or skeleton (initial load via NewsFeed)
      setLoading(true);
      setError(null);

      try {
        const data = await fetchNews(pageToLoad, PAGE_SIZE, 'All', filterCategories);

        // Write to cache so this page is free on the next visit
        writeToCache(key, data.articles, data.hasMore);

        setArticles(prev =>
          replace ? data.articles : [...prev, ...data.articles]
        );
        setPage(pageToLoad);
        setHasMore(data.hasMore);

        // Prefetch the NEXT page in the background while the user reads
        // this one. If prefetch finishes before the observer fires, the
        // next scroll will be instant (cache hit). If not, a normal fetch
        // runs instead — correct behaviour either way.
        if (data.hasMore) {
          prefetchPage(pageToLoad + 1, filterCategories);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
        pendingRef.current = false;   // always release the mutex
      }
    },
    // JSON.stringify gives a stable primitive for deep equality — prevents
    // fetchPage from being recreated when the array reference changes but
    // the values are the same (e.g. on every render of the parent).
    [JSON.stringify(filterCategories)] // eslint-disable-line
  );

  // ── Reset + load page 1 on filter change ────────────────────────────────────

  /**
   * Runs whenever fetchPage changes identity (i.e. filterCategories changed value).
   *
   * Resets all list state to "empty / page 0" before fetching page 1 fresh.
   * Does NOT clear the cache — if the user switches back to this filter,
   * the cached pages will still be available.
   *
   * pendingRef is also reset here in case a stale lock was left by a fetch
   * that was interrupted mid-flight when the previous filter was active.
   */
  useEffect(() => {
    setArticles([]);
    setPage(0);
    setHasMore(true);
    pendingRef.current = false;   // clear any stale lock from previous filter
    fetchPage(1, true);           // replace=true → wipe the list
  }, [fetchPage]);

  // ── Internal loadMore ────────────────────────────────────────────────────────

  /**
   * loadMore — request the next page and append it.
   *
   * Guards:
   *   !loading          → no network fetch already in-flight
   *   !pendingRef.current → no cache-hit path still in progress
   *   hasMore           → stop once the server says there are no more pages
   *
   * Intentionally NOT exported. Only the IntersectionObserver below should
   * call it — components never manually trigger page increments.
   */
  const loadMore = useCallback(() => {
    if (!loading && !pendingRef.current && hasMore) {
      fetchPage(page + 1, false);   // replace=false → append
    }
  }, [loading, hasMore, page, fetchPage]);

  // ── IntersectionObserver ─────────────────────────────────────────────────────

  /**
   * Attaches an IntersectionObserver to the sentinel div.
   *
   * rootMargin: '200px' — fires 200px BEFORE the sentinel enters the viewport.
   * This gives prefetchPage time to complete before the user reaches the last
   * card, so most scrolls result in instant (cache-hit) appends.
   *
   * The effect re-runs when loading / hasMore / loadMore change so the
   * observer's closure always captures current values.
   *
   * Cleanup: observer.disconnect() prevents stale observers from accumulating
   * between re-runs and after unmount.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Double-check guards inside the callback because there is a brief
        // window between the effect's dep snapshot and the callback firing
        if (entry.isIntersecting && !loading && !pendingRef.current && hasMore) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [loading, hasMore, loadMore]);

  // ── Public reset ─────────────────────────────────────────────────────────────

  /**
   * reset — clear the feed and re-fetch page 1.
   *
   * Called by the "Try again" / "Retry" buttons in NewsFeed after a network error.
   * Does NOT clear the cache — successfully fetched pages remain available.
   * Page 1 itself may come from cache (instant) if it was fetched before the error.
   */
  const reset = useCallback(() => {
    setArticles([]);
    setPage(0);
    setHasMore(true);
    pendingRef.current = false;
    fetchPage(1, true);
  }, [fetchPage]);

  return { articles, loading, hasMore, error, sentinelRef, reset };
}
