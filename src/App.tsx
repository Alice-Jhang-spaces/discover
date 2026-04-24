/**
 * App.tsx — root component and state orchestrator
 *
 * Owns all cross-cutting state and is the single place where:
 *   1. The active filter (topic OR saved interests) is computed
 *   2. useInfiniteNews is called — the hook result flows down to NewsFeed
 *   3. All user interactions (topic select, save interests, retry) are handled
 *
 * Layout: sticky Navbar → two-column body (feed + sidebar) → floating overlays
 */

import React, { useState }   from 'react';
import Navbar                from './components/Navbar';
import NewsFeed              from './components/NewsFeed';
import Sidebar               from './components/Sidebar';
import CookieBanner          from './components/CookieBanner';
import ScrollToTop           from './components/ScrollToTop';
import { useInfiniteNews }   from './hook/useInfiniteNews';
import { TOPICS }            from './components/InterestsWidget';
import './App.css';

// ── Topic → raw category mapping ─────────────────────────────────────────────

/**
 * TOPIC_CATEGORY_MAP — built once at module level from the TOPICS constant
 * exported by InterestsWidget. Maps every display topic label to its array
 * of raw backend category names.
 *
 * Example:
 *   "Tech & Science" → ["Technology", "Science", "Health"]
 *   "Entertainment"  → ["Politics"]
 *
 * Using TOPICS as the single source of truth means the mapping never gets
 * out of sync between the navbar dropdown, the interest chips, and the
 * API query that is sent to the backend.
 */
const TOPIC_CATEGORY_MAP: Record<string, string[]> = Object.fromEntries(
  TOPICS.map(t => [t.label, t.categories])
);

// ── Component ─────────────────────────────────────────────────────────────────

const App: React.FC = () => {

  // ── State ───────────────────────────────────────────────────────────────

  /**
   * savedCategories — raw category names chosen via "Make it yours".
   * null means the user has not saved any preferences yet (show all news).
   * An empty array [] means the user saved with nothing selected (edge case).
   */
  const [savedCategories, setSavedCategories] = useState<string[] | null>(null);

  /**
   * savedTopicIds — Set of topic IDs (e.g. "tech", "sports") that correspond
   * to the saved categories. Passed back into InterestsWidget so the chips
   * appear pre-highlighted when the widget is re-opened.
   */
  const [savedTopicIds, setSavedTopicIds] = useState<Set<string>>(new Set());

  /**
   * showInterests — controls whether the InterestsWidget is rendered in the
   * sidebar. Starts true so new users immediately see the "Make it yours" prompt.
   */
  const [showInterests, setShowInterests] = useState(true);

  /**
   * activeTopic — the topic label selected from the navbar Topics dropdown,
   * e.g. "Sports" or "Arts & Culture". null means "For You" / no topic filter.
   */
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  // ── Filter priority logic ────────────────────────────────────────────────

  /**
   * filterCategories — the raw category array sent to useInfiniteNews (and
   * ultimately to the backend ?categories= param).
   *
   * Priority rule:
   *   1. Navbar topic selected (activeTopic)  → use that topic's categories
   *   2. User saved interests (savedCategories) → use those categories
   *   3. Neither set (null / undefined)         → fetch all categories
   *
   * The `?? undefined` converts null (not-yet-saved) to undefined so the
   * API call omits the categories param entirely and returns all articles.
   */
  const filterCategories: string[] | undefined = activeTopic
    ? TOPIC_CATEGORY_MAP[activeTopic]   // navbar topic wins when both are set
    : savedCategories ?? undefined;     // fall back to saved interests or nothing

  // ── Hook ─────────────────────────────────────────────────────────────────

  // Destructure only the fields NewsFeed needs — loadMore stays internal to hook
  const {
    articles,
    loading,
    hasMore,
    error,
    sentinelRef,
    reset,
  } = useInfiniteNews(filterCategories);

  // ── Handlers ─────────────────────────────────────────────────────────────

  /**
   * handleSave — called by InterestsWidget when the user clicks "Save Interests".
   * Stores the flat raw category array and rebuilds savedTopicIds from it so
   * the interest chips can be re-highlighted on next open.
   */
  const handleSave = (categories: string[]) => {
    setSavedCategories(categories);
    // Reverse-map: which topics have at least one category in the saved list?
    const ids = new Set(
      TOPICS
        .filter(t => t.categories.some(c => categories.includes(c)))
        .map(t => t.id)
    );
    setSavedTopicIds(ids);
  };

  /**
   * handleFilterClick — triggered by the filter icon in the navbar
   * (only visible after the user has saved interests).
   * Re-opens the interest widget and scrolls to the top so the user can see it.
   */
  const handleFilterClick = () => {
    setShowInterests(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * handleTopicSelect — called when the user picks a topic from the navbar
   * dropdown, or clicks "For You" / "Top" (which pass null to clear the filter).
   * Scrolls to top so the refreshed feed starts from article 1.
   */
  const handleTopicSelect = (label: string | null) => {
    setActiveTopic(label);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="app">
      {/* ── Navigation ──────────────────────────────────────────── */}
      <Navbar
        showFilter={savedCategories !== null}  // show filter icon only after first save
        onFilterClick={handleFilterClick}
        onTopicSelect={handleTopicSelect}
        activeTopic={activeTopic}
      />

      {/* ── Main body: feed (left) + sidebar (right) ────────────── */}
      <main className="app__body">

        {/* Feed column — receives all pagination state from the hook */}
        <div className="app__feed">
          <NewsFeed
            articles={articles}
            loading={loading}
            hasMore={hasMore}
            error={error}
            sentinelRef={sentinelRef}
            onRetry={reset}            // reset re-fetches page 1 (used by error buttons)
          />
        </div>

        {/* Sidebar — sticky, contains interest widget + weather + market */}
        <Sidebar
          showInterests={showInterests}
          savedTopicIds={savedTopicIds}
          onClose={() => setShowInterests(false)}
          onSave={handleSave}
        />
      </main>

      {/* ── Floating overlays ────────────────────────────────────── */}
      <CookieBanner />   {/* bottom-right consent popup */}
      <ScrollToTop  />   {/* floating ↑ button after 400 px scroll */}
    </div>
  );
};

export default App;
