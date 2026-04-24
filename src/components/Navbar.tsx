import React, { useState, useRef, useEffect, useCallback } from 'react';

const styles = `
@keyframes dropdown-in {
  from { opacity:0; transform:translateY(-6px); }
  to   { opacity:1; transform:translateY(0); }
}
.navbar { position:sticky; top:0; z-index:100; background:rgba(255,255,255,0.95); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border-bottom:1px solid rgba(0,0,0,0.08); padding:0 28px; display:grid; grid-template-columns:1fr auto 1fr; align-items:center; height:52px; }
.navbar__brand { font-size:16px; font-weight:700; color:#111; letter-spacing:-0.3px; justify-self:start; }
.navbar__tabs { display:flex; align-items:center; gap:0; justify-self:center; }
.navbar__tab { position:relative; background:none; border:none; cursor:pointer; padding:0 16px; height:52px; font-size:14px; font-weight:500; color:rgba(0,0,0,0.45); white-space:nowrap; display:flex; align-items:center; gap:4px; transition:color 0.15s ease; }
.navbar__tab:hover { color:rgba(0,0,0,0.85); }
.navbar__tab--active { color:#111; font-weight:600; }
.navbar__tab--active::after { content:''; position:absolute; bottom:0; left:16px; right:16px; height:2px; background:#111; border-radius:2px 2px 0 0; }
.navbar__topics-wrap { position:relative; }
.navbar__tab--topics { gap:3px; }
.navbar__chevron { width:14px; height:14px; transition:transform 0.2s ease; flex-shrink:0; }
.navbar__chevron--open { transform:rotate(180deg); }
.navbar__dropdown { position:absolute; top:calc(100% + 4px); left:0; background:#fff; border:1px solid rgba(0,0,0,0.1); border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,0.12),0 2px 8px rgba(0,0,0,0.06); padding:6px; min-width:180px; animation:dropdown-in 0.15s ease both; z-index:200; }
.navbar__dropdown-item--active { background:rgba(108,108,255,0.08); color:#6c6cff; font-weight:600; }
.navbar__dropdown-item { display:flex; align-items:center; gap:10px; width:100%; padding:9px 12px; border-radius:8px; border:none; background:none; font-size:13.5px; font-weight:500; color:#222; cursor:pointer; text-align:left; transition:background 0.12s ease; }
.navbar__dropdown-item:hover { background:rgba(0,0,0,0.05); }
.navbar__dropdown-icon { font-size:15px; width:20px; text-align:center; }
.navbar__actions { display:flex; align-items:center; gap:8px; justify-self:end; }
.navbar__tooltip-wrap { position:relative; display:flex; }
.navbar__tooltip { position:absolute; top:calc(100% + 8px); right:0; background:#111; color:#fff; font-size:12.5px; font-weight:500; padding:6px 10px; border-radius:8px; white-space:nowrap; pointer-events:none; opacity:0; transform:translateY(-4px); transition:opacity 0.15s ease,transform 0.15s ease; z-index:300; }
.navbar__tooltip-wrap:hover .navbar__tooltip { opacity:1; transform:translateY(0); }
.navbar__icon-btn { width:34px; height:34px; border-radius:8px; border:1px solid rgba(0,0,0,0.12); background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.15s ease; color:#333; }
.navbar__icon-btn svg { width:16px; height:16px; }
.navbar__icon-btn:hover { background:rgba(0,0,0,0.05); }
.navbar__share-wrap { position:relative; }
.navbar__share-btn { display:flex; align-items:center; gap:6px; padding:7px 14px; border-radius:8px; border:1px solid rgba(0,0,0,0.12); background:#fff; font-size:13px; font-weight:600; color:#111; cursor:pointer; transition:background 0.15s ease; }
.navbar__share-btn:hover { background:rgba(0,0,0,0.05); }
.navbar__share-dropdown { position:absolute; top:calc(100% + 6px); right:0; background:#fff; border:1px solid rgba(0,0,0,0.1); border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,0.12),0 2px 8px rgba(0,0,0,0.06); padding:6px; min-width:160px; z-index:200; animation:dropdown-in 0.15s ease both; }
.navbar__share-item { display:flex; align-items:center; gap:10px; width:100%; padding:9px 12px; border-radius:8px; border:none; background:none; font-size:13.5px; font-weight:500; color:#222; cursor:pointer; text-align:left; transition:background 0.12s ease; white-space:nowrap; }
.navbar__share-item:hover { background:rgba(0,0,0,0.05); }
`;

type Tab = 'for-you' | 'top' | 'topics';

const TOPIC_LIST = [
  { id: 'tech',          label: 'Tech & Science', icon: '🌐' },
  { id: 'business',      label: 'Business',        icon: '💲' },
  { id: 'arts',          label: 'Arts & Culture',  icon: '🎨' },
  { id: 'sports',        label: 'Sports',           icon: '🏅' },
  { id: 'entertainment', label: 'Entertainment',   icon: '📺' },
];

interface Props {
  showFilter:    boolean;
  onFilterClick: () => void;
  onTopicSelect: (topicLabel: string | null) => void;
  activeTopic:   string | null;
}

const Navbar: React.FC<Props> = ({ showFilter, onFilterClick, onTopicSelect, activeTopic }) => {
  const [activeTab,  setActiveTab]  = useState<Tab>('for-you');
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [shareOpen,  setShareOpen]  = useState(false);
  const [copied,     setCopied]     = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shareRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setTopicsOpen(false);
      if (shareRef.current    && !shareRef.current.contains(e.target as Node))    setShareOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); setShareOpen(false); }, 1500);
    });
  }, []);

  const handleForYou = () => { setActiveTab('for-you'); setTopicsOpen(false); onTopicSelect(null); };
  const handleTop    = () => { setActiveTab('top');     setTopicsOpen(false); onTopicSelect(null); };
  const handleTopicClick = (label: string) => { setActiveTab('topics'); setTopicsOpen(false); onTopicSelect(label); };

  return (
    <>
      <style>{styles}</style>
      <header className="navbar">
        <span className="navbar__brand">Discover</span>

        <nav className="navbar__tabs" role="navigation">
          <button className={`navbar__tab ${activeTab === 'for-you' ? 'navbar__tab--active' : ''}`} onClick={handleForYou}>For You</button>
          <button className={`navbar__tab ${activeTab === 'top'     ? 'navbar__tab--active' : ''}`} onClick={handleTop}>Top</button>

          <div className="navbar__topics-wrap" ref={dropdownRef}>
            <button
              className={`navbar__tab navbar__tab--topics ${activeTab === 'topics' ? 'navbar__tab--active' : ''}`}
              onClick={() => setTopicsOpen(o => !o)}
              aria-haspopup="listbox" aria-expanded={topicsOpen}
            >
              {activeTopic ?? 'Topics'}
              <svg className={`navbar__chevron ${topicsOpen ? 'navbar__chevron--open' : ''}`} viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {topicsOpen && (
              <div className="navbar__dropdown" role="listbox">
                {TOPIC_LIST.map(t => (
                  <button
                    key={t.id}
                    className={`navbar__dropdown-item ${activeTopic === t.label ? 'navbar__dropdown-item--active' : ''}`}
                    role="option" aria-selected={activeTopic === t.label}
                    onClick={() => handleTopicClick(t.label)}
                  >
                    <span className="navbar__dropdown-icon">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="navbar__actions">
          {showFilter && (
            <div className="navbar__tooltip-wrap">
              <button className="navbar__icon-btn" aria-label="Personalize Discover" onClick={onFilterClick}>
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <div className="navbar__tooltip">Personalize Discover</div>
            </div>
          )}
          <div className="navbar__share-wrap" ref={shareRef}>
            <button className="navbar__share-btn" onClick={() => setShareOpen(o => !o)} aria-haspopup="true" aria-expanded={shareOpen}>
              <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                <path d="M14 3l3 3-3 3M17 6H8a5 5 0 000 10h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Share
            </button>
            {shareOpen && (
              <div className="navbar__share-dropdown">
                <button className="navbar__share-item" onClick={handleCopyLink}>
                  <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
                    <path d="M8 4H5a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M12 2h6m0 0v6m0-6L9 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
