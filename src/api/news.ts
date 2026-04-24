/**
 * api/news.ts — HTTP layer
 *
 * Single function that talks to the Express backend.
 * Keeps all fetch() calls and URL construction in one place so components
 * and hooks never need to know about the API shape directly.
 */

import { NewsResponse } from '../components/NewsCard';

// Base URL — the Vite proxy (or CRA proxy) forwards /api/* to localhost:3001
const BASE_URL = '/api';

/**
 * fetchNews — fetch one page of articles from the backend.
 *
 * @param page        1-based page number to request
 * @param limit       Articles per page (default 12, backend caps at 24)
 * @param category    Single raw category name. Ignored when `categories` is provided.
 * @param categories  Array of raw category names for multi-topic filtering.
 *                    e.g. ['Technology', 'Science', 'Health'] for "Tech & Science"
 *                    When provided, these are joined into ?categories=... and
 *                    `category` is omitted from the query string.
 *
 * @throws Error      If the HTTP response status is not 2xx
 * @returns           Typed NewsResponse: { articles, page, limit, total, hasMore }
 */
export async function fetchNews(
  page:        number,
  limit      = 12,
  category   = 'All',
  categories?: string[]
): Promise<NewsResponse> {

  // Build query string — only include the params that are relevant
  const params = new URLSearchParams({
    page:  String(page),
    limit: String(limit),
    // Include single `category` only when there is no multi-category array
    ...(category !== 'All' && !categories && { category }),
    // Join array → comma-separated string, e.g. "Technology,Science,Health"
    ...(categories && categories.length > 0 && { categories: categories.join(',') }),
  });

  const res = await fetch(`${BASE_URL}/news?${params}`);

  // Throw so useInfiniteNews can catch and store the error message in state
  if (!res.ok) throw new Error(`Failed to fetch news: ${res.status}`);

  return res.json();
}
