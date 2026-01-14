import { useState } from "react";

export default function Consent() {
  // Pre-configured consents from your backend logic
  const [consents] = useState([
    { id: "user_123", purposes: ["analytics", "research", "reporting"], status: "Active" },
    { id: "user_456", purposes: ["operational", "security", "audit"], status: "Active" },
    { id: "user_789", purposes: ["compliance", "audit"], status: "Active" },
    { id: "user_999", purposes: [], status: "No Consent" },
  ]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Consent Manager</h1>
          <p style={styles.subtitle}>
            Dynamic validation of user-granted permissions against data access purposes.
          </p>
        </div>

        {/* INFO BOX */}
        <div style={styles.infoBox}>
          <div style={styles.infoIcon}>⚖️</div>
          <div>
            <strong style={{ color: "#1e3a8a" }}>Enforcement Logic:</strong>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#64748b" }}>
              The Privy Engine automatically blocks any request where the "Purpose" parameter 
              does not match the pre-configured registry below.
            </p>
          </div>
        </div>

        {/* CONSENT TABLE */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Subject ID (Requester)</th>
                <th style={styles.th}>Authorized Purposes</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {consents.map((c, i) => (
                <tr key={i} style={styles.tr}>
                  <td style={styles.td}>
                    <code style={styles.code}>{c.id}</code>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.purposeGrid}>
                      {c.purposes.length > 0 ? (
                        c.purposes.map((p, idx) => (
                          <span key={idx} style={styles.purposeBadge}>
                            {p}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                          No purposes authorized
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={c.status === "Active" ? styles.statusActive : styles.statusEmpty}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    paddingTop: "120px",
    paddingBottom: "40px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 20px",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "16px",
    marginTop: "8px",
  },
  infoBox: {
    display: "flex",
    gap: "16px",
    background: "#eff6ff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #bfdbfe",
    marginBottom: "32px",
    alignItems: "center",
  },
  infoIcon: {
    fontSize: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "16px 24px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "20px 24px",
    verticalAlign: "middle",
  },
  code: {
    background: "#f1f5f9",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "13px",
    color: "#1e3a8a",
    fontWeight: "600",
  },
  purposeGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  purposeBadge: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
    border: "1px solid #bae6fd",
  },
  statusActive: {
    color: "#166534",
    background: "#dcfce7",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "700",
  },
  statusEmpty: {
    color: "#991b1b",
    background: "#fee2e2",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "700",
  },
};