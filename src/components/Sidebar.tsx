import React           from 'react';
import InterestsWidget from './InterestsWidget';
import WeatherWidget   from './WeatherWidget';
import MarketWidget    from './MarketWidget';

const styles = `
.sidebar { width:300px; flex-shrink:0; display:flex; flex-direction:column; gap:12px; padding:20px 0 80px; position:sticky; top:52px; max-height:calc(100vh - 52px); overflow-y:auto; scrollbar-width:none; }
.sidebar::-webkit-scrollbar { display:none; }
@media (max-width:900px) { .sidebar { display:none; } }
`;

interface Props {
  showInterests:  boolean;
  savedTopicIds?: Set<string>;
  onClose:        () => void;
  onSave:         (categories: string[]) => void;
}

const Sidebar: React.FC<Props> = ({ showInterests, savedTopicIds, onClose, onSave }) => (
  <>
    <style>{styles}</style>
    <aside className="sidebar">
      {showInterests && (
        <InterestsWidget onClose={onClose} onSave={onSave} savedIds={savedTopicIds} />
      )}
      <WeatherWidget />
      <MarketWidget  />
    </aside>
  </>
);

export default Sidebar;
