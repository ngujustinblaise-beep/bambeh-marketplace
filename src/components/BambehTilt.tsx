// BAMBEH_DEPLOY_TOKEN__BAMBEHTILT_FIX406_CLEAN
/**
 * src/components/BambehTilt.tsx - Bambeh Marketplace
 *
 * FIX406: the 3D tilt-parallax product view.
 *
 * WHAT IT DOES
 *  Phone: the product image tilts as the user tilts the handset, and a soft
 *  sheen of light travels across it. It reads as depth without needing a
 *  single extra photo from the seller.
 *  Desktop: the same effect follows the mouse.
 *
 * WHY NOT REAL 3D
 *  True 3D product rotation needs 24-36 photos of one item on a turntable.
 *  No seller in Yaounde will do that. This gives most of the feeling for
 *  none of the cost, and it works on every photo already in the database.
 *
 * SAFETY AND POLICY
 *  - Respects prefers-reduced-motion. Motion effects make some people
 *    physically ill, and Apple checks this. Reduced motion = a plain image.
 *  - iOS 13+ requires a tap before it will give orientation data. We show a
 *    small unobtrusive chip; if the user ignores it, the image just sits
 *    still. Nothing breaks.
 *  - Android needs HTTPS. app.bambeh.com is HTTPS, so this is satisfied.
 *  - Zero dependencies, zero network, ~4 kB. No effect on load time.
 *  - Motion is damped and capped at 9 degrees, so it never jitters and
 *    never looks like a toy.
 *
 * HOW TO USE
 *   import BambehTilt from "@/components/BambehTilt";
 *
 *   <BambehTilt src={imageUrl} alt={product.title} className="h-64 w-full" />
 *
 * It replaces a plain <img>. Everything else on the page stays as it is.
 *
 * (c) 2025-2026 BAMBEH SARL. All rights reserved.
 */

import { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  /** Image to show. If empty, the fallback is rendered instead. */
  src?: string | null;
  alt?: string;
  /** Extra classes for the OUTER frame (set your height here). */
  className?: string;
  /** Maximum tilt in degrees. 9 is calm. Above 14 starts to look cheap. */
  maxTilt?: number;
  /** Shown when there is no image. */
  fallback?: React.ReactNode;
  /** Label on the iOS permission chip, already translated by the caller. */
  enableLabel?: string;
};

/** iOS 13+ hides orientation behind a permission call that needs a tap. */
type OrientationCtor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function needsIosPermission(): boolean {
  try {
    const C = DeviceOrientationEvent as OrientationCtor;
    return typeof C !== "undefined" && typeof C.requestPermission === "function";
  } catch {
    return false;
  }
}

export default function BambehTilt({
  src,
  alt = "",
  className = "",
  maxTilt = 9,
  fallback = null,
  enableLabel = "Tap for 3D",
}: Props) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const plateRef = useRef<HTMLDivElement | null>(null);
  const sheenRef = useRef<HTMLDivElement | null>(null);

  // target values (from sensor or pointer) and the eased values we actually draw
  const target = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const running = useRef(false);

  const [motionOn, setMotionOn] = useState(false);
  const [showChip, setShowChip] = useState(false);
  const [broken, setBroken] = useState(false);

  // ---- the draw loop: ease toward the target, never snap ------------------
  const tick = useCallback(() => {
    const e = eased.current;
    const t = target.current;
    // 0.12 is the damping. Lower is smoother and lazier; higher is twitchy.
    e.x += (t.x - e.x) * 0.12;
    e.y += (t.y - e.y) * 0.12;

    const plate = plateRef.current;
    const sheen = sheenRef.current;
    if (plate) {
      plate.style.transform =
        `perspective(900px) rotateX(${(-e.y).toFixed(2)}deg) ` +
        `rotateY(${e.x.toFixed(2)}deg) scale(1.04)`;
    }
    if (sheen) {
      // the light sheen slides the OPPOSITE way, which is what sells the depth
      const px = 50 - (e.x / maxTilt) * 45;
      const py = 50 - (e.y / maxTilt) * 45;
      sheen.style.background =
        `radial-gradient(circle at ${px.toFixed(1)}% ${py.toFixed(1)}%, ` +
        `rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.10) 32%, ` +
        `rgba(255,255,255,0) 62%)`;
    }

    const settled = Math.abs(t.x - e.x) < 0.01 && Math.abs(t.y - e.y) < 0.01;
    if (settled && t.x === 0 && t.y === 0) {
      running.current = false;
      raf.current = null;
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, [maxTilt]);

  const kick = useCallback(() => {
    if (running.current) return;
    running.current = true;
    raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const clamp = useCallback(
    (v: number) => Math.max(-maxTilt, Math.min(maxTilt, v)),
    [maxTilt],
  );

  // ---- device orientation (phones) ----------------------------------------
  const attachOrientation = useCallback(() => {
    const onOrient = (ev: DeviceOrientationEvent) => {
      // gamma = left/right tilt, beta = front/back tilt
      const g = ev.gamma ?? 0;
      const b = ev.beta ?? 0;
      // 45 degrees of real tilt maps to full effect: gentle, not wristy
      target.current.x = clamp((g / 45) * maxTilt);
      target.current.y = clamp(((b - 45) / 45) * maxTilt);
      kick();
    };
    window.addEventListener("deviceorientation", onOrient, true);
    return () => window.removeEventListener("deviceorientation", onOrient, true);
  }, [clamp, kick, maxTilt]);

  useEffect(() => {
    if (prefersReducedMotion()) return;          // honour the OS setting
    if (typeof window === "undefined") return;
    if (!("DeviceOrientationEvent" in window)) return;

    if (needsIosPermission()) {
      setShowChip(true);                          // iOS: wait for a tap
      return;
    }
    setMotionOn(true);
    return attachOrientation();
  }, [attachOrientation]);

  const askIos = useCallback(async () => {
    try {
      const C = DeviceOrientationEvent as OrientationCtor;
      const res = await C.requestPermission?.();
      if (res === "granted") {
        setMotionOn(true);
        setShowChip(false);
        attachOrientation();
      } else {
        setShowChip(false);                       // refused: stay still, no nagging
      }
    } catch {
      setShowChip(false);
    }
  }, [attachOrientation]);

  // ---- pointer fallback (desktop) -----------------------------------------
  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (motionOn || prefersReducedMotion()) return;
      const el = frameRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      target.current.x = clamp(nx * maxTilt * 2);
      target.current.y = clamp(ny * maxTilt * 2);
      kick();
    },
    [clamp, kick, maxTilt, motionOn],
  );

  const onPointerLeave = useCallback(() => {
    if (motionOn) return;
    target.current.x = 0;
    target.current.y = 0;
    kick();
  }, [kick, motionOn]);

  useEffect(() => {
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  const hasImage = !!src && !broken;

  return (
    <div
      ref={frameRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`relative overflow-hidden rounded-2xl bg-gray-100 ${className}`}
      style={{ touchAction: "pan-y" }}
    >
      <div
        ref={plateRef}
        className="absolute inset-0 will-change-transform"
        style={{ transformStyle: "preserve-3d", transition: "none" }}
      >
        {hasImage ? (
          <img
            src={src as string}
            alt={alt}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover select-none pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {fallback}
          </div>
        )}
      </div>

      {/* the travelling light. pointer-events-none so it never eats a tap */}
      <div
        ref={sheenRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
      />

      {/* iOS only: one small chip, once. Ignore it and nothing is lost. */}
      {showChip && hasImage && (
        <button
          type="button"
          onClick={askIos}
          className="absolute bottom-2 right-2 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm active:scale-95"
        >
          {enableLabel}
        </button>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__BAMBEHTILT_FIX406__COMPLETE
