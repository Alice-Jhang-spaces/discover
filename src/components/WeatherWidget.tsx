import React from 'react';

const styles = `
.weather { background:#fff; border:1px solid rgba(0,0,0,0.08); border-radius:14px; padding:16px 18px 14px; }
.weather__top { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
.weather__current { display:flex; align-items:center; gap:6px; }
.weather__icon { font-size:18px; }
.weather__temp { font-size:17px; font-weight:600; color:#111; }
.weather__unit { font-size:13px; font-weight:400; color:rgba(0,0,0,0.4); }
.weather__condition { font-size:13px; color:rgba(0,0,0,0.45); }
.weather__location-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.weather__location { font-size:13px; color:rgba(0,0,0,0.55); }
.weather__hl { font-size:12px; color:rgba(0,0,0,0.4); }
.weather__divider { height:1px; background:rgba(0,0,0,0.07); margin-bottom:12px; }
.weather__forecast { display:flex; justify-content:space-between; }
.weather__day { display:flex; flex-direction:column; align-items:center; gap:4px; }
.weather__day-icon { font-size:18px; }
.weather__day-temp { font-size:12.5px; font-weight:600; color:#111; }
.weather__day-label { font-size:11px; color:rgba(0,0,0,0.4); }
`;

const FORECAST = [
  { day: 'Fri', icon: '⛅', high: 73 },
  { day: 'Sat', icon: '⛅', high: 77 },
  { day: 'Sun', icon: '⛅', high: 78 },
  { day: 'Mon', icon: '☁️',  high: 72 },
  { day: 'Tue', icon: '🌧️', high: 61 },
];

const WeatherWidget: React.FC = () => (
  <>
    <style>{styles}</style>
    <div className="weather">
      <div className="weather__top">
        <div className="weather__current">
          <span className="weather__icon">☀️</span>
          <span className="weather__temp">72° <span className="weather__unit">F/C</span></span>
        </div>
        <span className="weather__condition">Sunny</span>
      </div>
      <div className="weather__location-row">
        <span className="weather__location">Carmichael</span>
        <span className="weather__hl">H: 73° L: 47°</span>
      </div>
      <div className="weather__divider" />
      <div className="weather__forecast">
        {FORECAST.map(f => (
          <div key={f.day} className="weather__day">
            <span className="weather__day-icon">{f.icon}</span>
            <span className="weather__day-temp">{f.high}°</span>
            <span className="weather__day-label">{f.day}</span>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default WeatherWidget;
