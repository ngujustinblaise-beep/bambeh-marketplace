// File: src/pages/BambehWelcomeScreen.jsx
// REDESIGN: Collapsed 3-phase welcome into ONE single page.
// All content visible at once. ONE large NEXT button at the bottom.
//
// LANGUAGE: now speaks the app's 5 in-app languages (en / fr / pidgin / ar / ff)
// and is fully REACTIVE — it reads the language chosen on the first selector
// (localStorage "Bambeh_language") and live-updates the instant the language
// changes anywhere via the "bambeh:langchange" event. Its own language buttons
// also broadcast that event, so picking a language here re-translates the whole
// app (terms, home, etc.) with no refresh.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LANG_KEY = "Bambeh_language";

// Map any stored value to one of the 5 in-app languages.
function resolveCode(raw) {
  const valid = ["en", "fr", "pidgin", "ar", "ff"];
  if (!raw) return "en";
  if (raw === "pcm" || raw === "pidgin_english") return "pidgin";
  if (raw === "ful" || raw === "fulfulde") return "ff";
  if (raw === "ha" || raw === "hausa") return "en"; // legacy value -> safe default
  return valid.includes(raw) ? raw : "en";
}

function readStoredLang() {
  try {
    return resolveCode(localStorage.getItem(LANG_KEY));
  } catch (_) {
    return "en";
  }
}

const LANGUAGES = {
  en: {
    code: "en",
    label: "English",
    flag: "🇬🇧",
    greeting: "Welcome to the Family",
    tagline: "We Carry All Loads.",
    blurb:
      "Buy, sell, find jobs, rent property, exchange goods & hire vehicles — all in one place, built for you.",
    items: [
      { icon: "🛒", label: "Buy & Sell" },
      { icon: "💼", label: "Jobs" },
      { icon: "🏠", label: "Rentals" },
      { icon: "🔄", label: "Exchange" },
      { icon: "🚗", label: "Vehicles" },
      { icon: "🏪", label: "Vendors" },
    ],
    next: "Enter Bambeh",
    caption: "5 Languages · 6 Categories · 1 Family",
  },
  fr: {
    code: "fr",
    label: "Français",
    flag: "🇫🇷",
    greeting: "Bienvenue dans la Famille",
    tagline: "Nous Portons Toutes les Charges.",
    blurb:
      "Achetez, vendez, trouvez un emploi, louez un logement, échangez des biens et louez des véhicules — tout au même endroit, conçu pour vous.",
    items: [
      { icon: "🛒", label: "Acheter & Vendre" },
      { icon: "💼", label: "Emplois" },
      { icon: "🏠", label: "Locations" },
      { icon: "🔄", label: "Échange" },
      { icon: "🚗", label: "Véhicules" },
      { icon: "🏪", label: "Vendeurs" },
    ],
    next: "Entrer dans Bambeh",
    caption: "5 Langues · 6 Catégories · 1 Famille",
  },
  pidgin: {
    code: "pidgin",
    label: "Pidgin",
    flag: "🇨🇲",
    greeting: "Welcome to di Family",
    tagline: "We Dey Carry All Load.",
    blurb:
      "Buy, sell, find work, rent house, exchange things & hire motor — all for one place, we build am for you.",
    items: [
      { icon: "🛒", label: "Buy & Sell" },
      { icon: "💼", label: "Work" },
      { icon: "🏠", label: "House Rent" },
      { icon: "🔄", label: "Exchange" },
      { icon: "🚗", label: "Motor" },
      { icon: "🏪", label: "Sellers" },
    ],
    next: "Enta Bambeh",
    caption: "5 Languages · 6 Categories · 1 Family",
  },
  ar: {
    code: "ar",
    label: "العربية",
    flag: "🇸🇦",
    greeting: "أهلاً بك في العائلة",
    tagline: "نحمل كل الأحمال.",
    blurb:
      "اشترِ، بِع، ابحث عن عمل، استأجر سكنًا، بادل السلع واستأجر المركبات — كل ذلك في مكان واحد، صُمم من أجلك.",
    items: [
      { icon: "🛒", label: "شراء وبيع" },
      { icon: "💼", label: "وظائف" },
      { icon: "🏠", label: "إيجارات" },
      { icon: "🔄", label: "تبادل" },
      { icon: "🚗", label: "مركبات" },
      { icon: "🏪", label: "بائعون" },
    ],
    next: "ادخل إلى بامبيه",
    caption: "5 لغات · 6 فئات · عائلة واحدة",
  },
  ff: {
    code: "ff",
    label: "Fulfulde",
    flag: "🌍",
    greeting: "Njabbama e Goreeji",
    tagline: "Min Ronndoto Donngal Fof.",
    blurb:
      "Soodu, yeeyu, ɗaɓɓito golle, luwo suudu, waɗtu kaake & luwo otooji — fof e nokku gooto, mahanaa ma.",
    items: [
      { icon: "🛒", label: "Soodu & Yeeyu" },
      { icon: "💼", label: "Golle" },
      { icon: "🏠", label: "Luwol" },
      { icon: "🔄", label: "Waɗtita" },
      { icon: "🚗", label: "Otooji" },
      { icon: "🏪", label: "Yeeyooɓe" },
    ],
    next: "Naatu Bambeh",
    caption: "Ɗemɗe 5 · Kelle 6 · Goree gooto",
  },
};

function FloatingParticle({ delay, x, size }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        bottom: "-10px",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "rgba(184,150,12,0.13)",
        animation: `floatUp ${7 + delay}s ${delay}s infinite ease-in`,
        pointerEvents: "none",
      }}
    />
  );
}

export default function BambehWelcomeScreen() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(() => readStoredLang());
  const [visible, setVisible] = useState(false);
  const t = LANGUAGES[lang] || LANGUAGES.en;
  const isRTL = lang === "ar";

  // ── Reactive language: follow the first selector and any later change ──────
  useEffect(() => {
    const onLangChange = (e) => {
      const d = e && e.detail;
      setLang(resolveCode(typeof d === "string" ? d : readStoredLang()));
    };
    const onStorage = (e) => {
      if (e.key === LANG_KEY) setLang(resolveCode(e.newValue));
    };
    window.addEventListener("bambeh:langchange", onLangChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("bambeh:langchange", onLangChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, [lang]);

  const particles = Array.from({ length: 10 }, (_, i) => ({
    x: (i * 10.5) % 100,
    delay: i * 0.6,
    size: 8 + (i % 4) * 5,
  }));

  // Pick a language here -> persist + broadcast so the WHOLE app re-translates.
  const chooseLang = (code) => {
    const c = resolveCode(code);
    setLang(c);
    try {
      localStorage.setItem(LANG_KEY, c);
    } catch (_) {}
    try {
      window.dispatchEvent(new CustomEvent("bambeh:langchange", { detail: c }));
    } catch (_) {}
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a0802 0%, #1a1200 45%, #0f0a00 100%)",
        fontFamily: "'Georgia', serif",
        color: "#FFF8E7",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');

        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1);    opacity: 0; }
          10%  { opacity: 0.5; }
          90%  { opacity: 0.08; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        @keyframes goldPulse {
          0%,100% { text-shadow: 0 0 20px rgba(184,150,12,0.55), 0 0 40px rgba(184,150,12,0.25); }
          50%     { text-shadow: 0 0 40px rgba(212,160,23,0.9),  0 0 80px rgba(184,150,12,0.45); }
        }
        @keyframes logoPulse {
          0%,100% { filter: sepia(1) saturate(400%) hue-rotate(10deg) brightness(85%) drop-shadow(0 0 20px rgba(184,150,12,0.5)); }
          50%     { filter: sepia(1) saturate(500%) hue-rotate(10deg) brightness(100%) drop-shadow(0 0 40px rgba(212,160,23,0.9)); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chipIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes btnPop {
          0%   { transform: scale(0.92); opacity: 0; }
          60%  { transform: scale(1.03); }
          100% { transform: scale(1);    opacity: 1; }
        }

        .bambeh-next-btn {
          width: 100%;
          background: linear-gradient(135deg, #FFD700, #D4A017, #B8960C);
          border: none;
          color: #0a0802;
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: clamp(22px, 5vw, 28px);
          letter-spacing: 1.5px;
          padding: 22px 32px;
          border-radius: 16px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 6px 32px rgba(212,160,23,0.55),
            0 0 0 2px rgba(255,215,0,0.25),
            inset 0 1px 0 rgba(255,255,255,0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: btnPop 0.6s 0.8s ease both;
        }
        .bambeh-next-btn:hover {
          transform: translateY(-3px);
          box-shadow:
            0 12px 48px rgba(212,160,23,0.7),
            0 0 0 3px rgba(255,215,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .bambeh-next-btn:active { transform: translateY(0); }
        .bambeh-next-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
          background-size: 200% auto;
          animation: shimmer 2.4s infinite;
        }

        .lang-btn {
          background: transparent;
          border: 1px solid rgba(184,150,12,0.4);
          color: rgba(255,248,231,0.65);
          padding: 5px 13px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 13px;
          font-family: 'Lato', sans-serif;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .lang-btn:hover, .lang-btn.active {
          background: rgba(184,150,12,0.2);
          border-color: #B8960C;
          color: #FFD700;
        }
        .feature-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(184,150,12,0.09);
          border: 1px solid rgba(184,150,12,0.22);
          border-radius: 30px;
          padding: 9px 18px;
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          color: rgba(255,248,231,0.82);
          animation: chipIn 0.45s ease both;
          transition: background 0.2s, border-color 0.2s;
        }
        .feature-chip:hover {
          background: rgba(184,150,12,0.18);
          border-color: #B8960C;
        }
        .gold-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(184,150,12,0.5), transparent);
          border: none;
          margin: 0;
        }
      `}</style>

      {/* ── Floating particles ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {particles.map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}
      </div>

      {/* ── Radial gold glow ── */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "560px",
          height: "560px",
          background: "radial-gradient(circle, rgba(184,150,12,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Language bar ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          padding: "14px 20px",
          flexWrap: "wrap",
        }}
      >
        {Object.values(LANGUAGES).map((l) => (
          <button
            key={l.code}
            className={`lang-btn ${lang === l.code ? "active" : ""}`}
            onClick={() => chooseLang(l.code)}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "8px 24px 32px",
          position: "relative",
          zIndex: 5,
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(14px)",
          transition: "opacity 0.45s ease, transform 0.45s ease",
          maxWidth: "520px",
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* Logo */}
        <div
          style={{
            animation: "fadeUp 0.7s ease both",
            marginBottom: "16px",
          }}
        >
          <img
            src="/bambeh-logo.png"
            alt="Bambeh"
            style={{
              width: "130px",
              height: "130px",
              objectFit: "contain",
              borderRadius: "50%",
              filter:
                "sepia(1) saturate(400%) hue-rotate(10deg) brightness(85%) drop-shadow(0 6px 28px rgba(184,150,12,0.6))",
              animation: "logoPulse 3s ease-in-out infinite",
            }}
          />
        </div>

        {/* Brand name */}
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(52px, 14vw, 80px)",
            fontWeight: 900,
            letterSpacing: "6px",
            background: "linear-gradient(135deg, #FFD700, #D4A017, #B8960C, #8B6F0A)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "goldPulse 3s ease-in-out infinite",
            lineHeight: 1,
            marginBottom: "6px",
            textAlign: "center",
          }}
        >
          BAMBEH
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "13px",
            letterSpacing: "3.5px",
            textTransform: "uppercase",
            color: "rgba(212,160,23,0.65)",
            marginBottom: "20px",
            textAlign: "center",
            animation: "fadeUp 0.7s 0.1s ease both",
          }}
        >
          {t.tagline}
        </div>

        <hr className="gold-divider" style={{ width: "120px", marginBottom: "20px" }} />

        {/* Greeting */}
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(22px, 5.5vw, 30px)",
            fontWeight: 700,
            color: "#FFF8E7",
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: "14px",
            animation: "fadeUp 0.7s 0.15s ease both",
          }}
        >
          {t.greeting}
        </div>

        {/* Short blurb */}
        <div
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "clamp(14px, 3.5vw, 16px)",
            color: "rgba(255,248,231,0.6)",
            textAlign: "center",
            lineHeight: 1.65,
            marginBottom: "24px",
            padding: "0 4px",
            animation: "fadeUp 0.7s 0.2s ease both",
          }}
        >
          {t.blurb}
        </div>

        <hr className="gold-divider" style={{ width: "100%", marginBottom: "20px" }} />

        {/* Feature chips */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "32px",
          }}
        >
          {t.items.map((item, i) => (
            <div
              key={i}
              className="feature-chip"
              style={{ animationDelay: `${0.25 + i * 0.07}s` }}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* ── THE BIG NEXT BUTTON ── */}
        <button
          className="bambeh-next-btn"
          onClick={() => { localStorage.setItem("Bambeh_onboarding_completed", "true"); navigate("/home", { replace: true }); }}
        >
          {t.next} →
        </button>

        {/* Sub caption */}
        <div
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "11px",
            color: "rgba(255,248,231,0.28)",
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            marginTop: "14px",
            textAlign: "center",
          }}
        >
          🇨🇲 · {t.caption}
        </div>
      </div>
    </div>
  );
}
