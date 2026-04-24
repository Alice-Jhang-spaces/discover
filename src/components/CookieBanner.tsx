import React, { useState, useEffect } from 'react';

const styles = `
@keyframes cookie-slide-up {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
.cookie-banner { position:fixed; bottom:24px; right:24px; z-index:999; width:380px; animation:cookie-slide-up 0.35s cubic-bezier(0.34,1.3,0.64,1) both; }
.cookie-banner__card { background:#fff; border:1px solid rgba(0,0,0,0.1); border-radius:18px; padding:22px 22px 18px; box-shadow:0 8px 40px rgba(0,0,0,0.14),0 2px 8px rgba(0,0,0,0.06); }
.cookie-banner__header { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.cookie-banner__icon { font-size:18px; line-height:1; }
.cookie-banner__title { font-size:15px; font-weight:700; color:#111; }
.cookie-banner__body { font-size:13.5px; line-height:1.6; color:rgba(0,0,0,0.6); margin-bottom:18px; }
.cookie-banner__link { color:rgba(0,0,0,0.6); text-decoration:underline; text-underline-offset:2px; }
.cookie-banner__link:hover { color:#111; }
.cookie-banner__actions { display:flex; gap:10px; }
.cookie-banner__btn { flex:1; padding:11px 14px; border-radius:12px; font-size:13.5px; font-weight:600; cursor:pointer; transition:background 0.15s ease,opacity 0.15s ease; border:none; }
.cookie-banner__btn--primary { background:#111; color:#fff; }
.cookie-banner__btn--primary:hover { background:#000; }
.cookie-banner__btn--secondary { background:rgba(0,0,0,0.07); color:#111; }
.cookie-banner__btn--secondary:hover { background:rgba(0,0,0,0.12); }
@media (max-width:520px) {
  .cookie-banner { bottom:12px; }
  .cookie-banner__actions { flex-direction:column; }
}
`;

const STORAGE_KEY = 'cookie_consent';

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = (type: 'necessary' | 'all') => {
    localStorage.setItem(STORAGE_KEY, type);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="cookie-banner" role="dialog" aria-modal="false" aria-label="Cookie Policy">
        <div className="cookie-banner__card">
          <div className="cookie-banner__header">
            <span className="cookie-banner__icon" aria-hidden="true">🍪</span>
            <h2 className="cookie-banner__title">Cookie Policy</h2>
          </div>
          <p className="cookie-banner__body">
            We use cookies to enhance your experience. By clicking &ldquo;Accept All
            Cookies&rdquo; or selecting &ldquo;Necessary Cookies&rdquo;, you agree to our{' '}
            <a href="#" className="cookie-banner__link">privacy policy</a>.
          </p>
          <div className="cookie-banner__actions">
            <button className="cookie-banner__btn cookie-banner__btn--primary" onClick={() => accept('necessary')}>
              Necessary Cookies
            </button>
            <button className="cookie-banner__btn cookie-banner__btn--secondary" onClick={() => accept('all')}>
              Accept All Cookies
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieBanner;
