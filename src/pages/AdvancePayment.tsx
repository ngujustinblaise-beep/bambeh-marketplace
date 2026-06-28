import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type PaymentForm = {
  fullName: string;
  email: string;
  amount: string;
  reference: string;
};

const initialForm: PaymentForm = {
  fullName: "",
  email: "",
  amount: "",
  reference: "",
};

export default function AdvancePayment() {
  const navigate = useNavigate();
  const [form, setForm] = useState<PaymentForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const amountValue = useMemo(() => Number(form.amount), [form.amount]);

  const validateForm = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
    if (!Number.isFinite(amountValue) || amountValue <= 0) return "Enter an amount greater than 0.";
    if (!form.reference.trim()) return "Payment reference is required.";
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          amount: amountValue,
          reference: form.reference.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Payment request failed.");
      }

      setSuccess(true);
      setTimeout(() => navigate("/payment-success"), 1200);
    } catch {
      setError("Payment could not be processed. Please try again.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={container}>
      <section style={card} aria-labelledby="advance-payment-title">
        <header style={header}>
          <p style={eyebrow}>Advance Payment</p>
          <h1 id="advance-payment-title" style={title}>Complete your payment</h1>
          <p style={subtitle}>
            Review your details and submit securely. Sensitive card data should be handled by your payment provider.
          </p>
        </header>

        <form onSubmit={handleSubmit} style={formStyle}>
          <label style={label}>
            Full Name
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              autoComplete="name"
              placeholder="John Doe"
              style={input}
            />
          </label>

          <label style={label}>
            Email Address
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="john@example.com"
              style={input}
            />
          </label>

          <label style={label}>
            Amount
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              inputMode="decimal"
              min="1"
              step="0.01"
              placeholder="100.00"
              style={input}
            />
          </label>

          <label style={label}>
            Reference
            <input
              type="text"
              name="reference"
              value={form.reference}
              onChange={handleChange}
              placeholder="Invoice or order reference"
              style={input}
            />
          </label>

          {error ? <div style={errorStyle} role="alert">{error}</div> : null}
          {success ? <div style={successStyle} role="status">Payment request submitted successfully.</div> : null}

          <button type="submit" disabled={loading} style={button}>
            {loading ? "Processing..." : "Pay Now"}
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
  width: "100%",
  maxWidth: "520px",
  background: "#ffffff",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};

const header: React.CSSProperties = {
  marginBottom: "24px",
};

const eyebrow: React.CSSProperties = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: "12px",
  fontWeight: 700,
  color: "#2563eb",
};

const title: React.CSSProperties = {
  margin: "8px 0 8px",
  fontSize: "28px",
  fontWeight: 800,
  color: "#0f172a",
};

const subtitle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  lineHeight: 1.6,
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const label: React.CSSProperties = {
  display: "grid",
  gap: "8px",
  fontSize: "14px",
  fontWeight: 600,
  color: "#0f172a",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  outline: "none",
};

const button: React.CSSProperties = {
  marginTop: "8px",
  padding: "12px 16px",
  border: "none",
  borderRadius: "12px",
  background: "#2563eb",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  color: "#b91c1c",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  padding: "12px",
  borderRadius: "12px",
};

const successStyle: React.CSSProperties = {
  color: "#166534",
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
  padding: "12px",
  borderRadius: "12px",
};