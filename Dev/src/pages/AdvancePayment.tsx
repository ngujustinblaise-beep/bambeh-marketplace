import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PaymentForm {
  fullName: string;
  email: string;
  amount: number;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export default function AdvancePayment() {
  const navigate = useNavigate();

  const [form, setForm] = useState<PaymentForm>({
    fullName: "",
    email: "",
    amount: 0,
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    if (!form.fullName.trim()) return setError("Full name is required."), false;
    if (!form.email.includes("@")) return setError("Valid email required."), false;
    if (form.amount <= 0) return setError("Amount must be greater than 0."), false;
    if (form.cardNumber.length < 16) return setError("Invalid card number."), false;
    if (!form.expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/))
      return setError("Expiry must be MM/YY format."), false;
    if (form.cvv.length < 3) return setError("Invalid CVV."), false;

    setError("");
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);

      setTimeout(() => {
        navigate("/payment-success");
      }, 1500);
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>Advance Payment</h1>
        <p style={subtitle}>
          Securely complete your advance payment below.
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            style={input}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            style={input}
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount (USD)"
            value={form.amount}
            onChange={handleChange}
            style={input}
          />

          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            value={form.cardNumber}
            onChange={handleChange}
            style={input}
          />

          <input
            type="text"
            name="expiry"
            placeholder="MM/YY"
            value={form.expiry}
            onChange={handleChange}
            style={input}
          />

          <input
            type="password"
            name="cvv"
            placeholder="CVV"
            value={form.cvv}
            onChange={handleChange}
            style={input}
          />

          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>Payment Successful!</div>}

          <button type="submit" style={button} disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #0f172a, #1e293b)",
  padding: "20px",
};

const card: React.CSSProperties = {
  background: "#ffffff",
  padding: "40px",
  borderRadius: "12px",
  width: "100%",
  maxWidth: "450px",
  boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
};

const title: React.CSSProperties = {
  marginBottom: "10px",
  fontSize: "24px",
  fontWeight: 700,
};

const subtitle: React.CSSProperties = {
  marginBottom: "25px",
  fontSize: "14px",
  color: "#555",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const input: React.CSSProperties = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

const button: React.CSSProperties = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "13px",
};

const successStyle: React.CSSProperties = {
  color: "#16a34a",
  fontSize: "13px",
};
