/**
 * AdvancePayment.tsx — Bambeh Marketplace · Advance Payment
 * Self-contained 5-language UI (en · fr · pidgin · ar · ff).
 */

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "@/hooks/useAppLang";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

type PaymentForm = {
  fullName: string;
  email: string;
  amount: string;
  reference: string;
};

const initialForm: PaymentForm = { fullName: "", email: "", amount: "", reference: "" };

const T: Record<
  Lang,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    fullName: string;
    email: string;
    amount: string;
    reference: string;
    referencePlaceholder: string;
    pay: string;
    processing: string;
    success: string;
    errName: string;
    errEmail: string;
    errAmount: string;
    errRef: string;
    errFailed: string;
  }
> = {
  en: {
    eyebrow: "Advance Payment",
    title: "Complete your payment",
    subtitle: "Review your details and submit securely. Sensitive card data should be handled by your payment provider.",
    fullName: "Full Name",
    email: "Email Address",
    amount: "Amount",
    reference: "Reference",
    referencePlaceholder: "Invoice or order reference",
    pay: "Pay Now",
    processing: "Processing…",
    success: "Payment request submitted successfully.",
    errName: "Full name is required.",
    errEmail: "Enter a valid email address.",
    errAmount: "Enter an amount greater than 0.",
    errRef: "Payment reference is required.",
    errFailed: "Payment could not be processed. Please try again.",
  },
  fr: {
    eyebrow: "Paiement anticipé",
    title: "Finalisez votre paiement",
    subtitle: "Vérifiez vos informations et validez en toute sécurité. Les données bancaires sensibles sont gérées par votre prestataire de paiement.",
    fullName: "Nom complet",
    email: "Adresse e-mail",
    amount: "Montant",
    reference: "Référence",
    referencePlaceholder: "Référence de facture ou de commande",
    pay: "Payer maintenant",
    processing: "Traitement…",
    success: "Demande de paiement envoyée avec succès.",
    errName: "Le nom complet est requis.",
    errEmail: "Saisissez une adresse e-mail valide.",
    errAmount: "Saisissez un montant supérieur à 0.",
    errRef: "La référence de paiement est requise.",
    errFailed: "Le paiement n’a pas pu être traité. Veuillez réessayer.",
  },
  pidgin: {
    eyebrow: "Advance Payment",
    title: "Complete your payment",
    subtitle: "Check your details well, then submit. Your payment provider go handle the card details.",
    fullName: "Full Name",
    email: "Email Address",
    amount: "Amount",
    reference: "Reference",
    referencePlaceholder: "Invoice or order reference",
    pay: "Pay Now",
    processing: "E dey process…",
    success: "We don submit your payment request well well.",
    errName: "You must put full name.",
    errEmail: "Put correct email address.",
    errAmount: "Put amount wey pass 0.",
    errRef: "You must put payment reference.",
    errFailed: "We no fit process the payment. Try again.",
  },
  ar: {
    eyebrow: "دفعة مقدمة",
    title: "أكمل عملية الدفع",
    subtitle: "راجع بياناتك ثم أرسلها بأمان. تتم معالجة بيانات البطاقة الحساسة بواسطة مزود الدفع الخاص بك.",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    amount: "المبلغ",
    reference: "المرجع",
    referencePlaceholder: "مرجع الفاتورة أو الطلب",
    pay: "ادفع الآن",
    processing: "جارٍ المعالجة…",
    success: "تم إرسال طلب الدفع بنجاح.",
    errName: "الاسم الكامل مطلوب.",
    errEmail: "أدخل بريداً إلكترونياً صالحاً.",
    errAmount: "أدخل مبلغاً أكبر من 0.",
    errRef: "مرجع الدفع مطلوب.",
    errFailed: "تعذّر إتمام الدفع. يرجى المحاولة مرة أخرى.",
  },
  ff: {
    eyebrow: "Yoɓdi Adcomngal",
    title: "Timminir yoɓdi maa",
    subtitle: "Ƴeew keɓe maa refti neldaa e kisal. Keɓe karce coomɗe ina toppitee e neɗɗo yoɓdi maa.",
    fullName: "Innde Timmunde",
    email: "Email",
    amount: "Hoore",
    reference: "Référence",
    referencePlaceholder: "Référence facture walla kommannda",
    pay: "Yoɓ jooni",
    processing: "Ina huwee…",
    success: "Ɓanndital yoɓdi neldaama no moƴƴiri.",
    errName: "Innde timmunde ina naamnaa.",
    errEmail: "Naatnu email selliiɗo.",
    errAmount: "Naatnu hoore ɓurnde 0.",
    errRef: "Référence yoɓdi ina naamnaa.",
    errFailed: "Yoɓdi waawaa huweede. Tiiɗno fillito.",
  },
};

export default function AdvancePayment() {
  const navigate = useNavigate();
  const lang = (useLang() as Lang) || "en";
  const s = T[lang] || T.en;
  const isRtl = lang === "ar";

  const [form, setForm] = useState<PaymentForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const amountValue = useMemo(() => Number(form.amount), [form.amount]);

  const validateForm = () => {
    if (!form.fullName.trim()) return s.errName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return s.errEmail;
    if (!Number.isFinite(amountValue) || amountValue <= 0) return s.errAmount;
    if (!form.reference.trim()) return s.errRef;
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      setSuccess(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/payments/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          amount: amountValue,
          reference: form.reference.trim(),
        }),
      });
      if (!response.ok) throw new Error("Payment request failed.");
      setSuccess(true);
      setTimeout(() => navigate("/payment-success"), 1200);
    } catch {
      setError(s.errFailed);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={container} dir={isRtl ? "rtl" : "ltr"}>
      <section style={card} aria-labelledby="advance-payment-title">
        <header style={headerStyle}>
          <p style={eyebrow}>{s.eyebrow}</p>
          <h1 id="advance-payment-title" style={titleStyle}>{s.title}</h1>
          <p style={subtitle}>{s.subtitle}</p>
        </header>

        <form onSubmit={handleSubmit} style={formStyle}>
          <label style={label}>
            {s.fullName}
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
              autoComplete="name" placeholder="John Doe" style={input} />
          </label>

          <label style={label}>
            {s.email}
            <input type="email" name="email" value={form.email} onChange={handleChange}
              autoComplete="email" placeholder="john@example.com" style={input} />
          </label>

          <label style={label}>
            {s.amount}
            <input type="number" name="amount" value={form.amount} onChange={handleChange}
              inputMode="decimal" min="1" step="0.01" placeholder="100.00" style={input} />
          </label>

          <label style={label}>
            {s.reference}
            <input type="text" name="reference" value={form.reference} onChange={handleChange}
              placeholder={s.referencePlaceholder} style={input} />
          </label>

          {error ? <div style={errorStyle} role="alert">{error}</div> : null}
          {success ? <div style={successStyle} role="status">{s.success}</div> : null}

          <button type="submit" disabled={loading} style={button}>
            {loading ? s.processing : s.pay}
          </button>
        </form>
      </section>
    </main>
  );
}

const container: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "24px",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
};
const card: React.CSSProperties = {
  width: "100%", maxWidth: "520px", background: "#ffffff",
  borderRadius: "20px", padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};
const headerStyle: React.CSSProperties = { marginBottom: "24px" };
const eyebrow: React.CSSProperties = {
  margin: 0, textTransform: "uppercase", letterSpacing: "0.12em",
  fontSize: "12px", fontWeight: 700, color: "#2563eb",
};
const titleStyle: React.CSSProperties = { margin: "8px 0 8px", fontSize: "28px", fontWeight: 800, color: "#0f172a" };
const subtitle: React.CSSProperties = { margin: 0, color: "#475569", lineHeight: 1.6 };
const formStyle: React.CSSProperties = { display: "grid", gap: "16px" };
const label: React.CSSProperties = { display: "grid", gap: "8px", fontSize: "14px", fontWeight: 600, color: "#0f172a" };
const input: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "12px",
  border: "1px solid #cbd5e1", fontSize: "15px", outline: "none",
};
const button: React.CSSProperties = {
  marginTop: "8px", padding: "12px 16px", border: "none", borderRadius: "12px",
  background: "#2563eb", color: "#ffffff", fontSize: "15px", fontWeight: 700, cursor: "pointer",
};
const errorStyle: React.CSSProperties = {
  color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", padding: "12px", borderRadius: "12px",
};
const successStyle: React.CSSProperties = {
  color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "12px",
};
