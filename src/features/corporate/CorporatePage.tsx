/**
 * BAMBEH Corporate - front-end scaffold (preview).
 * Self-contained: plain React + Tailwind + inline SVG. No emoji, no external
 * contexts, no lucide brand icons. Placeholder data is labelled. The register
 * form does not submit yet - backend wiring is a later step.
 */
import { useState } from "react";

const IconCheck = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5" /></svg>
);
const IconShield = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
);
const IconStore = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 9 4 4h16l1 5" /><path d="M4 9v11h16V9" /><path d="M9 20v-6h6v6" /></svg>
);
const IconChart = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18" /><rect x="7" y="11" width="3" height="6" /><rect x="12" y="7" width="3" height="10" /><rect x="17" y="13" width="3" height="4" /></svg>
);

const VALUE_PROPS = [
  { icon: IconShield, title: "Verified business badge", body: "Show buyers your RCCM-registered status and build instant trust." },
  { icon: IconStore, title: "Branded storefront", body: "Your own corporate page with logo, catalogue, and contact." },
  { icon: IconChart, title: "Sales analytics", body: "Track views, orders, and revenue across all your listings." },
  { icon: IconCheck, title: "Priority placement", body: "Corporate listings surface above standard posts in search." },
];

/* Two annual tiers. Higher price = fewer scammers, more serious businesses. */
const TIERS = [
  { name: "Business", price: "30,000", period: "/ year", highlight: true,
    features: ["Verified business badge", "Up to 250 active listings", "Branded storefront", "Sales analytics", "Priority placement", "Priority support"] },
  { name: "Enterprise", price: "40,000", period: "/ year", highlight: false,
    features: ["Everything in Business", "Unlimited listings", "Team accounts", "Dedicated account manager", "Early access to new tools"] },
];

export default function CorporatePage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ business: "", rccm: "", niu: "", category: "", email: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-teal-600 to-teal-800 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <span className="inline-block text-xs font-semibold tracking-wide uppercase bg-white/15 rounded-full px-3 py-1 mb-4">Bambeh Corporate</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">Sell as a verified business</h1>
          <p className="text-teal-50 text-lg max-w-2xl mx-auto mb-8">
            Give your company a trusted storefront on Cameroon&apos;s marketplace. A verified badge, real analytics, and serious-only membership that keeps scammers out.
          </p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold rounded-xl px-6 py-3 hover:bg-teal-50 transition-colors">
            Register your business
          </button>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-teal-100 p-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center">
          <span className="text-gray-700"><strong className="text-teal-700">1%</strong> commission per sale</span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="text-gray-700"><strong className="text-teal-700">4 FCFA</strong> government tax per transaction</span>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Why go Corporate?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUE_PROPS.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "#ccfbf1" }}>
                  <Icon className="w-6 h-6 text-teal-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                <p className="text-sm text-gray-600">{v.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-14">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Annual membership</h2>
        <p className="text-center text-gray-500 text-sm mb-8">Verified businesses only. Billed yearly.</p>
        <div className="grid md:grid-cols-2 gap-5">
          {TIERS.map((t) => (
            <div key={t.name} className={"rounded-2xl p-6 border bg-white " + (t.highlight ? "border-teal-500 shadow-xl ring-1 ring-teal-500" : "border-gray-100 shadow-sm")}>
              {t.highlight && <span className="inline-block text-xs font-semibold text-teal-700 bg-teal-50 rounded-full px-3 py-1 mb-3">Most popular</span>}
              <h3 className="text-lg font-bold text-gray-900">{t.name}</h3>
              <div className="mt-2 mb-4"><span className="text-3xl font-extrabold text-gray-900">{t.price}</span><span className="text-gray-500 text-sm"> FCFA {t.period}</span></div>
              <ul className="space-y-2 mb-6">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700"><IconCheck className="w-4 h-4 mt-0.5 text-teal-600 shrink-0" />{f}</li>
                ))}
              </ul>
              <button onClick={() => setShowForm(true)} className={"w-full rounded-xl py-2.5 font-semibold transition-colors " + (t.highlight ? "bg-teal-600 text-white hover:bg-teal-700" : "border border-teal-600 text-teal-700 hover:bg-teal-50")}>Choose {t.name}</button>
            </div>
          ))}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Register your business</h3>
              <button onClick={() => setShowForm(false)} aria-label="Close" className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-3">
              {[
                { k: "business", label: "Business name", ph: "e.g. Bambeh SARL" },
                { k: "rccm", label: "RCCM number", ph: "CM-NSI-..." },
                { k: "niu", label: "NIU (tax ID)", ph: "M0..." },
                { k: "category", label: "Category", ph: "Retail, Services, ..." },
                { k: "email", label: "Contact email", ph: "you@company.com" },
              ].map((fld) => (
                <div key={fld.k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{fld.label}</label>
                  <input value={(form as any)[fld.k]} onChange={(e) => set(fld.k, e.target.value)} placeholder={fld.ph}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">Preview only - submitting is disabled until we wire the backend.</p>
            <button disabled className="w-full mt-3 rounded-xl py-2.5 font-semibold bg-gray-200 text-gray-500 cursor-not-allowed">Submit (coming soon)</button>
          </div>
        </div>
      )}
    </div>
  );
}