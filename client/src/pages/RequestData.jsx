import { useState } from "react";
import { requestDataAccess } from "../api/client";

export default function RequestData() {
  const [form, setForm] = useState({
    requester_id: "",
    role: "",
    purpose: "analytics",
    data_sensitivity: "medium",
    location: "US",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
        const res = await requestDataAccess(form);
        setResult(res);
    } catch (error) {
        console.error("Evaluation failed", error);
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Runtime Access Evaluation</h2>
        <p style={styles.subheading}>
          Privy Gateway: Evaluating real-time data access against policy, risk, and consent.
        </p>
      </div>

      <div style={styles.grid}>
        {/* LEFT: INPUT FORM */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Request Parameters</h3>
          
          <div style={styles.field}>
            <label style={styles.label}>Requester ID</label>
            <input
              name="requester_id"
              placeholder="e.g. user_123"
              style={styles.input}
              onChange={handleChange}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Requester Role</label>
            <select name="role" style={styles.input} onChange={handleChange}>
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="external">External Partner</option>
            </select>
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Purpose</label>
              <select name="purpose" style={styles.input} onChange={handleChange}>
                <option value="analytics">Analytics</option>
                <option value="research">Research</option>
                <option value="reporting">Reporting</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Sensitivity</label>
              <select name="data_sensitivity" style={styles.input} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Jurisdiction (Origin)</label>
            <select name="location" style={styles.input} onChange={handleChange}>
              <option value="US">United States (US)</option>
              <option value="EU">European Union (EU)</option>
              <option value="India">India (IN)</option>
              <option value="GLOBAL">Global/Others</option>
            </select>
          </div>

          <button 
            style={loading ? {...styles.button, opacity: 0.7} : styles.button} 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Processing Engine..." : "Evaluate Decision"}
          </button>
        </div>

        {/* RIGHT: DECISION OUTPUT */}
        <div style={styles.card}>
          <div style={styles.resultHeader}>
            <h3 style={styles.cardTitle}>Decision Engine Output</h3>
            {result && (
              <span style={result.decision === "ALLOW" ? styles.allowBadge : styles.denyBadge}>
                {result.decision}
              </span>
            )}
          </div>
          
          <div style={styles.resultContainer}>
            {result ? (
              <div style={styles.resultContent}>
                <div style={styles.summaryBox}>
                  <strong>Reason:</strong> {result.reason}
                  <br />
                  <strong>Risk Score:</strong> 
                  <span style={{color: result.risk_score > 0.6 ? '#ef4444' : '#10b981', marginLeft: '8px', fontWeight: '700'}}>
                    {(result.risk_score * 100).toFixed(1)}%
                  </span>
                </div>
                <label style={styles.jsonLabel}>Raw Gateway Response (JSON)</label>
                <pre style={styles.jsonOutput}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🛡️</div>
                <p>Waiting for request evaluation...</p>
                <small>Configure the parameters and click "Evaluate Decision"</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "100px 40px 40px 40px", // Top padding fixed for Navbar
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    maxWidth: "1200px",
    margin: "0 auto 32px auto",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
  },
  subheading: {
    color: "#64748b",
    fontSize: "15px",
    marginTop: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    gap: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    background: "#ffffff",
    padding: "32px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "24px",
    margin: 0,
  },
  field: {
    marginBottom: "20px",
  },
  row: {
    display: "flex",
    gap: "16px",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    transition: "border 0.2s",
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#1e3a8a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "12px",
    transition: "background 0.2s",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  allowBadge: {
    padding: "6px 16px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
  },
  denyBadge: {
    padding: "6px 16px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
  },
  resultContainer: {
    background: "#f1f5f9",
    borderRadius: "12px",
    padding: "20px",
    flexGrow: 1,
    minHeight: "400px",
  },
  emptyState: {
    textAlign: "center",
    color: "#94a3b8",
    paddingTop: "100px",
  },
  emptyIcon: {
    fontSize: "40px",
    marginBottom: "16px",
  },
  summaryBox: {
    background: "#fff",
    padding: "16px",
    borderRadius: "8px",
    borderLeft: "4px solid #1e3a8a",
    fontSize: "14px",
    color: "#334155",
    lineHeight: "1.6",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  jsonLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: "8px",
    display: "block",
  },
  jsonOutput: {
    fontSize: "12px",
    background: "#0f172a",
    color: "#38bdf8",
    padding: "16px",
    borderRadius: "8px",
    overflow: "auto",
    maxHeight: "300px",
    margin: 0,
  }
};