import { useEffect, useState } from "react";
import { fetchAuditLogs } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AuditLogs() {
  const { token } = useAuth(); // Need token for Admin access
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      loadLogs();
    }
  }, [token]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await fetchAuditLogs(token);
      // Sort logs by newest first
      const sortedLogs = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLogs(sortedLogs);
    } catch (err) {
      console.error("Audit log error:", err);
      setError("Failed to fetch logs. Ensure you are logged in as Admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>System Audit Trail</h1>
            <p style={styles.subtitle}>Immutable record of all gateway access decisions.</p>
          </div>
          <button onClick={loadLogs} style={styles.refreshBtn}>Refresh Logs</button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Timestamp</th>
                <th style={styles.th}>Requester</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Purpose</th>
                <th style={styles.th}>Decision</th>
                <th style={styles.th}>Risk Score</th>
                <th style={styles.th}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={styles.loadingCell}>Fetching Audit Records...</td></tr>
              ) : logs.length > 0 ? (
                logs.map((l, i) => (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>{new Date(l.timestamp).toLocaleString()}</td>
                    <td style={styles.td}><strong>{l.requester_id}</strong></td>
                    <td style={styles.td}><span style={styles.roleTag}>{l.requester_role}</span></td>
                    <td style={styles.td}>{l.purpose}</td>
                    <td style={styles.td}>
                      <span style={l.decision === "ALLOW" ? styles.allowBadge : styles.denyBadge}>
                        {l.decision}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.riskContainer}>
                        <div style={{...styles.riskBar, width: `${l.risk_score * 100}%`, backgroundColor: l.risk_score > 0.7 ? '#ef4444' : '#10b981'}} />
                        <span style={{fontSize: '11px'}}>{Math.round(l.risk_score * 100)}%</span>
                      </div>
                    </td>
                    <td style={styles.td} title={l.reason}>
                      <div style={styles.reasonText}>{l.reason}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" style={styles.emptyCell}>No logs found in database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { paddingTop: "100px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" },
  title: { fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "14px", marginTop: "4px" },
  refreshBtn: { padding: "10px 20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontWeight: "600", color: "#1e293b" },
  errorBox: { padding: "16px", background: "#fef2f2", border: "1px solid #fee2e2", color: "#b91c1c", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  theadRow: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "16px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" },
  td: { padding: "16px", fontSize: "13px", color: "#334155" },
  roleTag: { background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" },
  allowBadge: { color: "#166534", background: "#dcfce7", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800" },
  denyBadge: { color: "#991b1b", background: "#fee2e2", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800" },
  riskContainer: { display: "flex", alignItems: "center", gap: "8px" },
  riskBar: { height: "6px", borderRadius: "3px", minWidth: "40px" },
  reasonText: { maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "12px", color: "#64748b" },
  loadingCell: { padding: "60px", textAlign: "center", color: "#64748b" },
  emptyCell: { padding: "60px", textAlign: "center", color: "#94a3b8" }
};