import React, { useState, useEffect } from 'react';

const styles = `
@keyframes fadeUp {
  from { opacity:0; transform:translateX(-50%) translateY(8px); }
  to   { opacity:1; transform:translateX(-50%) translateY(0); }
}
.scroll-top {
  position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
  z-index:200; width:40px; height:40px; border-radius:50%;
  border:1px solid rgba(0,0,0,0.12); background:#fff;
  box-shadow:0 2px 12px rgba(0,0,0,0.12); font-size:18px; color:#333;
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition:box-shadow 0.2s, transform 0.2s; animation:fadeUp 0.2s ease both;
}
.scroll-top:hover { box-shadow:0 4px 20px rgba(0,0,0,0.18); transform:translateX(-50%) translateY(-2px); }
`;

const SHOW_AFTER_PX = 400;

const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{styles}</style>
      <button
        className="scroll-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </>
  );
};

export default ScrollToTop;
