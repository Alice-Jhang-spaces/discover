import React from 'react';

const styles = `
.market { background:#fff; border:1px solid rgba(0,0,0,0.08); border-radius:14px; padding:16px 18px 14px; }
.market__section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.market__section-header--mt { margin-top:18px; }
.market__section-title { font-size:13px; font-weight:700; color:#111; }
.market__chevron { font-size:16px; color:rgba(0,0,0,0.35); cursor:pointer; }
.market__grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.market__card { background:#f7f7f7; border-radius:10px; padding:10px 12px 8px; overflow:hidden; }
.market__card-top { display:flex; justify-content:space-between; align-items:flex-start; gap:4px; margin-bottom:2px; }
.market__card-name { font-size:11px; color:rgba(0,0,0,0.5); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.market__card-pct { font-size:10.5px; font-weight:700; white-space:nowrap; flex-shrink:0; }
.market__card-price { font-size:13px; font-weight:700; color:#111; margin-bottom:1px; }
.market__card-change { font-size:11px; font-weight:500; margin-bottom:8px; }
.market__spark { width:100%; height:36px; display:block; }
.market__up   { color:#1a8f5a; }
.market__down { color:#e5383b; }
.market__trending { display:flex; flex-direction:column; gap:0; }
.market__row { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid rgba(0,0,0,0.05); }
.market__row:last-child { border-bottom:none; }
.market__logo { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; flex-shrink:0; letter-spacing:-0.5px; }
.market__row-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:1px; }
.market__row-name { font-size:12px; font-weight:600; color:#111; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.market__row-ticker { font-size:10.5px; color:rgba(0,0,0,0.4); }
.market__row-right { display:flex; flex-direction:column; align-items:flex-end; gap:1px; flex-shrink:0; }
.market__row-price { font-size:12px; font-weight:600; color:#111; }
.market__row-change { font-size:11px; font-weight:600; }
`;

function sparklinePath(values: number[], w: number, h: number): string {
  const min   = Math.min(...values);
  const max   = Math.max(...values);
  const range = max - min || 1;
  const step  = w / (values.length - 1);
  return values.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

interface MarketItem {
  name: string; fullName: string; price: string; change: string;
  pct: number; up: boolean; points: number[];
}

const MARKETS: MarketItem[] = [
  { name: 'S&P Futures',     fullName: 'S&P F...',     price: '$7,161.50',   change: '+$84.50',   pct: 1.19, up: true,  points: [62,58,55,60,63,61,65,68,66,70,72,71,75,78,77,82,80,84] },
  { name: 'NASDAQ Futures',  fullName: 'NASDAQ F...',  price: '$26,825.50',  change: '+$338.25',  pct: 1.28, up: true,  points: [50,53,51,55,58,57,62,60,65,63,68,70,67,73,75,72,78,80] },
  { name: 'Bitcoin',         fullName: 'Bitcoin',      price: '$77,428.87',  change: '+$2,484.87',pct: 3.32, up: true,  points: [40,44,42,48,45,50,53,51,58,55,62,60,65,68,66,72,70,76] },
  { name: 'VIX',             fullName: 'VIX',          price: '17.48',       change: '-0.46',     pct: 2.56, up: false, points: [80,75,78,72,70,74,68,65,70,63,60,65,58,55,60,52,50,48] },
];

const TRENDING = [
  { name: 'Netflix, Inc.',                 ticker: 'NFLX', logo: 'N', color: '#e50914', price: '$97.31',  change: '-9.72%',  up: false },
  { name: 'Albemarle Corporation',         ticker: 'ALB',  logo: 'A', color: '#2d6a4f', price: '$197.75', change: '-8.29%',  up: false },
  { name: 'Rocket Lab USA, Inc.',          ticker: 'RKLB', logo: 'R', color: '#1a1a2e', price: '$84.80',  change: '+2.25%',  up: true  },
  { name: 'ON Semiconductor Corporati...', ticker: 'ON',   logo: 'O', color: '#003087', price: '$83.01',  change: '+3.85%',  up: true  },
  { name: 'The Charles Schwab Corpora...', ticker: 'SCHW', logo: 'S', color: '#0057a8', price: '$92.28',  change: '-0.37%',  up: false },
];

const W = 90, H = 36;

const MarketWidget: React.FC = () => (
  <>
    <style>{styles}</style>
    <div className="market">
      <div className="market__section-header">
        <span className="market__section-title">Market Outlook</span>
        <span className="market__chevron">›</span>
      </div>
      <div className="market__grid">
        {MARKETS.map(m => {
          const path = sparklinePath(m.points, W, H);
          return (
            <div key={m.name} className="market__card">
              <div className="market__card-top">
                <span className="market__card-name">{m.fullName}</span>
                <span className={`market__card-pct ${m.up ? 'market__up' : 'market__down'}`}>
                  {m.up ? '↗' : '↘'} {m.pct.toFixed(2)}%
                </span>
              </div>
              <div className="market__card-price">{m.price}</div>
              <div className={`market__card-change ${m.up ? 'market__up' : 'market__down'}`}>{m.change}</div>
              <svg className="market__spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                <path d={path} fill="none" stroke={m.up ? '#1a8f5a' : '#e5383b'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          );
        })}
      </div>
      <div className="market__section-header market__section-header--mt">
        <span className="market__section-title">Trending Companies</span>
        <span className="market__chevron">›</span>
      </div>
      <div className="market__trending">
        {TRENDING.map(c => (
          <div key={c.ticker} className="market__row">
            <div className="market__logo" style={{ background: c.color }}>{c.logo}</div>
            <div className="market__row-info">
              <span className="market__row-name">{c.name}</span>
              <span className="market__row-ticker">{c.ticker}</span>
            </div>
            <div className="market__row-right">
              <span className="market__row-price">{c.price}</span>
              <span className={`market__row-change ${c.up ? 'market__up' : 'market__down'}`}>{c.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default MarketWidget;
