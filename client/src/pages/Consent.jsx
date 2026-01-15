import { useState } from "react";

export default function Consent() {
  const [searchTerm, setSearchTerm] = useState("");

  // These match your backend's pre-configured logic exactly
  const [consents] = useState([
    { id: "user_123", purposes: ["analytics", "research", "reporting"], status: "Active", lastUpdated: "2026-01-10" },
    { id: "user_456", purposes: ["operational", "security", "audit"], status: "Active", lastUpdated: "2026-01-12" },
    { id: "user_789", purposes: ["compliance", "audit"], status: "Active", lastUpdated: "2026-01-14" },
    { id: "user_999", purposes: [], status: "No Consent", lastUpdated: "N/A" },
  ]);

  const filteredConsents = consents.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h1 style={styles.title}>Consent Manager</h1>
              <p style={styles.subtitle}>
                Central registry of user-granted permissions and data usage authorizations.
              </p>
            </div>
            <input 
              style={styles.search}
              placeholder="Search User ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* INFO BOX */}
        <div style={styles.infoBox}>
          <div style={styles.infoIcon}>🛡️</div>
          <div>
            <strong style={{ color: "#1e3a8a" }}>Gateway Integration:</strong>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#64748b" }}>
              Every incoming request is verified against this registry. If the requested 
              <strong> Purpose</strong> is not explicitly listed for the <strong>Requester ID</strong>, 
              access is automatically revoked.
            </p>
          </div>
        </div>

        {/* CONSENT TABLE */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Subject ID</th>
                <th style={styles.th}>Authorized Purposes</th>
                <th style={styles.th}>Last Updated</th>
                <th style={styles.th}>Registry Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredConsents.length > 0 ? filteredConsents.map((c, i) => (
                <tr key={i} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <div style={styles.avatar}>{c.id.charAt(5)}</div>
                      <code style={styles.code}>{c.id}</code>
                    </div>
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
                        <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: '13px' }}>
                          Unauthorized - All requests will be denied
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{color: '#64748b', fontSize: '13px'}}>{c.lastUpdated}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={c.status === "Active" ? styles.statusActive : styles.statusEmpty}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>
                    No users matching "{searchTerm}" found in consent registry.
                  </td>
                </tr>
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
  container: { maxWidth: "1100px", margin: "0 auto", padding: "0 20px" },
  header: { marginBottom: "32px" },
  title: { fontSize: "32px", fontWeight: "800", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "16px", marginTop: "8px" },
  search: { padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', width: '250px', fontSize: '14px' },
  infoBox: { display: "flex", gap: "16px", background: "#eff6ff", padding: "20px", borderRadius: "12px", border: "1px solid #bfdbfe", marginBottom: "32px", alignItems: "center" },
  infoIcon: { fontSize: "24px" },
  card: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: '0.05em' },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "20px 24px", verticalAlign: "middle" },
  avatar: { width: '32px', height: '32px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#475569' },
  code: { background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px", fontSize: "13px", color: "#1e3a8a", fontWeight: "600" },
  purposeGrid: { display: "flex", flexWrap: "wrap", gap: "8px" },
  purposeBadge: { background: "#e0f2fe", color: "#0369a1", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", border: "1px solid #bae6fd" },
  statusActive: { color: "#166534", background: "#dcfce7", padding: "4px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: "800" },
  statusEmpty: { color: "#991b1b", background: "#fee2e2", padding: "4px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: "800" },
};