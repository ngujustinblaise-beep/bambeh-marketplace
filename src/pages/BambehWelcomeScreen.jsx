// File: src/pages/BambehWelcomeScreen.jsx
// FIXES:
//  1. Replaced BambehFigure SVG stick man with gold Bambeh logo image
//  2. Fixed Phase 2 CTA that was looping back to Phase 0 instead of navigating
//  3. Added useNavigate to properly exit the welcome screen

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentWelcome } from "@/utils/languageConfig";
import bambehLogo from "@/assets/bambeh-glossy-logo.png";

const LANGUAGES = {
  en: {
    code: "en",
    label: "English",
    flag: "🇬🇧",
    greeting: "Welcome to the Family.",
    tagline: "We Carry All Loads.",
    story: [
      'In the streets where we grew up, the Bambeh was the one who never said "too heavy." He was the strength when the load was big and the day was long.',
      "We built this for you. Not because you need a machine — but because your hard work deserves a partner.",
      "You are not alone anymore. Your voice is our fuel. Your success is our pride.",
    ],
    cta: "Let's Lift the World",
    sub: "Your load. Your life. Your Bambeh.",
    items: [
      "Buy & Sell",
      "Find Jobs",
      "Rent Property",
      "Exchange Goods",
      "Hire Vehicles",
    ],
  },
  fr: {
    code: "fr",
    label: "Français",
    flag: "🇫🇷",
    greeting: "Bienvenue à la maison.",
    tagline: "Nous Portons Toutes les Charges.",
    story: [
      "Dans nos quartiers, le Bambeh était celui qui ne disait jamais « c'est trop lourd. » Il était la force quand la journée était longue.",
      "Nous avons construit ceci pour vous — non pas parce que vous avez besoin d'une machine, mais parce que votre travail mérite un partenaire.",
      "Vous n'êtes plus seul. Votre voix est notre carburant. Votre succès est notre fierté.",
    ],
    cta: "Soulevons le Monde",
    sub: "Votre charge. Votre vie. Votre Bambeh.",
    items: [
      "Acheter & Vendre",
      "Trouver un Emploi",
      "Louer",
      "Échanger",
      "Véhicules",
    ],
  },
  ha: {
    code: "ha",
    label: "Hausa",
    flag: "🇳🇬",
    greeting: "Barka da zuwa gida.",
    tagline: "Muna ɗaukar duk kaya.",
    story: [
      "A cikin unguwanninmu, Bambeh shine wanda baya taba cewa kaya sunyi nauyi. Shi ne karfinmu lokacin da hanya tayi nisa.",
      "Mun gina wannan ne saboda kai — ba wai don kana bukatar na'ura ba, amma don kokarinka ya cancanci abokin guda.",
      "Ba ka kadaita kuma. Karfin Bambeh yana hannunka yanzu.",
    ],
    cta: "Bari Mu Daga Duniya",
    sub: "Kayan ka. Rayuwar ka. Bambehin ka.",
    items: [
      "Siya & Sayarwa",
      "Neman Aiki",
      "Hayar Gida",
      "Musayar Kaya",
      "Motoci",
    ],
  },
  ar: {
    code: "ar",
    label: "العربية",
    flag: "🇸🇦",
    greeting: "أهلاً بك في بيتك.",
    tagline: "نحمل كل الأحمال.",
    story: [
      "في شوارعنا، كان بامبيه هو الشخص الذي لا يقول أبداً «الحمل ثقيل». كان هو القوة عندما يكون الطريق طويلاً.",
      "لقد بنينا هذا التطبيق من أجلك — ليس لأنك بحاجة إلى آلة، بل لأن عملك الشاق يستحق شريكاً.",
      "لست وحدك بعد الآن. صوتك هو وقودنا. نجاحك هو فخرنا.",
    ],
    cta: "لنرفع العالم معاً",
    sub: "حملك. حياتك. بامبيه الخاص بك.",
    items: ["شراء وبيع", "البحث عن عمل", "الإيجار", "التبادل", "المركبات"],
  },
};

const FEATURES = [
  { icon: "🛒", en: "Marketplace", color: "#D4A017" },
  { icon: "💼", en: "Jobs", color: "#B8960C" },
  { icon: "🏠", en: "Rentals", color: "#8B6F0A" },
  { icon: "🔄", en: "Exchange", color: "#D4A017" },
  { icon: "🚗", en: "Vehicles", color: "#B8960C" },
  { icon: "🏪", en: "Vendors", color: "#8B6F0A" },
];

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
        background: "rgba(184,150,12,0.15)",
        animation: `floatUp ${6 + delay}s ${delay}s infinite ease-in`,
        pointerEvents: "none",
      }}
    />
  );
}

// ── GOLD BAMBEH LOGO (replaces stick man) ──
// CSS filter breakdown:
//   sepia(1)          → converts teal/grey to warm brown tones
//   saturate(4)       → boosts colour richness
//   hue-rotate(10deg) → shifts brown → gold
//   brightness(0.85)  → darkens slightly so gold reads rich, not washed out
// The dark grey text in the logo naturally becomes near-black through this chain.
function BambehLogo({ animate }) {
  return (
    <div
      style={{
        position: "relative",
        width: "200px",
        height: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: animate ? "logoPulse 3s ease-in-out infinite" : "none",
      }}
    >
      <img
        src={bambehLogo}
        alt="Bambeh Logo"
        style={{
          width: "200px",
          height: "200px",
          objectFit: "contain",
          borderRadius: "50%",
          filter:
            "sepia(1) saturate(400%) hue-rotate(10deg) brightness(85%) drop-shadow(0 8px 32px rgba(184,150,12,0.5))",
        }}
      />
    </div>
  );
}

export default function BambehWelcomeScreen() {
  const navigate = useNavigate(); // ← FIX: needed to exit welcome screen
  const [lang, setLang] = useState(getCurrentWelcome().code);
  const [phase, setPhase] = useState(0); // 0=splash, 1=story, 2=ready
  const [storyLine, setStoryLine] = useState(0);
  const [visible, setVisible] = useState(false);
  const [logoAnimate, setLogoAnimate] = useState(false);
  const t = LANGUAGES[lang] || LANGUAGES.en;
  const isRTL = lang === "ar";

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => setLogoAnimate(true), 800);
  }, []);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, [lang]);

  // ── FIX: handleNext now navigates on final phase ──
  const handleNext = () => {
    if (phase === 0) {
      setPhase(1);
      setStoryLine(0);
    } else if (phase === 1 && storyLine < t.story.length - 1) {
      setStoryLine((s) => s + 1);
    } else if (phase === 1) {
      setPhase(2);
    } else if (phase === 2) {
      // ── Previously this was setPhase(0) — THAT was the bug trapping users ──
      navigate("/");
    }
  };

  // Allow skipping story phases entirely from splash
  const handleSkip = () => {
    navigate("/");
  };

  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: (i * 8.5) % 100,
    delay: i * 0.7,
    size: 8 + (i % 4) * 6,
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #0a0802 0%, #1a1200 40%, #0f0a00 100%)",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: "#FFF8E7",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');

        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.1; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        @keyframes logoPulse {
          0%, 100% {
            filter: sepia(1) saturate(400%) hue-rotate(10deg) brightness(85%) drop-shadow(0 0 20px rgba(184,150,12,0.5));
          }
          50% {
            filter: sepia(1) saturate(500%) hue-rotate(10deg) brightness(100%) drop-shadow(0 0 40px rgba(212,160,23,0.9));
          }
        }
        @keyframes goldPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(184,150,12,0.6), 0 0 40px rgba(184,150,12,0.3); }
          50% { text-shadow: 0 0 40px rgba(212,160,23,0.9), 0 0 80px rgba(184,150,12,0.5); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0); opacity: 0; }
          40% { transform: scale(1); opacity: 1; }
        }
        .bambeh-btn {
          background: linear-gradient(135deg, #D4A017, #B8960C, #8B6F0A);
          border: none;
          color: #0a0802;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 18px;
          padding: 16px 48px;
          border-radius: 60px;
          cursor: pointer;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 24px rgba(184,150,12,0.4), 0 0 0 1px rgba(212,160,23,0.3);
          position: relative;
          overflow: hidden;
        }
        .bambeh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(184,150,12,0.6), 0 0 0 2px rgba(212,160,23,0.5);
        }
        .bambeh-btn:active { transform: translateY(0); }
        .bambeh-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200% auto;
          animation: shimmer 2s infinite;
        }
        .skip-btn {
          background: transparent;
          border: none;
          color: rgba(255,248,231,0.35);
          font-family: 'Lato', sans-serif;
          font-size: 12px;
          cursor: pointer;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 8px 16px;
          transition: color 0.2s;
        }
        .skip-btn:hover { color: rgba(255,248,231,0.65); }
        .lang-btn {
          background: transparent;
          border: 1px solid rgba(184,150,12,0.4);
          color: rgba(255,248,231,0.7);
          padding: 6px 14px;
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
          color: #D4A017;
        }
        .lang-btn.active {
          background: rgba(184,150,12,0.25);
          color: #FFD700;
        }
        .feature-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(184,150,12,0.1);
          border: 1px solid rgba(184,150,12,0.25);
          border-radius: 30px;
          padding: 8px 18px;
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          color: rgba(255,248,231,0.85);
          animation: fadeSlideIn 0.5s ease both;
          transition: all 0.2s;
        }
        .feature-chip:hover {
          background: rgba(184,150,12,0.2);
          border-color: #B8960C;
          transform: translateY(-2px);
        }
        .gold-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, #B8960C, transparent);
          border: none;
          margin: 0;
        }
        .story-text {
          animation: fadeSlideUp 0.6s ease both;
        }
        .progress-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          transition: all 0.3s ease;
          cursor: pointer;
        }
      `}</style>

      {/* Particles */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {particles.map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}
      </div>

      {/* Gold radial glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(184,150,12,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Language Selector */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          padding: "16px 24px",
          flexWrap: "wrap",
        }}
      >
        <button className="skip-btn" onClick={handleSkip}>
          Skip →
        </button>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {Object.values(LANGUAGES).map((l) => (
            <button
              key={l.code}
              className={`lang-btn ${lang === l.code ? "active" : ""}`}
              onClick={() => {
                setLang(l.code);
                try {
                  localStorage.setItem("Bambeh_language", l.code);
                } catch (_) {}
              }}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          position: "relative",
          zIndex: 5,
          direction: isRTL ? "rtl" : "ltr",
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* ── PHASE 0: SPLASH ── */}
        {phase === 0 && (
          <div style={{ textAlign: "center", maxWidth: "480px" }}>
            {/* ── GOLD LOGO (replaces stick man) ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "24px",
                animation: "fadeSlideUp 0.8s ease both",
              }}
            >
              <div
                style={{
                  animation: logoAnimate
                    ? "logoPulse 3s ease-in-out infinite"
                    : "none",
                  borderRadius: "50%",
                }}
              >
                <img
                  src={bambehLogo}
                  alt="Bambeh"
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "contain",
                    borderRadius: "50%",
                    // Gold filter: sepia converts teal → warm tone,
                    // saturate+hue-rotate shifts it to gold,
                    // brightness darkens slightly for rich gold,
                    // drop-shadow adds the golden glow around it
                    filter:
                      "sepia(1) saturate(400%) hue-rotate(10deg) brightness(85%) drop-shadow(0 8px 32px rgba(184,150,12,0.6))",
                  }}
                />
              </div>
            </div>

            {/* Brand Name */}
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(64px, 15vw, 96px)",
                fontWeight: 900,
                letterSpacing: "6px",
                background:
                  "linear-gradient(135deg, #FFD700, #D4A017, #B8960C, #8B6F0A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "goldPulse 3s ease-in-out infinite",
                lineHeight: 1,
                marginBottom: "8px",
              }}
            >
              BAMBEH
            </div>

            {/* Tagline */}
            <div
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "14px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "rgba(212,160,23,0.7)",
                marginBottom: "40px",
              }}
            >
              {t.tagline}
            </div>

            <hr
              className="gold-rule"
              style={{ width: "160px", margin: "0 auto 40px" }}
            />

            {/* Greeting */}
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(24px, 5vw, 32px)",
                fontWeight: 700,
                color: "#FFF8E7",
                marginBottom: "32px",
                lineHeight: 1.3,
                animation: "fadeSlideUp 0.8s ease both",
              }}
            >
              {t.greeting}
            </div>

            {/* CTA */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <button className="bambeh-btn" onClick={handleNext}>
                {t.cta} →
              </button>
              <div
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "13px",
                  color: "rgba(255,248,231,0.4)",
                  letterSpacing: "1px",
                }}
              >
                {t.sub}
              </div>
            </div>
          </div>
        )}

        {/* ── PHASE 1: STORY ── */}
        {phase === 1 && (
          <div
            style={{
              textAlign: isRTL ? "right" : "center",
              maxWidth: "560px",
              width: "100%",
            }}
          >
            {/* Small logo */}
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 900,
                letterSpacing: "4px",
                background: "linear-gradient(135deg, #FFD700, #B8960C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "40px",
              }}
            >
              BAMBEH
            </div>

            {/* Story text */}
            <div
              key={storyLine}
              className="story-text"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(18px, 3.5vw, 24px)",
                lineHeight: 1.75,
                color: "#FFF8E7",
                marginBottom: "48px",
                fontStyle: "italic",
                padding: "0 8px",
                borderLeft: isRTL ? "none" : "3px solid #B8960C",
                borderRight: isRTL ? "3px solid #B8960C" : "none",
                paddingLeft: isRTL ? "0" : "24px",
                paddingRight: isRTL ? "24px" : "0",
              }}
            >
              "{t.story[storyLine]}"
            </div>

            {/* Progress dots */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "40px",
              }}
            >
              {t.story.map((_, i) => (
                <div
                  key={i}
                  className="progress-dot"
                  onClick={() => setStoryLine(i)}
                  style={{
                    background:
                      i === storyLine ? "#D4A017" : "rgba(184,150,12,0.3)",
                    transform: i === storyLine ? "scale(1.4)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              {storyLine > 0 && (
                <button
                  className="bambeh-btn"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(184,150,12,0.5)",
                    color: "#D4A017",
                    fontSize: "15px",
                    padding: "12px 32px",
                  }}
                  onClick={() => setStoryLine((s) => s - 1)}
                >
                  ←
                </button>
              )}
              <button className="bambeh-btn" onClick={handleNext}>
                {storyLine < t.story.length - 1 ? "Continue →" : t.cta + " →"}
              </button>
            </div>
          </div>
        )}

        {/* ── PHASE 2: READY ── */}
        {phase === 2 && (
          <div
            style={{ textAlign: "center", maxWidth: "560px", width: "100%" }}
          >
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(32px, 7vw, 52px)",
                fontWeight: 900,
                color: "#FFF8E7",
                marginBottom: "16px",
                animation: "fadeSlideUp 0.6s ease both",
              }}
            >
              {t.greeting}
            </div>
            <div
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "16px",
                color: "rgba(212,160,23,0.8)",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "48px",
                animation: "fadeSlideUp 0.6s 0.1s ease both",
              }}
            >
              {t.tagline}
            </div>

            {/* Feature chips */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                justifyContent: "center",
                marginBottom: "48px",
              }}
            >
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="feature-chip"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span style={{ fontSize: "20px" }}>{f.icon}</span>
                  <span>{t.items[i] || f.en}</span>
                </div>
              ))}
            </div>

            <hr className="gold-rule" style={{ marginBottom: "40px" }} />

            {/* ── FIX: Enter button now navigates to /home instead of setPhase(0) ── */}
            <div style={{ animation: "fadeSlideUp 0.6s 0.7s ease both" }}>
              <button
                className="bambeh-btn"
                style={{ fontSize: "20px", padding: "20px 64px" }}
                onClick={() => navigate("/")}
              >
                {t.cta} 🏋️
              </button>
              <div
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "13px",
                  color: "rgba(255,248,231,0.35)",
                  marginTop: "20px",
                  letterSpacing: "1px",
                }}
              >
                {t.sub}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom brand strip */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          borderTop: "1px solid rgba(184,150,12,0.2)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        {["🇨🇲 ", "4 Languages", "6 Categories", "1 Family"].map(
          (item, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "12px",
                color: "rgba(184,150,12,0.55)",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              {item}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

