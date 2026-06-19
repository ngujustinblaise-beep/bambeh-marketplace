/**
 * BambehSuccessAnimation.tsx â€” Bambeh figure sets down load, thumbs up.
 * USAGE: <BambehSuccessAnimation visible={showSuccess} onComplete={() => setShowSuccess(false)} message="Load delivered!" />
 */

import React, { useEffect, useState, useRef } from 'react';

type Variant = 'overlay' | 'inline';

interface BambehSuccessAnimationProps {
  visible: boolean;
  message?: string;
  subMessage?: string;
  onComplete?: () => void;
  variant?: Variant;
}

interface Particle {
  id: number; x: number; vx: number; vy: number; color: string;
  size: number; rotation: number; rotationSpeed: number; shape: 'rect' | 'circle' | 'star';
}

const CONFETTI_COLORS = ['#FFD700', '#D4A017', '#FFF8E7', '#B8960C', '#FFFACC', '#8B6F0A', '#F0C040'];

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    vx: (Math.random() - 0.5) * 3,
    vy: -(3 + Math.random() * 4),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 5 + Math.random() * 6,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 8,
    shape: (['rect', 'circle', 'star'] as const)[Math.floor(Math.random() * 3)],
  }));
}

function BambehFigureSVG({ phase }: { phase: number }) {
  return (
    <svg viewBox="0 0 100 160" width="120" height="192"
      style={{ filter: 'drop-shadow(0 8px 24px rgba(184,150,12,0.5))', transition: 'transform 0.4s ease', transform: phase === 1 ? 'scaleX(1.05)' : 'scaleX(1)' }}
    >
      <defs>
        <radialGradient id="sa-skin" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#D4A017" /><stop offset="100%" stopColor="#8B6F0A" />
        </radialGradient>
        <radialGradient id="sa-load" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="rgba(255,248,231,0.25)" /><stop offset="100%" stopColor="rgba(255,248,231,0.08)" />
        </radialGradient>
      </defs>
      {phase === 0 && (
        <g>
          <rect x="22" y="10" width="56" height="18" rx="4" fill="url(#sa-load)" stroke="#D4A017" strokeWidth="1.5" />
          <rect x="30" y="16" width="18" height="12" rx="3" fill="rgba(255,255,255,0.15)" stroke="#B8960C" strokeWidth="1.2" />
          <circle cx="50" cy="42" r="10" fill="url(#sa-skin)" />
          <circle cx="46" cy="40" r="1.5" fill="#3D2800" /><circle cx="54" cy="40" r="1.5" fill="#3D2800" />
          <path d="M45 45 Q50 47 55 45" stroke="#3D2800" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M44 52 Q50 54 56 52 L58 78 Q50 82 42 78 Z" fill="#B8960C" />
          <path d="M44 53 Q36 40 32 28" stroke="#D4A017" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M56 53 Q64 40 68 28" stroke="#B8960C" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M46 78 Q42 100 40 120" stroke="#D4A017" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M54 78 Q58 100 60 120" stroke="#B8960C" strokeWidth="9" strokeLinecap="round" fill="none" />
          <ellipse cx="38" cy="122" rx="10" ry="5" fill="#8B6F0A" /><ellipse cx="62" cy="122" rx="10" ry="5" fill="#8B6F0A" />
        </g>
      )}
      {phase === 1 && (
        <g>
          <g style={{ transform: 'translateY(30px) rotate(8deg)', transformOrigin: '50px 30px' }}>
            <rect x="18" y="30" width="56" height="18" rx="4" fill="url(#sa-load)" stroke="#D4A017" strokeWidth="1.5" opacity="0.7" />
          </g>
          <circle cx="50" cy="52" r="10" fill="url(#sa-skin)" />
          <path d="M44 49 Q46 47 48 49" stroke="#3D2800" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M52 49 Q54 47 56 49" stroke="#3D2800" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M44 56 L56 56" stroke="#3D2800" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M42 62 Q50 60 58 62 L60 84 Q50 88 40 84 Z" fill="#B8960C" />
          <path d="M42 63 Q34 55 30 45" stroke="#D4A017" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M58 63 Q66 55 70 45" stroke="#B8960C" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M44 84 Q36 104 32 124" stroke="#D4A017" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M56 84 Q64 104 68 124" stroke="#B8960C" strokeWidth="9" strokeLinecap="round" fill="none" />
          <ellipse cx="30" cy="126" rx="10" ry="5" fill="#8B6F0A" /><ellipse cx="70" cy="126" rx="10" ry="5" fill="#8B6F0A" />
        </g>
      )}
      {phase === 2 && (
        <g>
          <circle cx="50" cy="38" r="10" fill="url(#sa-skin)" />
          <circle cx="46" cy="36" r="1.5" fill="#3D2800" />
          <path d="M52 35 Q54 33 56 35" stroke="#3D2800" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M44 42 Q50 46 56 42" stroke="#3D2800" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M44 48 Q50 50 56 48 L58 72 Q50 76 42 72 Z" fill="#B8960C" />
          <path d="M44 50 Q38 40 34 32 Q36 30 40 31" stroke="#D4A017" strokeWidth="7" strokeLinecap="round" fill="none" />
          <ellipse cx="40" cy="30" rx="7" ry="4" fill="#D4A017" transform="rotate(-20 40 30)" />
          <path d="M56 50 Q62 60 64 70" stroke="#B8960C" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M46 72 Q44 94 42 116" stroke="#D4A017" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M54 72 Q56 94 58 116" stroke="#B8960C" strokeWidth="9" strokeLinecap="round" fill="none" />
          <ellipse cx="40" cy="118" rx="10" ry="5" fill="#8B6F0A" /><ellipse cx="60" cy="118" rx="10" ry="5" fill="#8B6F0A" />
        </g>
      )}
      {phase === 3 && (
        <g>
          <circle cx="50" cy="36" r="11" fill="url(#sa-skin)" />
          <path d="M44 33 Q46 31 48 33" stroke="#3D2800" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M52 33 Q54 31 56 33" stroke="#3D2800" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M43 40 Q50 46 57 40" stroke="#3D2800" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M44 47 Q50 49 56 47 L57 70 Q50 74 43 70 Z" fill="#B8960C" />
          <path d="M56 48 Q66 44 72 36" stroke="#D4A017" strokeWidth="8" strokeLinecap="round" fill="none" />
          <g transform="translate(68, 28)">
            <rect x="0" y="4" width="10" height="8" rx="2" fill="#D4A017" stroke="#8B6F0A" strokeWidth="1" />
            <path d="M3 4 Q3 -1 6 -4 Q9 -4 8 0 L8 4" fill="#D4A017" stroke="#8B6F0A" strokeWidth="1" strokeLinejoin="round" />
          </g>
          <path d="M44 48 Q36 52 32 62" stroke="#B8960C" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M46 70 Q44 92 43 114" stroke="#D4A017" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M54 70 Q56 92 57 114" stroke="#B8960C" strokeWidth="9" strokeLinecap="round" fill="none" />
          <ellipse cx="41" cy="116" rx="10" ry="5" fill="#8B6F0A" /><ellipse cx="59" cy="116" rx="10" ry="5" fill="#8B6F0A" />
          {[[-18, -12], [20, -8], [-14, 8], [22, 10]].map(([dx, dy], i) => (
            <g key={i} transform={`translate(${50 + dx}, ${36 + dy})`}>
              <text fontSize="8" textAnchor="middle" dominantBaseline="middle" fill="#FFD700">â˜…</text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

export default function BambehSuccessAnimation({
  visible,
  message = 'Load delivered! You did it, partner.',
  subMessage,
  onComplete,
  variant = 'overlay',
}: BambehSuccessAnimationProps) {
  const [phase, setPhase] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [particlePositions, setParticlePositions] = useState<{ x: number; y: number; rotation: number }[]>([]);
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const phaseTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setExiting(false);
      setPhase(0);
      const p = createParticles(32);
      setParticles(p);
      setParticlePositions(p.map(pt => ({ x: pt.x, y: 85, rotation: pt.rotation })));
      const t1 = setTimeout(() => setPhase(1), 600);
      const t2 = setTimeout(() => setPhase(2), 1400);
      const t3 = setTimeout(() => setPhase(3), 2200);
      phaseTimersRef.current = [t1, t2, t3];
      startTimeRef.current = performance.now();
      const animate = (now: number) => {
        const elapsed = (now - startTimeRef.current) / 1000;
        setParticlePositions(prev =>
          prev.map((pos, i) => {
            const pt = p[i];
            return {
              x: pos.x + pt.vx * 0.4,
              y: Math.max(-10, pos.y + pt.vy * 0.4 + 0.1 * elapsed * 9.8 * 0.4),
              rotation: pos.rotation + pt.rotationSpeed,
            };
          })
        );
        rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    } else if (mounted) {
      setExiting(true);
      const exitTimer = setTimeout(() => {
        setMounted(false);
        setExiting(false);
        cancelAnimationFrame(rafRef.current);
        onComplete?.();
      }, 600);
      phaseTimersRef.current.push(exitTimer);
    }
    return () => {
      phaseTimersRef.current.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!mounted) return null;

  const isOverlay = variant === 'overlay';
  const containerStyle: React.CSSProperties = isOverlay ? {
    position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'rgba(10,8,2,0.88)', backdropFilter: 'blur(8px)',
    opacity: exiting ? 0 : 1, transition: 'opacity 0.5s ease',
  } : {
    position: 'relative', width: '100%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '32px 16px', opacity: exiting ? 0 : 1, transition: 'opacity 0.5s ease',
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes sa-pop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes sa-slide-up { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes sa-ring-expand { 0%{transform:scale(0.8);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
        .sa-figure-wrap{animation:sa-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both}
        .sa-message{animation:sa-slide-up 0.6s 0.3s ease both}
        .sa-sub{animation:sa-slide-up 0.6s 0.5s ease both}
        .sa-ring{position:absolute;width:120px;height:120px;border-radius:50%;border:2px solid #FFD700;animation:sa-ring-expand 1.2s 0.4s ease-out both}
        .sa-ring-2{animation-delay:0.7s}
        .sa-dismiss-btn{background:linear-gradient(135deg,#D4A017,#B8960C);border:none;color:#0a0802;font-family:Georgia,serif;font-weight:700;font-size:15px;padding:12px 36px;border-radius:40px;cursor:pointer;letter-spacing:0.5px;margin-top:20px;transition:transform 0.2s;animation:sa-slide-up 0.6s 0.8s ease both}
        .sa-dismiss-btn:hover{transform:translateY(-2px)}
      `}</style>

      {particles.map((pt, i) => {
        const pos = particlePositions[i];
        if (!pos || pos.y < -15) return null;
        return (
          <div key={pt.id} style={{
            position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`,
            width: pt.size, height: pt.shape === 'circle' ? pt.size : pt.size * 0.5,
            borderRadius: pt.shape === 'circle' ? '50%' : '1px',
            background: pt.color, transform: `rotate(${pos.rotation}deg)`,
            opacity: Math.max(0, Math.min(1, 1 - (pos.y - 70) / 20)), pointerEvents: 'none',
          }} />
        );
      })}

      <div style={{
        position: 'relative', textAlign: 'center', padding: isOverlay ? '48px 40px 36px' : '32px 24px',
        borderRadius: 24, background: isOverlay ? 'linear-gradient(160deg,#1a1200 0%,#0f0a00 100%)' : 'transparent',
        border: isOverlay ? '1px solid rgba(184,150,12,0.3)' : 'none', maxWidth: 360, width: '100%',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
          <div className="sa-ring" /><div className="sa-ring sa-ring-2" />
        </div>
        <div className="sa-figure-wrap" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, position: 'relative', zIndex: 2 }}>
          <BambehFigureSVG phase={phase} />
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#B8960C,transparent)', marginBottom: 16 }} />
        <div className="sa-message" style={{ fontFamily: "Georgia,'Times New Roman',serif", fontSize: 20, fontWeight: 700, color: '#FFF8E7', lineHeight: 1.4, marginBottom: subMessage ? 8 : 0 }}>
          {message}
        </div>
        {subMessage && (
          <div className="sa-sub" style={{ fontFamily: 'Arial,sans-serif', fontSize: 14, color: 'rgba(212,160,23,0.85)', letterSpacing: '0.3px' }}>
            {subMessage}
          </div>
        )}
        {phase === 3 && (
          <button className="sa-dismiss-btn" onClick={() => {
            setExiting(true);
            setTimeout(() => { setMounted(false); onComplete?.(); }, 500);
          }}>
            Let's go! ðŸ‹ï¸
          </button>
        )}
      </div>
    </div>
  );
}

export function useBambehSuccess() {
  const [config, setConfig] = useState<{ visible: boolean; message: string; subMessage?: string }>({ visible: false, message: '' });
  const triggerSuccess = (opts: { message?: string; subMessage?: string } = {}) => {
    setConfig({ visible: true, message: opts.message ?? 'Load delivered! You did it, partner.', subMessage: opts.subMessage });
  };
  const SuccessAnimation = () => (
    <BambehSuccessAnimation visible={config.visible} message={config.message} subMessage={config.subMessage}
      onComplete={() => setConfig(c => ({ ...c, visible: false }))} />
  );
  return { triggerSuccess, SuccessAnimation };
}
