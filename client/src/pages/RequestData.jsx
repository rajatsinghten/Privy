import { useState } from "react";
import { requestDataAccess } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function RequestData() {
  const { token } = useAuth(); 
  
  const [form, setForm] = useState({
    requester_id: "",
    role: "analyst",
    purpose: "analytics",
    location: "US",
    data_sensitivity: "medium",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.requester_id) {
      setError("Requester ID is required");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await requestDataAccess(form, token);
      setResult(res);
    } catch (err) {
      console.error("Evaluation failed", err);
      setError(err.message); // Displays backend errors like "Could not validate credentials"
    } finally {
      setLoading(false);
    }
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
              value={form.requester_id}
              onChange={handleChange}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Requester Role</label>
            <select name="role" value={form.role} style={styles.input} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="external">External Partner</option>
            </select>
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Purpose</label>
              <select name="purpose" value={form.purpose} style={styles.input} onChange={handleChange}>
                <option value="analytics">Analytics</option>
                <option value="research">Research</option>
                <option value="reporting">Reporting</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Sensitivity</label>
              <select name="data_sensitivity" value={form.data_sensitivity} style={styles.input} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Location (Jurisdiction)</label>
            <select name="location" value={form.location} style={styles.input} onChange={handleChange}>
              <option value="US">United States (US)</option>
              <option value="EU">European Union (EU)</option>
              <option value="India">India (IN)</option>
              <option value="GLOBAL">Global/Others</option>
            </select>
          </div>

          {error && <p style={styles.errorText}>{error}</p>}

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
                  <div style={{marginTop: '8px'}}>
                    <strong>Risk Score:</strong> 
                    <span style={{color: result.risk_score > 0.7 ? '#ef4444' : '#10b981', marginLeft: '8px', fontWeight: '700'}}>
                      {(result.risk_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div style={styles.checksGrid}>
                  {/* Policy Engine Breakdown */}
                  <div style={styles.checkCol}>
                    <label style={styles.jsonLabel}>Policy Checks</label>
                    {result.policy_checks?.checks ? (
                      Object.entries(result.policy_checks.checks).map(([key, val]) => (
                        <div key={key} style={styles.checkItem}>
                          <span style={styles.checkName}>{key.replace(/_/g, ' ')}</span>
                          <span style={val ? styles.passBadge : styles.failBadge}>{val ? 'PASS' : 'FAIL'}</span>
                        </div>
                      ))
                    ) : <span style={styles.noneText}>No data</span>}
                  </div>
                  
                  {/* Consent Manager Breakdown */}
                  <div style={styles.checkCol}>
                    <label style={styles.jsonLabel}>Consent Status</label>
                    <div style={styles.checkItem}>
                       <span style={styles.checkName}>User Consent</span>
                       <span style={result.consent_status?.has_consent ? styles.passBadge : styles.failBadge}>
                          {result.consent_status?.has_consent ? 'GRANTED' : 'MISSING'}
                       </span>
                    </div>
                    {result.consent_status?.granted_purposes && (
                       <div style={{fontSize: '10px', color: '#64748b', marginTop: '10px'}}>
                          Allowed: {result.consent_status.granted_purposes.join(', ')}
                       </div>
                    )}
                  </div>
                </div>

                <label style={styles.jsonLabel}>Raw Gateway Response</label>
                <pre style={styles.jsonOutput}>{JSON.stringify(result, null, 2)}</pre>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🛡️</div>
                <p>Waiting for request evaluation...</p>
                <small>Check inputs and click "Evaluate Decision"</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "100px 40px 40px 40px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  header: { maxWidth: "1200px", margin: "0 auto 32px auto" },
  heading: { fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 },
  subheading: { color: "#64748b", fontSize: "15px", marginTop: "8px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "32px", maxWidth: "1200px", margin: "0 auto" },
  card: { background: "#ffffff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0" },
  cardTitle: { fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "24px", margin: 0 },
  field: { marginBottom: "20px" },
  row: { display: "flex", gap: "16px", marginBottom: "20px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "8px" },
  input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", backgroundColor: "#fff" },
  button: { width: "100%", padding: "14px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  errorText: { color: "#ef4444", fontSize: "12px", marginBottom: "15px", fontWeight: "700", textAlign: "center", padding: "8px", background: "#fef2f2", borderRadius: "8px" },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  allowBadge: { padding: "6px 16px", background: "#dcfce7", color: "#166534", borderRadius: "20px", fontSize: "12px", fontWeight: "800" },
  denyBadge: { padding: "6px 16px", background: "#fee2e2", color: "#991b1b", borderRadius: "20px", fontSize: "12px", fontWeight: "800" },
  resultContainer: { background: "#f1f5f9", borderRadius: "12px", padding: "24px", minHeight: "450px" },
  emptyState: { textAlign: "center", color: "#94a3b8", paddingTop: "120px" },
  emptyIcon: { fontSize: "40px", marginBottom: "16px" },
  summaryBox: { background: "#fff", padding: "16px", borderRadius: "8px", borderLeft: "4px solid #0f172a", fontSize: "14px", color: "#334155", marginBottom: "20px" },
  checksGrid: { display: "flex", gap: "20px", marginBottom: "20px" },
  checkCol: { flex: 1, background: "rgba(255,255,255,0.6)", padding: "16px", borderRadius: "10px" },
  checkItem: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  checkName: { fontSize: "10px", fontWeight: "700", color: "#475569", textTransform: "uppercase" },
  passBadge: { fontSize: "9px", fontWeight: "800", color: "#10b981", background: "#dcfce7", padding: "2px 6px", borderRadius: "4px" },
  failBadge: { fontSize: "9px", fontWeight: "800", color: "#ef4444", background: "#fee2e2", padding: "2px 6px", borderRadius: "4px" },
  noneText: { fontSize: "12px", color: "#94a3b8", fontStyle: "italic" },
  jsonLabel: { fontSize: "10px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "10px", display: "block" },
  jsonOutput: { fontSize: "12px", background: "#0f172a", color: "#38bdf8", padding: "16px", borderRadius: "8px", overflow: "auto", maxHeight: "200px" }
};