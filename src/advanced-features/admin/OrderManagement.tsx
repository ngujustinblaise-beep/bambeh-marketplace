import React, { useMemo, useState } from "react";

type Order = {
  id: string;
  customer: string;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  amount: number;
  createdAt: string;
};

const seedOrders: Order[] = [
  {
    id: "ORD-1001",
    customer: "John Doe",
    status: "Pending",
    amount: 120.5,
    createdAt: "2026-06-27",
  },
  {
    id: "ORD-1002",
    customer: "Amina K.",
    status: "Processing",
    amount: 89.99,
    createdAt: "2026-06-26",
  },
  {
    id: "ORD-1003",
    customer: "Paul T.",
    status: "Completed",
    amount: 240,
    createdAt: "2026-06-25",
  },
];

function OrderManagement() {
  const [query, setQuery] = useState("");
  const [orders] = useState<Order[]>(seedOrders);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) =>
      [order.id, order.customer, order.status]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [orders, query]);

  const totalRevenue = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + order.amount, 0),
    [filteredOrders]
  );

  return (
    <main style={page}>
      <section style={card}>
        <header style={header}>
          <div>
            <p style={eyebrow}>Admin Panel</p>
            <h1 style={title}>Order Management</h1>
            <p style={subtitle}>Track orders, review statuses, and monitor revenue at a glance.</p>
          </div>

          <div style={stats}>
            <div style={statBox}>
              <span style={statLabel}>Orders</span>
              <strong style={statValue}>{filteredOrders.length}</strong>
            </div>
            <div style={statBox}>
              <span style={statLabel}>Revenue</span>
              <strong style={statValue}>${totalRevenue.toFixed(2)}</strong>
            </div>
          </div>
        </header>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order, customer, or status"
          style={search}
        />

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Order ID</th>
                <th style={th}>Customer</th>
                <th style={th}>Status</th>
                <th style={th}>Amount</th>
                <th style={th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td style={td}>{order.id}</td>
                  <td style={td}>{order.customer}</td>
                  <td style={td}>
                    <span style={{ ...badge, ...badgeStyles[order.status] }}>{order.status}</span>
                  </td>
                  <td style={td}>${order.amount.toFixed(2)}</td>
                  <td style={td}>{order.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  padding: "24px",
  background: "linear-gradient(135deg, #0f172a 0%, #111827 100%)",
  color: "#0f172a",
};

const card: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  background: "#ffffff",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "24px",
  alignItems: "flex-start",
  flexWrap: "wrap",
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
  fontSize: "32px",
  fontWeight: 800,
  color: "#0f172a",
};

const subtitle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  lineHeight: 1.6,
};

const stats: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(140px, 1fr))",
  gap: "12px",
};

const statBox: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "14px 16px",
};

const statLabel: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  color: "#64748b",
  marginBottom: "6px",
};

const statValue: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 800,
  color: "#0f172a",
};

const search: React.CSSProperties = {
  width: "100%",
  marginBottom: "20px",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  outline: "none",
};

const tableWrap: React.CSSProperties = {
  overflowX: "auto",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "760px",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: "14px",
};

const td: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #e2e8f0",
  color: "#0f172a",
  fontSize: "14px",
};

const badge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
};

const badgeStyles: Record<Order["status"], React.CSSProperties> = {
  Pending: { background: "#fef3c7", color: "#92400e" },
  Processing: { background: "#dbeafe", color: "#1d4ed8" },
  Completed: { background: "#dcfce7", color: "#166534" },
  Cancelled: { background: "#fee2e2", color: "#b91c1c" },
};

export default OrderManagement;