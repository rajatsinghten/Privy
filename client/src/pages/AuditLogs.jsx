import { useEffect, useState } from "react";
import { fetchAuditLogs } from "../api/client";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchAuditLogs().then(setLogs).catch(err => console.error(err));
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>System Audit Trail</h1>
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th>Timestamp</th>
                <th>Requester</th>
                <th>Decision</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((l, i) => (
                <tr key={i} style={styles.row}>
                  <td>{new Date(l.timestamp).toLocaleString()}</td>
                  <td>{l.requester_id}</td>
                  <td style={{color: l.decision === "ALLOW" ? "#10b981" : "#ef4444", fontWeight: "700"}}>{l.decision}</td>
                  <td>{Math.round(l.risk_score * 100)}%</td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{textAlign: "center", padding: "40px", color: "#94a3b8"}}>No logs found in database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { paddingTop: "120px", background: "#f8fafc", minHeight: "100vh" },
  container: { maxWidth: "1000px", margin: "0 auto", padding: "0 20px" },
  title: { fontSize: "28px", fontWeight: "800", marginBottom: "24px" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc", textAlign: "left", fontSize: "12px", color: "#64748b" },
  row: { borderBottom: "1px solid #f1f5f9", fontSize: "14px" }
};