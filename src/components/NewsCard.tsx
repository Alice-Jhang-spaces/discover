import React, { useState, useEffect, useRef } from 'react';
import { postAction } from '../api/actions';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Article {
  id:          number;
  title:       string;
  summary:     string;
  category:    string;
  source:      string;
  publishedAt: string;
  imageUrl:    string;
  url:         string;
  readTime:    string;
}
export interface NewsResponse {
  articles: Article[];
  page:     number;
  limit:    number;
  total:    number;
  hasMore:  boolean;
}
export type ActionType = 'liked' | 'bookmarked' | 'inSpace' | 'disliked';
export interface ArticleActions {
  liked:      boolean;
  bookmarked: boolean;
  inSpace:    boolean;
  disliked:   boolean;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
export function formatTimeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
const CATEGORY_LABEL_MAP: Record<string, string> = {
  Technology: 'Tech & Science', Science: 'Tech & Science', Health: 'Tech & Science',
  Business: 'Business', World: 'Business', Culture: 'Arts & Culture',
  Sports: 'Sports', Politics: 'Entertainment',
};
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABEL_MAP[category] ?? category;
}
const CATEGORY_COLORS: Record<string, string> = {
  'Tech & Science': '#4da6ff', 'Business': '#fbbf24', 'Arts & Culture': '#a78bfa',
  'Sports': '#fb923c', 'Entertainment': '#f472b6',
};
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[getCategoryLabel(category)] ?? '#94a3b8';
}

const styles = `
.card { background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:12px; cursor:pointer; transition:box-shadow 0.18s ease,border-color 0.18s ease; display:flex; flex-direction:column; }
.card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.09); border-color:rgba(0,0,0,0.13); }
.card__link { display:contents; text-decoration:none; color:inherit; }
.card__img-wrap { position:relative; overflow:hidden; }
.card__img-wrap--16-8 { aspect-ratio:16/8; width:100%; }
.card__img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.4s ease; }
.card:hover .card__img { transform:scale(1.04); }
.card__thumb-wrap { flex-shrink:0; width:76px; height:76px; border-radius:8px; overflow:hidden; }
.card__thumb { width:100%; height:100%; object-fit:cover; transition:transform 0.35s ease; }
.card:hover .card__thumb { transform:scale(1.06); }
.card__badge { font-size:10px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; color:var(--cat); }
.card__badge--overlay { position:absolute; top:10px; left:10px; padding:3px 9px; border-radius:20px; background:#fff; box-shadow:0 1px 6px rgba(0,0,0,0.15); }
.card__badge--inline { display:inline; }
.card__body { display:flex; flex-direction:column; gap:5px; padding:16px 18px; flex:1; min-width:0; }
.card__source-label { font-size:10.5px; font-weight:600; color:rgba(0,0,0,0.38); text-transform:uppercase; letter-spacing:0.4px; }
.card__title { margin:0; font-weight:700; line-height:1.35; letter-spacing:-0.2px; color:#111; }
.card__title--lg { font-size:clamp(17px,1.8vw,22px); }
.card__title--md { font-size:14.5px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
.card__title--sm { font-size:13.5px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
.card__summary { margin:0; font-size:13.5px; line-height:1.65; color:rgba(0,0,0,0.52); display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden; }
.card__summary--clamp2 { -webkit-line-clamp:2; font-size:12.5px; }
.card__tags { display:flex; align-items:center; gap:5px; flex-wrap:wrap; margin-top:2px; }
.card__meta { display:flex; align-items:center; gap:5px; font-size:11.5px; color:rgba(0,0,0,0.38); margin-top:auto; padding-top:6px; }
.card__source { font-weight:600; color:rgba(0,0,0,0.55); }
.card__dot { opacity:0.35; }
.card__time,.card__read { color:rgba(0,0,0,0.38); }
.card__actions { display:flex; align-items:center; justify-content:flex-end; gap:2px; padding:5px 10px 8px; border-top:1px solid rgba(0,0,0,0.05); flex-shrink:0; }
.card__action-btn { display:flex; align-items:center; justify-content:center; width:28px; height:28px; padding:0; border:none; background:none; border-radius:6px; cursor:pointer; color:rgba(0,0,0,0.32); transition:background 0.14s ease,color 0.14s ease; }
.card__action-btn:hover { background:rgba(0,0,0,0.06); color:rgba(0,0,0,0.65); }
.card__action-btn--liked { color:#e5383b; }
.card__action-btn--liked:hover { background:rgba(229,56,59,0.08); color:#c0272a; }
.card__more-wrap { position:relative; }
.card__more-menu { position:absolute; bottom:calc(100% + 6px); right:0; list-style:none; margin:0; padding:5px; background:#fff; border:1px solid rgba(0,0,0,0.08); border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.12),0 1px 4px rgba(0,0,0,0.06); min-width:160px; z-index:200; }
.card__menu-item { display:flex; align-items:center; gap:9px; width:100%; padding:8px 11px; background:none; border:none; border-radius:8px; font-size:13px; font-weight:500; color:#111; cursor:pointer; text-align:left; white-space:nowrap; transition:background 0.12s ease; }
.card__menu-item:hover { background:rgba(0,0,0,0.05); }
.card__menu-item--on { color:#4da6ff; }
.card__menu-item--danger { color:rgba(0,0,0,0.55); }
.card__menu-item--danger:hover { color:#e5383b; background:rgba(229,56,59,0.06); }
.card__menu-item--danger.card__menu-item--on { color:#e5383b; }
.card--headline .card__link { display:grid; grid-template-columns:1fr 1fr; min-height:260px; }
.card--headline .card__img-wrap { min-height:260px; border-radius:11px 0 0 11px; }
.card--headline .card__body { justify-content:center; padding:24px 26px; gap:10px; }
.card--headline .card__summary { -webkit-line-clamp:5; }
.card--small .card__link { display:flex; flex-direction:row; align-items:flex-start; gap:12px; padding:14px; flex:1; }
.card--small .card__body { padding:0; gap:4px; }
.card--stacked .card__link { display:flex; flex-direction:column; flex:1; }
.card--stacked .card__img-wrap { border-radius:11px 11px 0 0; }
.card--stacked .card__body { gap:6px; }
@media (max-width:640px) {
  .card--headline .card__link { grid-template-columns:1fr; }
  .card--headline .card__img-wrap { min-height:unset; aspect-ratio:16/8; border-radius:11px 11px 0 0; }
  .card--headline .card__summary { display:none; }
}
`;

export type CardVariant = 'headline' | 'small' | 'left' | 'right';

interface NewsCardProps { article: Article; variant: CardVariant; }

const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const DotsIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);

const BookmarkIcon: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const PlusIcon: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const DislikeIcon: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
);

const EMPTY_ACTIONS: ArticleActions = { liked: false, bookmarked: false, inSpace: false, disliked: false };

const ActionsBar: React.FC<{ articleId: string }> = ({ articleId }) => {
  const [actions,  setActions]  = useState<ArticleActions>(EMPTY_ACTIONS);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [moreOpen]);

  const toggle = async (key: ActionType) => {
    const next = !actions[key];
    setActions(prev => ({ ...prev, [key]: next }));
    try { await postAction(articleId, key, next); }
    catch { setActions(prev => ({ ...prev, [key]: !next })); }
  };

  const handleMenu = (key: ActionType) => { toggle(key); setMoreOpen(false); };

  return (
    <div className="card__actions">
      <button className={`card__action-btn${actions.liked ? ' card__action-btn--liked' : ''}`} onClick={() => toggle('liked')} aria-label={actions.liked ? 'Unlike' : 'Like'} title={actions.liked ? 'Unlike' : 'Like'}>
        <HeartIcon filled={actions.liked} />
      </button>
      <div className="card__more-wrap" ref={moreRef}>
        <button className="card__action-btn" onClick={() => setMoreOpen(o => !o)} aria-label="More options" aria-haspopup="menu" aria-expanded={moreOpen}>
          <DotsIcon />
        </button>
        {moreOpen && (
          <ul className="card__more-menu" role="menu">
            <li role="none">
              <button className={`card__menu-item${actions.bookmarked ? ' card__menu-item--on' : ''}`} role="menuitem" onClick={() => handleMenu('bookmarked')}>
                <BookmarkIcon />{actions.bookmarked ? 'Saved' : 'Bookmark'}
              </button>
            </li>
            <li role="none">
              <button className={`card__menu-item${actions.inSpace ? ' card__menu-item--on' : ''}`} role="menuitem" onClick={() => handleMenu('inSpace')}>
                <PlusIcon />{actions.inSpace ? 'In Space' : 'Add to Space'}
              </button>
            </li>
            <li role="none">
              <button className={`card__menu-item card__menu-item--danger${actions.disliked ? ' card__menu-item--on' : ''}`} role="menuitem" onClick={() => handleMenu('disliked')}>
                <DislikeIcon />{actions.disliked ? 'Disliked' : 'Dislike'}
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

const CategoryBadge: React.FC<{ category: string; overlay?: boolean }> = ({ category, overlay = false }) => (
  <span
    className={`card__badge ${overlay ? 'card__badge--overlay' : 'card__badge--inline'}`}
    style={{ '--cat': getCategoryColor(category) } as React.CSSProperties}
  >
    {getCategoryLabel(category)}
  </span>
);

const MetaRow: React.FC<{ article: Article }> = ({ article }) => (
  <footer className="card__meta">
    <span className="card__source">{article.source}</span>
    <span className="card__dot">·</span>
    <time className="card__time" dateTime={article.publishedAt}>{formatTimeAgo(article.publishedAt)}</time>
    <span className="card__dot">·</span>
    <span className="card__read">{article.readTime}</span>
  </footer>
);

const HeadlineCard: React.FC<{ article: Article }> = ({ article }) => (
  <article className="card card--headline">
    <a href={article.url} className="card__link">
      <div className="card__img-wrap">
        <img className="card__img" src={article.imageUrl} alt={article.title} loading="eager" />
        <CategoryBadge category={article.category} overlay />
      </div>
      <div className="card__body">
        <span className="card__source-label">{article.source}</span>
        <h2 className="card__title card__title--lg">{article.title}</h2>
        <p className="card__summary">{article.summary}</p>
        <MetaRow article={article} />
      </div>
    </a>
    <ActionsBar articleId={String(article.id)} />
  </article>
);

const SmallCard: React.FC<{ article: Article }> = ({ article }) => (
  <article className="card card--small">
    <a href={article.url} className="card__link">
      <div className="card__body">
        <span className="card__source-label">{article.source}</span>
        <h3 className="card__title card__title--sm">{article.title}</h3>
        <div className="card__tags">
          <CategoryBadge category={article.category} />
          <span className="card__dot">·</span>
          <time className="card__time" dateTime={article.publishedAt}>{formatTimeAgo(article.publishedAt)}</time>
        </div>
      </div>
      <div className="card__thumb-wrap">
        <img className="card__thumb" src={article.imageUrl} alt="" loading="lazy" />
      </div>
    </a>
    <ActionsBar articleId={String(article.id)} />
  </article>
);

const StackedCard: React.FC<{ article: Article }> = ({ article }) => (
  <article className="card card--stacked">
    <a href={article.url} className="card__link">
      <div className="card__img-wrap card__img-wrap--16-8">
        <img className="card__img" src={article.imageUrl} alt={article.title} loading="lazy" />
        <CategoryBadge category={article.category} overlay />
      </div>
      <div className="card__body">
        <span className="card__source-label">{article.source}</span>
        <h3 className="card__title card__title--md">{article.title}</h3>
        <p className="card__summary card__summary--clamp2">{article.summary}</p>
        <MetaRow article={article} />
      </div>
    </a>
    <ActionsBar articleId={String(article.id)} />
  </article>
);

const NewsCard: React.FC<NewsCardProps> = ({ article, variant }) => {
  switch (variant) {
    case 'headline': return <><style>{styles}</style><HeadlineCard article={article} /></>;
    case 'small':    return <><style>{styles}</style><SmallCard    article={article} /></>;
    case 'left':
    case 'right':    return <><style>{styles}</style><StackedCard  article={article} /></>;
  }
};

export default NewsCard;
