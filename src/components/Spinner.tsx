import React from 'react';

const styles = `
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { display:flex; flex-direction:column; align-items:center; gap:10px; padding:28px 0; }
.spinner__ring { width:32px; height:32px; border:3px solid rgba(0,0,0,0.08); border-top-color:rgba(0,0,0,0.45); border-radius:50%; animation:spin 0.75s linear infinite; }
.spinner__text { font-size:12px; color:rgba(0,0,0,0.35); letter-spacing:0.2px; }
`;

const Spinner: React.FC = () => (
  <>
    <style>{styles}</style>
    <div className="spinner" role="status" aria-label="Loading more articles">
      <div className="spinner__ring" />
      <span className="spinner__text">Loading more…</span>
    </div>
  </>
);

export default Spinner;
