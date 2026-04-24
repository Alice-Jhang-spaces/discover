import React           from 'react';
import { Article }     from './NewsCard';
import NewsCard        from './NewsCard';
import SkeletonBlock   from './SkeletonBlock';
import Spinner         from './Spinner';

const styles = `
.feed { display:flex; flex-direction:column; gap:12px; padding:20px 0 80px; min-height:100vh; }
.feed__section { display:flex; flex-direction:column; gap:12px; }
.feed__small-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.feed__double-row { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.feed__sentinel { height:1px; pointer-events:none; visibility:hidden; }
.feed__end { text-align:center; font-size:12.5px; color:rgba(0,0,0,0.3); padding:20px 0 4px; letter-spacing:0.2px; }
.feed__state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 24px; gap:16px; text-align:center; min-height:60vh; }
.feed__inline-err { display:flex; align-items:center; justify-content:center; gap:12px; padding:16px; font-size:13px; color:rgba(0,0,0,0.45); }
.feed__btn { padding:8px 20px; border-radius:8px; border:1px solid rgba(0,0,0,0.14); background:#fff; color:rgba(0,0,0,0.75); font-size:13px; font-weight:500; cursor:pointer; transition:background 0.15s,border-color 0.15s; }
.feed__btn:hover { background:rgba(0,0,0,0.04); border-color:rgba(0,0,0,0.24); }
.feed__btn--sm { padding:5px 14px; font-size:12px; }
@media (max-width:768px) { .feed__small-grid { grid-template-columns:repeat(2,1fr); } .feed__double-row { grid-template-columns:1fr; } }
@media (max-width:480px) { .feed { padding:12px 0 60px; gap:10px; } .feed__small-grid { grid-template-columns:1fr; } }
`;

const CHUNK_SIZE = 6;

function chunkArticles(articles: Article[]): Article[][] {
  const chunks: Article[][] = [];
  for (let i = 0; i < articles.length; i += CHUNK_SIZE) {
    chunks.push(articles.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

const SmallGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="feed__small-grid">{children}</div>
);

const DoubleRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="feed__double-row">{children}</div>
);

const FeedSection: React.FC<{ chunk: Article[] }> = ({ chunk }) => (
  <div className="feed__section">
    {chunk[0] && <NewsCard variant="headline" article={chunk[0]} />}
    {chunk[1] && (
      <SmallGrid>
        {chunk.slice(1, 4).map(a => <NewsCard key={a.id} variant="small" article={a} />)}
      </SmallGrid>
    )}
    {chunk[4] && chunk[5] && (
      <DoubleRow>
        <NewsCard variant="left"  article={chunk[4]} />
        <NewsCard variant="right" article={chunk[5]} />
      </DoubleRow>
    )}
    {chunk[4] && !chunk[5] && (
      <SmallGrid>
        <NewsCard variant="small" article={chunk[4]} />
      </SmallGrid>
    )}
  </div>
);

interface Props {
  articles:    Article[];
  loading:     boolean;
  hasMore:     boolean;
  error:       string | null;
  sentinelRef: React.RefObject<HTMLDivElement>;
  onRetry:     () => void;
}

const NewsFeed: React.FC<Props> = ({ articles, loading, hasMore, error, sentinelRef, onRetry }) => {
  if (loading && articles.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="feed" aria-busy aria-label="Loading news">
          <SkeletonBlock variant="headline" />
          <SkeletonBlock variant="smalls"   />
          <SkeletonBlock variant="double"   />
        </div>
      </>
    );
  }

  if (error && articles.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="feed__state">
          <p>{error}</p>
          <button className="feed__btn" onClick={onRetry}>Try again</button>
        </div>
      </>
    );
  }

  if (articles.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="feed__state"><p>No articles found for this topic.</p></div>
      </>
    );
  }

  const chunks = chunkArticles(articles);

  return (
    <>
      <style>{styles}</style>
      <section className="feed" role="feed" aria-label="News articles">
        {chunks.map(chunk => <FeedSection key={chunk[0].id} chunk={chunk} />)}
        <div ref={sentinelRef} className="feed__sentinel" aria-hidden="true" data-testid="scroll-sentinel" />
        {loading && articles.length > 0 && <Spinner />}
        {!hasMore && !loading && (
          <p className="feed__end" aria-live="polite">
            You've reached the end · {articles.length} articles loaded
          </p>
        )}
        {error && articles.length > 0 && (
          <div className="feed__inline-err">
            <span>{error}</span>
            <button className="feed__btn feed__btn--sm" onClick={onRetry}>Retry</button>
          </div>
        )}
      </section>
    </>
  );
};

export default NewsFeed;
