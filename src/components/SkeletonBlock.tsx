import React from 'react';

const styles = `
@keyframes shimmer {
  0%   { background-position:-600px 0; }
  100% { background-position: 600px 0; }
}
.skeleton { background:linear-gradient(90deg,#ebebeb 25%,#f5f5f5 50%,#ebebeb 75%); background-size:1200px 100%; animation:shimmer 1.5s ease-in-out infinite; border-radius:6px; }
.skel-headline { border-radius:12px; overflow:hidden; background:#fff; border:1px solid rgba(0,0,0,0.07); display:grid; grid-template-columns:1fr 1fr; min-height:260px; }
.skel-headline__image { border-radius:0; height:100%; min-height:260px; }
.skel-headline__body { padding:24px 26px; display:flex; flex-direction:column; justify-content:center; gap:10px; }
.skel-headline__src   { height:10px; width:70px; }
.skel-headline__title { height:20px; width:92%; }
.skel-headline__title--lg { height:22px; width:80%; }
.skel-headline__line  { height:13px; width:100%; }
.skel-headline__line--short { width:65%; }
.skel-headline__meta  { height:11px; width:130px; margin-top:6px; }
.skel-smalls { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.skel-double { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.skel-small { border-radius:10px; overflow:hidden; background:#fff; border:1px solid rgba(0,0,0,0.07); padding:14px; display:flex; gap:12px; align-items:flex-start; }
.skel-small--vertical { flex-direction:column; padding:0; }
.skel-small__image { flex-shrink:0; width:76px; height:76px; border-radius:8px; }
.skel-small__image--full { width:100%; height:auto; aspect-ratio:16/8; border-radius:0; }
.skel-small__body { flex:1; display:flex; flex-direction:column; gap:7px; padding-bottom:2px; }
.skel-small__body--padded { padding:14px 16px 16px; }
.skel-small__src   { height:10px; width:60px; }
.skel-small__title { height:13px; width:90%; }
.skel-small__title--short { width:65%; }
.skel-small__meta  { height:10px; width:90px; margin-top:4px; }
@media (max-width:768px) { .skel-smalls { grid-template-columns:repeat(2,1fr); } }
@media (max-width:520px) {
  .skel-smalls,.skel-double { grid-template-columns:1fr; }
  .skel-headline { grid-template-columns:1fr; }
  .skel-headline__image { min-height:180px; }
}
`;

interface Props { variant: 'headline' | 'smalls' | 'double'; }

const S: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);

const SkeletonBlock: React.FC<Props> = ({ variant }) => {
  if (variant === 'headline') {
    return (
      <>
        <style>{styles}</style>
        <div className="skel-headline" aria-hidden="true">
          <S className="skel-headline__image" />
          <div className="skel-headline__body">
            <S className="skel-headline__src" />
            <S className="skel-headline__title skel-headline__title--lg" />
            <S className="skel-headline__title" />
            <S className="skel-headline__line" />
            <S className="skel-headline__line" />
            <S className="skel-headline__line skel-headline__line--short" />
            <S className="skel-headline__meta" />
          </div>
        </div>
      </>
    );
  }

  if (variant === 'smalls') {
    return (
      <>
        <style>{styles}</style>
        <div className="skel-smalls" aria-hidden="true">
          {[0, 1, 2].map(i => (
            <div key={i} className="skel-small">
              <div className="skel-small__body">
                <S className="skel-small__src" />
                <S className="skel-small__title" />
                <S className="skel-small__title skel-small__title--short" />
                <S className="skel-small__meta" />
              </div>
              <S className="skel-small__image" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="skel-double" aria-hidden="true">
        {[0, 1].map(i => (
          <div key={i} className="skel-small skel-small--vertical">
            <S className="skel-small__image skel-small__image--full" />
            <div className="skel-small__body skel-small__body--padded">
              <S className="skel-small__src" />
              <S className="skel-small__title" />
              <S className="skel-small__title skel-small__title--short" />
              <S className="skel-small__meta" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default SkeletonBlock;
