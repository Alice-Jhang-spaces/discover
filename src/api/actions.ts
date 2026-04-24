/**
 * api/actions.ts — HTTP layer for per-article user actions
 *
 * Keeps all action fetch() calls in one place so components never
 * construct URLs or handle HTTP status codes directly.
 */

import { ActionType, ArticleActions } from '../components/NewsCard';

const BASE_URL = '/api';

/**
 * postAction — persist one action toggle to the backend.
 *
 * Called optimistically: the UI updates first, then this runs.
 * If it throws, the caller rolls the UI state back.
 *
 * @param articleId  Article's stable numeric ID (as string for the URL)
 * @param action     Which signal to update ('liked' | 'bookmarked' | ...)
 * @param value      New boolean value (true = on, false = off)
 */
export async function postAction(
  articleId: string,
  action:    ActionType,
  value:     boolean
): Promise<void> {
  const res = await fetch(`${BASE_URL}/actions`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ articleId, action, value }),
  });
  if (!res.ok) throw new Error(`Action failed: ${res.status}`);
}

/**
 * fetchActions — bulk-load action state for a set of articles.
 *
 * Used to hydrate the UI after a page load so previously saved actions
 * (liked, bookmarked, etc.) are reflected without requiring user interaction.
 *
 * @param articleIds  Array of article IDs to query
 * @returns           Map of articleId → ArticleActions (all-false if not found)
 */
export async function fetchActions(
  articleIds: string[]
): Promise<Record<string, ArticleActions>> {
  if (articleIds.length === 0) return {};
  const params = new URLSearchParams({ articleIds: articleIds.join(',') });
  const res = await fetch(`${BASE_URL}/actions?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch actions: ${res.status}`);
  return res.json();
}
