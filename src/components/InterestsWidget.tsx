import React, { useState } from 'react';

const styles = `
.interests { background:#fff; border:1px solid rgba(0,0,0,0.08); border-radius:14px; padding:18px 18px 16px; position:relative; }
.interests__close { position:absolute; top:14px; right:14px; background:none; border:none; font-size:18px; color:rgba(0,0,0,0.35); cursor:pointer; line-height:1; padding:0 2px; transition:color 0.15s; }
.interests__close:hover { color:rgba(0,0,0,0.7); }
.interests__title { font-size:15px; font-weight:700; color:#111; margin-bottom:5px; }
.interests__desc { font-size:12.5px; color:rgba(0,0,0,0.5); line-height:1.5; margin-bottom:14px; }
.interests__chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px; }
.interests__chip { display:flex; align-items:center; gap:6px; padding:7px 13px; border-radius:22px; border:1.5px solid rgba(0,0,0,0.13); background:#fff; font-size:12.5px; font-weight:500; color:#222; cursor:pointer; transition:border-color 0.15s,background 0.15s,color 0.15s; }
.interests__chip:hover { border-color:rgba(0,0,0,0.28); }
.interests__chip--on { border-color:#6c6cff; background:rgba(108,108,255,0.07); color:#6c6cff; }
.interests__chip-icon { font-size:13px; }
.interests__save { width:100%; padding:11px; border-radius:10px; border:none; background:#222; color:#fff; font-size:13.5px; font-weight:600; cursor:pointer; transition:background 0.15s,opacity 0.15s; }
.interests__save:hover:not(:disabled) { background:#000; }
.interests__save:disabled { opacity:0.4; cursor:not-allowed; }
.interests__save--done { background:#1a8f5a; }
.interests__save--done:hover { background:#157a4d !important; }
`;

export const TOPICS = [
  { id: 'tech',          label: 'Tech & Science', icon: '🌐', categories: ['Technology', 'Science', 'Health'] },
  { id: 'business',      label: 'Business',        icon: '💲', categories: ['Business', 'World'] },
  { id: 'arts',          label: 'Arts & Culture',  icon: '🎨', categories: ['Culture'] },
  { id: 'sports',        label: 'Sports',           icon: '🏅', categories: ['Sports'] },
  { id: 'entertainment', label: 'Entertainment',   icon: '📺', categories: ['Politics'] },
];

interface Props {
  onClose:   () => void;
  onSave:    (categories: string[]) => void;
  savedIds?: Set<string>;
}

const InterestsWidget: React.FC<Props> = ({ onClose, onSave, savedIds }) => {
  const [selected, setSelected] = useState<Set<string>>(savedIds ?? new Set());
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setSaved(false);
  };

  const save = () => {
    const cats = Array.from(new Set(
      TOPICS.filter(t => selected.has(t.id)).flatMap(t => t.categories)
    ));
    onSave(cats);
    setSaved(true);
    setTimeout(onClose, 800);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="interests">
        <button className="interests__close" onClick={onClose} aria-label="Close">×</button>
        <h3 className="interests__title">Make it yours</h3>
        <p className="interests__desc">
          Select topics and interests to customize your Discover experience
        </p>
        <div className="interests__chips">
          {TOPICS.map(t => (
            <button
              key={t.id}
              className={`interests__chip ${selected.has(t.id) ? 'interests__chip--on' : ''}`}
              onClick={() => toggle(t.id)}
            >
              <span className="interests__chip-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <button
          className={`interests__save ${saved ? 'interests__save--done' : ''}`}
          onClick={save}
          disabled={selected.size === 0}
        >
          {saved ? 'Saved ✓' : 'Save Interests'}
        </button>
      </div>
    </>
  );
};

export default InterestsWidget;
